import {describe, it, expect} from 'vitest';
import {run} from './run';
import Decimal from 'decimal.js';

describe('discounts allocator function', () => {
  it('returns no discounts without configuration', () => {
    const result = run({
      shop: {
        metafield: null
      }
    });
    const expected = {
      displayableErrors: [],
      lineDiscounts: [],
    };

    expect(result).toEqual(expected);
  });
});