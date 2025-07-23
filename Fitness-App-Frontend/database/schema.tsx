import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'onboarding_answers',
      columns: [
        { name: 'question', type: 'string' },
        { name: 'answer', type: 'string' },
      ],
    }),
  ],
});
