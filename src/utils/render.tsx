import DangerousHtml from 'components/DangerousHtml/DangerousHtml';
import _ from 'lodash';
import { BackgroundElement } from 'models/background';
import { BackgroundFluffElement } from 'models/background-fluff';
import { Monster } from 'models/bestiary';
import { MonsterFluff } from 'models/bestiary-fluff';
import { ClassElement, ClassSubclass } from 'models/class';
import { LanguageElement } from 'models/language';
import { Optionalfeature } from 'models/optional-feature';
import { Race } from 'models/race';
import { RaceFluffElement } from 'models/race-fluff';
import Entry from 'components/Entry/Entry';
import ClassBase from 'pages/Create/ClassBase';
import ClassTable from 'pages/Create/ClassTable';
import React from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { filterSources } from 'utils/data';
import { mainRenderer, Parser } from 'utils/mainRenderer';
import {
  getClassFeatures,
  getSubClassFeatures,
  getFeat,
} from 'utils/sourceDataUtils';

export const addDefaultImageSrc = (ev: any, name: string) => {
  const fallback = name.includes('custom') ? 'default' : name.split(' ')[0];
  ev.target.src = `${process.env.PUBLIC_URL}/img/races/${fallback}.png`;
};

export const renderClassFeatures = (className: string) => {
  return getClassFeatures(className)
    .filter(i => filterSources(i))
    .map((feature, index) => (
      <div
        key={`${feature.name}-${index}`}
        className="dnd-body text-sm p-1 my-1"
      >
        <div className="rd__h rd__h--1">{`Level ${feature.level} – ${feature.name}:`}</div>
        {feature.entries.map((entry, index) => {
          return <Entry extraClassName="tight" key={index} entry={entry} />;
        })}
      </div>
    ));
};

export const renderSubClassFeatures = (
  className: string,
  subClassName: string,
) => {
  return getSubClassFeatures(className, subClassName)
    .filter(i => filterSources(i))
    .map((feature, index) => (
      <div
        key={`${feature.name}-${index}`}
        className="dnd-body text-sm p-1 my-1"
      >
        <div className="rd__h rd__h--1">{`Level ${feature.level} – ${feature.name}:`}</div>
        {feature.entries.map((entry, index) => {
          return <Entry extraClassName="tight" key={index} entry={entry} />;
        })}
      </div>
    ));
};

export const renderRaceTraits = (race: Race) => {
  const raceTraits = race.entries?.filter(
    item => !_.includes(['Age', 'Size', 'Alignment', 'Languages'], item.name),
  );
  return raceTraits?.length ? (
    raceTraits?.map((trait, index) =>
      typeof trait === 'string' ? (
        <div className="dnd-body text-sm p-1 my-1">{trait}</div>
      ) : (
        <div
          key={`${trait.name}-${index}`}
          className="dnd-body text-sm p-1 my-1"
        >
          <div className="rd__h rd__h--1">{`${trait.name}:`}</div>
          {trait.entries.map((entry, index) => {
            return <Entry extraClassName="tight" key={index} entry={entry} />;
          })}
        </div>
      ),
    )
  ) : (
    <p>No racial traits</p>
  );
};

export const renderFeats = (feats: string[]) => {
  return feats?.length ? (
    feats?.map((featName, index) => {
      const feat = getFeat(featName);
      return (
        <div
          key={`${feat?.name}-${index}`}
          className="dnd-body text-sm p-1 my-1"
        >
          <div className="rd__h rd__h--1">{`${feat?.name}:`}</div>
          {feat?.entries.map((entry, index) => {
            return <Entry extraClassName="tight" key={index} entry={entry} />;
          })}
        </div>
      );
    })
  ) : (
    <p>No feats</p>
  );
};

export const isTableElement = (data: string) => {
  const tableElements = ['<td', '<tr', '<th'];
  return tableElements.includes(data.trim().slice(0, 3)) ? true : false;
};

export const RenderClass = (classElem: ClassElement) => (
  <Tabs>
    <TabList className="flex text-center">
      <Tab className="mr-2">Features</Tab>
      <Tab>Info</Tab>
    </TabList>
    <TabPanel className="overflow-y-scroll px-2">
      <Entry extraClassName="tight" entry={classElem} />
      <ClassTable cls={classElem} subcls={{} as ClassSubclass} />
      <ClassBase cls={classElem} />
      {getClassFeatures(classElem.name).map((feature, index) => (
        <div key={`${feature.name}-${index}`} className="p-1 my-1">
          <div className="rd__h rd__h--1">{`Level ${feature.level} – ${feature.name}:`}</div>
          {feature.entries.map((entry, index) => {
            return <Entry extraClassName="tight" key={index} entry={entry} />;
          })}
        </div>
      ))}
    </TabPanel>
    <TabPanel className="overflow-y-scroll px-2">
      <DangerousHtml
        extraClassName="tight"
        data={mainRenderer.render(
          {
            type: 'entries',
            entries: classElem.fluff,
          },
          1,
        )}
      />
    </TabPanel>
  </Tabs>
);

export const RenderSubClass = (
  classElem: ClassElement,
  subclass: ClassSubclass,
) => (
  <div className="tight">
    <DangerousHtml data={mainRenderer.render(subclass)} />
    <ClassTable cls={classElem} subcls={subclass} />
    {renderSubClassFeatures(classElem!.name, subclass!.name)}
  </div>
);

export const RenderBackground = (
  bg: BackgroundElement,
  bgFluff?: BackgroundFluffElement,
) => (
  <Tabs>
    <TabList className="flex text-center">
      <Tab className="mr-2">Traits</Tab>
      <Tab>Info</Tab>
    </TabList>
    <TabPanel>
      <DangerousHtml
        extraClassName="tight"
        data={mainRenderer.background.getCompactRenderedString(bg)}
      />
    </TabPanel>
    <TabPanel>
      <DangerousHtml
        extraClassName="tight"
        data={bgFluff && mainRenderer.render(bgFluff)}
      />
    </TabPanel>
  </Tabs>
);

export const RenderRace = (
  race: Race,
  raceFluff: (RaceFluffElement | undefined)[],
) => (
  <Tabs>
    <TabList className="flex text-center">
      <Tab className="mr-2">Traits</Tab>
      <Tab className="mr-2">Info</Tab>
      <Tab>Image</Tab>
    </TabList>
    <TabPanel>
      <DangerousHtml
        extraClassName="tight"
        data={mainRenderer.race.getCompactRenderedString(race)}
      />
    </TabPanel>
    <TabPanel>
      {raceFluff?.map(fluff => (
        <DangerousHtml
          extraClassName="tight"
          data={fluff && mainRenderer.render(fluff)}
        />
      ))}
    </TabPanel>
    <TabPanel>
      <img
        src={`${
          process.env.PUBLIC_URL
        }/img/races/${race.name.toLowerCase()}.png`}
        onError={(ev: any) => addDefaultImageSrc(ev, race.name.toLowerCase())}
        alt={race.name.toLowerCase()}
        className="w-full shadow rounded"
      />
    </TabPanel>
  </Tabs>
);

// Monster
export const RenderMonster = (
  monster: Monster,
  monsterFluff?: MonsterFluff,
) => (
  <Tabs>
    <TabList className="flex text-center">
      <Tab className="mr-2">Statblock</Tab>
      <Tab>Info</Tab>
    </TabList>
    <TabPanel>
      <DangerousHtml
        extraClassName="tight w-full"
        data={mainRenderer.monster.getCompactRenderedString(monster)}
      />
    </TabPanel>
    <TabPanel>
      <DangerousHtml
        extraClassName="tight"
        data={monsterFluff && mainRenderer.render(monsterFluff)}
      />
    </TabPanel>
  </Tabs>
);

// Items
export const RenderItem = (item: any) => {
  const [
    damage,
    damageType,
    propertiesTxt,
  ] = mainRenderer.item.getDamageAndPropertiesText(item);

  const renderedText = mainRenderer.item.getRenderedEntries(item);

  const textLeft = [Parser.itemValueToFull(item), Parser.itemWeightToFull(item)]
    .filter(Boolean)
    .join(', ');

  const textRight = [damage, damageType, propertiesTxt]
    .filter(Boolean)
    .join(' ');

  return `
			${mainRenderer.utils.getBorderTr()}
			${mainRenderer.utils.getExcludedTr(item, 'item')}
			${mainRenderer.utils.getNameTr(item)}
			<tr><td class="rd-item__type-rarity-attunement" colspan="6">${mainRenderer.item
        .getTypeRarityAndAttunementText(item)
        .uppercaseFirst()}</td></tr>
			${
        textLeft && textRight
          ? `<tr>
				<td colspan="2">${textLeft}</td>
				<td class="text-right" colspan="4">${textRight}</td>
			</tr>`
          : `<tr><td colspan="6">${textLeft || textRight}</td></tr>`
      }

			${
        renderedText
          ? `<tr><td class="divider" colspan="6"><div/></td></tr>
			<tr class="text"><td colspan="6">${renderedText}</td></tr>`
          : ''
      }
			${mainRenderer.utils.getPageTr(item)}
			${mainRenderer.utils.getBorderTr()}
		`;
};

// Language
export const RenderLanguage = (lang: LanguageElement) =>
  mainRenderer.language.getCompactRenderedString(lang);

// Language
export const RenderOptionalFeature = (feat: Optionalfeature) =>
  mainRenderer.optionalfeature.getCompactRenderedString(feat);

// Spells
export const RenderSpell = (sp: any, subclassLookup?: any) => {
  const renderStack = [];
  mainRenderer.setFirstSection(true);

  renderStack.push(`
			${mainRenderer.utils.getBorderTr()}
			${mainRenderer.utils.getExcludedTr(sp, 'spell')}
			${mainRenderer.utils.getNameTr(sp)}
			<tr><td class="rd-spell__level-school-ritual" colspan="6"><span>${Parser.spLevelSchoolMetaToFull(
        sp.level,
        sp.school,
        sp.meta,
        sp.subschools,
      )}</span></td></tr>
			<tr><td colspan="6"><span class="bold">Casting Time: </span>${Parser.spTimeListToFull(
        sp.time,
      )}</td></tr>
			<tr><td colspan="6"><span class="bold">Range: </span>${Parser.spRangeToFull(
        sp.range,
      )}</td></tr>
			<tr><td colspan="6"><span class="bold">Components: </span>${Parser.spComponentsToFull(
        sp.components,
        sp.level,
      )}</td></tr>
			<tr><td colspan="6"><span class="bold">Duration: </span>${Parser.spDurationToFull(
        sp.duration,
      )}</td></tr>
			${mainRenderer.utils.getDividerTr()}
		`);

  const entryList = { type: 'entries', entries: sp.entries };
  renderStack.push(`<tr class="text"><td colspan="6" class="text">`);
  mainRenderer.recursiveRender(entryList, renderStack, { depth: 1 });
  if (sp.entriesHigherLevel) {
    const higherLevelsEntryList = {
      type: 'entries',
      entries: sp.entriesHigherLevel,
    };
    mainRenderer.recursiveRender(higherLevelsEntryList, renderStack, {
      depth: 2,
    });
  }
  renderStack.push(`</td></tr>`);

  const stackFroms = [];

  const fromClassList = mainRenderer.spell.getCombinedClasses(
    sp,
    'fromClassList',
  );
  if (fromClassList.length) {
    const [current] = Parser.spClassesToCurrentAndLegacy(fromClassList);
    stackFroms.push(
      `<div><span class="bold">Classes: </span>${Parser.spMainClassesToFull(
        current,
      )}</div>`,
    );
  }

  //   const fromSubclass = mainRenderer.spell.getCombinedClasses(sp, 'fromSubclass');
  //   if (fromSubclass.length) {
  //     const [current, legacy] = Parser.spSubclassesToCurrentAndLegacyFull(
  //       sp,
  //       subclassLookup,
  //     );
  //     stackFroms.push(
  //       `<div><span class="bold">Subclasses: </span>${current}</div>`,
  //     );
  //     if (legacy.length) {
  //       stackFroms.push(
  //         `<div class="text-muted"><span class="bold">Subclasses (legacy): </span>${legacy}</div>`,
  //       );
  //     }
  //   }

  //   const fromClassListVariant = mainRenderer.spell.getCombinedClasses(
  //     sp,
  //     'fromClassListVariant',
  //   );
  //   if (fromClassListVariant.length) {
  //     const [current, legacy] = Parser.spVariantClassesToCurrentAndLegacy(
  //       fromClassListVariant,
  //     );
  //     if (current.length) {
  //       stackFroms.push(
  //         `<div><span class="bold">Optional/Variant Classes: </span>${Parser.spMainClassesToFull(
  //           current,
  //         )}</div>`,
  //       );
  //     }
  //     if (legacy.length) {
  //       stackFroms.push(
  //         `<div class="text-muted"><span class="bold">Optional/Variant Classes (legacy): </span>${Parser.spMainClassesToFull(
  //           legacy,
  //         )}</div>`,
  //       );
  //     }
  //   }

  //   if (sp.races) {
  //     sp.races.sort(
  //       (a, b) =>
  //         SortUtil.ascSortLower(a.name, b.name) ||
  //         SortUtil.ascSortLower(a.source, b.source),
  //     );
  //     stackFroms.push(
  //       `<div><span class="bold">Races: </span>${sp.races
  //         .map(
  //           r =>
  //             `${
  //               SourceUtil.isNonstandardSource(r.source)
  //                 ? `<span class="text-muted">`
  //                 : ``
  //             }${mainRenderer.render(`{@race ${r.name}|${r.source}}`)}${
  //               SourceUtil.isNonstandardSource(r.source) ? `</span>` : ``
  //             }`,
  //         )
  //         .join(', ')}</div>`,
  //     );
  //   }

  //   if (sp.backgrounds) {
  //     sp.backgrounds.sort(
  //       (a, b) =>
  //         SortUtil.ascSortLower(a.name, b.name) ||
  //         SortUtil.ascSortLower(a.source, b.source),
  //     );
  //     stackFroms.push(
  //       `<div><span class="bold">Backgrounds: </span>${sp.backgrounds
  //         .map(
  //           r =>
  //             `${
  //               SourceUtil.isNonstandardSource(r.source)
  //                 ? `<span class="text-muted">`
  //                 : ``
  //             }${mainRenderer.render(`{@background ${r.name}|${r.source}}`)}${
  //               SourceUtil.isNonstandardSource(r.source) ? `</span>` : ``
  //             }`,
  //         )
  //         .join(', ')}</div>`,
  //     );
  //   }

  //   if (sp.eldritchInvocations) {
  //     sp.eldritchInvocations.sort(
  //       (a, b) =>
  //         SortUtil.ascSortLower(a.name, b.name) ||
  //         SortUtil.ascSortLower(a.source, b.source),
  //     );
  //     stackFroms.push(
  //       `<div><span class="bold">Eldritch Invocations: </span>${sp.eldritchInvocations
  //         .map(
  //           r =>
  //             `${
  //               SourceUtil.isNonstandardSource(r.source)
  //                 ? `<span class="text-muted">`
  //                 : ``
  //             }${mainRenderer.render(`{@optfeature ${r.name}|${r.source}}`)}${
  //               SourceUtil.isNonstandardSource(r.source) ? `</span>` : ``
  //             }`,
  //         )
  //         .join(', ')}</div>`,
  //     );
  //   }

  if (stackFroms.length) {
    renderStack.push(
      `<tr class="text"><td colspan="6">${stackFroms.join('')}</td></tr>`,
    );
  }

  if (sp._scrollNote) {
    renderStack.push(
      `<tr class="text"><td colspan="6"><section class="text-muted">`,
    );
    mainRenderer.recursiveRender(
      `{@italic Note: Both the {@class fighter||${mainRenderer.spell.STR_FIGHTER} (${mainRenderer.spell.STR_ELD_KNIGHT})|eldritch knight} and the {@class rogue||${mainRenderer.spell.STR_ROGUE} (${mainRenderer.spell.STR_ARC_TCKER})|arcane trickster} spell lists include all {@class ${mainRenderer.spell.STR_WIZARD}} spells. Spells of 5th level or higher may be cast with the aid of a spell scroll or similar.}`,
      renderStack,
      { depth: 2 },
    );
    renderStack.push(`</section></td></tr>`);
  }

  renderStack.push(`
			${mainRenderer.utils.getPageTr(sp)}
			${mainRenderer.utils.getBorderTr()}
		`);

  return renderStack.join('');
};
