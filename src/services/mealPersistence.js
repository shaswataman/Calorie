// Simple, DB-ready persistence layer for meal entries.
// Swappable later with a real database by replacing the provider implementation.

const MEAL_TYPES = ['breakfast', 'lunch', 'snacks', 'dinner'];

function getTodayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch (_) {
    return null;
  }
}

function normalizeRecordToArrays(record) {
  const base = { breakfast: [], lunch: [], snacks: [], dinner: [] };
  if (!record || typeof record !== 'object') return base;
  const result = { ...base };
  for (const type of MEAL_TYPES) {
    const val = record[type];
    if (Array.isArray(val)) {
      result[type] = val;
    } else if (val && typeof val === 'object') {
      result[type] = [val];
    } else {
      result[type] = [];
    }
  }
  return result;
}

function generateId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// LocalStorage-backed provider (default for now)
const localProvider = {
  saveMealEntry({ date, mealType, totals, tool }) {
    if (!MEAL_TYPES.includes(mealType)) {
      throw new Error('Invalid meal type');
    }
    const key = `meals:${date}`;
    const existingRaw = safeParse(localStorage.getItem(key)) || {};
    const existing = normalizeRecordToArrays(existingRaw);
    const entry = {
      id: generateId(),
      ...totals,
      tool: tool || 'unknown',
      savedAt: new Date().toISOString(),
    };
    const updated = { ...existing, [mealType]: [...existing[mealType], entry] };
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  },

  deleteMealEntry({ date, mealType, id }) {
    if (!MEAL_TYPES.includes(mealType)) {
      throw new Error('Invalid meal type');
    }
    const key = `meals:${date}`;
    const existingRaw = safeParse(localStorage.getItem(key)) || {};
    const existing = normalizeRecordToArrays(existingRaw);
    const updatedList = existing[mealType].filter((e) => e.id !== id);
    const updated = { ...existing, [mealType]: updatedList };
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  },

  getMealsByDate(date) {
    const key = `meals:${date}`;
    const raw = safeParse(localStorage.getItem(key));
    return normalizeRecordToArrays(raw);
  },
};

// Placeholder DB provider interface (to be implemented later)
// Example: swap exports.persistenceProvider = dbProvider once ready
const dbProvider = {
  saveMealEntry(_) {
    throw new Error('Database provider not implemented yet');
  },
  deleteMealEntry(_) {
    throw new Error('Database provider not implemented yet');
  },
  getMealsByDate(_) {
    throw new Error('Database provider not implemented yet');
  },
};

export const persistenceProvider = localProvider; // swap to dbProvider later
export { getTodayKey, MEAL_TYPES };


