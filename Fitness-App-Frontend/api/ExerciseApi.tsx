import axios from "axios";

const BASE_URL = "https://exercisedb.dev/api/v1";

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
  metadata: {
    totalExercises: number;
    totalPages: number;
    currentPage: number;
    previousPage: string | null;
    nextPage: string | null;
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
      const res = await exerciseClient.get<PaginatedResponse<ExerciseInfo>>(
        `/exercises/search`,
        { params: { q: query, limit, offset } },
      );
      return {
        total: res.data.metadata.totalExercises,
        exercises: res.data.data ?? [],
      };
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
        { params: { limit, offset } },
      );
      return {
        total: res.data.metadata.totalExercises,
        exercises: res.data.data ?? [],
      };
    } catch {
      return { total: 0, exercises: [] };
    }
  },

  /** Get exercises by body part name (e.g. "chest", "back", "upper legs") */
  async getExercisesByBodyPart(
    bodyPart: string,
    limit = 10,
    offset = 0,
  ): Promise<{ total: number; exercises: ExerciseInfo[] }> {
    try {
      const res = await exerciseClient.get<PaginatedResponse<ExerciseInfo>>(
        `/bodyparts/${encodeURIComponent(bodyPart)}/exercises`,
        { params: { limit, offset } },
      );
      return {
        total: res.data.metadata.totalExercises,
        exercises: res.data.data ?? [],
      };
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
      const res = await exerciseClient.get<PaginatedResponse<ExerciseInfo>>(
        `/equipments/${encodeURIComponent(equipment)}/exercises`,
        { params: { limit, offset } },
      );
      return {
        total: res.data.metadata.totalExercises,
        exercises: res.data.data ?? [],
      };
    } catch {
      return { total: 0, exercises: [] };
    }
  },

  /** Get exercises by muscle name (e.g. "biceps", "pectorals") */
  async getExercisesByMuscle(
    muscle: string,
    limit = 10,
    offset = 0,
  ): Promise<{ total: number; exercises: ExerciseInfo[] }> {
    try {
      const res = await exerciseClient.get<PaginatedResponse<ExerciseInfo>>(
        `/muscles/${encodeURIComponent(muscle)}/exercises`,
        { params: { limit, offset } },
      );
      return {
        total: res.data.metadata.totalExercises,
        exercises: res.data.data ?? [],
      };
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
