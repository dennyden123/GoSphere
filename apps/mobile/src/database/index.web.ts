import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import schema from './schema';
import migrations from './migrations';
import Plant from './models/Plant';
import UserGarden from './models/UserGarden';
import PlantGuide from './models/PlantGuide';
import GardenLog from './models/GardenLog';

const adapter = new LokiJSAdapter({
  schema,
  migrations,
  useWebWorker: false,
  useIncrementalIndexedDB: true,
  dbName: 'GroSphereLoki',
  onSetUpError: error => {
    console.error('LokiJS setup error:', error);
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
