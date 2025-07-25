import { Database } from '@nozbe/watermelondb'
import { adapter } from './adapter'
import { User } from '../models/User'

export const database = new Database({
  adapter,
  modelClasses: [User],
})
export default database;
