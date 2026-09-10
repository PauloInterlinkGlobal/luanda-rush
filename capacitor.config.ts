import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lotador.game',
  appName: 'Lotador',
  webDir: '.output/public',
  bundledWebRuntime: false,
  server: { androidScheme: 'https' },
};

export default config;
