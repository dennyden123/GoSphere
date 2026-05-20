import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import schema from './schema';
import migrations from './migrations';
import Plant from './models/Plant';
import UserGarden from './models/UserGarden';
import PlantGuide from './models/PlantGuide';
import GardenLog from './models/GardenLog';

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  dbName: 'GroSphereOffline',
  jsi: true,
  onSetUpError: error => {
    console.error('SQLite setup error:', error);
  }
});

export const database = new Database({
  adapter,
  modelClasses: [
    Plant,
    UserGarden,
    PlantGuide,
    GardenLog,
  ],
});
