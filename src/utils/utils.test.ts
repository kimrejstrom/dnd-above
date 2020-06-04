import { getIncludedProficiencies, extractSpellSlots } from 'utils/character';
import { ClassTableGroup, Title } from 'models/class';

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
  it('gets the correct spell slots', () => {
    const classTableGroups: ClassTableGroup[] = [
      {
        colLabels: ['{@filter Cantrips Known|spells|level=0|class=Druid}'],
        rows: [
          [2],
          [2],
          [2],
          [3],
          [3],
          [3],
          [3],
          [3],
          [3],
          [4],
          [4],
          [4],
          [4],
          [4],
          [4],
          [4],
          [4],
          [4],
          [4],
          [4],
        ],
      },
      {
        title: Title.SpellSlotsPerSpellLevel,
        colLabels: [
          '{@filter 1st|spells|level=1|class=Druid}',
          '{@filter 2nd|spells|level=2|class=Druid}',
          '{@filter 3rd|spells|level=3|class=Druid}',
          '{@filter 4th|spells|level=4|class=Druid}',
          '{@filter 5th|spells|level=5|class=Druid}',
          '{@filter 6th|spells|level=6|class=Druid}',
          '{@filter 7th|spells|level=7|class=Druid}',
          '{@filter 8th|spells|level=8|class=Druid}',
          '{@filter 9th|spells|level=9|class=Druid}',
        ],
        rows: [
          [2, 0, 0, 0, 0, 0, 0, 0, 0],
          [3, 0, 0, 0, 0, 0, 0, 0, 0],
          [4, 2, 0, 0, 0, 0, 0, 0, 0],
          [4, 3, 0, 0, 0, 0, 0, 0, 0],
          [4, 3, 2, 0, 0, 0, 0, 0, 0],
          [4, 3, 3, 0, 0, 0, 0, 0, 0],
          [4, 3, 3, 1, 0, 0, 0, 0, 0],
          [4, 3, 3, 2, 0, 0, 0, 0, 0],
          [4, 3, 3, 3, 1, 0, 0, 0, 0],
          [4, 3, 3, 3, 2, 0, 0, 0, 0],
          [4, 3, 3, 3, 2, 1, 0, 0, 0],
          [4, 3, 3, 3, 2, 1, 0, 0, 0],
          [4, 3, 3, 3, 2, 1, 1, 0, 0],
          [4, 3, 3, 3, 2, 1, 1, 0, 0],
          [4, 3, 3, 3, 2, 1, 1, 1, 0],
          [4, 3, 3, 3, 2, 1, 1, 1, 0],
          [4, 3, 3, 3, 2, 1, 1, 1, 1],
          [4, 3, 3, 3, 3, 1, 1, 1, 1],
          [4, 3, 3, 3, 3, 2, 1, 1, 1],
          [4, 3, 3, 3, 3, 2, 2, 1, 1],
        ],
      },
    ];
    expect(extractSpellSlots(classTableGroups, 4)).toEqual({
      '1': 4,
      '2': 3,
      '3': 0,
      '4': 0,
      '5': 0,
      '6': 0,
      '7': 0,
      '8': 0,
      '9': 0,
    });
  });
  it('gets no spell slots if non-caster', () => {
    const classTableGroups: ClassTableGroup[] = [
      {
        colLabels: ['{@filter Cantrips Known|spells|level=0|class=Druid}'],
        rows: [
          [2],
          [2],
          [2],
          [3],
          [3],
          [3],
          [3],
          [3],
          [3],
          [4],
          [4],
          [4],
          [4],
          [4],
          [4],
          [4],
          [4],
          [4],
          [4],
          [4],
        ],
      },
    ];
    expect(extractSpellSlots(classTableGroups, 4)).toEqual(undefined);
  });
});
