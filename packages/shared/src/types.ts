export interface GrowthPhase {
  id: string;
  name: string;
  duration_days: number;
  description: string;
  tasks: GrowingTask[];
}

export interface GrowingTask {
  id: string;
  title: string;
  description: string;
  frequency_days?: number;
  type: 'watering' | 'fertilizing' | 'pruning' | 'harvesting' | 'observation';
}

export interface PlantGuide {
  plant_id: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  sunlight: string;
  water_schedule: string;
  soil_type: string;
  phases: GrowthPhase[];
}

export interface UserContext {
  experience_level: string;
  location_type: 'indoor' | 'balcony' | 'rooftop' | 'backyard';
  climate_zone?: string;
  current_season: string;
}
