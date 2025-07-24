import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 2,
  tables: [
    tableSchema({
      name: 'user_info',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string' },

        { name: 'age', type: 'number' },
        { name: 'gender', type: 'string' },
        { name: 'height', type: 'number' },
        { name: 'weight', type: 'number' },

        { name: 'activity_level', type: 'string' },
        { name: 'fitness_level', type: 'string' },
        { name: 'weight_goal', type: 'string' },

        { name: 'BMI', type: 'number' },
        { name: 'BMR', type: 'number' },
        { name: 'TDEE', type: 'number' },
        { name: 'caloric_intake', type: 'number' },

        { name: 'unit', type: 'string' },
      ],
    }),
  ],
});
