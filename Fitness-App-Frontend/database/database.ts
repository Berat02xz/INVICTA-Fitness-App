import { Database } from '@nozbe/watermelondb'
import { adapter } from './adapter'
import { User } from '../models/User'
import { Meal } from '../models/Meals'
import { SavedMessage } from '../models/SavedMessage'

export const database = new Database({
  adapter,
  modelClasses: [User, Meal, SavedMessage],
})
export default database;
