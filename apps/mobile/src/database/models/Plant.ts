import { Model, Q } from '@nozbe/watermelondb';
import { field, date, readonly, children, lazy } from '@nozbe/watermelondb/decorators';
import { Query } from '@nozbe/watermelondb';
import UserGarden from './UserGarden';
import PlantGuide from './PlantGuide';

export default class Plant extends Model {
  static table = 'plants';
  static associations = {
    user_gardens: { type: 'has_many' as const, foreignKey: 'plant_id' },
    plant_guides: { type: 'has_many' as const, foreignKey: 'plant_id' },
  };

  @field('name') name!: string;
  @field('scientific_name') scientificName?: string;
  @field('description') description?: string;
  @field('is_edible') isEdible!: boolean;
  @field('is_toxic') isToxic!: boolean;
  @field('sunlight_requirement') sunlightRequirement?: string;
  @field('water_requirement') waterRequirement?: string;
  @field('difficulty_level') difficultyLevel?: string;
  @field('image_url') imageUrl?: string;
  @readonly @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @date('deleted_at') deletedAt?: Date;

  @children('user_gardens') userGardens!: Query<UserGarden>;
  
  @lazy guide = this.collections
    .get<PlantGuide>('plant_guides')
    .query(Q.where('plant_id', this.id));
}
