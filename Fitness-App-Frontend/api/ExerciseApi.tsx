import axios from "axios";
import { database } from "@/database/database";
import { CachedExercise } from "@/models/CachedExercise";

const BASE_URL = "https://oss.exercisedb.dev/api/v1";

const exerciseClient = axios.create({
  baseURL: BASE_URL,
  headers: { Accept: "application/json" },
  timeout: 15000,
});

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ExerciseInfo {
  exerciseId: string;
  name: string;
  gifUrl: string;
  targetMuscles: string[];
  bodyParts: string[];
  equipments: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category?: string;
  target?: string;
  bodyPart?: string;
  equipment?: string;
}

interface PaginatedResponse {
  success: boolean;
  meta: {
    total: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor: string | null;
  };
  data: ExerciseInfo[];
}

interface ListResponse<T> {
  success: boolean;
  data: T[];
}

/** Small delay helper to stay within rate limits */
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ─── API Methods ─────────────────────────────────────────────────────────────

export const ExerciseApi = {
  /** Fetch a single exercise by ID — checks local cache first, then hits API */
  async getExerciseById(id: string): Promise<ExerciseInfo | null> {
    // 1. Check in-memory cache
    if (this._allExercisesCache) {
      const cached = this._allExercisesCache.find((ex) => ex.exerciseId === id);
      if (cached) return cached;
    }
    // 2. Try loading the full pool (populates cache for most IDs)
    try {
      const pool = await this.getAllExercises();
      const found = pool.find((ex) => ex.exerciseId === id);
      if (found) return found;
    } catch {
      // ignore
    }
    // 3. Direct API call for a single exercise by ID
    try {
      const res = await exerciseClient.get<{ success: boolean; data: ExerciseInfo }>(
        `/exercises/${encodeURIComponent(id)}`,
      );
      return res.data.data ?? null;
    } catch {
      return null;
    }
  },

  /** Fuzzy search exercises — uses cached pool, filters client-side */
  async searchExercises(
    query: string,
    limit = 10,
    _offset = 0,
  ): Promise<{ total: number; exercises: ExerciseInfo[] }> {
    try {
      const pool = await this.getAllExercises();
      const q = query.toLowerCase();
      const filtered = pool.filter(
        (ex) =>
          ex.name.toLowerCase().includes(q) ||
          ex.bodyParts.some((b) => b.toLowerCase().includes(q)) ||
          ex.equipments.some((e) => e.toLowerCase().includes(q)) ||
          ex.targetMuscles.some((m) => m.toLowerCase().includes(q)),
      );
      return { total: filtered.length, exercises: filtered.slice(0, limit) };
    } catch {
      return { total: 0, exercises: [] };
    }
  },

  /** List exercises with pagination — uses cached pool */
  async getExercises(
    limit = 10,
    offset = 0,
  ): Promise<{ total: number; exercises: ExerciseInfo[] }> {
    try {
      const pool = await this.getAllExercises();
      return {
        total: pool.length,
        exercises: pool.slice(offset, offset + limit),
      };
    } catch {
      return { total: 0, exercises: [] };
    }
  },

  /**
   * Fetch ALL exercises by walking through cursor-based pagination.
   * The free API caps each page at 25 items regardless of the limit param.
   * Uses the `after` query param with the `nextCursor` from each response
   * to iterate every page and build a complete local pool (~1500 exercises).
   * Includes retry logic with back-off to handle rate limits.
   * Results are cached in-memory so subsequent calls are instant.
   */
  _allExercisesCache: null as ExerciseInfo[] | null,
  _fetchPromise: null as Promise<ExerciseInfo[]> | null,
  _listeners: [] as ((msg: string) => void)[],
  _exerciseListeners: [] as ((exercises: ExerciseInfo[]) => void)[],

  onProgress(callback: (msg: string) => void) {
    this._listeners.push(callback);
    return () => {
      this._listeners = this._listeners.filter((cb) => cb !== callback);
    };
  },
  _emitProgress(msg: string) {
    this._listeners.forEach((cb) => cb(msg));
  },

  /** Subscribe to progressive exercise updates as pages arrive */
  onExercises(callback: (exercises: ExerciseInfo[]) => void) {
    this._exerciseListeners.push(callback);
    // If already cached, fire immediately
    if (this._allExercisesCache) callback(this._allExercisesCache);
    return () => {
      this._exerciseListeners = this._exerciseListeners.filter((cb) => cb !== callback);
    };
  },
  _emitExercises(exercises: ExerciseInfo[]) {
    this._exerciseListeners.forEach((cb) => cb(exercises));
  },

  async getAllExercises(): Promise<ExerciseInfo[]> {
    if (this._allExercisesCache) return this._allExercisesCache;

    // Prevent duplicate parallel fetches — reuse the in-flight promise
    if (this._fetchPromise) return this._fetchPromise;

    this._fetchPromise = (async (): Promise<ExerciseInfo[]> => {
      try {
        // 1. Try loading from WatermelonDB cache first
        this._emitProgress("Checking offline database...");
        if (await CachedExercise.isFresh(database)) {
          this._emitProgress("Loading workouts from database...");
          const dbExercises = await CachedExercise.loadAll(database);
          if (dbExercises.length > 0) {
            this._allExercisesCache = dbExercises;
            this._emitProgress("");
            this._emitExercises(dbExercises);
            return dbExercises;
          }
        }

        // 2. Fetch from API — clear stale DB cache first
        await CachedExercise.clearAll(database).catch(() => {});

        const all: ExerciseInfo[] = [];
        let after: string | null = null;
        let hasNext = true;
        let consecutiveErrors = 0;

        while (hasNext) {
          try {
            this._emitProgress(`Downloading exercises (${all.length} so far)...`);
            const params: Record<string, string> = { limit: "25" };
            if (after) params.after = after;

            const res = await exerciseClient.get<PaginatedResponse>(
              "/exercises",
              { params },
            );

            const page = res.data?.data ?? [];
            all.push(...page);

            // Save this page to DB immediately
            if (page.length > 0) {
              CachedExercise.saveBatch(database, page).catch(() => {});
              // Notify screens so they can show exercises right away
              this._emitExercises([...all]);
            }

            hasNext = res.data?.meta?.hasNextPage ?? false;
            after = res.data?.meta?.nextCursor ?? null;
            consecutiveErrors = 0;

            if (page.length === 0 || !after || all.length >= 450) break;

            await delay(150);
          } catch {
            consecutiveErrors++;
            if (consecutiveErrors >= 5) break;
            this._emitProgress(`Server is busy, retrying shortly...`);
            await delay(2000 * consecutiveErrors);
          }
        }

        // Deduplicate by exerciseId
        const seen = new Set<string>();
        const unique = all.filter((ex) => {
          if (seen.has(ex.exerciseId)) return false;
          seen.add(ex.exerciseId);
          return true;
        });

        if (unique.length > 0) {
          this._allExercisesCache = unique;
        }
        
        this._emitProgress("");
        return unique;
      } catch (err) {
        this._emitProgress("");
        throw err;
      } finally {
        this._fetchPromise = null;
      }
    })();

    return this._fetchPromise;
  },

  /** Get exercises by body part — filters from cached pool */
  async getExercisesByBodyPart(
    bodyPart: string,
    limit = 10,
    _offset = 0,
  ): Promise<{ total: number; exercises: ExerciseInfo[] }> {
    try {
      const pool = await this.getAllExercises();
      const bp = bodyPart.toLowerCase();
      const filtered = pool.filter((ex) =>
        ex.bodyParts.some((b) => b.toLowerCase().includes(bp)),
      );
      return { total: filtered.length, exercises: filtered.slice(0, limit) };
    } catch {
      return { total: 0, exercises: [] };
    }
  },

  /** Get exercises by equipment — filters from cached pool */
  async getExercisesByEquipment(
    equipment: string,
    limit = 10,
    _offset = 0,
  ): Promise<{ total: number; exercises: ExerciseInfo[] }> {
    try {
      const pool = await this.getAllExercises();
      const eq = equipment.toLowerCase();
      const filtered = pool.filter((ex) =>
        ex.equipments.some((e) => e.toLowerCase().includes(eq)),
      );
      return { total: filtered.length, exercises: filtered.slice(0, limit) };
    } catch {
      return { total: 0, exercises: [] };
    }
  },

  /** Per-muscle cache — keyed by lowercase muscle name */
  _muscleCache: {} as Record<string, ExerciseInfo[]>,

  /** Get exercises for a target muscle — filters from cached pool */
  async getAllExercisesByMuscle(muscle: string): Promise<ExerciseInfo[]> {
    const key = muscle.toLowerCase();
    if (this._muscleCache[key]) return this._muscleCache[key];

    const pool = await this.getAllExercises();
    const filtered = pool.filter(
      (ex) =>
        ex.targetMuscles.some((m) => m.toLowerCase() === key) ||
        (ex.secondaryMuscles ?? []).some((m) => m.toLowerCase() === key),
    );

    this._muscleCache[key] = filtered;
    return filtered;
  },

  /** Get all body part names */
  async getBodyParts(): Promise<string[]> {
    try {
      const res = await exerciseClient.get<ListResponse<{ name: string }>>(
        "/bodyparts",
      );
      return (res.data.data ?? []).map((b) => b.name);
    } catch {
      return [];
    }
  },

  /** Get all muscle names — derived from cached exercise pool */
  async getMuscles(): Promise<string[]> {
    try {
      const pool = await this.getAllExercises();
      const muscles = new Set<string>();
      for (const ex of pool) {
        for (const m of ex.targetMuscles) muscles.add(m);
        for (const m of ex.secondaryMuscles ?? []) muscles.add(m);
      }
      return [...muscles].sort();
    } catch {
      return [];
    }
  },

  /** Get all equipment names */
  async getEquipments(): Promise<string[]> {
    try {
      const res = await exerciseClient.get<ListResponse<{ name: string }>>(
        "/equipments",
      );
      return (res.data.data ?? []).map((e) => e.name);
    } catch {
      return [];
    }
  },
};
