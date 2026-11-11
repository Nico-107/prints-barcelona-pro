import { describe, it, expect } from 'vitest';
import { engineCents } from '../../../scripts/price-examples';
import { PAGES_ES as landingPagesEs } from '../../seo/landingPagesEs';

// Published example prices must equal the real V3 engine output.
describe('published price examples match the V3 engine', () => {
  const page = (landingPagesEs as any[]).find(p => p.slug === '/precio-impresion-3d');
  const text = JSON.stringify(page);
  const cases: Array<[string, number, number, string]> = [
    ['PLA', 5, 0.5, '10,00€'], ['PLA', 25, 1.5, '10,00€'], ['PLA', 40, 2, '12,10€'], ['PLA', 90, 5, '27,50€'],
    ['PETG', 35, 1.5, '10,29€'], ['PETG', 150, 7, '42,35€'], ['PLA', 350, 16, '75,35€'],
  ];
  for (const [m, g, h, shown] of cases) {
    it(`${g} g ${m} ${h} h → ${shown}`, () => {
      expect((engineCents(m, g, h) / 100).toFixed(2).replace('.', ',') + '€').toBe(shown);
      expect(text).toContain(shown);
    });
  }
  it('never shows the PLA per-gram rate without machine time', () => {
    expect(text).not.toMatch(/0,055 €\/g"(?! \+)/);
    expect(text).toContain('0,055 €/g + 4,95 €/h');
  });
});
