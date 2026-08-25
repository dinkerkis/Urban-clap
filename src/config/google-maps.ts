import Constants from 'expo-constants';

import appJson from '../../app.json';

function asKey(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

const fromAppJson = asKey(appJson.expo?.android?.config?.googleMaps?.apiKey);

export const GOOGLE_MAPS_API_KEY =
  asKey(process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY) ||
  asKey(Constants.expoConfig?.extra?.googleMapsApiKey) ||
  asKey(Constants.expoConfig?.android?.config?.googleMaps?.apiKey) ||
  fromAppJson;
