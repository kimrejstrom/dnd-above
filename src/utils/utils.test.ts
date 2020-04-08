import { getIncludedProficiencies } from 'utils/character';

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
    expect(getIncludedProficiencies(languageProficiencies)).toStrictEqual([
      'common',
      'other',
      'primordial',
    ]);
    expect(getIncludedProficiencies(skillProficiencies)).toStrictEqual([
      'stealth',
    ]);
  });
});
