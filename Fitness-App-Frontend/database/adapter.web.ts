// adapter.web.ts
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs'
import { schema } from './schema'
import { migrations } from './migrations'

export const adapter = new LokiJSAdapter({
  schema,
  migrations,
  useWebWorker: false,
  useIncrementalIndexedDB: true,
  onSetUpError: _error => {
    adapter.unsafeResetDatabase();
  },
})
