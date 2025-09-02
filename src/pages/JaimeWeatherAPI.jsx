import { cache } from '@/components/utils/cache';
import { getWeather } from '@/api/functions'; // Importa la nueva función de backend

const CACHE_TTL_MS = 5 * 60 * 1000; // Cache de 5 minutos
const DEFAULT_TZ = 'America/Santiago';

// Mantenemos la generación de datos mock como un último recurso en el cliente
// si la función de backend falla por completo.
function generateMockWeatherData(lat, lon) {
  const now = new Date();
  const localTime = now.toLocaleString('es-CL', { 
    timeZone: DEFAULT_TZ,
    hour12: false,
    hour: '2-digit', 
    minute: '2-digit'
  });

  const isDaytime = (sunrise, sunset, currentTime) => {
    return currentTime >= sunrise && currentTime < sunset;
  };
  
  const mockTemp = 5 + Math.round(Math.random() * 8); // Rango de 5-13°C
  const conditions = ["cielo despejado", "parcialmente nublado", "nublado", "lluvia ligera"];
  
  return {
    source: "mock (fallback)",
    last_updated_local: localTime,
    temperature_c: mockTemp,
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    wind_kmh: 5 + Math.round(Math.random() * 15),
    humidity: 65 + Math.round(Math.random() * 25),
    sunrise: "07:50",
    sunset: "18:10", 
    timezone: DEFAULT_TZ,
    is_day: isDaytime("07:50", "18:10", localTime),
    minutes_since_update: 0,
    updated_at_utc: now.toISOString(),
  };
}

export default async function JaimeWeatherAPI({ lat, lon, forceRefresh = false }) {
  const latitude = lat || -41.317;
  const longitude = lon || -72.985;
  const cacheKey = `weather-backend-${latitude}-${longitude}`;

  if (forceRefresh) {
    cache.delete(cacheKey);
  }

  // Revisar el cache del cliente primero
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    const lastUpdated = new Date(cachedData.updated_at_utc);
    const now = new Date();
    // Calcular dinámicamente cuántos minutos han pasado
    cachedData.minutes_since_update = Math.round((now.getTime() - lastUpdated.getTime()) / 60000);
    return { success: true, data: cachedData };
  }
  
  try {
    // Llamar a nuestra nueva función de backend
    const response = await getWeather({ lat: latitude, lon: longitude });

    // La plataforma Base44 envuelve la respuesta en `response.data`
    const result = response.data;
    
    if (result && result.success) {
      const weatherData = result.data;
      // Añadir una marca de tiempo del lado del cliente para la lógica de caché
      weatherData.updated_at_utc = new Date().toISOString();
      cache.set(cacheKey, weatherData, CACHE_TTL_MS);
      return { success: true, data: weatherData };
    } else {
      throw new Error(result.error || 'La función de backend no tuvo éxito.');
    }
  } catch (error) {
    // Esto atrapa errores de red al llamar a la función o si la función devolvió un error.
    console.error('Error al obtener el clima desde el backend:', error.message);
    const mockData = generateMockWeatherData(latitude, longitude);
    
    return { 
      success: true, // Devolvemos éxito para no romper la interfaz de Jaime
      data: mockData,
      warning: 'Usando datos de respaldo - servicio climático no disponible' 
    };
  }
}