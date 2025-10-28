import { useState, useMemo, memo } from 'react';
import './App.css';

// Nutrition data per unit
const NUTRIENTS = {
  milk_per_ml: { kcal: 120 / 250, protein: 8 / 250, carbs: 12 / 250, fat: 4 / 250 },
  banana_per_fruit: { kcal: 105, protein: 1.3, carbs: 27, fat: 0.3 },
  kiwi_per_fruit: { kcal: 42, protein: 0.8, carbs: 10, fat: 0.4 },
  berries_per_g: { kcal: 70 / 20, protein: 0.5 / 20, carbs: 17 / 20, fat: 0.2 / 20 },
  pb_per_g: { kcal: 95 / 16, protein: 4 / 16, carbs: 3 / 16, fat: 8 / 16 },
  icecream_per_g: { kcal: 35 / 15, protein: 0.5 / 15, carbs: 4 / 15, fat: 2 / 15 },
  whey_per_scoop: { kcal: 120, protein: 25, carbs: 2, fat: 2 },
  normal_milk_per_ml: { kcal: 150 / 250, protein: 8 / 250, carbs: 12 / 250, fat: 8 / 250 },
  oats_per_g: { kcal: 389 / 100, protein: 17 / 100, carbs: 66 / 100, fat: 7 / 100 },
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

function App() {
  // State for ingredient amounts
  const [milkMl, setMilkMl] = useState(250);
  const [bananaFruits, setBananaFruits] = useState(1);
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
  }, [milkMl, bananaFruits, kiwiFruits, berriesG, pbG, iceG, wheyScoops, normalMilkMl, oatsG]);

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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Shake Mixer — interactive nutrition builder</h1>
      <p className="mb-4 text-sm text-slate-600">
        Adjust amounts below (grams / ml / scoops) and the totals update instantly. Set ingredients to 0 to remove them.
      </p>

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

          <h3 className="font-medium mb-2">Per-ingredient detail</h3>
          <div className="text-xs text-slate-600 mb-2">(Hover on numbers for suggestion actions)</div>

          <div className="space-y-2">
            {ingredients.map((ing) => {
              const ingValues = {
                kcal: round(ing.value * ing.nutrient.kcal),
                protein: round(ing.value * ing.nutrient.protein),
              };
              return (
                <div key={ing.id} className="flex justify-between items-center">
                  <div className="text-sm">{ing.name}</div>
                  <div className="text-xs text-slate-700">
                    {ingValues.kcal} kcal — {ingValues.protein} g P
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 border-t pt-4 text-sm text-slate-600">
            <div className="mb-2">
              <strong>Tips</strong>
            </div>
            <ul className="list-disc pl-5">
              <li>Remove peanut butter (set to 0 g) to drop ~95 kcal and ~8 g fat (per tbsp).</li>
              <li>Swap milk to lower volume to drop ~0.48 kcal per ml — every 50 ml ≈ 24 kcal.</li>
              <li>Add 1 scoop whey to add ~25 g protein (~120 kcal).</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-slate-500">
        Built for quick experimentation. Edit amounts, copy totals, or use quick presets.
      </div>
    </div>
  );
}

export default App;

