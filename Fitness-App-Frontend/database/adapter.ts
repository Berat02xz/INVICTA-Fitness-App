import Constants from 'expo-constants'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs'
import { NativeModules } from 'react-native'
import { schema } from './schema'
import { migrations } from './migrations'

const isExpoGo = Constants.appOwnership === 'expo'
const hasWatermelonNativeBridge = Boolean(
  NativeModules.WMDatabaseBridge || NativeModules.WMDatabaseJSIBridge
)

const createAdapter = () => {
  if (isExpoGo || !hasWatermelonNativeBridge) {
    if (!isExpoGo) {
      console.warn(
        '[database] WatermelonDB native bridge is unavailable; using LokiJS fallback. Rebuild the dev client to use native SQLite.'
      )
    }

    return new LokiJSAdapter({
      schema,
      migrations,
      useWebWorker: false,
      useIncrementalIndexedDB: false,
      onSetUpError: _error => {
        adapter.unsafeResetDatabase(() => { })
      },
    })
  }

  return new SQLiteAdapter({
    schema,
    migrations,
    jsi: true,
    onSetUpError: _error => {
      // Migration failed (e.g. DB existed before migrations were introduced).
      // Reset the database so it is recreated from the current schema.
      adapter.unsafeResetDatabase(() => { })
    },
  })
}

export const adapter = createAdapter()
