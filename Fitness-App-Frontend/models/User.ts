import { Model } from '@nozbe/watermelondb';
import { field, text } from '@nozbe/watermelondb/decorators';

export class User extends Model {
  static table = 'user';

  @field('user_id') userId!: string;
  @field('name') name!: string;
  @field('email') email!: string;
  @field('age') age!: number;
  @field('gender') gender!: string;
  @field('height') height!: string;
  @field('weight') weight!: number;
  @field('equipment_access') equipmentAccess!: string;
  @field('activity_level') activityLevel!: string;
  @field('fitness_level') fitnessLevel!: string;
  @field('weight_goal') goal!: string;
  @field('BMI') BMI!: number;
  @field('BMR') BMR!: number;
  @field('TDEE') TDEE!: number;
  @field('caloric_intake') caloricIntake!: number;
  @field('calorie_deficit') calorieDeficit!: string;
  @field('unit') unit!: string;

}
