# Shake Mixer - Interactive Nutrition Builder

A React-based application for calculating nutrition totals for custom shake recipes.

## Features

- Adjust ingredient amounts with interactive sliders and number inputs
- Real-time calculation of calories, protein, carbs, and fat
- Quick preset configurations (Snack, Breakfast, Meal replacement)
- Copy nutrition totals to clipboard
- Expandable ingredient list with more options
- Beautiful, responsive UI with Tailwind CSS

## Tech Stack

- **React 18** - Frontend framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

### Run Tests

```bash
npm test
```

Or run tests in watch mode:

```bash
npm run test:watch
```

## Testing

The project includes a comprehensive test suite using Jest and React Testing Library. The tests cover:

- Initial render and component structure
- Default values and state
- Slider and input interactions
- Quick set presets (Snack, Breakfast, Meal)
- Copy to clipboard functionality
- More items toggle
- Nutrition calculations
- Per-ingredient details
- Tips section

All tests are located in `src/App.test.js`.
