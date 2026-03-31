// adapter.ts
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { schema } from './schema'
import { migrations } from './migrations'

export const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: true,
  onSetUpError: _error => {
    // Migration failed (e.g. DB existed before migrations were introduced).
    // Reset the database so it is recreated from the current schema.
    adapter.unsafeResetDatabase();
  },
})
