import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 3,
  tables: [
    tableSchema({
      name: 'plants',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'scientific_name', type: 'string', isOptional: true },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'is_edible', type: 'boolean' },
        { name: 'is_toxic', type: 'boolean' },
        { name: 'sunlight_requirement', type: 'string', isOptional: true },
        { name: 'water_requirement', type: 'string', isOptional: true },
        { name: 'difficulty_level', type: 'string', isOptional: true },
        { name: 'image_url', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'user_gardens',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'plant_id', type: 'string', isIndexed: true },
        { name: 'custom_name', type: 'string' },
        { name: 'date_planted', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'location', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'plant_guides',
      columns: [
        { name: 'plant_id', type: 'string', isIndexed: true },
        { name: 'difficulty', type: 'string' },
        { name: 'sunlight', type: 'string' },
        { name: 'water_schedule', type: 'string' },
        { name: 'soil_type', type: 'string' },
        { name: 'phases', type: 'string' }, // We'll store JSON as string
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'garden_logs',
      columns: [
        { name: 'user_garden_id', type: 'string', isIndexed: true },
        { name: 'activity_type', type: 'string' },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'telemetry_value', type: 'number', isOptional: true },
        { name: 'telemetry_unit', type: 'string', isOptional: true },
        { name: 'log_date', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),
  ],
});
