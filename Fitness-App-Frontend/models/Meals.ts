import { Database, Model, Q } from "@nozbe/watermelondb";
import { field, text } from "@nozbe/watermelondb/decorators";
import database from "@/database/database";
import UserData from "./DTO/UserDTO";
import UserDTO from "./DTO/UserDTO";
import { User } from "./User";

export class Meal extends Model {
  static table = "meals";

  @field("user_id") userId!: string;
  @field("meal_name") mealName!: string;
  @field("calories") calories!: number;
  @field("protein") protein!: number;
  @field("carbohydrates") carbohydrates!: number;
  @field("fats") fats!: number;
  @field("label") label!: string;
  @field("created_at") createdAt!: number;
  @field("health_score") healthScore!: number;


static async createMeal(database: Database, mealData: { userId: string; mealName: string; calories: number; protein: number; carbohydrates: number; fats: number; label: string; createdAt: number; healthScore: number; }): Promise<Meal> {
  return await database.write(async () => {
    return await database.get<Meal>("meals").create((meal) => {
      meal.userId = mealData.userId;
      meal.mealName = mealData.mealName;
      meal.calories = mealData.calories;
      meal.protein = mealData.protein;
      meal.carbohydrates = mealData.carbohydrates;
      meal.fats = mealData.fats;
      meal.label = mealData.label;
      meal.createdAt = mealData.createdAt;
      meal.healthScore = mealData.healthScore;
    });
  });
}

static async getAllMeals(database: Database): Promise<Meal[]> {
  return await database.get<Meal>("meals").query().fetch();
}

static async getTodayMeals(database: Database, userId?: string): Promise<Meal[]> {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).getTime();

  const query = userId 
    ? Q.and(
        Q.where("user_id", userId),
        Q.where("created_at", Q.between(startOfDay, endOfDay))
      )
    : Q.where("created_at", Q.between(startOfDay, endOfDay));

  return await database.get<Meal>("meals").query(query).fetch();
}

static async deleteMealsForUser(database: Database, userId: string): Promise<void> {
  await database.write(async () => {
    const userMeals = await database.get<Meal>("meals").query(Q.where("user_id", userId)).fetch();
    await Promise.all(userMeals.map((meal) => meal.destroyPermanently()));
  });
}

static async DaySumCalories(database: Database, userId?: string, date?: Date): Promise<number> {
  const startOfDay = date ? new Date(date.setHours(0, 0, 0, 0)).getTime() : 0;
  const endOfDay = date ? new Date(date.setHours(23, 59, 59, 999)).getTime() : 0;

  const query = userId
    ? Q.and(
        Q.where("user_id", userId),
        Q.where("created_at", Q.between(startOfDay, endOfDay))
      )
    : Q.where("created_at", Q.between(startOfDay, endOfDay));

  const meals = await database.get<Meal>("meals").query(query).fetch();
  return meals.reduce((sum, meal) => sum + meal.calories, 0);
}

static async DaySuccesfulCalorieIntake(database: Database, userId: string, date?: Date): Promise<boolean> {
  const targetDate = date || new Date();
  const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0)).getTime();
  const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999)).getTime();

  // Check if there are any meals for this day
  const mealsQuery = Q.and(
    Q.where("user_id", userId),
    Q.where("created_at", Q.between(startOfDay, endOfDay))
  );
  const meals = await database.get<Meal>("meals").query(mealsQuery).fetch();
  
  // If no meals, day is unsuccessful
  if (meals.length === 0) {
    return false;
  }

  // If meals exist, check if total calories are within target
  const user = await database.get<User>("user").query(Q.where("user_id", userId)).fetch();
  const caloricIntake = user[0]?.caloricIntake || 0;
  const totalCalories = await Meal.DaySumCalories(database, userId, targetDate);
  return totalCalories > 0 && totalCalories <= caloricIntake;
}


}