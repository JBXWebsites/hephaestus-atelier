export type Intention = "protect" | "begin" | "return";
export type Material = "bronze" | "obsidian" | "silver";
export type Mark = "sun" | "wave" | "laurel";

export type RecipeChoice = {
  intention: Intention;
  material: Material;
  mark: Mark;
};
export interface RelicRecipe extends RecipeChoice {
  version: 1;
  createdAt: string;
  nonce: string;
}
export interface RelicRecord {
  token: string;
  id: string;
  url: string;
  recipe: RelicRecipe;
}

export const intentions = [
  {
    id: "protect",
    name: "Aegis",
    label: "Protect",
    description: "A boundary for what matters.",
    inscription: "Keep close what gives you strength.",
  },
  {
    id: "begin",
    name: "Pyr",
    label: "Begin",
    description: "A spark for the unfinished.",
    inscription: "Every beginning asks for a little fire.",
  },
  {
    id: "return",
    name: "Nostos",
    label: "Return",
    description: "A reminder of the way back.",
    inscription: "Carry a way home within you.",
  },
] as const satisfies ReadonlyArray<{
  id: Intention;
  name: string;
  label: string;
  description: string;
  inscription: string;
}>;

export const materials = [
  {
    id: "bronze",
    name: "Bronze",
    description: "Warm, enduring metal.",
    color: "#b7854e",
    metalness: 0.86,
    roughness: 0.34,
  },
  {
    id: "obsidian",
    name: "Obsidian",
    description: "Dark, volcanic glass.",
    color: "#353a3e",
    metalness: 0.22,
    roughness: 0.18,
  },
  {
    id: "silver",
    name: "Silver",
    description: "Cool, reflective metal.",
    color: "#c8d1d5",
    metalness: 0.94,
    roughness: 0.23,
  },
] as const satisfies ReadonlyArray<{
  id: Material;
  name: string;
  description: string;
  color: string;
  metalness: number;
  roughness: number;
}>;

// Shared engraving coordinates, centered in a 100 × 100 viewBox.
export const marks = [
  {
    id: "sun",
    name: "Sun",
    description: "A sign of clarity.",
    path: "M50 32a18 18 0 1 0 0 36a18 18 0 1 0 0-36 M50 8v12 M50 80v12 M8 50h12 M80 50h12 M20 20l9 9 M71 71l9 9 M20 80l9-9 M71 29l9-9",
  },
  {
    id: "wave",
    name: "Wave",
    description: "A sign of movement.",
    path: "M10 38c15-22 25 22 40 0s25 22 40 0 M10 58c15-22 25 22 40 0s25 22 40 0 M10 78c15-22 25 22 40 0s25 22 40 0",
  },
  {
    id: "laurel",
    name: "Laurel",
    description: "A sign of perseverance.",
    path: "M48 88C12 70 12 35 32 12 M52 88C88 70 88 35 68 12 M28 68Q7 68 14 49Q32 48 28 68 M22 44Q6 39 18 23Q35 29 22 44 M72 68Q93 68 86 49Q68 48 72 68 M78 44Q94 39 82 23Q65 29 78 44 M31 28Q21 10 40 7Q48 24 31 28 M69 28Q79 10 60 7Q52 24 69 28",
  },
] as const satisfies ReadonlyArray<{
  id: Mark;
  name: string;
  description: string;
  path: string;
}>;

export const getIntention = (id: Intention) =>
  intentions.find((item) => item.id === id)!;
export const getMaterial = (id: Material) =>
  materials.find((item) => item.id === id)!;
export const getMark = (id: Mark) => marks.find((item) => item.id === id)!;
export const recipeTitle = (recipe: RecipeChoice) =>
  `${getIntention(recipe.intention).name} · ${getMaterial(recipe.material).name} · ${getMark(recipe.mark).name}`;
