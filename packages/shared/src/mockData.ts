import { PlantGuide } from './types';

export const MOCK_GUIDES: Record<string, PlantGuide> = {
  'monstera-id': {
    plant_id: 'monstera-id',
    difficulty: 'intermediate',
    sunlight: 'Medium Indirect',
    water_schedule: 'Every 7-10 days',
    soil_type: 'Peat-based potting mix',
    phases: [
      {
        id: 'p1',
        name: 'Acclimation',
        duration_days: 14,
        description: 'Allow the plant to adjust to its new environment.',
        tasks: [
          { id: 't1', title: 'Monitor Light', description: 'Ensure it is not in direct scorching sun.', type: 'observation' },
          { id: 't2', title: 'Check Moisture', description: 'Water only when top 2 inches are dry.', type: 'watering', frequency_days: 7 }
        ]
      },
      {
        id: 'p2',
        name: 'Vegetative Growth',
        duration_days: 60,
        description: 'Active leaf and stem development.',
        tasks: [
          { id: 't3', title: 'Fertilize', description: 'Apply balanced liquid fertilizer.', type: 'fertilizing', frequency_days: 30 },
          { id: 't4', title: 'Clean Leaves', description: 'Wipe dust off leaves to improve photosynthesis.', type: 'observation', frequency_days: 14 }
        ]
      }
    ]
  },
  'tomato-id': {
    plant_id: 'tomato-id',
    difficulty: 'beginner',
    sunlight: 'Full Sun',
    water_schedule: 'Daily or every other day',
    soil_type: 'Well-draining compost rich soil',
    phases: [
      {
        id: 'tp1',
        name: 'Seedling',
        duration_days: 21,
        description: 'Developing first true leaves.',
        tasks: [
          { id: 'tt1', title: 'Water', description: 'Keep soil consistently moist but not soggy.', type: 'watering', frequency_days: 1 }
        ]
      },
      {
        id: 'tp2',
        name: 'Vegetative',
        duration_days: 30,
        description: 'Rapid stem and foliage growth.',
        tasks: [
          { id: 'tt2', title: 'Support', description: 'Add a stake or cage for support.', type: 'observation' },
          { id: 'tt3', title: 'Prune Suckers', description: 'Remove small shoots between branch and stem.', type: 'pruning', frequency_days: 7 }
        ]
      }
    ]
  }
};
