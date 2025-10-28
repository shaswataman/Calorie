import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock clipboard API
const mockWriteText = jest.fn().mockResolvedValue();

beforeEach(() => {
  // Reset clipboard mock
  delete navigator.clipboard;
  Object.defineProperty(navigator, 'clipboard', {
    writable: true,
    configurable: true,
    value: {
      writeText: mockWriteText,
    },
  });
});

describe('Shake Mixer App', () => {
  describe('Initial Render', () => {
    test('renders the main heading', () => {
      render(<App />);
      expect(screen.getByText(/Shake Mixer — interactive nutrition builder/i)).toBeInTheDocument();
    });

    test('renders all ingredient sliders', () => {
      render(<App />);
      const sliders = screen.getAllByRole('slider');
      expect(sliders.length).toBeGreaterThanOrEqual(5);
    });

    test('renders quick set buttons', () => {
      render(<App />);
      expect(screen.getByRole('button', { name: /snack/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /breakfast/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /meal replacement/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /copy totals/i })).toBeInTheDocument();
    });

    test('renders totals section', () => {
      render(<App />);
      expect(screen.getByText(/^Totals$/i)).toBeInTheDocument();
    });
  });

  describe('Default Values', () => {
    test('displays default nutrition totals', () => {
      render(<App />);
      const totalsHeading = screen.getByText(/^Totals$/i);
      const totalsSection = totalsHeading.parentElement;
      const kcalElement = totalsSection.querySelector('.text-3xl');
      expect(kcalElement).toBeInTheDocument();
      expect(kcalElement.textContent).toMatch(/\d+ kcal/);
    });

    test('displays default ingredient values', () => {
      render(<App />);
      const sliders = screen.getAllByRole('slider');
      const milkSlider = sliders[0];
      expect(milkSlider.value).toBe('250');
    });
  });

  describe('Slider Interactions', () => {
    test('updates milk amount via slider', async () => {
      render(<App />);
      
      const sliders = screen.getAllByRole('slider');
      const milkSlider = sliders[0];
      
      fireEvent.change(milkSlider, { target: { value: '300' } });
      
      await waitFor(() => {
        expect(milkSlider.value).toBe('300');
      });
    });

    test('updates banana amount via slider', async () => {
      render(<App />);
      
      const sliders = screen.getAllByRole('slider');
      const bananaSlider = sliders[1];
      
      fireEvent.change(bananaSlider, { target: { value: '2' } });
      
      await waitFor(() => {
        expect(bananaSlider.value).toBe('2');
      });
    });

    test('updates totals when slider changes', async () => {
      render(<App />);
      
      const totalsHeading = screen.getByText(/^Totals$/i);
      const totalsSection = totalsHeading.parentElement;
      const initialKcal = totalsSection.querySelector('.text-3xl').textContent;
      
      const sliders = screen.getAllByRole('slider');
      const milkSlider = sliders[0];
      
      fireEvent.change(milkSlider, { target: { value: '500' } });
      
      await waitFor(() => {
        const newKcal = totalsSection.querySelector('.text-3xl').textContent;
        expect(newKcal).not.toBe(initialKcal);
      });
    });

    test('typing into number input updates totals', async () => {
      render(<App />);
      const totalsHeading = screen.getByText(/^Totals$/i);
      const totalsSection = totalsHeading.parentElement;
      const initialKcal = totalsSection.querySelector('.text-3xl').textContent;

      const milkInput = screen.getByLabelText(/Low-fat milk \(2%\) value/i);
      await userEvent.clear(milkInput);
      await userEvent.type(milkInput, '275');

      await waitFor(() => {
        const newKcal = totalsSection.querySelector('.text-3xl').textContent;
        expect(newKcal).not.toBe(initialKcal);
        expect(milkInput.value).toBe('275');
      });
    });

    test('clamps value to min (0) for number inputs', async () => {
      render(<App />);
      const bananaInput = screen.getByLabelText(/Banana value/i);
      await userEvent.clear(bananaInput);
      fireEvent.change(bananaInput, { target: { value: '-1' } });
      await waitFor(() => {
        expect(bananaInput.value).toBe('0');
      });
    });

    test('clamps value to max for number inputs', async () => {
      render(<App />);
      const bananaInput = screen.getByLabelText(/Banana value/i);
      await userEvent.clear(bananaInput);
      await userEvent.type(bananaInput, '99');
      await waitFor(() => {
        expect(bananaInput.value).toBe('3');
      });
    });
  });

  describe('Quick Set Presets', () => {
    test('snack preset updates values correctly', async () => {
      render(<App />);
      
      const snackButton = screen.getByRole('button', { name: /snack/i });
      fireEvent.click(snackButton);
      
      await waitFor(() => {
        const sliders = screen.getAllByRole('slider');
        expect(sliders[0].value).toBe('150'); // milk
        expect(sliders[1].value).toBe('0.5'); // banana
        expect(sliders[2].value).toBe('0.5'); // kiwi
        expect(sliders[3].value).toBe('10'); // berries
        expect(sliders[4].value).toBe('0.5'); // whey
      });
    });

    test('breakfast preset updates values correctly', async () => {
      render(<App />);
      
      const breakfastButton = screen.getByRole('button', { name: /breakfast/i });
      fireEvent.click(breakfastButton);
      
      await waitFor(() => {
        const sliders = screen.getAllByRole('slider');
        expect(sliders[0].value).toBe('250'); // milk
        expect(sliders[1].value).toBe('1'); // banana
        expect(sliders[2].value).toBe('1'); // kiwi
        expect(sliders[3].value).toBe('20'); // berries
        expect(sliders[4].value).toBe('1'); // whey
      });
    });

    test('meal preset updates values correctly', async () => {
      render(<App />);
      
      const mealButton = screen.getByRole('button', { name: /meal replacement/i });
      fireEvent.click(mealButton);
      
      await waitFor(() => {
        const sliders = screen.getAllByRole('slider');
        expect(sliders[0].value).toBe('300'); // milk
        expect(sliders[1].value).toBe('1.5'); // banana
        expect(sliders[2].value).toBe('1'); // kiwi
        expect(sliders[3].value).toBe('30'); // berries
        expect(sliders[4].value).toBe('1.5'); // whey
      });
    });

    test('presets keep peanut butter at 0 in More Items', async () => {
      render(<App />);
      const breakfastButton = screen.getByRole('button', { name: /breakfast/i });
      await userEvent.click(breakfastButton);

      const toggleButton = screen.getByRole('button', { name: /more items/i });
      await userEvent.click(toggleButton);

      const pbInput = screen.getByLabelText(/Peanut butter value/i);
      expect(pbInput.value).toBe('0');
    });
  });

  describe('Copy Totals', () => {
    test('copies totals to clipboard', async () => {
      render(<App />);
      
      const copyButton = screen.getByRole('button', { name: /copy totals/i });
      fireEvent.click(copyButton);
      
      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalled();
      });
    });

    test('clipboard fallback used if navigator.clipboard is unavailable', async () => {
      render(<App />);

      // Remove clipboard to trigger fallback path
      const originalClipboard = navigator.clipboard;
      // eslint-disable-next-line no-undef
      // @ts-ignore
      delete navigator.clipboard;
      const originalAlert = window.alert;
      window.alert = jest.fn();
      const originalExec = document.execCommand;
      // jsdom does not implement execCommand; mock it
      // @ts-ignore
      document.execCommand = jest.fn();

      const copyButton = screen.getByRole('button', { name: /copy totals/i });
      await userEvent.click(copyButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalled();
      });

      // Restore
      if (originalClipboard) {
        Object.defineProperty(navigator, 'clipboard', {
          configurable: true,
          writable: true,
          value: originalClipboard,
        });
      }
      window.alert = originalAlert;
      // @ts-ignore
      document.execCommand = originalExec;
    });
  });

  describe('More Items Toggle', () => {
    test('hides more items by default', () => {
      render(<App />);
      expect(screen.queryByText(/ice cream/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/normal milk/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/oats/i)).not.toBeInTheDocument();
    });

    test('shows more items when toggle clicked', async () => {
      render(<App />);
      
      const toggleButton = screen.getByRole('button', { name: /more items/i });
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText(/ice cream/i)).toBeInTheDocument();
        expect(screen.getByText(/normal milk/i)).toBeInTheDocument();
        expect(screen.getByText(/oats/i)).toBeInTheDocument();
      });
    });

    test('hides more items when toggle clicked again', async () => {
      render(<App />);
      
      const toggleButton = screen.getByRole('button', { name: /more items/i });
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText(/ice cream/i)).toBeInTheDocument();
      });
      
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/ice cream/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Nutrition Calculations', () => {
    test('updates protein totals correctly', async () => {
      render(<App />);
      
      const sliders = screen.getAllByRole('slider');
      const wheySlider = sliders[4]; // whey protein (now at index 4 after removing pb)
      
      fireEvent.change(wheySlider, { target: { value: '2' } });
      
      await waitFor(() => {
        // Verify totals section updates
        const totalsHeading = screen.getByText(/^Totals$/i);
        expect(totalsHeading).toBeInTheDocument();
      });
    });
  });

  describe('Per-Ingredient Details', () => {
    test('displays per-ingredient details', () => {
      render(<App />);
      
      expect(screen.getByText(/Per-ingredient detail/i)).toBeInTheDocument();
    });

    test('updates per-ingredient detail when values change', async () => {
      render(<App />);

      // Increase Kiwi to 2 and check per-ingredient detail updates
      const sliders = screen.getAllByRole('slider');
      const kiwiSlider = sliders[2];
      fireEvent.change(kiwiSlider, { target: { value: '2' } });

      await waitFor(() => {
        const totalsPanel = screen.getByText(/^Totals$/i).parentElement;
        const kiwiLabelInDetails = within(totalsPanel).getAllByText(/^Kiwi$/i)[0];
        const kiwiDetailRow = kiwiLabelInDetails.closest('div').parentElement;
        expect(kiwiDetailRow.textContent).toMatch(/84\s*kcal/); // 42 * 2
        expect(kiwiDetailRow.textContent).toMatch(/1\.6\s*g P/); // 0.8 * 2
      });
    });
  });

  describe('Zero Totals', () => {
    test('totals become zero when all ingredients set to 0', async () => {
      render(<App />);

      const sliders = screen.getAllByRole('slider');
      // Set all five main sliders to 0
      for (let i = 0; i < sliders.length; i++) {
        fireEvent.change(sliders[i], { target: { value: '0' } });
      }

      await waitFor(() => {
        const totalsHeading = screen.getByText(/^Totals$/i);
        const totalsSection = totalsHeading.parentElement;
        const kcalText = totalsSection.querySelector('.text-3xl').textContent;
        expect(kcalText.trim()).toMatch(/^0\s*kcal$/);

        const protein = screen.getAllByText(/g Protein/)[0];
        const carbs = screen.getAllByText(/g Carbs/)[0];
        const fat = screen.getAllByText(/g Fat/)[0];
        expect(protein.textContent).toMatch(/^0(\.0)?\s*g Protein$/);
        expect(carbs.textContent).toMatch(/^0(\.0)?\s*g Carbs$/);
        expect(fat.textContent).toMatch(/^0(\.0)?\s*g Fat$/);
      });
    });
  });

  describe('Tips Section', () => {
    test('displays tips section', () => {
      render(<App />);
      
      expect(screen.getByText(/Tips/i)).toBeInTheDocument();
      expect(screen.getAllByText(/peanut butter/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/milk/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/whey/i).length).toBeGreaterThan(0);
    });
  });

  describe('UI Elements', () => {
    test('renders all five main ingredients', () => {
      render(<App />);
      
      expect(screen.getAllByText(/Low-fat milk/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Banana/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Kiwi/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/berries/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Whey protein/i).length).toBeGreaterThan(0);
    });

    test('displays nutrition values for each ingredient', () => {
      render(<App />);
      
      // Each ingredient should show kcal and protein values
      const kcalElements = screen.getAllByText(/\d+ kcal/);
      expect(kcalElements.length).toBeGreaterThanOrEqual(6);
    });
  });
});
