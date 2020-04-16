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

    // const chooseProficiencies = [
    //   {
    //     choose: {
    //       from: [
    //         'athletics',
    //         'acrobatics',
    //         'sleight of hand',
    //         'stealth',
    //         'arcana',
    //         'history',
    //         'investigation',
    //         'nature',
    //         'religion',
    //         'animal handling',
    //         'insight',
    //         'medicine',
    //         'perception',
    //         'survival',
    //         'deception',
    //         'intimidation',
    //         'performance',
    //         'persuasion',
    //         {
    //           tool: true,
    //         },
    //       ],
    //       count: 4,
    //     },
    //   },
    // ];

    expect(getIncludedProficiencies(languageProficiencies)).toStrictEqual([
      'common',
      'other',
      'primordial',
    ]);
    expect(getIncludedProficiencies(skillProficiencies)).toStrictEqual([
      'stealth',
    ]);
    // expect(getIncludedProficiencies(chooseProficiencies)).toStrictEqual([]);
  });
});
