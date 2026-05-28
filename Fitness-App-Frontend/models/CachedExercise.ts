import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';
import { Database, Q } from '@nozbe/watermelondb';
import type { ExerciseInfo } from '@/api/ExerciseApi';

export class CachedExercise extends Model {
  static table = 'cached_exercises';

  @field('exercise_id') exerciseId: string;
  @field('name') name: string;
  @field('gif_url') gifUrl: string;
  @field('target_muscles') targetMusclesRaw: string;
  @field('body_parts') bodyPartsRaw: string;
  @field('equipments') equipmentsRaw: string;
  @field('secondary_muscles') secondaryMusclesRaw: string;
  @field('instructions') instructionsRaw: string;
  @field('cached_at') cachedAt: number;

  /** Convert DB row → ExerciseInfo */
  toExerciseInfo(): ExerciseInfo {
    return {
      exerciseId: this.exerciseId,
      name: this.name,
      gifUrl: this.gifUrl,
      targetMuscles: JSON.parse(this.targetMusclesRaw || '[]'),
      bodyParts: JSON.parse(this.bodyPartsRaw || '[]'),
      equipments: JSON.parse(this.equipmentsRaw || '[]'),
      secondaryMuscles: JSON.parse(this.secondaryMusclesRaw || '[]'),
      instructions: JSON.parse(this.instructionsRaw || '[]'),
    };
  }

  /** Load all cached exercises from DB → ExerciseInfo[] */
  static async loadAll(db: Database): Promise<ExerciseInfo[]> {
    try {
      const collection = db.collections.get<CachedExercise>('cached_exercises');
      const rows = await collection.query().fetch();
      return rows.map((r) => r.toExerciseInfo());
    } catch {
      return [];
    }
  }

  /** Persist an array of ExerciseInfo into DB (replaces all previous rows) */
  static async saveAll(db: Database, exercises: ExerciseInfo[]): Promise<void> {
    const collection = db.collections.get<CachedExercise>('cached_exercises');
    const now = Date.now();

    await db.write(async () => {
      // Delete existing cache
      const existing = await collection.query().fetch();
      for (const row of existing) {
        await row.destroyPermanently();
      }
      // Insert fresh
      for (const ex of exercises) {
        await collection.create((rec) => {
          rec.exerciseId = ex.exerciseId;
          rec.name = ex.name;
          rec.gifUrl = ex.gifUrl;
          rec.targetMusclesRaw = JSON.stringify(ex.targetMuscles);
          rec.bodyPartsRaw = JSON.stringify(ex.bodyParts);
          rec.equipmentsRaw = JSON.stringify(ex.equipments);
          rec.secondaryMusclesRaw = JSON.stringify(ex.secondaryMuscles);
          rec.instructionsRaw = JSON.stringify(ex.instructions);
          rec.cachedAt = now;
        });
      }
    });
  }

  /** Append a batch of exercises to the DB cache (no delete — used for incremental saves) */
  static async saveBatch(db: Database, exercises: ExerciseInfo[]): Promise<void> {
    const collection = db.collections.get<CachedExercise>('cached_exercises');
    const now = Date.now();
    await db.write(async () => {
      for (const ex of exercises) {
        await collection.create((rec) => {
          rec.exerciseId = ex.exerciseId;
          rec.name = ex.name;
          rec.gifUrl = ex.gifUrl;
          rec.targetMusclesRaw = JSON.stringify(ex.targetMuscles);
          rec.bodyPartsRaw = JSON.stringify(ex.bodyParts);
          rec.equipmentsRaw = JSON.stringify(ex.equipments);
          rec.secondaryMusclesRaw = JSON.stringify(ex.secondaryMuscles);
          rec.instructionsRaw = JSON.stringify(ex.instructions);
          rec.cachedAt = now;
        });
      }
    });
  }

  /** Clear the entire cached_exercises table */
  static async clearAll(db: Database): Promise<void> {
    const collection = db.collections.get<CachedExercise>('cached_exercises');
    await db.write(async () => {
      const existing = await collection.query().fetch();
      for (const row of existing) {
        await row.destroyPermanently();
      }
    });
  }

  /** Check if DB cache exists and is not too old (default: 24 hours) */
  static async isFresh(db: Database, maxAgeMs = 24 * 60 * 60 * 1000): Promise<boolean> {
    try {
      const collection = db.collections.get<CachedExercise>('cached_exercises');
      const count = await collection.query().fetchCount();
      if (count === 0) return false;
      const oldest = await collection.query(Q.sortBy('cached_at', Q.asc), Q.take(1)).fetch();
      if (oldest.length === 0) return false;
      return Date.now() - oldest[0].cachedAt < maxAgeMs;
    } catch {
      return false;
    }
  }
}
