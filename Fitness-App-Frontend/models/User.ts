import { Database, Model } from "@nozbe/watermelondb";
import { field, text } from "@nozbe/watermelondb/decorators";
import UserData from "./DTO/UserDTO";
import UserDTO from "./DTO/UserDTO";

export class User extends Model {
  static table = "user";

  @field("user_id") userId!: string;
  @field("name") name!: string;
  @field("email") email!: string;
  @field("age") age!: number;
  @field("gender") gender!: string;
  @field("height") height!: string;
  @field("weight") weight!: number;
  @field("equipment_access") equipmentAccess!: string;
  @field("activity_level") activityLevel!: string;
  @field("fitness_level") fitnessLevel!: string;
  @field("weight_goal") goal!: string;
  @field("bmi") bmi!: number | any;
  @field("bmr") bmr!: number | any;
  @field("tdee") tdee!: number | any;
  @field("caloric_intake") caloricIntake!: number;
  @field("caloric_deficit") caloricDeficit!: string;
  @field("unit") unit!: string;
  @field("app_name") appName!: string;
  @field("role") role!: string; // "FREE", "PREMIUM", "ADMIN"

  static async createUser(database: Database, UserData: UserDTO): Promise<User> {
    return await database.get<User>("user").create((user) => {
      user.userId = UserData.userId ?? "";
      user.name = UserData.name ?? "";
      user.email = UserData.email ?? "";
      user.age = UserData.age ?? 0;
      user.gender = UserData.gender ?? "";
      user.height = UserData.height ?? "";
      user.weight = UserData.weight ?? 0;
      user.equipmentAccess = UserData.equipmentAccess ?? "";
      user.activityLevel = UserData.activityLevel ?? "";
      user.fitnessLevel = UserData.fitnessLevel ?? "";
      user.goal = UserData.goal ?? "";
      user.bmi = UserData.bmi ?? 0;
      user.bmr = UserData.bmr ?? 0;
      user.tdee = UserData.tdee ?? 0;
      user.caloricIntake = UserData.caloricIntake ?? 0;
      user.caloricDeficit = UserData.caloricDeficit ?? "";
      user.unit = UserData.unit ?? "";
      user.appName = UserData.appName ?? "";
      user.role = UserData.role ?? "FREE"; // Default to "FREE"
    });
  }

  static async getUserDetails(database: Database): Promise<User | null> {
    const userCollection = database.get<User>("user");
    const users = await userCollection.query();
    return users.length > 0 ? users[0] : null;
  }

  static async getValue(
    database: Database,
    fieldName: keyof UserData
  ): Promise<UserData[keyof UserData] | null> {
    const user = await this.getUserDetails(database);
    return user ? (user[fieldName] as UserData[keyof UserData]) : null;
  }
}
