import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wms.app',
  appName: 'WMS仓库管理',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: ['*']
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined
    },
    minSdkVersion: 22,
    targetSdkVersion: 33
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: '#409eff',
      showSpinner: true,
      spinnerColor: '#ffffff',
      androidSpinnerStyle: 'large'
    }
  }
};

export default config;
