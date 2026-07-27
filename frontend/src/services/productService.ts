import { OFFER_IMAGES_PATH } from "@/lib/constants";
import type {
  DrinkInclusiveItem,
  DrinkSizeOption,
  ProductFormData,
  ProductRecord,
  SubCategoryFormData,
  SubCategoryRecord,
} from "@/types";

export const PRODUCT_DESCRIPTION =
  "Kaffe Krümel is a cozy café offering freshly brewed coffee, handcrafted beverages, delicious pastries, and light meals in a warm and welcoming atmosphere.";

export const DRINK_CUSTOMIZATION_NAMES = ["Flavour", "Milk", "Topping"];
export const DRINK_GROUPS = ["Add Sauce", "Add Syrups", "Add Extra"];
export const DRINK_DEFAULT_OPTIONS = [
  "Dark Caramel Sauce",
  "White Chocolate Mocha Sauce",
  "Vanilla Syrup",
  "Hazelnut Syrup",
];

export function createEmptyInclusive(): DrinkInclusiveItem {
  return {
    id: `inc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    customizationName: "",
    group: "",
    defaultOption: "",
    pumps: "",
  };
}

export function createEmptySize(index = 1): DrinkSizeOption {
  return {
    id: `size-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sizeName: index === 1 ? "Small" : "",
    price: "0",
    status: "Active",
    collapsed: false,
    included: [createEmptyInclusive()],
  };
}

export const INITIAL_FOOD_SUB_CATEGORIES = [
  "Cake",
  "Pastry",
  "Sandwich",
  "Bakery",
];

export const INITIAL_DRINK_SUB_CATEGORIES = [
  "Coffee",
  "Cold Drinks",
  "Tea",
  "Smoothie",
];

/** @deprecated use INITIAL_FOOD_SUB_CATEGORIES */
export const FOOD_SUB_CATEGORIES = INITIAL_FOOD_SUB_CATEGORIES;
/** @deprecated use INITIAL_DRINK_SUB_CATEGORIES */
export const DRINK_SUB_CATEGORIES = INITIAL_DRINK_SUB_CATEGORIES;

const CHEESE_CAKE = `${OFFER_IMAGES_PATH}/cheese%20cake.png`;
const AMERICAN_MOCHO = `${OFFER_IMAGES_PATH}/American%20Mocho.png`;

export const EMPTY_PRODUCT_FORM: ProductFormData = {
  name: "",
  subCategory: "",
  price: "",
  description: "",
  image: "",
  sizes: [createEmptySize(1)],
};

export const EMPTY_SUB_CATEGORY_FORM: SubCategoryFormData = {
  image: "",
  category: "",
  name: "",
};

export const INITIAL_SUB_CATEGORIES: SubCategoryRecord[] = [
  {
    id: 1,
    name: "Cake",
    category: "Food",
    image: CHEESE_CAKE,
  },
  {
    id: 2,
    name: "Pastry",
    category: "Food",
    image: CHEESE_CAKE,
  },
  {
    id: 3,
    name: "Sandwich",
    category: "Food",
    image: CHEESE_CAKE,
  },
  {
    id: 4,
    name: "Bakery",
    category: "Food",
    image: CHEESE_CAKE,
  },
  {
    id: 5,
    name: "Coffee",
    category: "Drinks",
    image: AMERICAN_MOCHO,
  },
  {
    id: 6,
    name: "Cold Drinks",
    category: "Drinks",
    image: AMERICAN_MOCHO,
  },
  {
    id: 7,
    name: "Tea",
    category: "Drinks",
    image: AMERICAN_MOCHO,
  },
  {
    id: 8,
    name: "Smoothie",
    category: "Drinks",
    image: AMERICAN_MOCHO,
  },
];

export const INITIAL_FOOD_PRODUCTS: ProductRecord[] = Array.from(
  { length: 30 },
  (_, i) => ({
    id: i + 1,
    type: "food" as const,
    name: "Cheese Cake",
    subCategory: "Cake",
    price: "€3.15",
    description: PRODUCT_DESCRIPTION,
    image: CHEESE_CAKE,
    status: i === 1 ? ("Inactive" as const) : ("Active" as const),
  })
);

export const INITIAL_DRINK_PRODUCTS: ProductRecord[] = Array.from(
  { length: 30 },
  (_, i) => ({
    id: 100 + i + 1,
    type: "drinks" as const,
    name: "American Macho",
    subCategory: "Cold Drinks",
    price: "€1,20",
    description: PRODUCT_DESCRIPTION,
    image: AMERICAN_MOCHO,
    status: "Active" as const,
    sizes: [
      {
        id: `sample-small-${i}`,
        sizeName: "Small",
        price: "1,20",
        status: "Active" as const,
        collapsed: false,
        included: [
          {
            id: `s1-inc1-${i}`,
            customizationName: "Flavour",
            group: "Add Sauce",
            defaultOption: "Dark Caramel Sauce",
            pumps: "",
          },
          {
            id: `s1-inc2-${i}`,
            customizationName: "Flavour",
            group: "Add Syrups",
            defaultOption: "White Chocolate Mocha Sauce",
            pumps: "3",
          },
        ],
      },
      {
        id: `sample-medium-${i}`,
        sizeName: "Medium",
        price: "2,20",
        status: "Active" as const,
        collapsed: false,
        included: [
          {
            id: `s2-inc1-${i}`,
            customizationName: "Flavour",
            group: "Add Sauce",
            defaultOption: "Dark Caramel Sauce",
            pumps: "",
          },
          {
            id: `s2-inc2-${i}`,
            customizationName: "Flavour",
            group: "Add Syrups",
            defaultOption: "White Chocolate Mocha Sauce",
            pumps: "3",
          },
        ],
      },
      {
        id: `sample-large-${i}`,
        sizeName: "Large",
        price: "3,20",
        status: "Active" as const,
        collapsed: false,
        included: [
          {
            id: `s3-inc1-${i}`,
            customizationName: "Flavour",
            group: "Add Sauce",
            defaultOption: "Dark Caramel Sauce",
            pumps: "",
          },
          {
            id: `s3-inc2-${i}`,
            customizationName: "Flavour",
            group: "Add Syrups",
            defaultOption: "White Chocolate Mocha Sauce",
            pumps: "3",
          },
        ],
      },
    ],
  })
);
