import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';
import { Database, Q } from '@nozbe/watermelondb';

export class LikedExercise extends Model {
  static table = 'liked_exercises';

  @field('exercise_id') exerciseId!: string;
  @field('name') name!: string;
  @field('gif_url') gifUrl!: string;
  @field('category') category!: string;
  @field('liked_at') likedAt!: number;

  static async isLiked(database: Database, exerciseId: string): Promise<boolean> {
    try {
      const collection = database.collections.get<LikedExercise>('liked_exercises');
      const results = await collection.query(Q.where('exercise_id', exerciseId)).fetchCount();
      return results > 0;
    } catch {
      return false;
    }
  }

  static async toggle(
    database: Database,
    exerciseId: string,
    name: string,
    gifUrl: string,
    category: string,
  ): Promise<boolean> {
    const collection = database.collections.get<LikedExercise>('liked_exercises');
    const existing = await collection.query(Q.where('exercise_id', exerciseId)).fetch();

    if (existing.length > 0) {
      await database.write(async () => {
        for (const record of existing) {
          await record.destroyPermanently();
        }
      });
      return false; // unliked
    } else {
      await database.write(async () => {
        await collection.create((rec) => {
          rec.exerciseId = exerciseId;
          rec.name = name;
          rec.gifUrl = gifUrl;
          rec.category = category;
          rec.likedAt = Date.now();
        });
      });
      return true; // liked
    }
  }

  static async getAll(database: Database): Promise<LikedExercise[]> {
    try {
      const collection = database.collections.get<LikedExercise>('liked_exercises');
      return collection.query(Q.sortBy('liked_at', Q.desc)).fetch();
    } catch {
      return [];
    }
  }
}
