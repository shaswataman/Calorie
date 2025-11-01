import { useState, useMemo, memo } from 'react';
import './App.css';
import { persistenceProvider, getTodayKey } from './services/mealPersistence';

// Nutrition data per unit
const NUTRIENTS = {
  milk_per_ml: { kcal: 120 / 250, protein: 8 / 250, carbs: 12 / 250, fat: 4 / 250 },
  banana_per_fruit: { kcal: 105, protein: 1.3, carbs: 27, fat: 0.3 },
  banana_per_g: { kcal: 89 / 100, protein: 1.1 / 100, carbs: 23 / 100, fat: 0.3 / 100 },
  kiwi_per_fruit: { kcal: 42, protein: 0.8, carbs: 10, fat: 0.4 },
  berries_per_g: { kcal: 70 / 20, protein: 0.5 / 20, carbs: 17 / 20, fat: 0.2 / 20 },
  pb_per_g: { kcal: 95 / 16, protein: 4 / 16, carbs: 3 / 16, fat: 8 / 16 },
  icecream_per_g: { kcal: 35 / 15, protein: 0.5 / 15, carbs: 4 / 15, fat: 2 / 15 },
  whey_per_scoop: { kcal: 120, protein: 25, carbs: 2, fat: 2 },
  normal_milk_per_ml: { kcal: 150 / 250, protein: 8 / 250, carbs: 12 / 250, fat: 8 / 250 },
  oats_per_g: { kcal: 389 / 100, protein: 17 / 100, carbs: 66 / 100, fat: 7 / 100 },
  // Rice bowl items (per gram, typical values)
  jasmine_rice_cooked_per_g: { kcal: 130 / 100, protein: 2.7 / 100, carbs: 28 / 100, fat: 0.3 / 100 },
  chicken_breast_cooked_per_g: { kcal: 165 / 100, protein: 31 / 100, carbs: 0, fat: 3.6 / 100 },
  potatoes_boiled_per_g: { kcal: 87 / 100, protein: 2 / 100, carbs: 20 / 100, fat: 0.1 / 100 },
  potatoes_stirfry_per_g: { kcal: 150 / 100, protein: 2 / 100, carbs: 20 / 100, fat: 7 / 100 },
  tomatoes_per_g: { kcal: 18 / 100, protein: 0.9 / 100, carbs: 3.9 / 100, fat: 0.2 / 100 },
  cucumbers_per_g: { kcal: 15 / 100, protein: 0.7 / 100, carbs: 3.6 / 100, fat: 0.1 / 100 },
  bell_peppers_per_g: { kcal: 31 / 100, protein: 1 / 100, carbs: 6 / 100, fat: 0.3 / 100 },
  onion_per_g: { kcal: 40 / 100, protein: 1.1 / 100, carbs: 9.3 / 100, fat: 0.1 / 100 },
};

function round(x) {
  return Math.round(x * 10) / 10;
}

// IngredientRow component defined outside App to maintain stable reference
const IngredientRow = memo(function IngredientRow({ ingredient }) {
  const values = {
    kcal: round(ingredient.value * ingredient.nutrient.kcal),
    protein: round(ingredient.value * ingredient.nutrient.protein),
    carbs: round(ingredient.value * ingredient.nutrient.carbs),
    fat: round(ingredient.value * ingredient.nutrient.fat),
  };

  const handleChange = (newValue) => {
    const numValue = Number(newValue);
    if (!isNaN(numValue)) {
      // Clamp value between min and max
      const clampedValue = Math.max(ingredient.inputProps.min, Math.min(ingredient.inputProps.max, numValue));
      ingredient.onChange(clampedValue);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
      <div className="w-28 sm:w-32 flex-shrink-0">
        <div className="text-xs sm:text-sm font-medium">{ingredient.name}</div>
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5 flex-1 sm:w-30 sm:flex-shrink-0">
        <input
          type="range"
          min={ingredient.inputProps.min}
          max={ingredient.inputProps.max}
          step={ingredient.inputProps.step}
          value={ingredient.value}
          onChange={(e) => handleChange(e.target.value)}
          className="flex-1 h-8 sm:h-auto"
          aria-label={ingredient.name}
        />
        <input
          type="number"
          min={ingredient.inputProps.min}
          max={ingredient.inputProps.max}
          step={ingredient.inputProps.step}
          value={ingredient.value}
          onChange={(e) => handleChange(e.target.value)}
          className="w-12 sm:w-14 px-1 sm:px-1.5 py-0.5 sm:py-1 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`${ingredient.name} value`}
        />
        <span className="text-xs text-slate-500 w-8 sm:w-10">{ingredient.unit}</span>
      </div>

      {/* Nutrition details: wraps on mobile, stays inline on desktop */}
      <div className="w-full sm:w-28 sm:ml-auto sm:mr-4">
        <div className="text-xs sm:text-sm">
          {/* Mobile: horizontal layout */}
          <div className="flex gap-3 sm:hidden">
            <div className="flex gap-2">
              <span>{values.kcal} kcal</span>
            </div>
            <div className="flex gap-2 text-slate-500">
              <span>{values.carbs} C</span>
              <span>{values.fat} F</span>
              <span>{values.protein} g P</span>
            </div>
          </div>
          {/* Desktop: original two-line layout */}
          <div className="hidden sm:block">
            <div className="flex justify-between">
              <div>{values.kcal} kcal</div>
              <div>{values.protein} g P</div>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <div>{values.carbs} C</div>
              <div>{values.fat} F</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if the value actually changed
  return prevProps.ingredient.value === nextProps.ingredient.value;
});

function ShakeMixerView({ onSaved }) {
  // State for ingredient amounts
  const [milkMl, setMilkMl] = useState(250);
  const [bananaFruits, setBananaFruits] = useState(1);
  const [bananaG, setBananaG] = useState(0);
  const [kiwiFruits, setKiwiFruits] = useState(1);
  const [berriesG, setBerriesG] = useState(20);
  const [pbG, setPbG] = useState(0);
  const [iceG, setIceG] = useState(0);
  const [wheyScoops, setWheyScoops] = useState(1);
  const [normalMilkMl, setNormalMilkMl] = useState(0);
  const [oatsG, setOatsG] = useState(0);
  const [showMoreItems, setShowMoreItems] = useState(false);

  // Calculate totals
  const totals = useMemo(() => {
    const m = NUTRIENTS.milk_per_ml;
    const b = NUTRIENTS.banana_per_fruit;
    const bg = NUTRIENTS.banana_per_g;
    const k = NUTRIENTS.kiwi_per_fruit;
    const be = NUTRIENTS.berries_per_g;
    const pb = NUTRIENTS.pb_per_g;
    const ic = NUTRIENTS.icecream_per_g;
    const w = NUTRIENTS.whey_per_scoop;
    const nm = NUTRIENTS.normal_milk_per_ml;
    const o = NUTRIENTS.oats_per_g;

    const kcal =
      milkMl * m.kcal +
      bananaFruits * b.kcal +
      bananaG * bg.kcal +
      kiwiFruits * k.kcal +
      berriesG * be.kcal +
      pbG * pb.kcal +
      iceG * ic.kcal +
      wheyScoops * w.kcal +
      normalMilkMl * nm.kcal +
      oatsG * o.kcal;

    const protein =
      milkMl * m.protein +
      bananaFruits * b.protein +
      bananaG * bg.protein +
      kiwiFruits * k.protein +
      berriesG * be.protein +
      pbG * pb.protein +
      iceG * ic.protein +
      wheyScoops * w.protein +
      normalMilkMl * nm.protein +
      oatsG * o.protein;

    const carbs =
      milkMl * m.carbs +
      bananaFruits * b.carbs +
      bananaG * bg.carbs +
      kiwiFruits * k.carbs +
      berriesG * be.carbs +
      pbG * pb.carbs +
      iceG * ic.carbs +
      wheyScoops * w.carbs +
      normalMilkMl * nm.carbs +
      oatsG * o.carbs;

    const fat =
      milkMl * m.fat +
      bananaFruits * b.fat +
      bananaG * bg.fat +
      kiwiFruits * k.fat +
      berriesG * be.fat +
      pbG * pb.fat +
      iceG * ic.fat +
      wheyScoops * w.fat +
      normalMilkMl * nm.fat +
      oatsG * o.fat;

    return {
      kcal: round(kcal),
      protein: round(protein),
      carbs: round(carbs),
      fat: round(fat),
    };
  }, [milkMl, bananaFruits, bananaG, kiwiFruits, berriesG, pbG, iceG, wheyScoops, normalMilkMl, oatsG]);

  // Quick set presets
  const quickSet = (mode) => {
    if (mode === 'snack') {
      setMilkMl(150);
      setBananaFruits(0.5);
      setKiwiFruits(0.5);
      setBerriesG(10);
      setPbG(0);
      setIceG(0);
      setWheyScoops(0.5);
    } else if (mode === 'breakfast') {
      setMilkMl(250);
      setBananaFruits(1);
      setKiwiFruits(1);
      setBerriesG(20);
      setPbG(0);
      setIceG(0);
      setWheyScoops(1);
    } else if (mode === 'meal') {
      setMilkMl(300);
      setBananaFruits(1.5);
      setKiwiFruits(1);
      setBerriesG(30);
      setPbG(0);
      setIceG(0);
      setWheyScoops(1.5);
    }
  };

  // Copy totals to clipboard
  const copyTotals = () => {
    const text = `Totals - ${totals.kcal} kcal | ${totals.protein} g protein | ${totals.carbs} g carbs | ${totals.fat} g fat`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        if (typeof window !== 'undefined' && window.alert) {
          alert('Totals copied to clipboard:\n' + text);
        }
      });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      if (typeof window !== 'undefined' && window.alert) {
        alert('Totals copied to clipboard:\n' + text);
      }
    }
  };

  // Ingredient configuration
  const ingredients = [
    {
      id: 'milk',
      name: 'Low-fat milk (2%)',
      value: milkMl,
      onChange: setMilkMl,
      unit: 'ml',
      inputProps: { min: 0, max: 1000, step: 10 },
      nutrient: NUTRIENTS.milk_per_ml,
    },
    {
      id: 'banana',
      name: 'Banana',
      value: bananaFruits,
      onChange: setBananaFruits,
      unit: 'fruits',
      inputProps: { min: 0, max: 3, step: 0.5 },
      nutrient: NUTRIENTS.banana_per_fruit,
    },
    {
      id: 'kiwi',
      name: 'Kiwi',
      value: kiwiFruits,
      onChange: setKiwiFruits,
      unit: 'fruits',
      inputProps: { min: 0, max: 3, step: 0.5 },
      nutrient: NUTRIENTS.kiwi_per_fruit,
    },
    {
      id: 'berries',
      name: 'Dried mixed berries (unsweetened)',
      value: berriesG,
      onChange: setBerriesG,
      unit: 'g',
      inputProps: { min: 0, max: 100, step: 1 },
      nutrient: NUTRIENTS.berries_per_g,
    },
    {
      id: 'whey',
      name: 'Whey protein (scoops)',
      value: wheyScoops,
      onChange: setWheyScoops,
      unit: 'scoops',
      inputProps: { min: 0, max: 3, step: 0.5 },
      nutrient: NUTRIENTS.whey_per_scoop,
    },
  ];

  const moreIngredients = [
    {
      id: 'banana_g',
      name: 'Banana (grams)',
      value: bananaG,
      onChange: setBananaG,
      unit: 'g',
      inputProps: { min: 0, max: 300, step: 5 },
      nutrient: NUTRIENTS.banana_per_g,
    },
    {
      id: 'pb',
      name: 'Peanut butter',
      value: pbG,
      onChange: setPbG,
      unit: 'g',
      inputProps: { min: 0, max: 60, step: 1 },
      nutrient: NUTRIENTS.pb_per_g,
    },
    {
      id: 'ice',
      name: 'Ice cream (vanilla)',
      value: iceG,
      onChange: setIceG,
      unit: 'g',
      inputProps: { min: 0, max: 60, step: 1 },
      nutrient: NUTRIENTS.icecream_per_g,
    },
    {
      id: 'normal_milk',
      name: 'Normal milk (whole)',
      value: normalMilkMl,
      onChange: setNormalMilkMl,
      unit: 'ml',
      inputProps: { min: 0, max: 1000, step: 10 },
      nutrient: NUTRIENTS.normal_milk_per_ml,
    },
    {
      id: 'oats',
      name: 'Oats',
      value: oatsG,
      onChange: setOatsG,
      unit: 'g',
      inputProps: { min: 0, max: 200, step: 5 },
      nutrient: NUTRIENTS.oats_per_g,
    },
  ];

  const [showMealPicker, setShowMealPicker] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Shake Mixer — interactive nutrition builder</h1>
      <p className="mb-4 text-sm text-slate-600">Adjust amounts below (grams / ml / scoops) and the totals update instantly. Set ingredients to 0 to remove them.</p>

      <div className="flex gap-3 mb-4">
        <button onClick={() => quickSet('snack')} className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200">
          Snack
        </button>
        <button onClick={() => quickSet('breakfast')} className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200">
          Breakfast
        </button>
        <button onClick={() => quickSet('meal')} className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200">
          Meal replacement
        </button>
        <button onClick={copyTotals} className="px-3 py-1 rounded bg-emerald-100 hover:bg-emerald-200 ml-auto">
          Copy totals
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow lg:col-span-2">
          <h2 className="font-medium mb-3">Ingredients</h2>

          {ingredients.map((ingredient) => (
            <IngredientRow key={ingredient.id} ingredient={ingredient} />
          ))}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowMoreItems(!showMoreItems)}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800"
            >
              <span className="text-lg">{showMoreItems ? '−' : '+'}</span>
              <span>More Items</span>
            </button>

            {showMoreItems && (
              <div className="mt-3">
                {moreIngredients.map((ingredient) => (
                  <IngredientRow key={ingredient.id} ingredient={ingredient} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-medium mb-3">Totals</h2>

          <div className="text-3xl font-bold mb-2">{totals.kcal} kcal</div>
          <div className="grid grid-cols-3 gap-2 text-sm mb-4">
            <div className="bg-slate-50 p-2 rounded text-center">{totals.protein} g Protein</div>
            <div className="bg-slate-50 p-2 rounded text-center">{totals.carbs} g Carbs</div>
            <div className="bg-slate-50 p-2 rounded text-center">{totals.fat} g Fat</div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => setShowMealPicker((v) => !v)}
                className="px-3 py-1 rounded bg-blue-600 text-white"
              >
                Save to Meals
              </button>
            </div>
            {showMealPicker && (
              <MealTypePicker
                onSelect={(mealType) => {
                  const updated = persistenceProvider.saveMealEntry({
                    date: getTodayKey(),
                    mealType,
                    totals,
                    tool: 'shake',
                  });
                  if (onSaved) onSaved(updated);
                  setShowMealPicker(false);
                  setSaveMessage(`Saved to ${mealType} for today.`);
                  setTimeout(() => setSaveMessage(''), 2500);
                }}
                onCancel={() => setShowMealPicker(false)}
              />
            )}
            {saveMessage && <div className="text-xs text-emerald-700">{saveMessage}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function RiceBowlView({ onSaved }) {
  const [riceG, setRiceG] = useState(200);
  const [chickenG, setChickenG] = useState(150);
  const [potatoesG, setPotatoesG] = useState(0);
  const [tomatoesG, setTomatoesG] = useState(50);
  const [cucumbersG, setCucumbersG] = useState(50);
  const [bellPeppersG, setBellPeppersG] = useState(30);
  const [onionG, setOnionG] = useState(20);

  const totals = useMemo(() => {
    const r = NUTRIENTS.jasmine_rice_cooked_per_g;
    const c = NUTRIENTS.chicken_breast_cooked_per_g;
    const pb = NUTRIENTS.potatoes_boiled_per_g;
    const ps = NUTRIENTS.potatoes_stirfry_per_g;
    const t = NUTRIENTS.tomatoes_per_g;
    const cu = NUTRIENTS.cucumbers_per_g;
    const bp = NUTRIENTS.bell_peppers_per_g;
    const o = NUTRIENTS.onion_per_g;

    // Use a fixed stir-fried-at-home profile for potatoes
    const kcal = riceG * r.kcal + chickenG * c.kcal + potatoesG * ps.kcal + tomatoesG * t.kcal + cucumbersG * cu.kcal + bellPeppersG * bp.kcal + onionG * o.kcal;
    const protein = riceG * r.protein + chickenG * c.protein + potatoesG * ps.protein + tomatoesG * t.protein + cucumbersG * cu.protein + bellPeppersG * bp.protein + onionG * o.protein;
    const carbs = riceG * r.carbs + chickenG * c.carbs + potatoesG * ps.carbs + tomatoesG * t.carbs + cucumbersG * cu.carbs + bellPeppersG * bp.carbs + onionG * o.carbs;
    const fat = riceG * r.fat + chickenG * c.fat + potatoesG * ps.fat + tomatoesG * t.fat + cucumbersG * cu.fat + bellPeppersG * bp.fat + onionG * o.fat;

    return { kcal: round(kcal), protein: round(protein), carbs: round(carbs), fat: round(fat) };
  }, [riceG, chickenG, potatoesG, tomatoesG, cucumbersG, bellPeppersG, onionG]);

  const copyTotals = () => {
    const text = `Totals - ${totals.kcal} kcal | ${totals.protein} g protein | ${totals.carbs} g carbs | ${totals.fat} g fat`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        if (typeof window !== 'undefined' && window.alert) {
          alert('Totals copied to clipboard:\n' + text);
        }
      });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      if (typeof window !== 'undefined' && window.alert) {
        alert('Totals copied to clipboard:\n' + text);
      }
    }
  };

  const ingredients = [
    { id: 'rice', name: 'Jasmine rice (cooked)', value: riceG, onChange: setRiceG, unit: 'g', inputProps: { min: 0, max: 600, step: 5 }, nutrient: NUTRIENTS.jasmine_rice_cooked_per_g },
    { id: 'chicken', name: 'Chicken breast (air fried)', value: chickenG, onChange: setChickenG, unit: 'g', inputProps: { min: 0, max: 400, step: 5 }, nutrient: NUTRIENTS.chicken_breast_cooked_per_g },
    { id: 'potatoes', name: 'Potatoes (boiled then stir-fried)', value: potatoesG, onChange: setPotatoesG, unit: 'g', inputProps: { min: 0, max: 500, step: 5 }, nutrient: NUTRIENTS.potatoes_stirfry_per_g },
  ];

  const vegTotal = tomatoesG + cucumbersG + bellPeppersG + onionG;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Rice Bowl — interactive nutrition builder</h1>
      <p className="mb-4 text-sm text-slate-600">Adjust grams for each ingredient; totals update instantly. Set to 0 to remove an item.</p>

      <div className="flex gap-3 mb-4">
        <button onClick={copyTotals} className="px-3 py-1 rounded bg-emerald-100 hover:bg-emerald-200 ml-auto">Copy totals</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow lg:col-span-2">
          <h2 className="font-medium mb-3">Ingredients</h2>
          {ingredients.map((ingredient) => (
            <IngredientRow key={ingredient.id} ingredient={ingredient} />
          ))}

          {/* Potatoes now use a fixed stir-fried-at-home profile */}

          {/* Veggies group */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm font-medium mb-2">Veggies</div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <div className="w-28 sm:w-32 flex-shrink-0">
                <div className="text-xs sm:text-sm">Veggies (total)</div>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 flex-1 sm:w-30 sm:flex-shrink-0">
                <input
                  type="range"
                  min={0}
                  max={250}
                  step={5}
                  value={vegTotal}
                  onChange={(e) => {
                    const total = Number(e.target.value);
                    const per = total / 4;
                    setTomatoesG(per);
                    setCucumbersG(per);
                    setBellPeppersG(per);
                    setOnionG(per);
                  }}
                  className="flex-1 h-8 sm:h-auto"
                  aria-label="Veggies total grams"
                />
                <input
                  type="number"
                  min={0}
                  max={250}
                  step={5}
                  value={vegTotal}
                  onChange={(e) => {
                    const total = Number(e.target.value);
                    const per = total / 4;
                    setTomatoesG(per);
                    setCucumbersG(per);
                    setBellPeppersG(per);
                    setOnionG(per);
                  }}
                  className="w-16 sm:w-20 px-1 sm:px-1.5 py-0.5 sm:py-1 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Veggies total grams value"
                />
                <span className="text-xs text-slate-500 w-8 sm:w-10">g</span>
              </div>
            </div>

            {/* Individual veggies */}
            <IngredientRow key="tomatoes" ingredient={{ id: 'tomatoes', name: 'Tomatoes', value: tomatoesG, onChange: setTomatoesG, unit: 'g', inputProps: { min: 0, max: 250, step: 5 }, nutrient: NUTRIENTS.tomatoes_per_g }} />
            <IngredientRow key="cucumbers" ingredient={{ id: 'cucumbers', name: 'Cucumbers', value: cucumbersG, onChange: setCucumbersG, unit: 'g', inputProps: { min: 0, max: 250, step: 5 }, nutrient: NUTRIENTS.cucumbers_per_g }} />
            <IngredientRow key="bell_peppers" ingredient={{ id: 'bell_peppers', name: 'Bell peppers', value: bellPeppersG, onChange: setBellPeppersG, unit: 'g', inputProps: { min: 0, max: 250, step: 5 }, nutrient: NUTRIENTS.bell_peppers_per_g }} />
            <IngredientRow key="onion" ingredient={{ id: 'onion', name: 'Onion', value: onionG, onChange: setOnionG, unit: 'g', inputProps: { min: 0, max: 250, step: 5 }, nutrient: NUTRIENTS.onion_per_g }} />
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-medium mb-3">Totals</h2>
          <div className="text-3xl font-bold mb-2">{totals.kcal} kcal</div>
          <div className="grid grid-cols-3 gap-2 text-sm mb-4">
            <div className="bg-slate-50 p-2 rounded text-center">{totals.protein} g Protein</div>
            <div className="bg-slate-50 p-2 rounded text-center">{totals.carbs} g Carbs</div>
            <div className="bg-slate-50 p-2 rounded text-center">{totals.fat} g Fat</div>
          </div>
          <MealSaveArea toolId="bowl" totals={totals} onSaved={onSaved} />
        </div>
      </div>
    </div>
  );
}

function App() {
  const [tool, setTool] = useState('shake'); // 'shake' | 'bowl'
  const [isMealsOpen, setIsMealsOpen] = useState(false);
  const [todayMeals, setTodayMeals] = useState(() => persistenceProvider.getMealsByDate(getTodayKey()));

  const openMeals = () => {
    setTodayMeals(persistenceProvider.getMealsByDate(getTodayKey()));
    setIsMealsOpen(true);
  };

  const onSaved = () => {
    setTodayMeals(persistenceProvider.getMealsByDate(getTodayKey()));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setTool('shake')}
          className={`${tool === 'shake' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'} px-3 py-1 rounded`}
        >
          Shake Mixer
        </button>
        <button
          onClick={() => setTool('bowl')}
          className={`${tool === 'bowl' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'} px-3 py-1 rounded`}
        >
          Rice Bowl
        </button>
        <button onClick={openMeals} className="px-3 py-1 rounded bg-emerald-100 hover:bg-emerald-200 ml-auto">Today&apos;s Meals</button>
      </div>

      {tool === 'shake' ? <ShakeMixerView onSaved={onSaved} /> : <RiceBowlView onSaved={onSaved} />}

      <div className="mt-6 text-sm text-slate-500">Built for quick experimentation. Edit amounts or copy totals.</div>

      {isMealsOpen && (
        <div className="fixed inset-0 z-50" style={{ display: 'flex' }}>
          <div
            className="flex-1 bg-black/30"
            onClick={() => setIsMealsOpen(false)}
            role="button"
            aria-label="Close meals overlay"
          />
          <div className="w-full max-w-md bg-white h-full shadow-xl p-4 overflow-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-semibold">Today&apos;s Meals — {getTodayKey()}</div>
              <button onClick={() => setIsMealsOpen(false)} className="px-2 py-1 rounded bg-slate-100">Close</button>
            </div>
            <div className="space-y-3">
              <MealSummary
                title="Breakfast"
                entries={todayMeals.breakfast}
                onDelete={(id) => {
                  const updated = persistenceProvider.deleteMealEntry({ date: getTodayKey(), mealType: 'breakfast', id });
                  setTodayMeals(updated);
                }}
              />
              <MealSummary
                title="Lunch"
                entries={todayMeals.lunch}
                onDelete={(id) => {
                  const updated = persistenceProvider.deleteMealEntry({ date: getTodayKey(), mealType: 'lunch', id });
                  setTodayMeals(updated);
                }}
              />
              <MealSummary
                title="Snacks"
                entries={todayMeals.snacks}
                onDelete={(id) => {
                  const updated = persistenceProvider.deleteMealEntry({ date: getTodayKey(), mealType: 'snacks', id });
                  setTodayMeals(updated);
                }}
              />
              <MealSummary
                title="Dinner"
                entries={todayMeals.dinner}
                onDelete={(id) => {
                  const updated = persistenceProvider.deleteMealEntry({ date: getTodayKey(), mealType: 'dinner', id });
                  setTodayMeals(updated);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MealSaveArea({ toolId, totals, onSaved }) {
  const [showMealPicker, setShowMealPicker] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={() => setShowMealPicker((v) => !v)}
          className="px-3 py-1 rounded bg-blue-600 text-white"
        >
          Save to Meals
        </button>
      </div>
      {showMealPicker && (
        <MealTypePicker
          onSelect={(mealType) => {
            const updated = persistenceProvider.saveMealEntry({
              date: getTodayKey(),
              mealType,
              totals,
              tool: toolId,
            });
            if (onSaved) onSaved(updated);
            setShowMealPicker(false);
            setSaveMessage(`Saved to ${mealType} for today.`);
            setTimeout(() => setSaveMessage(''), 2500);
          }}
          onCancel={() => setShowMealPicker(false)}
        />
      )}
      {saveMessage && <div className="text-xs text-emerald-700">{saveMessage}</div>}
    </div>
  );
}

function MealTypePicker({ onSelect, onCancel }) {
  return (
    <div className="border rounded p-2 bg-white shadow-sm">
      <div className="text-xs mb-2">Select meal</div>
      <div className="grid grid-cols-2 gap-2">
        <button className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200" onClick={() => onSelect('breakfast')}>Breakfast</button>
        <button className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200" onClick={() => onSelect('lunch')}>Lunch</button>
        <button className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200" onClick={() => onSelect('snacks')}>Snacks</button>
        <button className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200" onClick={() => onSelect('dinner')}>Dinner</button>
      </div>
      <div className="mt-2 text-right">
        <button className="text-xs text-slate-600 hover:underline" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function MealSummary({ title, entries, onDelete }) {
  const hasEntries = Array.isArray(entries) && entries.length > 0;
  const totals = hasEntries
    ? entries.reduce(
        (acc, e) => ({
          kcal: acc.kcal + (e.kcal || 0),
          protein: acc.protein + (e.protein || 0),
          carbs: acc.carbs + (e.carbs || 0),
          fat: acc.fat + (e.fat || 0),
        }),
        { kcal: 0, protein: 0, carbs: 0, fat: 0 }
      )
    : { kcal: 0, protein: 0, carbs: 0, fat: 0 };

  return (
    <div className="border rounded p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">{title}</div>
        {hasEntries && <div className="text-xs text-slate-600">Total: {Math.round(totals.kcal)} kcal</div>}
      </div>
      {hasEntries ? (
        <div className="space-y-2">
          {entries.map((e) => (
            <div key={e.id} className="border rounded p-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{e.kcal} kcal</div>
                <button
                  className="text-xs text-red-600 hover:underline"
                  onClick={() => onDelete && onDelete(e.id)}
                >
                  Delete
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs mt-1">
                <div className="bg-slate-50 p-2 rounded text-center">{e.protein} g Protein</div>
                <div className="bg-slate-50 p-2 rounded text-center">{e.carbs} g Carbs</div>
                <div className="bg-slate-50 p-2 rounded text-center">{e.fat} g Fat</div>
              </div>
              <div className="text-[11px] text-slate-500 mt-2">Saved from: {e.tool} — {new Date(e.savedAt).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-slate-500">No entry saved.</div>
      )}
    </div>
  );
}

export default App;

