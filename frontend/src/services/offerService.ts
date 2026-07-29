import { OFFER_IMAGES_PATH } from "@/lib/constants";
import type {
  OfferCatalogProduct,
  OfferDateParts,
  OfferRecord,
  ComboOfferFormData,
  SingleOfferFormData,
} from "@/types";

export const OFFER_CATEGORIES = ["Cake", "Coffee", "Pastry", "Beverage", "Cold Drinks"];

export const OFFER_DESCRIPTION =
  "Kaffe Krümel is a cozy café offering freshly brewed coffee, handcrafted beverages, delicious pastries, and light meals in a warm and welcoming atmosphere.";

const CHEESE_CAKE = `${OFFER_IMAGES_PATH}/cheese%20cake.png`;
const AMERICAN_MOCHO = `${OFFER_IMAGES_PATH}/American%20Mocho.png`;
const SUMMER_OFFER = `${OFFER_IMAGES_PATH}/summer%20offer.png`;

export const OFFER_PRODUCT_CATALOG: OfferCatalogProduct[] = [
  {
    id: 1,
    name: "Cheese Cake",
    category: "Cake",
    price: "€3.15",
    image: CHEESE_CAKE,
  },
  {
    id: 2,
    name: "American Macho",
    category: "Cold Drinks",
    price: "€3.15",
    image: AMERICAN_MOCHO,
  },
  {
    id: 3,
    name: "Cheese Cake",
    category: "Pastry",
    price: "€2.50",
    image: CHEESE_CAKE,
  },
];

export const EMPTY_DATE_PARTS: OfferDateParts = {
  day: "",
  month: "",
  year: "",
};

export const EMPTY_SINGLE_OFFER_FORM: SingleOfferFormData = {
  start: { ...EMPTY_DATE_PARTS },
  end: { ...EMPTY_DATE_PARTS },
  product: null,
  offerPrice: "",
};

export const EMPTY_COMBO_OFFER_FORM: ComboOfferFormData = {
  image: "",
  title: "",
  description: "",
  start: { ...EMPTY_DATE_PARTS },
  end: { ...EMPTY_DATE_PARTS },
  products: [],
};

export function formatOfferDate(parts: OfferDateParts) {
  const day = parts.day.padStart(2, "0");
  const month = parts.month.padStart(2, "0");
  return `${day}/${month}/${parts.year}`;
}

export function parseOfferDate(value: string): OfferDateParts {
  const [day = "", month = "", year = ""] = value.split("/");
  return { day, month, year };
}

/** Local calendar date from DD/MM/YYYY parts, or null if invalid */
export function offerDatePartsToLocalDate(parts: OfferDateParts): Date | null {
  const day = Number(parts.day);
  const month = Number(parts.month);
  const year = Number(parts.year);
  if (!day || !month || !year || String(parts.year).length !== 4) return null;
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function startOfTodayLocal(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Validate offer validity range.
 * - Start/end must be real calendar dates
 * - On create, start cannot be before today
 * - End cannot be before today
 * - End must be on/after start
 */
export function validateOfferDateRange(
  start: OfferDateParts,
  end: OfferDateParts,
  options?: { allowPastStart?: boolean }
): string | null {
  const startDate = offerDatePartsToLocalDate(start);
  const endDate = offerDatePartsToLocalDate(end);
  if (!startDate || !endDate) {
    return "Please enter valid Start and End dates.";
  }

  const today = startOfTodayLocal();
  if (!options?.allowPastStart && startDate < today) {
    return "Start date cannot be in the past.";
  }
  if (endDate < today) {
    return "End date cannot be in the past.";
  }
  if (endDate < startDate) {
    return "End date must be on or after the start date.";
  }
  return null;
}

/** True when validityTo (DD/MM/YYYY) end-of-day is before now */
export function isOfferValidityExpired(validityTo: string): boolean {
  const end = offerDatePartsToLocalDate(parseOfferDate(validityTo));
  if (!end) return false;
  const endOfDay = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate(),
    23,
    59,
    59,
    999
  );
  return endOfDay < new Date();
}

export const INITIAL_SINGLE_OFFERS: OfferRecord[] = Array.from(
  { length: 20 },
  (_, i) => {
    const isCake = i % 2 === 0;
    return {
      id: i + 1,
      type: "single" as const,
      name: isCake ? "Cheese Cake" : "American Macho",
      category: isCake ? "Cake" : "Cold Drink",
      status: "Active" as const,
      image: isCake ? CHEESE_CAKE : AMERICAN_MOCHO,
      validityFrom: "12/02/2026",
      validityTo: "20/02/2026",
      offerPrice: "€3.15",
      originalPrice: "€2.15",
      description: OFFER_DESCRIPTION,
    };
  }
);

export const INITIAL_COMBO_OFFERS: OfferRecord[] = Array.from(
  { length: 12 },
  (_, i) => ({
    id: 100 + i + 1,
    type: "combo" as const,
    name: "Summer Offer",
    category: "Combo",
    status: i % 4 === 0 ? ("Inactive" as const) : ("Active" as const),
    image: SUMMER_OFFER,
    validityFrom: "12/02/2026",
    validityTo: "20/02/2026",
    offerPrice: "€3.15",
    description: OFFER_DESCRIPTION,
    itemsSummary: "2 Croissant + 2Tea + 2 Macho",
    products: [
      {
        id: 1,
        name: "Cheese Cake",
        category: "Cake",
        price: "€3.10",
        image: CHEESE_CAKE,
        quantity: 1,
        discount: "1.20",
      },
      {
        id: 2,
        name: "Cheese Cake",
        category: "Cake",
        price: "€3.10",
        image: CHEESE_CAKE,
        quantity: 1,
        discount: "1.20",
      },
      {
        id: 3,
        name: "Cheese Cake",
        category: "Cake",
        price: "€3.10",
        image: CHEESE_CAKE,
        quantity: 1,
        discount: "1.20",
      },
    ],
  })
);
