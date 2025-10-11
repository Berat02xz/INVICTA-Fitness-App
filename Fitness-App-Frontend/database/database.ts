import { Database } from '@nozbe/watermelondb'
import { adapter } from './adapter'
import { User } from '../models/User'
import { Meal } from '../models/Meals'

export const database = new Database({
  adapter,
  modelClasses: [User, Meal],
})
export default database;
