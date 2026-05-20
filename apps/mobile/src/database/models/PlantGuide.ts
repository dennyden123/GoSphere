import { Model, Relation } from '@nozbe/watermelondb';
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators';
import Plant from './Plant';

export default class PlantGuide extends Model {
  static table = 'plant_guides';
  static associations = {
    plants: { type: 'belongs_to' as const, key: 'plant_id' },
  };

  @field('plant_id') plantId!: string;
  @field('difficulty') difficulty!: string;
  @field('sunlight') sunlight!: string;
  @field('water_schedule') waterSchedule!: string;
  @field('soil_type') soilType!: string;
  @field('phases') phases!: string; // Stored as JSON string
  @readonly @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @date('deleted_at') deletedAt?: Date;

  @relation('plants', 'plant_id') plant!: Relation<Plant>;

  get parsedPhases() {
    try {
      return JSON.parse(this.phases);
    } catch {
      return [];
    }
  }
}
