import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Image,
  type ImageSourcePropType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { useAuth } from '../lib/auth-context';

type OnboardingSlide = {
  description: string;
  image?: ImageSourcePropType;
  title: string;
  visual: 'brand' | 'organize' | 'find';
};

const onboardingSlides: OnboardingSlide[] = [
  {
    description: '영상, 블로그, 메모로 흩어진 레시피를 한 곳에 모아요.',
    image: require('../assets/splash-icon.png'),
    title: '레시피 링크를 저장해요',
    visual: 'brand',
  },
  {
    description: '가져온 레시피를 재료와 조리순서로 깔끔하게 확인해요.',
    title: '재료와 순서를 정리해요',
    visual: 'organize',
  },
  {
    description: '요리할 때 필요한 레시피를 내 목록에서 빠르게 찾아요.',
    title: '나중에 바로 찾아요',
    visual: 'find',
  },
];

function OnboardingVisual({ slide }: { slide: OnboardingSlide }) {
  if (slide.visual === 'brand') {
    return (
      <View style={styles.brandVisual}>
        <Image
          resizeMode="contain"
          source={slide.image}
          style={styles.brandImage}
        />
      </View>
    );
  }

  if (slide.visual === 'organize') {
    return (
      <View style={styles.visualPanel}>
        <View style={styles.previewHeader}>
          <View style={styles.previewThumb} />
          <View style={styles.previewLines}>
            <View style={styles.previewLineWide} />
            <View style={styles.previewLineShort} />
          </View>
        </View>
        <View style={styles.checkRow}>
          <Text style={styles.checkMark}>✓</Text>
          <Text style={styles.checkText}>양파 1/2개</Text>
        </View>
        <View style={styles.checkRow}>
          <Text style={styles.checkMark}>✓</Text>
          <Text style={styles.checkText}>고추장 2큰술</Text>
        </View>
        <View style={styles.stepChip}>
          <Text style={styles.stepChipText}>1. 재료를 손질하고 볶기</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.visualPanel}>
      <View style={[styles.recipeCardPreview, styles.recipeCardRaised]}>
        <Text style={styles.recipeCardMeta}>저장됨 · YouTube</Text>
        <Text style={styles.recipeCardTitle}>초간단 제육볶음</Text>
      </View>
      <View style={styles.recipeCardPreview}>
        <Text style={styles.recipeCardMeta}>완성 대기 · 웹</Text>
        <Text style={styles.recipeCardTitle}>김치찌개 레시피</Text>
      </View>
      <View style={styles.searchBarPreview}>
        <Text style={styles.searchBarText}>오늘 만들 레시피 찾기</Text>
      </View>
    </View>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { signInWithProvider } = useAuth();
  const slideWidth = Math.max(width - 48, 280);
  const [activeSlide, setActiveSlide] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingProvider, setPendingProvider] = useState<
    'google' | 'kakao' | null
  >(null);

  async function handleSocialLogin(provider: 'google' | 'kakao') {
    setErrorMessage(null);
    setPendingProvider(provider);

    try {
      const didSignIn = await signInWithProvider(provider);

      if (didSignIn) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '로그인 중 문제가 발생했습니다.',
      );
    } finally {
      setPendingProvider(null);
    }
  }

  function handleSlideChange(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const nextSlide = Math.round(
      event.nativeEvent.contentOffset.x / slideWidth,
    );

    setActiveSlide(nextSlide);
  }

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.brandBlock}>
          <Text style={styles.logo}>Prepper</Text>
        </View>

        <View style={styles.carouselArea}>
          <FlatList
            data={onboardingSlides}
            horizontal
            keyExtractor={(item) => item.title}
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={slideWidth}
            decelerationRate="fast"
            onMomentumScrollEnd={handleSlideChange}
            renderItem={({ item }) => (
              <View style={[styles.slide, { width: slideWidth }]}>
                <OnboardingVisual slide={item} />
                <View style={styles.slideCopy}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.subtitle}>{item.description}</Text>
                </View>
              </View>
            )}
          />
          <View style={styles.dotRow}>
            {onboardingSlides.map((slide, index) => (
              <View
                key={slide.title}
                style={[
                  styles.dot,
                  index === activeSlide && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.form}>
          <Pressable
            disabled={pendingProvider !== null}
            onPress={() => handleSocialLogin('kakao')}
            style={[
              styles.authButton,
              styles.kakaoButton,
              pendingProvider !== null && styles.disabledButton,
            ]}
          >
            <Text style={styles.kakaoButtonText}>
              {pendingProvider === 'kakao'
                ? '카카오 로그인 중...'
                : '카카오로 계속하기'}
            </Text>
          </Pressable>
          <Pressable
            disabled={pendingProvider !== null}
            onPress={() => handleSocialLogin('google')}
            style={[
              styles.authButton,
              styles.googleButton,
              pendingProvider !== null && styles.disabledButton,
            ]}
          >
            <Text style={styles.googleButtonText}>
              {pendingProvider === 'google'
                ? 'Google 로그인 중...'
                : 'Google로 계속하기'}
            </Text>
          </Pressable>
          {errorMessage ? (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fffaf3',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 64,
  },
  brandBlock: {
    alignItems: 'center',
  },
  logo: {
    color: '#b85c38',
    fontSize: 18,
    fontWeight: '800',
  },
  carouselArea: {
    gap: 16,
  },
  slide: {
    alignItems: 'center',
    gap: 22,
  },
  brandVisual: {
    width: '100%',
    maxWidth: 320,
    aspectRatio: 1.45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandImage: {
    width: '100%',
    height: '100%',
  },
  visualPanel: {
    width: '100%',
    maxWidth: 320,
    aspectRatio: 1.45,
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#ead9cc',
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 18,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewThumb: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#f06b35',
  },
  previewLines: {
    flex: 1,
    gap: 8,
  },
  previewLineWide: {
    width: '82%',
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ead9cc',
  },
  previewLineShort: {
    width: '54%',
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f2e7dd',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkMark: {
    color: '#b85c38',
    fontSize: 16,
    fontWeight: '900',
  },
  checkText: {
    color: '#4d4038',
    fontSize: 15,
    fontWeight: '700',
  },
  stepChip: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    backgroundColor: '#fff7f1',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  stepChipText: {
    color: '#8f4426',
    fontSize: 14,
    fontWeight: '800',
  },
  recipeCardPreview: {
    gap: 5,
    borderWidth: 1,
    borderColor: '#ead9cc',
    borderRadius: 8,
    backgroundColor: '#fffaf3',
    padding: 14,
  },
  recipeCardRaised: {
    borderColor: '#f1c3a9',
    backgroundColor: '#fff7f1',
  },
  recipeCardMeta: {
    color: '#b85c38',
    fontSize: 12,
    fontWeight: '800',
  },
  recipeCardTitle: {
    color: '#241812',
    fontSize: 16,
    fontWeight: '900',
  },
  searchBarPreview: {
    borderRadius: 8,
    backgroundColor: '#241812',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchBarText: {
    color: '#fffaf3',
    fontSize: 14,
    fontWeight: '800',
  },
  slideCopy: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 6,
  },
  title: {
    color: '#241812',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 35,
    textAlign: 'center',
  },
  subtitle: {
    color: '#6f6259',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#ead9cc',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#b85c38',
  },
  form: {
    gap: 12,
  },
  authButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  kakaoButton: {
    backgroundColor: '#fee500',
  },
  kakaoButtonText: {
    color: '#191919',
    fontSize: 16,
    fontWeight: '800',
  },
  googleButton: {
    borderWidth: 1,
    borderColor: '#d8c6b9',
    backgroundColor: '#fff',
  },
  googleButtonText: {
    color: '#4d4038',
    fontSize: 16,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.62,
  },
  errorMessage: {
    alignSelf: 'center',
    color: '#b42318',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    paddingTop: 4,
    textAlign: 'center',
  },
});
