import axios from "axios";

const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

export interface MealDBMeal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string | null;
  strYoutube: string | null;
  // Ingredients & measures (1-20)
  [key: string]: string | null;
}

export interface MealDBCategory {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

/** Extract non-empty ingredients + measures from a meal object */
export function getIngredients(meal: MealDBMeal): { ingredient: string; measure: string }[] {
  const list: { ingredient: string; measure: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`]?.trim();
    const msr = meal[`strMeasure${i}`]?.trim() ?? "";
    if (ing) list.push({ ingredient: ing, measure: msr });
  }
  return list;
}

// ─── Calorie / Macro estimation from ingredients ─────────────────────────────
// TheMealDB doesn't provide nutritional info, so we estimate based on
// common per-100g values for known ingredients, scaled by the measure text.

type NutrientInfo = { cal: number; protein: number; carbs: number; fat: number }; // per 100g

const NUTRIENT_DB: Record<string, NutrientInfo> = {
  // Proteins
  chicken:       { cal: 239, protein: 27, carbs: 0,  fat: 14 },
  "chicken breast": { cal: 165, protein: 31, carbs: 0, fat: 3.6 },
  "chicken thigh": { cal: 209, protein: 26, carbs: 0, fat: 11 },
  beef:          { cal: 250, protein: 26, carbs: 0,  fat: 15 },
  "minced beef": { cal: 250, protein: 26, carbs: 0,  fat: 15 },
  "beef brisket":{ cal: 250, protein: 26, carbs: 0,  fat: 15 },
  "beef fillet": { cal: 218, protein: 28, carbs: 0,  fat: 11 },
  lamb:          { cal: 294, protein: 25, carbs: 0,  fat: 21 },
  pork:          { cal: 242, protein: 27, carbs: 0,  fat: 14 },
  bacon:         { cal: 541, protein: 37, carbs: 1,  fat: 42 },
  sausage:       { cal: 301, protein: 12, carbs: 2,  fat: 27 },
  "sausages":    { cal: 301, protein: 12, carbs: 2,  fat: 27 },
  salmon:        { cal: 208, protein: 20, carbs: 0,  fat: 13 },
  tuna:          { cal: 132, protein: 28, carbs: 0,  fat: 1  },
  shrimp:        { cal: 99,  protein: 24, carbs: 0,  fat: 0.3 },
  prawns:        { cal: 99,  protein: 24, carbs: 0,  fat: 0.3 },
  "king prawns": { cal: 99,  protein: 24, carbs: 0,  fat: 0.3 },
  cod:           { cal: 82,  protein: 18, carbs: 0,  fat: 0.7 },
  egg:           { cal: 155, protein: 13, carbs: 1,  fat: 11 },
  eggs:          { cal: 155, protein: 13, carbs: 1,  fat: 11 },
  tofu:          { cal: 76,  protein: 8,  carbs: 2,  fat: 4.8 },

  // Carbs / Grains
  rice:          { cal: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  "basmati rice":{ cal: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  pasta:         { cal: 131, protein: 5,  carbs: 25, fat: 1.1 },
  spaghetti:     { cal: 131, protein: 5,  carbs: 25, fat: 1.1 },
  penne:         { cal: 131, protein: 5,  carbs: 25, fat: 1.1 },
  macaroni:      { cal: 131, protein: 5,  carbs: 25, fat: 1.1 },
  "penne rigate":{ cal: 131, protein: 5,  carbs: 25, fat: 1.1 },
  lasagne:       { cal: 131, protein: 5,  carbs: 25, fat: 1.1 },
  "lasagne sheets": { cal: 131, protein: 5, carbs: 25, fat: 1.1 },
  noodles:       { cal: 138, protein: 5,  carbs: 25, fat: 2 },
  bread:         { cal: 265, protein: 9,  carbs: 49, fat: 3.2 },
  "bread crumbs":{ cal: 395, protein: 13, carbs: 72, fat: 5 },
  flour:         { cal: 364, protein: 10, carbs: 76, fat: 1 },
  "plain flour": { cal: 364, protein: 10, carbs: 76, fat: 1 },
  "self-raising flour": { cal: 340, protein: 10, carbs: 72, fat: 1 },
  potato:        { cal: 77,  protein: 2,  carbs: 17, fat: 0.1 },
  potatoes:      { cal: 77,  protein: 2,  carbs: 17, fat: 0.1 },
  "sweet potato":{ cal: 86,  protein: 1.6, carbs: 20, fat: 0.1 },
  tortilla:      { cal: 310, protein: 8,  carbs: 50, fat: 8 },
  "tortilla wraps": { cal: 310, protein: 8, carbs: 50, fat: 8 },

  // Dairy
  cheese:        { cal: 402, protein: 25, carbs: 1,  fat: 33 },
  cheddar:       { cal: 402, protein: 25, carbs: 1,  fat: 33 },
  "cheddar cheese": { cal: 402, protein: 25, carbs: 1, fat: 33 },
  parmesan:      { cal: 431, protein: 38, carbs: 4,  fat: 29 },
  "parmesan cheese": { cal: 431, protein: 38, carbs: 4, fat: 29 },
  mozzarella:    { cal: 280, protein: 28, carbs: 3,  fat: 17 },
  cream:         { cal: 340, protein: 2,  carbs: 3,  fat: 36 },
  "double cream":{ cal: 449, protein: 1.6, carbs: 2, fat: 48 },
  "single cream":{ cal: 195, protein: 3,  carbs: 4,  fat: 19 },
  "sour cream":  { cal: 193, protein: 2,  carbs: 5,  fat: 19 },
  "cream cheese":{ cal: 342, protein: 6,  carbs: 4,  fat: 34 },
  milk:          { cal: 42,  protein: 3.4, carbs: 5, fat: 1 },
  "whole milk":  { cal: 61,  protein: 3.2, carbs: 5, fat: 3.3 },
  "coconut milk":{ cal: 230, protein: 2.3, carbs: 6, fat: 24 },
  butter:        { cal: 717, protein: 0.8, carbs: 0, fat: 81 },
  yogurt:        { cal: 59,  protein: 10, carbs: 4,  fat: 0.4 },
  "greek yoghurt": { cal: 59, protein: 10, carbs: 4, fat: 0.4 },
  "natural yoghurt": { cal: 63, protein: 5, carbs: 7, fat: 1.5 },

  // Fats / Oils
  "olive oil":   { cal: 884, protein: 0,  carbs: 0,  fat: 100 },
  "vegetable oil": { cal: 884, protein: 0, carbs: 0, fat: 100 },
  "sesame oil":  { cal: 884, protein: 0,  carbs: 0,  fat: 100 },
  "sunflower oil": { cal: 884, protein: 0, carbs: 0, fat: 100 },
  oil:           { cal: 884, protein: 0,  carbs: 0,  fat: 100 },
  lard:          { cal: 902, protein: 0,  carbs: 0,  fat: 100 },

  // Vegetables
  onion:         { cal: 40,  protein: 1.1, carbs: 9, fat: 0.1 },
  onions:        { cal: 40,  protein: 1.1, carbs: 9, fat: 0.1 },
  "red onion":   { cal: 40,  protein: 1.1, carbs: 9, fat: 0.1 },
  "red onions":  { cal: 40,  protein: 1.1, carbs: 9, fat: 0.1 },
  garlic:        { cal: 149, protein: 6,  carbs: 33, fat: 0.5 },
  "garlic clove":{ cal: 149, protein: 6,  carbs: 33, fat: 0.5 },
  tomato:        { cal: 18,  protein: 0.9, carbs: 4, fat: 0.2 },
  tomatoes:      { cal: 18,  protein: 0.9, carbs: 4, fat: 0.2 },
  "chopped tomatoes": { cal: 18, protein: 0.9, carbs: 4, fat: 0.2 },
  "tomato puree":{ cal: 82,  protein: 4,  carbs: 18, fat: 0.5 },
  carrot:        { cal: 41,  protein: 0.9, carbs: 10, fat: 0.2 },
  carrots:       { cal: 41,  protein: 0.9, carbs: 10, fat: 0.2 },
  pepper:        { cal: 31,  protein: 1,  carbs: 6,  fat: 0.3 },
  "red pepper":  { cal: 31,  protein: 1,  carbs: 6,  fat: 0.3 },
  "green pepper":{ cal: 20,  protein: 0.9, carbs: 5, fat: 0.2 },
  celery:        { cal: 16,  protein: 0.7, carbs: 3, fat: 0.2 },
  broccoli:      { cal: 34,  protein: 2.8, carbs: 7, fat: 0.4 },
  spinach:       { cal: 23,  protein: 2.9, carbs: 4, fat: 0.4 },
  mushrooms:     { cal: 22,  protein: 3.1, carbs: 3, fat: 0.3 },
  "mushroom":    { cal: 22,  protein: 3.1, carbs: 3, fat: 0.3 },
  lettuce:       { cal: 15,  protein: 1.4, carbs: 3, fat: 0.2 },
  cucumber:      { cal: 16,  protein: 0.7, carbs: 4, fat: 0.1 },
  "green beans": { cal: 31,  protein: 1.8, carbs: 7, fat: 0.1 },
  peas:          { cal: 81,  protein: 5,  carbs: 14, fat: 0.4 },
  corn:          { cal: 86,  protein: 3.3, carbs: 19, fat: 1.2 },
  sweetcorn:     { cal: 86,  protein: 3.3, carbs: 19, fat: 1.2 },
  courgette:     { cal: 17,  protein: 1.2, carbs: 3,  fat: 0.3 },
  aubergine:     { cal: 25,  protein: 1,  carbs: 6,  fat: 0.2 },
  avocado:       { cal: 160, protein: 2,  carbs: 9,  fat: 15 },
  "spring onions": { cal: 32, protein: 1.8, carbs: 7, fat: 0.2 },
  leek:          { cal: 61,  protein: 1.5, carbs: 14, fat: 0.3 },

  // Fruits
  lemon:         { cal: 29,  protein: 1.1, carbs: 9, fat: 0.3 },
  "lemon juice": { cal: 22,  protein: 0.4, carbs: 7, fat: 0.2 },
  lime:          { cal: 30,  protein: 0.7, carbs: 11, fat: 0.2 },
  "lime juice":  { cal: 25,  protein: 0.4, carbs: 8, fat: 0 },
  banana:        { cal: 89,  protein: 1.1, carbs: 23, fat: 0.3 },
  apple:         { cal: 52,  protein: 0.3, carbs: 14, fat: 0.2 },

  // Legumes / Nuts
  "kidney beans":{ cal: 127, protein: 9,  carbs: 23, fat: 0.5 },
  "black beans": { cal: 132, protein: 9,  carbs: 24, fat: 0.5 },
  chickpeas:     { cal: 164, protein: 9,  carbs: 27, fat: 2.6 },
  lentils:       { cal: 116, protein: 9,  carbs: 20, fat: 0.4 },
  "peanut butter": { cal: 588, protein: 25, carbs: 20, fat: 50 },
  almonds:       { cal: 579, protein: 21, carbs: 22, fat: 50 },
  cashews:       { cal: 553, protein: 18, carbs: 30, fat: 44 },
  "pine nuts":   { cal: 673, protein: 14, carbs: 13, fat: 68 },

  // Condiments / Sauces
  sugar:         { cal: 387, protein: 0,  carbs: 100, fat: 0 },
  "caster sugar":{ cal: 387, protein: 0,  carbs: 100, fat: 0 },
  "brown sugar": { cal: 380, protein: 0,  carbs: 98, fat: 0 },
  "icing sugar": { cal: 389, protein: 0,  carbs: 100, fat: 0 },
  honey:         { cal: 304, protein: 0.3, carbs: 82, fat: 0 },
  "soy sauce":   { cal: 53,  protein: 8,  carbs: 5,  fat: 0 },
  "worcestershire sauce": { cal: 78, protein: 0, carbs: 19, fat: 0 },
  vinegar:       { cal: 18,  protein: 0,  carbs: 0.6, fat: 0 },
  "balsamic vinegar": { cal: 88, protein: 0.5, carbs: 17, fat: 0 },
  "red wine vinegar": { cal: 19, protein: 0, carbs: 0.3, fat: 0 },
  ketchup:       { cal: 112, protein: 1,  carbs: 26, fat: 0.1 },
  "tomato ketchup": { cal: 112, protein: 1, carbs: 26, fat: 0.1 },
  mustard:       { cal: 66,  protein: 4,  carbs: 5,  fat: 3 },
  "dijon mustard": { cal: 66, protein: 4, carbs: 5, fat: 3 },
  mayonnaise:    { cal: 680, protein: 1,  carbs: 1,  fat: 75 },
  "tomato sauce":{ cal: 29,  protein: 1,  carbs: 6,  fat: 0.2 },
  "fish sauce":  { cal: 35,  protein: 5,  carbs: 4,  fat: 0 },
  "oyster sauce":{ cal: 51,  protein: 1,  carbs: 11, fat: 0 },
  "hot sauce":   { cal: 11,  protein: 0.5, carbs: 2, fat: 0.2 },
  salt:          { cal: 0,   protein: 0,  carbs: 0,  fat: 0 },
  "black pepper":{ cal: 0,   protein: 0,  carbs: 0,  fat: 0 },
  "white pepper":{ cal: 0,   protein: 0,  carbs: 0,  fat: 0 },
  "chilli":      { cal: 40,  protein: 2,  carbs: 9,  fat: 0.4 },
  "chilli powder": { cal: 282, protein: 14, carbs: 50, fat: 8 },
  cumin:         { cal: 375, protein: 18, carbs: 44, fat: 22 },
  paprika:       { cal: 282, protein: 14, carbs: 54, fat: 13 },
  cinnamon:      { cal: 247, protein: 4,  carbs: 81, fat: 1.2 },
  ginger:        { cal: 80,  protein: 1.8, carbs: 18, fat: 0.8 },
  "fresh ginger":{ cal: 80,  protein: 1.8, carbs: 18, fat: 0.8 },
  turmeric:      { cal: 312, protein: 10, carbs: 67, fat: 3.3 },
  oregano:       { cal: 265, protein: 9,  carbs: 69, fat: 4 },
  basil:         { cal: 23,  protein: 3,  carbs: 3,  fat: 0.6 },
  parsley:       { cal: 36,  protein: 3,  carbs: 6,  fat: 0.8 },
  thyme:         { cal: 101, protein: 6,  carbs: 24, fat: 1.7 },
  rosemary:      { cal: 131, protein: 3,  carbs: 21, fat: 6 },
  coriander:     { cal: 23,  protein: 2,  carbs: 4,  fat: 0.5 },
  "bay leaf":    { cal: 313, protein: 8,  carbs: 75, fat: 8 },
  "bay leaves":  { cal: 313, protein: 8,  carbs: 75, fat: 8 },
  "coconut cream": { cal: 330, protein: 3, carbs: 7, fat: 35 },

  // Baking
  chocolate:     { cal: 546, protein: 5,  carbs: 60, fat: 31 },
  "dark chocolate": { cal: 546, protein: 5, carbs: 60, fat: 31 },
  "milk chocolate": { cal: 535, protein: 8, carbs: 59, fat: 30 },
  cocoa:         { cal: 228, protein: 20, carbs: 58, fat: 14 },
  "cocoa powder":{ cal: 228, protein: 20, carbs: 58, fat: 14 },
  "baking powder": { cal: 53, protein: 0, carbs: 28, fat: 0 },

  // Stock / Liquid
  "chicken stock":{ cal: 7,  protein: 1,  carbs: 0.3, fat: 0.2 },
  "beef stock":  { cal: 8,   protein: 1.2, carbs: 0.3, fat: 0.2 },
  "vegetable stock": { cal: 5, protein: 0.2, carbs: 1, fat: 0 },
  water:         { cal: 0,   protein: 0,  carbs: 0,  fat: 0 },
  wine:          { cal: 83,  protein: 0,  carbs: 3,  fat: 0 },
  "red wine":    { cal: 85,  protein: 0,  carbs: 3,  fat: 0 },
  "white wine":  { cal: 82,  protein: 0,  carbs: 3,  fat: 0 },
};

/** Parse a measure string like "200g", "2 cups", "1 tbs" into grams */
function parseMeasureToGrams(measure: string): number {
  const m = measure.toLowerCase().trim();
  if (!m || m === "to taste" || m === "pinch" || m === "garnish") return 2;

  // Try to extract a number
  const numMatch = m.match(/^([\d.\/]+)/);
  let amount = 1;
  if (numMatch) {
    const raw = numMatch[1];
    if (raw.includes("/")) {
      const [num, den] = raw.split("/");
      amount = parseFloat(num) / parseFloat(den);
    } else {
      amount = parseFloat(raw);
    }
    if (isNaN(amount) || amount <= 0) amount = 1;
  }

  // Direct gram/kg match
  if (m.includes("kg")) return amount * 1000;
  if (/\d+\s*g\b/.test(m) || m.endsWith("g")) return amount;
  if (m.includes("ml")) return amount; // 1ml ≈ 1g for most things
  if (m.includes("litre") || m.includes("liter") || m.includes(" l ")) return amount * 1000;

  // Volume conversions (approximate grams)
  if (m.includes("cup"))  return amount * 150;
  if (m.includes("tbsp") || m.includes("tbs") || m.includes("tablespoon")) return amount * 15;
  if (m.includes("tsp") || m.includes("teaspoon")) return amount * 5;
  if (m.includes("oz"))   return amount * 28;
  if (m.includes("lb"))   return amount * 454;
  if (m.includes("bunch") || m.includes("handful")) return amount * 30;
  if (m.includes("clove")) return amount * 5;
  if (m.includes("can") || m.includes("tin")) return amount * 400;
  if (m.includes("slice")) return amount * 30;
  if (m.includes("stalk") || m.includes("stick")) return amount * 60;
  if (m.includes("sprig")) return amount * 3;
  if (m.includes("knob")) return amount * 15;
  if (m.includes("pack") || m.includes("packet")) return amount * 250;

  // Count-based (e.g., "2 large", "3 medium")
  // For ingredients like eggs, onions, etc. — approximate weight per unit
  if (/^\d+$/.test(m.trim())) return amount * 80; // generic ~80g per item
  if (m.includes("large")) return amount * 120;
  if (m.includes("medium")) return amount * 80;
  if (m.includes("small")) return amount * 50;

  // Fallback: assume ~80g per unit
  return amount * 80;
}

/** Look up a nutrient entry, trying exact then partial matches */
function lookupNutrient(ingredient: string): NutrientInfo | null {
  const key = ingredient.toLowerCase().trim();

  // Exact match
  if (NUTRIENT_DB[key]) return NUTRIENT_DB[key];

  // Try progressively shorter substrings from the end
  const words = key.split(/\s+/);
  for (let len = words.length - 1; len >= 1; len--) {
    const sub = words.slice(0, len).join(" ");
    if (NUTRIENT_DB[sub]) return NUTRIENT_DB[sub];
  }
  // Try last word (e.g., "boneless chicken" → "chicken")
  if (words.length > 1 && NUTRIENT_DB[words[words.length - 1]]) {
    return NUTRIENT_DB[words[words.length - 1]];
  }
  // Partial includes check
  for (const dbKey of Object.keys(NUTRIENT_DB)) {
    if (key.includes(dbKey) || dbKey.includes(key)) {
      return NUTRIENT_DB[dbKey];
    }
  }
  return null;
}

export interface EstimatedNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: "high" | "medium" | "low"; // how many ingredients were matched
}

/** Estimate total nutritional info for a full MealDB meal */
export function estimateNutrition(meal: MealDBMeal): EstimatedNutrition {
  const ingredients = getIngredients(meal);
  let totalCal = 0, totalP = 0, totalC = 0, totalF = 0;
  let matched = 0;

  for (const { ingredient, measure } of ingredients) {
    const info = lookupNutrient(ingredient);
    if (!info) continue;
    matched++;
    const grams = parseMeasureToGrams(measure);
    const factor = grams / 100;
    totalCal += info.cal * factor;
    totalP += info.protein * factor;
    totalC += info.carbs * factor;
    totalF += info.fat * factor;
  }

  const ratio = ingredients.length > 0 ? matched / ingredients.length : 0;
  const confidence = ratio >= 0.7 ? "high" : ratio >= 0.4 ? "medium" : "low";

  return {
    calories: Math.round(totalCal),
    protein: Math.round(totalP),
    carbs: Math.round(totalC),
    fat: Math.round(totalF),
    confidence,
  };
}

export const MealDBApi = {
  /** Search meals by name */
  searchByName: async (query: string): Promise<MealDBMeal[]> => {
    const { data } = await axios.get<{ meals: MealDBMeal[] | null }>(`${BASE_URL}/search.php`, {
      params: { s: query },
    });
    return data.meals ?? [];
  },

  /** Lookup full meal details by id */
  lookupById: async (id: string): Promise<MealDBMeal | null> => {
    const { data } = await axios.get<{ meals: MealDBMeal[] | null }>(`${BASE_URL}/lookup.php`, {
      params: { i: id },
    });
    return data.meals?.[0] ?? null;
  },

  /** Get a random meal */
  random: async (): Promise<MealDBMeal | null> => {
    const { data } = await axios.get<{ meals: MealDBMeal[] | null }>(`${BASE_URL}/random.php`);
    return data.meals?.[0] ?? null;
  },

  /** List all categories */
  categories: async (): Promise<MealDBCategory[]> => {
    const { data } = await axios.get<{ categories: MealDBCategory[] | null }>(`${BASE_URL}/categories.php`);
    return data.categories ?? [];
  },

  /** Filter by category */
  filterByCategory: async (category: string): Promise<MealDBMeal[]> => {
    const { data } = await axios.get<{ meals: MealDBMeal[] | null }>(`${BASE_URL}/filter.php`, {
      params: { c: category },
    });
    return data.meals ?? [];
  },

  /** Filter by main ingredient */
  filterByIngredient: async (ingredient: string): Promise<MealDBMeal[]> => {
    const { data } = await axios.get<{ meals: MealDBMeal[] | null }>(`${BASE_URL}/filter.php`, {
      params: { i: ingredient },
    });
    return data.meals ?? [];
  },
};
