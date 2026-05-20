import { Model, Relation } from '@nozbe/watermelondb';
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators';
import UserGarden from './UserGarden';

export default class GardenLog extends Model {
  static table = 'garden_logs';
  static associations = {
    user_gardens: { type: 'belongs_to' as const, key: 'user_garden_id' },
  };

  @field('user_garden_id') userGardenId!: string;
  @field('activity_type') activityType!: string;
  @field('notes') notes?: string;
  @field('telemetry_value') telemetryValue?: number;
  @field('telemetry_unit') telemetryUnit?: string;
  @readonly @date('log_date') logDate!: Date;
  @readonly @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @date('deleted_at') deletedAt?: Date;

  @relation('user_gardens', 'user_garden_id') userGarden!: Relation<UserGarden>;
}
