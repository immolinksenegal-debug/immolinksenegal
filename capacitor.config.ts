import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.01dbc068805e4d77a6a797cb8ef758ae',
  appName: 'immolinksenegal',
  webDir: 'dist',
  server: {
    url: 'https://01dbc068-805e-4d77-a6a7-97cb8ef758ae.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Geolocation: {
      // Configuration pour la géolocalisation
    }
  }
};

export default config;
