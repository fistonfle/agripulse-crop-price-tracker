const { filterPrices } = require('./data');

describe('filterPrices crop search', () => {
  test('returns an empty list when the crop does not exist', () => {
    expect(filterPrices(undefined, 'Dragonfruit')).toEqual([]);
  });

  test('ignores whitespace around the crop search', () => {
    expect(filterPrices(undefined, '  beans  ')).toHaveLength(2);
  });
});
