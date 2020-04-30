import { getIncludedProficiencies } from 'utils/character';

// Mock 5e-tools
jest.mock('vendor/5e-tools/renderer', () => ({
  Renderer: jest.fn().mockImplementation(() => ({
    race: {
      mergeSubraces: jest.fn(() => []),
    },
    item: {
      _addProperty: jest.fn(),
      _addType: jest.fn(),
      _addAdditionalEntries: jest.fn(),
    },
  })),
  SourceUtil: {
    isCoreOrSupplement: jest.fn(),
    isNonstandardSource: jest.fn(),
  },
}));

describe('character utils', () => {
  it('gets the default proficiencies', () => {
    const languageProficiencies = [
      {
        common: true,
        other: true,
        primordial: true,
      },
    ];

    const skillProficiencies = [
      {
        stealth: true,
      },
    ];

    const chooseProficiencies = [
      {
        choose: {
          from: [
            'athletics',
            'acrobatics',
            'sleight of hand',
            'stealth',
            'arcana',
            'history',
            'investigation',
            'nature',
            'religion',
            'animal handling',
            'insight',
            'medicine',
            'perception',
            'survival',
            'deception',
            'intimidation',
            'performance',
            'persuasion',
            {
              tool: true,
            },
          ],
          count: 4,
        },
      },
    ];

    expect(getIncludedProficiencies(languageProficiencies)).toStrictEqual([
      'common',
      'other',
      'primordial',
    ]);
    expect(getIncludedProficiencies(skillProficiencies)).toStrictEqual([
      'stealth',
    ]);
    expect(getIncludedProficiencies(chooseProficiencies)).toStrictEqual([]);
  });
});
