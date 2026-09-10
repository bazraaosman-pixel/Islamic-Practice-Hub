import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { LocationData } from './prayerData';

const KEY = '@noor-al-salah/last-location';
export const DEFAULT_LOCATION: LocationData = { latitude: -1.286389, longitude: 36.817223, city: 'Nairobi, Kenya' };
export async function getCachedLocation(): Promise<LocationData | null> {
  try { const value = await AsyncStorage.getItem(KEY); return value ? JSON.parse(value) : null; } catch { return null; }
}
export async function requestCurrentLocation(): Promise<LocationData> {
  if (Platform.OS === 'web') {
    return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(
      (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude, city: `${p.coords.latitude.toFixed(3)}, ${p.coords.longitude.toFixed(3)}` }), reject));
  }
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) throw new Error(permission.canAskAgain ? 'location-denied' : 'location-settings');
  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  let city: string | undefined;
  try {
    const [place] = await Location.reverseGeocodeAsync({ latitude: position.coords.latitude, longitude: position.coords.longitude });
    city = [place?.city ?? place?.district, place?.country].filter(Boolean).join(', ') || undefined;
  } catch {
    city = undefined;
  }
  const location = { latitude: position.coords.latitude, longitude: position.coords.longitude, city };
  await AsyncStorage.setItem(KEY, JSON.stringify(location));
  return location;
}