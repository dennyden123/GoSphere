import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import UserGarden from '../database/models/UserGarden';
import { WeatherData } from '../hooks/useWeather';

// Configure how notifications are handled when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
}

/**
 * Schedules watering reminders based on plant species and current weather.
 */
export async function scheduleWateringReminders(specimens: UserGarden[], weather: WeatherData | null) {
  // 1. Clear existing notifications to avoid duplicates
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!weather) return;

  for (const specimen of specimens) {
    // Basic logic: if it's rainy (precipitation > 5mm), skip the notification
    if (weather.isRainy) {
      console.log(`SyncManager: Skipping reminder for ${specimen.customName} due to rain.`);
      continue;
    }

    // Schedule a reminder for 9 AM tomorrow
    const trigger = new Date();
    trigger.setHours(9, 0, 0, 0);
    trigger.setDate(trigger.getDate() + 1);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🌱 Gardening Telemetry Alert",
        body: `Hydration required for specimen: ${specimen.customName}. System recommends 250ml.`,
        data: { specimenId: specimen.id },
        sound: true,
      },
      trigger: trigger as any,
    });
  }
  
  console.log(`SyncManager: Scheduled ${specimens.length} watering reminders.`);
}
