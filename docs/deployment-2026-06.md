# 배포 가이드

작성일: 2026-06-30

## 아키텍처

```
git push (main)
    → GitHub Actions
        → Docker 이미지 빌드
        → AWS ECR에 이미지 push
        → EC2에 SSH 접속
            → SSM에서 환경변수 가져오기
            → Docker 컨테이너 교체
                ↕
            Nginx (HTTPS, Let's Encrypt)
                ↕
            Next.js 컨테이너 (포트 3000)
```

## 인프라 구성

| 항목 | 값 |
|------|-----|
| 도메인 | `https://prepperapp.duckdns.org` (DuckDNS 무료 도메인) |
| SSL | Let's Encrypt (Certbot 자동 갱신) |
| 서버 | AWS EC2 t3.micro (시드니, ap-southeast-2) |
| 이미지 저장소 | AWS ECR — `prepper` 리포지토리 |
| 환경변수 | AWS SSM Parameter Store |
| CI/CD | GitHub Actions |

## 추가된 파일

| 파일 | 설명 |
|------|------|
| `Dockerfile` | 멀티스테이지 빌드 (pruner → installer → builder → runner) |
| `docker-compose.yml` | 로컬 Docker 테스트용 |
| `.dockerignore` | Docker 빌드 시 제외할 파일 목록 |
| `.github/workflows/deploy.yml` | GitHub Actions CI/CD 워크플로우 |
| `apps/web/next.config.ts` | `output: standalone` + `transpilePackages` 추가 |

## AWS 리소스

### ECR
- 리포지토리 이름: `prepper`
- 리전: ap-southeast-2 (시드니)

### EC2
- AMI: Amazon Linux 2023
- 인스턴스 유형: t3.micro
- IAM 역할: `prepper-ec2-role`
  - `AmazonEC2ContainerRegistryReadOnly`
  - `AmazonSSMReadOnlyAccess`
- 보안 그룹 인바운드:
  - SSH (22) — 0.0.0.0/0
  - HTTP (80) — 0.0.0.0/0
  - HTTPS (443) — 0.0.0.0/0

### IAM
- `prepper-github-actions` 유저 — GitHub Actions에서 ECR push용
  - 정책: `AmazonEC2ContainerRegistryPowerUser`
- `prepper-ec2-role` 역할 — EC2 인스턴스 프로파일

### SSM Parameter Store (ap-southeast-2)

| 파라미터 이름 | 유형 |
|--------------|------|
| `/prepper/NEXT_PUBLIC_SUPABASE_URL` | String |
| `/prepper/NEXT_PUBLIC_SUPABASE_ANON_KEY` | SecureString |
| `/prepper/OPENAI_API_KEY` | SecureString |
| `/prepper/OPENAI_MODEL` | String |
| `/prepper/YOUTUBE_API_KEY` | SecureString |

## GitHub Secrets

| 이름 | 설명 |
|------|------|
| `AWS_ACCESS_KEY_ID` | IAM 유저 액세스 키 |
| `AWS_SECRET_ACCESS_KEY` | IAM 유저 시크릿 키 |
| `EC2_HOST` | EC2 퍼블릭 IP |
| `EC2_SSH_KEY` | EC2 키 페어 `.pem` 파일 전체 내용 |

## EC2 설치 목록

```bash
sudo dnf update -y
sudo dnf install -y docker jq
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
sudo dnf install -y nginx
sudo systemctl enable --now nginx
sudo dnf install -y python3-certbot-nginx
sudo certbot --nginx -d prepperapp.duckdns.org
```

Nginx 설정 파일: `/etc/nginx/conf.d/prepper.conf`
- 80/443 → localhost:3000 프록시

## 배포 흐름

`main` 브랜치에 push하면 자동으로:

1. GitHub Actions 실행
2. Dockerfile로 이미지 빌드
3. ECR에 이미지 push (`latest` + 커밋 SHA 태그)
4. EC2에 SSH 접속
5. SSM에서 환경변수 가져와 `/tmp/prepper.env`에 저장
6. 기존 컨테이너 중지 & 삭제
7. 새 컨테이너 실행 (`--restart unless-stopped`)
8. 임시 env 파일 삭제

## 운영 참고

### EC2 끄기/켜기
- 중지: EC2 콘솔 → 인스턴스 상태 → 중지 (컴퓨팅 요금 없음, 스토리지 요금만 발생)
- 재시작 후 IP가 바뀌므로 DuckDNS에서 IP 업데이트 필요

### Dockerfile 구조 (멀티스테이지)
```
[pruner]    turbo prune으로 web 앱 관련 파일만 추출
[installer] pnpm install (레이어 캐시 활용)
[builder]   Next.js 빌드 (.next/standalone 생성)
[runner]    standalone 결과물만 복사한 최소 이미지
```

`next.config.ts`의 `output: "standalone"` 덕분에 런타임에 필요한 파일만 추려져서 이미지 크기가 작아짐.
