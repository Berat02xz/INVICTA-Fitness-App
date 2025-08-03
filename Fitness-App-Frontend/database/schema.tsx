import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 5, 
  tables: [
    tableSchema({
      name: 'user',
      columns: [
        { name: 'user_id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string' },

        { name: 'age', type: 'number' },
        { name: 'gender', type: 'string' },
        { name: 'height', type: 'string' },
        { name: 'weight', type: 'number' },

        { name: 'equipment_access', type: 'string' },
        { name: 'activity_level', type: 'string' },
        { name: 'fitness_level', type: 'string' },
        { name: 'weight_goal', type: 'string' },

        { name: 'bmi', type: 'number' },
        { name: 'bmr', type: 'number' },
        { name: 'tdee', type: 'number' },
        { name: 'caloric_intake', type: 'number' },
        { name: 'caloric_deficit', type: 'string' },

        { name: 'unit', type: 'string' },
        { name: 'app_name', type: 'string' },
      ],
    }),
  ],
});
