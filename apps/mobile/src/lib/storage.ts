import * as SecureStore from 'expo-secure-store';

const CHUNK_SIZE = 2000;

export const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const manifest = await SecureStore.getItemAsync(`${key}_manifest`);
      if (!manifest) {
        return SecureStore.getItemAsync(key);
      }
      
      const count = parseInt(manifest, 10);
      let value = '';
      for (let i = 0; i < count; i++) {
        const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
        if (!chunk) return null;
        value += chunk;
      }
      return value;
    } catch (error) {
      console.error(`SecureStore getItem error for ${key}:`, error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      // First clean up any existing chunks or legacy value
      await ExpoSecureStoreAdapter.removeItem(key);

      if (value.length <= CHUNK_SIZE) {
        await SecureStore.setItemAsync(key, value);
        return;
      }

      const count = Math.ceil(value.length / CHUNK_SIZE);
      await SecureStore.setItemAsync(`${key}_manifest`, count.toString());
      
      for (let i = 0; i < count; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, value.length);
        await SecureStore.setItemAsync(`${key}_chunk_${i}`, value.substring(start, end));
      }
    } catch (error) {
      console.error(`SecureStore setItem error for ${key}:`, error);
      throw error;
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
      const manifest = await SecureStore.getItemAsync(`${key}_manifest`);
      if (manifest) {
        const count = parseInt(manifest, 10);
        for (let i = 0; i < count; i++) {
          await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
        }
        await SecureStore.deleteItemAsync(`${key}_manifest`);
      }
    } catch (error) {
      console.error(`SecureStore removeItem error for ${key}:`, error);
    }
  },
};
