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

class ShakeMixer {
  constructor() {
    // State variables
    this.milkMl = 250;
    this.bananaFruits = 1;
    this.kiwiFruits = 1;
    this.berriesG = 20;
    this.pbG = 16;
    this.iceG = 0;
    this.wheyScoops = 1;
    this.normalMilkMl = 0;
    this.oatsG = 0;
    this.showMoreItems = false;
    
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  calculateTotals() {
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
      this.milkMl * m.kcal +
      this.bananaFruits * b.kcal +
      this.kiwiFruits * k.kcal +
      this.berriesG * be.kcal +
      this.pbG * pb.kcal +
      this.iceG * ic.kcal +
      this.wheyScoops * w.kcal +
      this.normalMilkMl * nm.kcal +
      this.oatsG * o.kcal;

    const protein =
      this.milkMl * m.protein +
      this.bananaFruits * b.protein +
      this.kiwiFruits * k.protein +
      this.berriesG * be.protein +
      this.pbG * pb.protein +
      this.iceG * ic.protein +
      this.wheyScoops * w.protein +
      this.normalMilkMl * nm.protein +
      this.oatsG * o.protein;

    const carbs =
      this.milkMl * m.carbs +
      this.bananaFruits * b.carbs +
      this.kiwiFruits * k.carbs +
      this.berriesG * be.carbs +
      this.pbG * pb.carbs +
      this.iceG * ic.carbs +
      this.wheyScoops * w.carbs +
      this.normalMilkMl * nm.carbs +
      this.oatsG * o.carbs;

    const fat =
      this.milkMl * m.fat +
      this.bananaFruits * b.fat +
      this.kiwiFruits * k.fat +
      this.berriesG * be.fat +
      this.pbG * pb.fat +
      this.iceG * ic.fat +
      this.wheyScoops * w.fat +
      this.normalMilkMl * nm.fat +
      this.oatsG * o.fat;

    return {
      kcal: round(kcal),
      protein: round(protein),
      carbs: round(carbs),
      fat: round(fat),
    };
  }

  getIngredientRows() {
    return [
      {
        id: "milk",
        name: "Low-fat milk (2%)",
        qtyLabel: `${this.milkMl} ml`,
        value: this.milkMl,
        change: (v) => { this.milkMl = Number(v); this.updateIngredientValues(); },
        values: {
          kcal: round(this.milkMl * NUTRIENTS.milk_per_ml.kcal),
          protein: round(this.milkMl * NUTRIENTS.milk_per_ml.protein),
          carbs: round(this.milkMl * NUTRIENTS.milk_per_ml.carbs),
          fat: round(this.milkMl * NUTRIENTS.milk_per_ml.fat),
        },
        inputProps: { min: 0, max: 1000, step: 10 },
      },
      {
        id: "banana",
        name: "Banana",
        qtyLabel: `${this.bananaFruits} fruit${this.bananaFruits !== 1 ? 's' : ''}`,
        value: this.bananaFruits,
        change: (v) => { this.bananaFruits = Number(v); this.updateIngredientValues(); },
        values: {
          kcal: round(this.bananaFruits * NUTRIENTS.banana_per_fruit.kcal),
          protein: round(this.bananaFruits * NUTRIENTS.banana_per_fruit.protein),
          carbs: round(this.bananaFruits * NUTRIENTS.banana_per_fruit.carbs),
          fat: round(this.bananaFruits * NUTRIENTS.banana_per_fruit.fat),
        },
        inputProps: { min: 0, max: 3, step: 0.5 },
      },
      {
        id: "kiwi",
        name: "Kiwi",
        qtyLabel: `${this.kiwiFruits} fruit${this.kiwiFruits !== 1 ? 's' : ''}`,
        value: this.kiwiFruits,
        change: (v) => { this.kiwiFruits = Number(v); this.updateIngredientValues(); },
        values: {
          kcal: round(this.kiwiFruits * NUTRIENTS.kiwi_per_fruit.kcal),
          protein: round(this.kiwiFruits * NUTRIENTS.kiwi_per_fruit.protein),
          carbs: round(this.kiwiFruits * NUTRIENTS.kiwi_per_fruit.carbs),
          fat: round(this.kiwiFruits * NUTRIENTS.kiwi_per_fruit.fat),
        },
        inputProps: { min: 0, max: 3, step: 0.5 },
      },
      {
        id: "berries",
        name: "Dried mixed berries (unsweetened)",
        qtyLabel: `${this.berriesG} g`,
        value: this.berriesG,
        change: (v) => { this.berriesG = Number(v); this.updateIngredientValues(); },
        values: {
          kcal: round(this.berriesG * NUTRIENTS.berries_per_g.kcal),
          protein: round(this.berriesG * NUTRIENTS.berries_per_g.protein),
          carbs: round(this.berriesG * NUTRIENTS.berries_per_g.carbs),
          fat: round(this.berriesG * NUTRIENTS.berries_per_g.fat),
        },
        inputProps: { min: 0, max: 100, step: 1 },
      },
      {
        id: "pb",
        name: "Peanut butter",
        qtyLabel: `${this.pbG} g`,
        value: this.pbG,
        change: (v) => { this.pbG = Number(v); this.updateIngredientValues(); },
        values: {
          kcal: round(this.pbG * NUTRIENTS.pb_per_g.kcal),
          protein: round(this.pbG * NUTRIENTS.pb_per_g.protein),
          carbs: round(this.pbG * NUTRIENTS.pb_per_g.carbs),
          fat: round(this.pbG * NUTRIENTS.pb_per_g.fat),
        },
        inputProps: { min: 0, max: 60, step: 1 },
      },
      {
        id: "whey",
        name: "Whey protein (scoops)",
        qtyLabel: `${this.wheyScoops} scoop(s)`,
        value: this.wheyScoops,
        change: (v) => { this.wheyScoops = Number(v); this.updateIngredientValues(); },
        values: {
          kcal: round(this.wheyScoops * NUTRIENTS.whey_per_scoop.kcal),
          protein: round(this.wheyScoops * NUTRIENTS.whey_per_scoop.protein),
          carbs: round(this.wheyScoops * NUTRIENTS.whey_per_scoop.carbs),
          fat: round(this.wheyScoops * NUTRIENTS.whey_per_scoop.fat),
        },
        inputProps: { min: 0, max: 3, step: 0.5 },
      },
    ];
  }

  getMoreIngredientRows() {
    return [
      {
        id: "ice",
        name: "Ice cream (vanilla)",
        qtyLabel: `${this.iceG} g`,
        value: this.iceG,
        change: (v) => { this.iceG = Number(v); this.updateIngredientValues(); },
        values: {
          kcal: round(this.iceG * NUTRIENTS.icecream_per_g.kcal),
          protein: round(this.iceG * NUTRIENTS.icecream_per_g.protein),
          carbs: round(this.iceG * NUTRIENTS.icecream_per_g.carbs),
          fat: round(this.iceG * NUTRIENTS.icecream_per_g.fat),
        },
        inputProps: { min: 0, max: 60, step: 1 },
      },
      {
        id: "normal_milk",
        name: "Normal milk (whole)",
        qtyLabel: `${this.normalMilkMl} ml`,
        value: this.normalMilkMl,
        change: (v) => { this.normalMilkMl = Number(v); this.updateIngredientValues(); },
        values: {
          kcal: round(this.normalMilkMl * NUTRIENTS.normal_milk_per_ml.kcal),
          protein: round(this.normalMilkMl * NUTRIENTS.normal_milk_per_ml.protein),
          carbs: round(this.normalMilkMl * NUTRIENTS.normal_milk_per_ml.carbs),
          fat: round(this.normalMilkMl * NUTRIENTS.normal_milk_per_ml.fat),
        },
        inputProps: { min: 0, max: 1000, step: 10 },
      },
      {
        id: "oats",
        name: "Oats",
        qtyLabel: `${this.oatsG} g`,
        value: this.oatsG,
        change: (v) => { this.oatsG = Number(v); this.updateIngredientValues(); },
        values: {
          kcal: round(this.oatsG * NUTRIENTS.oats_per_g.kcal),
          protein: round(this.oatsG * NUTRIENTS.oats_per_g.protein),
          carbs: round(this.oatsG * NUTRIENTS.oats_per_g.carbs),
          fat: round(this.oatsG * NUTRIENTS.oats_per_g.fat),
        },
        inputProps: { min: 0, max: 200, step: 5 },
      },
    ];
  }

  toggleMoreItems() {
    this.showMoreItems = !this.showMoreItems;
    this.updateUI();
  }

  quickSet(mode) {
    if (mode === "snack") {
      this.milkMl = 150;
      this.bananaFruits = 0.5;
      this.kiwiFruits = 0.5;
      this.berriesG = 10;
      this.pbG = 0;
      this.iceG = 0;
      this.wheyScoops = 0.5;
    } else if (mode === "breakfast") {
      this.milkMl = 250;
      this.bananaFruits = 1;
      this.kiwiFruits = 1;
      this.berriesG = 20;
      this.pbG = 16;
      this.iceG = 0;
      this.wheyScoops = 1;
    } else if (mode === "meal") {
      this.milkMl = 300;
      this.bananaFruits = 1.5;
      this.kiwiFruits = 1;
      this.berriesG = 30;
      this.pbG = 32;
      this.iceG = 0;
      this.wheyScoops = 1.5;
    }
    this.updateUI();
  }

  copyTotals() {
    const totals = this.calculateTotals();
    const text = `Totals - ${totals.kcal} kcal | ${totals.protein} g protein | ${totals.carbs} g carbs | ${totals.fat} g fat`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert("Totals copied to clipboard:\n" + text);
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Totals copied to clipboard:\n" + text);
    }
  }

  render() {
    const totals = this.calculateTotals();
    const ingredientRows = this.getIngredientRows();
    const moreIngredientRows = this.getMoreIngredientRows();

    const html = `
       <div class="max-w-6xl mx-auto p-6">
        <h1 class="text-2xl font-semibold mb-4">Shake Mixer — interactive nutrition builder</h1>
        <p class="mb-4 text-sm text-slate-600">Adjust amounts below (grams / ml / scoops) and the totals update instantly. Set ingredients to 0 to remove them.</p>

        <div class="flex gap-3 mb-4">
          <button id="snack-btn" class="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200">Snack</button>
          <button id="breakfast-btn" class="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200">Breakfast</button>
          <button id="meal-btn" class="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200">Meal replacement</button>
          <button id="copy-btn" class="px-3 py-1 rounded bg-emerald-100 hover:bg-emerald-200 ml-auto">Copy totals</button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded shadow lg:col-span-2">
            <h2 class="font-medium mb-3">Ingredients</h2>

             ${ingredientRows.map((row) => `
               <div class="flex items-center gap-2 mb-3">
                 <div class="w-32 flex-shrink-0">
                   <div class="text-sm font-medium">${row.name}</div>
                 </div>

                 <div class="flex items-center gap-1.5 w-48 flex-shrink-0">
                  <input
                    type="range"
                    id="${row.id}-slider"
                    min="${row.inputProps.min}"
                    max="${row.inputProps.max}"
                    step="${row.inputProps.step}"
                    value="${row.value}"
                    class="flex-1"
                  />
                  <input
                    type="number"
                    id="${row.id}-input"
                    min="${row.inputProps.min}"
                    max="${row.inputProps.max}"
                    step="${row.inputProps.step}"
                    value="${row.value}"
                    class="w-14 px-1.5 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span class="text-xs text-slate-500 w-10">${row.id === 'milk' ? 'ml' : row.id === 'banana' || row.id === 'kiwi' ? 'fruits' : row.id === 'whey' ? 'scoops' : 'g'}</span>
                </div>

                <div class="w-28 text-sm ml-auto mr-4" id="${row.id}-nutrition">
                  <div class="flex justify-between">
                    <div id="${row.id}-kcal">${row.values.kcal} kcal</div>
                    <div id="${row.id}-protein">${row.values.protein} g P</div>
                  </div>
                  <div class="flex justify-between text-xs text-slate-500">
                    <div id="${row.id}-carbs">${row.values.carbs} C</div>
                    <div id="${row.id}-fat">${row.values.fat} F</div>
                  </div>
                </div>
              </div>
            `).join('')}

            <div class="mt-4 pt-4 border-t border-gray-200">
              <button id="more-items-btn" class="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800">
                <span class="text-lg">${this.showMoreItems ? '−' : '+'}</span>
                <span>More Items</span>
              </button>
              
              <div id="more-items-section" class="${this.showMoreItems ? 'block' : 'hidden'} mt-3">
                 ${moreIngredientRows.map((row) => `
                   <div class="flex items-center gap-2 mb-3">
                     <div class="w-36 flex-shrink-0">
                       <div class="text-sm font-medium">${row.name}</div>
                     </div>

                     <div class="flex items-center gap-1.5 w-48 flex-shrink-0">
                      <input
                        type="range"
                        id="${row.id}-slider"
                        min="${row.inputProps.min}"
                        max="${row.inputProps.max}"
                        step="${row.inputProps.step}"
                        value="${row.value}"
                        class="flex-1"
                      />
                      <input
                        type="number"
                        id="${row.id}-input"
                        min="${row.inputProps.min}"
                        max="${row.inputProps.max}"
                        step="${row.inputProps.step}"
                        value="${row.value}"
                        class="w-14 px-1.5 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span class="text-xs text-slate-500 w-10">${row.id === 'normal_milk' ? 'ml' : 'g'}</span>
                    </div>

                    <div class="w-28 text-sm ml-auto mr-4" id="${row.id}-nutrition">
                      <div class="flex justify-between">
                        <div id="${row.id}-kcal">${row.values.kcal} kcal</div>
                        <div id="${row.id}-protein">${row.values.protein} g P</div>
                      </div>
                      <div class="flex justify-between text-xs text-slate-500">
                        <div id="${row.id}-carbs">${row.values.carbs} C</div>
                        <div id="${row.id}-fat">${row.values.fat} F</div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>

          <div class="bg-white p-4 rounded shadow">
            <h2 class="font-medium mb-3">Totals</h2>

            <div class="text-3xl font-bold mb-2">${totals.kcal} kcal</div>
            <div class="grid grid-cols-3 gap-2 text-sm mb-4">
              <div class="bg-slate-50 p-2 rounded text-center">${totals.protein} g Protein</div>
              <div class="bg-slate-50 p-2 rounded text-center">${totals.carbs} g Carbs</div>
              <div class="bg-slate-50 p-2 rounded text-center">${totals.fat} g Fat</div>
            </div>

            <h3 class="font-medium mb-2">Per-ingredient detail</h3>
            <div class="text-xs text-slate-600 mb-2">(Hover on numbers for suggestion actions)</div>

            <div class="space-y-2">
              ${ingredientRows.map((r) => `
                <div class="flex justify-between items-center">
                  <div class="text-sm">${r.name}</div>
                  <div class="text-xs text-slate-700">${r.values.kcal} kcal — ${r.values.protein} g P</div>
                </div>
              `).join('')}
            </div>

            <div class="mt-4 border-t pt-4 text-sm text-slate-600">
              <div class="mb-2"><strong>Tips</strong></div>
              <ul class="list-disc pl-5">
                <li>Remove peanut butter (set to 0 g) to drop ~95 kcal and ~8 g fat (per tbsp).</li>
                <li>Swap milk to lower volume to drop ~0.48 kcal per ml — every 50 ml ≈ 24 kcal.</li>
                <li>Add 1 scoop whey to add ~25 g protein (~120 kcal).</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="mt-6 text-sm text-slate-500">Built for quick experimentation. Edit amounts, copy totals, or use quick presets.</div>
      </div>
    `;

    document.getElementById('app').innerHTML = html;
  }

  updateUI() {
    // When toggling more items, we need to re-render the entire HTML
    // to properly show/hide the collapsible section
    this.render();
    this.bindEvents();
  }

  updateIngredientValues() {
    // Update only the dynamic content without recreating the entire HTML
    this.updateDynamicContent();
  }

  updateDynamicContent() {
    const totals = this.calculateTotals();
    const ingredientRows = this.getIngredientRows();
    const moreIngredientRows = this.getMoreIngredientRows();

    // Update totals
    const totalsKcal = document.querySelector('.text-3xl.font-bold');
    if (totalsKcal) totalsKcal.textContent = `${totals.kcal} kcal`;

    const proteinEl = document.querySelector('.bg-slate-50.p-2.rounded.text-center');
    if (proteinEl) proteinEl.textContent = `${totals.protein} g Protein`;

    const carbsEl = proteinEl?.nextElementSibling;
    if (carbsEl) carbsEl.textContent = `${totals.carbs} g Carbs`;

    const fatEl = carbsEl?.nextElementSibling;
    if (fatEl) fatEl.textContent = `${totals.fat} g Fat`;

    // Update ingredient rows
    ingredientRows.forEach(row => {
      const slider = document.getElementById(`${row.id}-slider`);
      const input = document.getElementById(`${row.id}-input`);
      
      if (slider) {
        slider.value = row.value;
      }
      if (input) {
        input.value = row.value;
      }

      // Update nutrition values using IDs
      const kcalEl = document.getElementById(`${row.id}-kcal`);
      const proteinEl = document.getElementById(`${row.id}-protein`);
      const carbsEl = document.getElementById(`${row.id}-carbs`);
      const fatEl = document.getElementById(`${row.id}-fat`);

      if (kcalEl) kcalEl.textContent = `${row.values.kcal} kcal`;
      if (proteinEl) proteinEl.textContent = `${row.values.protein} g P`;
      if (carbsEl) carbsEl.textContent = `${row.values.carbs} C`;
      if (fatEl) fatEl.textContent = `${row.values.fat} F`;
    });

    // Update more ingredient rows
    moreIngredientRows.forEach(row => {
      const slider = document.getElementById(`${row.id}-slider`);
      const input = document.getElementById(`${row.id}-input`);
      
      if (slider) {
        slider.value = row.value;
      }
      if (input) {
        input.value = row.value;
      }

      // Update nutrition values using IDs
      const kcalEl = document.getElementById(`${row.id}-kcal`);
      const proteinEl = document.getElementById(`${row.id}-protein`);
      const carbsEl = document.getElementById(`${row.id}-carbs`);
      const fatEl = document.getElementById(`${row.id}-fat`);

      if (kcalEl) kcalEl.textContent = `${row.values.kcal} kcal`;
      if (proteinEl) proteinEl.textContent = `${row.values.protein} g P`;
      if (carbsEl) carbsEl.textContent = `${row.values.carbs} C`;
      if (fatEl) fatEl.textContent = `${row.values.fat} F`;
    });

    // Update per-ingredient detail section
    const detailSection = document.querySelector('.space-y-2');
    if (detailSection) {
      detailSection.innerHTML = ingredientRows.map((r) => `
        <div class="flex justify-between items-center">
          <div class="text-sm">${r.name}</div>
          <div class="text-xs text-slate-700">${r.values.kcal} kcal — ${r.values.protein} g P</div>
        </div>
      `).join('');
    }
  }

  bindEvents() {
    // Quick set buttons
    document.getElementById('snack-btn').addEventListener('click', () => this.quickSet('snack'));
    document.getElementById('breakfast-btn').addEventListener('click', () => this.quickSet('breakfast'));
    document.getElementById('meal-btn').addEventListener('click', () => this.quickSet('meal'));
    document.getElementById('copy-btn').addEventListener('click', () => this.copyTotals());

    // More items toggle button
    const moreItemsBtn = document.getElementById('more-items-btn');
    if (moreItemsBtn) {
      moreItemsBtn.addEventListener('click', () => this.toggleMoreItems());
    }

    // Slider and input events for main ingredients
    const ingredientRows = this.getIngredientRows();
    ingredientRows.forEach(row => {
      const slider = document.getElementById(`${row.id}-slider`);
      const input = document.getElementById(`${row.id}-input`);
      
      if (slider) {
        slider.addEventListener('input', (e) => row.change(e.target.value));
      }
      
      if (input) {
        input.addEventListener('input', (e) => {
          const value = parseFloat(e.target.value);
          if (!isNaN(value) && value >= row.inputProps.min && value <= row.inputProps.max) {
            row.change(value);
          }
        });
        
        // Also handle when user finishes typing (on blur)
        input.addEventListener('blur', (e) => {
          const value = parseFloat(e.target.value);
          if (isNaN(value) || value < row.inputProps.min) {
            e.target.value = row.inputProps.min;
            row.change(row.inputProps.min);
          } else if (value > row.inputProps.max) {
            e.target.value = row.inputProps.max;
            row.change(row.inputProps.max);
          }
        });
      }
    });

    // Slider and input events for more ingredients
    const moreIngredientRows = this.getMoreIngredientRows();
    moreIngredientRows.forEach(row => {
      const slider = document.getElementById(`${row.id}-slider`);
      const input = document.getElementById(`${row.id}-input`);
      
      if (slider) {
        slider.addEventListener('input', (e) => row.change(e.target.value));
      }
      
      if (input) {
        input.addEventListener('input', (e) => {
          const value = parseFloat(e.target.value);
          if (!isNaN(value) && value >= row.inputProps.min && value <= row.inputProps.max) {
            row.change(value);
          }
        });
        
        // Also handle when user finishes typing (on blur)
        input.addEventListener('blur', (e) => {
          const value = parseFloat(e.target.value);
          if (isNaN(value) || value < row.inputProps.min) {
            e.target.value = row.inputProps.min;
            row.change(row.inputProps.min);
          } else if (value > row.inputProps.max) {
            e.target.value = row.inputProps.max;
            row.change(row.inputProps.max);
          }
        });
      }
    });
  }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new ShakeMixer();
});
