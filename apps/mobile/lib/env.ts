function readRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} 환경변수가 설정되지 않았습니다.`);
  }

  return value;
}

export const mobileEnv = {
  apiUrl: readRequiredEnv('EXPO_PUBLIC_API_URL'),
  supabaseAnonKey: readRequiredEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  supabaseUrl: readRequiredEnv('EXPO_PUBLIC_SUPABASE_URL'),
};
