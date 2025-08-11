import { Database, Model, Q } from "@nozbe/watermelondb";
import { field, text } from "@nozbe/watermelondb/decorators";
import database from "@/database/database";
import UserData from "./DTO/UserDTO";
import UserDTO from "./DTO/UserDTO";

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


static async createMeal(database: Database, mealData: { userId: string; mealName: string; calories: number; protein: number; carbohydrates: number; fats: number; label: string; createdAt: number; }): Promise<Meal> {
  return await database.get<Meal>("meals").create((meal) => {
    meal.userId = mealData.userId;
    meal.mealName = mealData.mealName;
    meal.calories = mealData.calories;
    meal.protein = mealData.protein;
    meal.carbohydrates = mealData.carbohydrates;
    meal.fats = mealData.fats;
    meal.label = mealData.label;
    meal.createdAt = mealData.createdAt;
  });
}

static async getAllMeals(database: Database): Promise<Meal[]> {
  return await database.get<Meal>("meals").query().fetch();
}

static async getTodayMeals(database: Database): Promise<Meal[]> {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).getTime();

  return await database.get<Meal>("meals").query(Q.where("created_at", Q.between(startOfDay, endOfDay))).fetch();
}


}
