import axios from "axios";

const BASE_URL = "https://oss.exercisedb.dev/api/v1";

const exerciseClient = axios.create({
  baseURL: BASE_URL,
  headers: { Accept: "application/json" },
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
}

interface PaginatedResponse<T> {
  success: boolean;
  meta: {
    total: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor: string | null;
  };
  data: T[];
}

interface ListResponse<T> {
  success: boolean;
  data: T[];
}

// ─── API Methods ─────────────────────────────────────────────────────────────

export const ExerciseApi = {
  /** Fetch a single exercise by ID */
  async getExerciseById(id: string): Promise<ExerciseInfo | null> {
    try {
      const res = await exerciseClient.get<{ success: boolean; data: ExerciseInfo }>(
        `/exercises/${encodeURIComponent(id)}`
      );
      return res.data.data ?? null;
    } catch {
      return null;
    }
  },

  /** Fuzzy search exercises by name, muscles, equipment, body parts */
  async searchExercises(
    query: string,
    limit = 10,
    offset = 0,
  ): Promise<{ total: number; exercises: ExerciseInfo[] }> {
    try {
      // The free API search is limited — fall back to fetching and filtering client-side
      const res = await exerciseClient.get<PaginatedResponse<ExerciseInfo>>(
        `/exercises`,
        { params: { limit: Math.max(limit * 5, 50) } },
      );
      const all = res.data.data ?? [];
      const q = query.toLowerCase();
      const filtered = all.filter(
        (ex) =>
          ex.name.toLowerCase().includes(q) ||
          ex.bodyParts.some((b) => b.toLowerCase().includes(q)) ||
          ex.equipments.some((e) => e.toLowerCase().includes(q)) ||
          ex.targetMuscles.some((m) => m.toLowerCase().includes(q)),
      ).slice(0, limit);
      return { total: filtered.length, exercises: filtered };
    } catch {
      return { total: 0, exercises: [] };
    }
  },

  /** List exercises with pagination */
  async getExercises(
    limit = 10,
    offset = 0,
  ): Promise<{ total: number; exercises: ExerciseInfo[] }> {
    try {
      const res = await exerciseClient.get<PaginatedResponse<ExerciseInfo>>(
        `/exercises`,
        { params: { limit } },
      );
      return {
        total: res.data.meta?.total ?? res.data.data?.length ?? 0,
        exercises: res.data.data ?? [],
      };
    } catch {
      return { total: 0, exercises: [] };
    }
  },

  /**
   * Fetch ALL exercises by walking through cursor-based pagination.
   * The free API caps each page at 25 items regardless of the limit param.
   * This iterates every page to build a complete local pool (~1500 exercises).
   * Results are cached in-memory so subsequent calls are instant.
   */
  _allExercisesCache: null as ExerciseInfo[] | null,

  async getAllExercises(): Promise<ExerciseInfo[]> {
    if (this._allExercisesCache) return this._allExercisesCache;

    const all: ExerciseInfo[] = [];
    let cursor: string | null = null;
    let hasNext = true;

    while (hasNext) {
      try {
        const params: Record<string, unknown> = { limit: 25 };
        if (cursor) params.cursor = cursor;

        const res = await exerciseClient.get<PaginatedResponse<ExerciseInfo>>(
          `/exercises`,
          { params },
        );

        const page = res.data.data ?? [];
        all.push(...page);

        hasNext = res.data.meta?.hasNextPage ?? false;
        cursor = res.data.meta?.nextCursor ?? null;

        // Safety: stop if we get an empty page or hit a reasonable cap
        if (page.length === 0 || all.length >= 2000) break;
      } catch {
        break;
      }
    }

    this._allExercisesCache = all;
    return all;
  },

  /** Get exercises by body part name (e.g. "chest", "back", "upper legs") */
  async getExercisesByBodyPart(
    bodyPart: string,
    limit = 10,
    offset = 0,
  ): Promise<{ total: number; exercises: ExerciseInfo[] }> {
    try {
      // Fetch a larger set and filter client-side (free API ignores filter params)
      const res = await exerciseClient.get<PaginatedResponse<ExerciseInfo>>(
        `/exercises/bodyparts`,
        { params: { bodyPart, limit: Math.max(limit * 4, 60) } },
      );
      const all = res.data.data ?? [];
      const bp = bodyPart.toLowerCase();
      const filtered = all
        .filter((ex) => ex.bodyParts.some((b) => b.toLowerCase().includes(bp)))
        .slice(0, limit);
      return { total: filtered.length, exercises: filtered.length > 0 ? filtered : all.slice(0, limit) };
    } catch {
      return { total: 0, exercises: [] };
    }
  },

  /** Get exercises by equipment name (e.g. "barbell", "dumbbell") */
  async getExercisesByEquipment(
    equipment: string,
    limit = 10,
    offset = 0,
  ): Promise<{ total: number; exercises: ExerciseInfo[] }> {
    try {
      // Fetch a larger set and filter client-side (free API ignores filter params)
      const res = await exerciseClient.get<PaginatedResponse<ExerciseInfo>>(
        `/exercises/equipments`,
        { params: { equipment, limit: Math.max(limit * 4, 60) } },
      );
      const all = res.data.data ?? [];
      const eq = equipment.toLowerCase();
      const filtered = all
        .filter((ex) => ex.equipments.some((e) => e.toLowerCase().includes(eq)))
        .slice(0, limit);
      return { total: filtered.length, exercises: filtered.length > 0 ? filtered : all.slice(0, limit) };
    } catch {
      return { total: 0, exercises: [] };
    }
  },

  /** Get exercises by muscle name (e.g. "biceps", "pectorals") */
  async getExercisesByMuscle(
    muscle: string,
    limit = 200,
  ): Promise<{ total: number; exercises: ExerciseInfo[] }> {
    try {
      // Use path-based endpoint — the query-param variant is ignored by this API
      const res = await exerciseClient.get<PaginatedResponse<ExerciseInfo>>(
        `/exercises/muscles/${encodeURIComponent(muscle)}`,
        { params: { limit } },
      );
      const data = res.data.data ?? [];
      return { total: data.length, exercises: data };
    } catch {
      return { total: 0, exercises: [] };
    }
  },

  /** Get all body part names */
  async getBodyParts(): Promise<string[]> {
    try {
      const res = await exerciseClient.get<ListResponse<{ name: string }>>(
        `/bodyparts`,
      );
      return (res.data.data ?? []).map((b) => b.name);
    } catch {
      return [];
    }
  },

  /** Get all muscle names */
  async getMuscles(): Promise<string[]> {
    try {
      const res = await exerciseClient.get<ListResponse<{ name: string }>>(
        `/muscles`,
      );
      return (res.data.data ?? []).map((m) => m.name);
    } catch {
      return [];
    }
  },

  /** Get all equipment names */
  async getEquipments(): Promise<string[]> {
    try {
      const res = await exerciseClient.get<ListResponse<{ name: string }>>(
        `/equipments`,
      );
      return (res.data.data ?? []).map((e) => e.name);
    } catch {
      return [];
    }
  },
};
