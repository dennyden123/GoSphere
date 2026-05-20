import { database } from './index';
import Plant from './models/Plant';
import UserGarden from './models/UserGarden';
import GardenLog from './models/GardenLog';

export const verifyDatabase = async () => {
  console.log('Starting WatermelonDB verification...');
  
  try {
    await database.write(async () => {
      // 1. Create a test plant
      const newPlant = await database.get<Plant>('plants').create((plant) => {
        plant.name = 'Test Tomato';
        plant.scientificName = 'Solanum lycopersicum';
        plant.isEdible = true;
        plant.isToxic = false;
        plant.sunlightRequirement = 'Full Sun';
        plant.waterRequirement = 'High';
      });
      console.log('Created plant:', newPlant.name);

      // 2. Create a user garden entry
      const newUserGarden = await database.get<UserGarden>('user_gardens').create((ug) => {
        ug.userId = 'test-user-uuid';
        ug.plantId = newPlant.id;
        ug.customName = 'My First Tomato';
        ug.datePlanted = new Date().toISOString();
        ug.status = 'Healthy';
        ug.location = 'Balcony';
      });
      console.log('Created user garden entry:', newUserGarden.customName);

      // 3. Create a log
      const newLog = await database.get<GardenLog>('garden_logs').create((log) => {
        log.userGardenId = newUserGarden.id;
        log.activityType = 'Watered';
        log.notes = 'First watering after planting';
      });
      console.log('Created log for activity:', newLog.activityType);
    });

    // 4. Verification Read
    const plantsCount = await database.get<Plant>('plants').query().fetchCount();
    const userGardens = await database.get<UserGarden>('user_gardens').query().fetch();
    const logs = await database.get<GardenLog>('garden_logs').query().fetch();

    console.log(`Verification complete:
      - Plants count: ${plantsCount}
      - User Garden entries: ${userGardens.length}
      - Logs entries: ${logs.length}
    `);

    if (userGardens.length > 0) {
      const firstGarden = userGardens[0];
      const plant = await firstGarden.plant.fetch();
      console.log(`Relation check: UserGarden "${firstGarden.customName}" belongs to Plant "${plant?.name}"`);
    }

    return true;
  } catch (error) {
    console.error('Database verification failed:', error);
    return false;
  }
};
