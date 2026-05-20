import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface WeatherData {
  currentTemp: number;
  precipitation: number;
  description: string;
  isRainy: boolean;
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Request Permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access location was denied');
      }

      // 2. Get Location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // 3. Fetch from Open-Meteo (Free, no key)
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=precipitation_sum&timezone=auto`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.current_weather) {
        setWeather({
          currentTemp: data.current_weather.temperature,
          precipitation: data.daily.precipitation_sum[0],
          description: `Temperature: ${data.current_weather.temperature}°C, Rain: ${data.daily.precipitation_sum[0]}mm`,
          isRainy: data.daily.precipitation_sum[0] > 5, // Threshold for skipping watering
        });
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Weather Fetch Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  return { weather, isLoading, error, refresh: fetchWeather };
}
