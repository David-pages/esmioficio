import { MEXICO_LOCATIONS } from '../constants';

export interface ResolvedLocation {
  stateId: string;
  stateName: string;
  municipalityId: string;
  municipalityName: string;
}

type ReverseGeocodingAddress = {
  city?: string;
  town?: string;
  municipality?: string;
  county?: string;
  state?: string;
};

const DETECTED_CITY_CACHE_KEY = 'esmiOficio_detected_city';
const DETECTED_CITY_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
let cityDetectionPromise: Promise<string | null> | null = null;

const normalize = (value: string) => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const getCachedDetectedCity = () => {
  if (typeof window === 'undefined' || !window.localStorage) return null;

  try {
    const saved = window.localStorage.getItem(DETECTED_CITY_CACHE_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved);
    if (
      typeof parsed?.city === 'string' &&
      parsed.city.trim() &&
      typeof parsed?.expiresAt === 'number' &&
      parsed.expiresAt > Date.now()
    ) {
      return parsed.city.trim();
    }

    window.localStorage.removeItem(DETECTED_CITY_CACHE_KEY);
  } catch {
    try {
      window.localStorage.removeItem(DETECTED_CITY_CACHE_KEY);
    } catch {
      // Ignore storage cleanup failures.
    }
  }

  return null;
};

const cacheDetectedCity = (city: string) => {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    window.localStorage.setItem(
      DETECTED_CITY_CACHE_KEY,
      JSON.stringify({
        city,
        expiresAt: Date.now() + DETECTED_CITY_CACHE_TTL_MS
      })
    );
  } catch {
    // localStorage can be unavailable in private browsing or restricted contexts.
  }
};

const getCurrentBrowserPosition = () => new Promise<GeolocationPosition>((resolve, reject) => {
  navigator.geolocation.getCurrentPosition(resolve, reject, {
    enableHighAccuracy: false,
    timeout: 9000,
    maximumAge: 10 * 60 * 1000
  });
});

const pickCityFromAddress = (address: ReverseGeocodingAddress) => {
  const value = [
    address.city,
    address.town,
    address.municipality,
    address.county,
    address.state
  ].find(item => typeof item === 'string' && item.trim());

  return value?.trim() || null;
};

const stateAliases: Record<string, string> = {
  michoacan: 'michoacan',
  'michoacan de ocampo': 'michoacan',
  cdmx: 'cdmx',
  'ciudad de mexico': 'cdmx',
  'mexico city': 'cdmx',
  'estado de mexico': 'mexico_edo',
  'nuevo leon': 'nuevo_leon',
  'baja california': 'baja_california',
  'baja california sur': 'baja_california_sur',
  'san luis potosi': 'san_luis_potosi',
  queretaro: 'queretaro',
  yucatan: 'yucatan'
};

const getStateId = (stateName?: string | null) => {
  const normalized = normalize(stateName || '');
  if (!normalized) return null;
  if (stateAliases[normalized]) return stateAliases[normalized];
  return MEXICO_LOCATIONS.find(state => normalize(state.name) === normalized || normalize(state.id) === normalized)?.id || null;
};

const getMunicipalityId = (stateId: string, municipalityName?: string | null) => {
  const state = MEXICO_LOCATIONS.find(item => item.id === stateId);
  if (!state) return null;

  const normalized = normalize(municipalityName || '');
  if (!normalized) return null;

  return state.municipalities.find(municipality => (
    normalize(municipality.name) === normalized ||
    normalize(municipality.id) === normalized ||
    normalized.includes(normalize(municipality.name)) ||
    normalize(municipality.name).includes(normalized)
  ))?.id || null;
};

const fallbackByCoordinates = (lat: number, lon: number): ResolvedLocation | null => {
  const isMoreliaArea = lat >= 19.55 && lat <= 19.95 && lon >= -101.45 && lon <= -101.0;
  if (isMoreliaArea) {
    return {
      stateId: 'michoacan',
      stateName: 'Michoacan',
      municipalityId: 'morelia',
      municipalityName: 'Morelia'
    };
  }

  return null;
};

export const resolveBrowserLocation = async (): Promise<ResolvedLocation> => {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
    throw new Error('Tu navegador no permite usar ubicacion.');
  }

  const position = await getCurrentBrowserPosition();

  const { latitude, longitude } = position.coords;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=es`,
      { headers: { Accept: 'application/json' } }
    );

    if (response.ok) {
      const data = await response.json();
      const address = data.address || {};
      const stateId = getStateId(address.state || address.region || address.province);
      if (stateId) {
        const state = MEXICO_LOCATIONS.find(item => item.id === stateId);
        const municipalityId = getMunicipalityId(
          stateId,
          address.city || address.town || address.village || address.municipality || address.county || address.state_district
        );
        const municipality = state?.municipalities.find(item => item.id === municipalityId);

        if (state && municipality) {
          return {
            stateId: state.id,
            stateName: state.name,
            municipalityId: municipality.id,
            municipalityName: municipality.name
          };
        }
      }
    }
  } catch {
    const fallback = fallbackByCoordinates(latitude, longitude);
    if (fallback) return fallback;
  }

  const fallback = fallbackByCoordinates(latitude, longitude);
  if (fallback) return fallback;

  throw new Error('No pudimos identificar tu municipio. Puedes elegirlo manualmente.');
};

export const detectUserCity = async (): Promise<string | null> => {
  const cachedCity = getCachedDetectedCity();
  if (cachedCity) return cachedCity;

  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
    return null;
  }

  if (cityDetectionPromise) return cityDetectionPromise;

  cityDetectionPromise = (async () => {
    try {
      const position = await getCurrentBrowserPosition();
      const { latitude, longitude } = position.coords;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${latitude}&lon=${longitude}&accept-language=es`,
        { headers: { Accept: 'application/json' } }
      );

      if (!response.ok) return null;

      const data = await response.json();
      const city = pickCityFromAddress(data.address || {});
      if (!city) return null;

      cacheDetectedCity(city);
      return city;
    } catch {
      return null;
    } finally {
      cityDetectionPromise = null;
    }
  })();

  return cityDetectionPromise;
};

export const getLocationNamesFromIds = (stateId: string, municipalityId: string) => {
  const state = MEXICO_LOCATIONS.find(item => item.id === stateId);
  const municipality = state?.municipalities.find(item => item.id === municipalityId);

  return {
    stateName: state?.name || '',
    municipalityName: municipality?.name || ''
  };
};
