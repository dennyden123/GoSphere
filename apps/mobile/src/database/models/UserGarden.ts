import { Model, Relation } from '@nozbe/watermelondb';
import { field, date, readonly, relation, children } from '@nozbe/watermelondb/decorators';
import { Query } from '@nozbe/watermelondb';
import Plant from './Plant';
import GardenLog from './GardenLog';

export default class UserGarden extends Model {
  static table = 'user_gardens';
  static associations = {
    plants: { type: 'belongs_to' as const, key: 'plant_id' },
    garden_logs: { type: 'has_many' as const, foreignKey: 'user_garden_id' },
  };

  @field('user_id') userId!: string;
  @field('plant_id') plantId!: string;
  @field('custom_name') customName!: string;
  @field('date_planted') datePlanted!: string;
  @field('status') status!: string;
  @field('location') location?: string;
  @readonly @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @date('deleted_at') deletedAt?: Date;

  @relation('plants', 'plant_id') plant!: Relation<Plant>;
  @children('garden_logs') logs!: Query<GardenLog>;
}
