import { mainRenderer as Renderer, Parser } from 'utils/mainRenderer';

export const isTableElement = (data: string) => {
  const tableElements = ['<td', '<tr', '<th'];
  return tableElements.includes(data.trim().slice(0, 3)) ? true : false;
};

// Items
export const RenderItems = (item: any) => {
  const [
    damage,
    damageType,
    propertiesTxt,
  ] = Renderer.item.getDamageAndPropertiesText(item);

  const renderedText = Renderer.item.getRenderedEntries(item);

  const textLeft = [Parser.itemValueToFull(item), Parser.itemWeightToFull(item)]
    .filter(Boolean)
    .join(', ');

  const textRight = [damage, damageType, propertiesTxt]
    .filter(Boolean)
    .join(' ');

  return `
			${Renderer.utils.getBorderTr()}
			${Renderer.utils.getExcludedTr(item, 'item')}
			${Renderer.utils.getNameTr(item)}
			<tr><td class="rd-item__type-rarity-attunement" colspan="6">${Renderer.item
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
			${Renderer.utils.getPageTr(item)}
			${Renderer.utils.getBorderTr()}
		`;
};

// Spells
export const RenderedSpell = (sp: any, subclassLookup?: any) => {
  const renderStack = [];
  Renderer.setFirstSection(true);

  renderStack.push(`
			${Renderer.utils.getBorderTr()}
			${Renderer.utils.getExcludedTr(sp, 'spell')}
			${Renderer.utils.getNameTr(sp)}
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
			${Renderer.utils.getDividerTr()}
		`);

  const entryList = { type: 'entries', entries: sp.entries };
  renderStack.push(`<tr class="text"><td colspan="6" class="text">`);
  Renderer.recursiveRender(entryList, renderStack, { depth: 1 });
  if (sp.entriesHigherLevel) {
    const higherLevelsEntryList = {
      type: 'entries',
      entries: sp.entriesHigherLevel,
    };
    Renderer.recursiveRender(higherLevelsEntryList, renderStack, {
      depth: 2,
    });
  }
  renderStack.push(`</td></tr>`);

  const stackFroms = [];

  const fromClassList = Renderer.spell.getCombinedClasses(sp, 'fromClassList');
  if (fromClassList.length) {
    console.log(fromClassList);
    const [current, legacy] = Parser.spClassesToCurrentAndLegacy(fromClassList);
    stackFroms.push(
      `<div><span class="bold">Classes: </span>${Parser.spMainClassesToFull(
        current,
      )}</div>`,
    );
    if (legacy.length)
      stackFroms.push(
        `<div class="text-muted"><span class="bold">Classes (legacy): </span>${Parser.spMainClassesToFull(
          legacy,
        )}</div>`,
      );
  }

  //   const fromSubclass = Renderer.spell.getCombinedClasses(sp, 'fromSubclass');
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

  //   const fromClassListVariant = Renderer.spell.getCombinedClasses(
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
  //             }${Renderer.render(`{@race ${r.name}|${r.source}}`)}${
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
  //             }${Renderer.render(`{@background ${r.name}|${r.source}}`)}${
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
  //             }${Renderer.render(`{@optfeature ${r.name}|${r.source}}`)}${
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
    Renderer.recursiveRender(
      `{@italic Note: Both the {@class fighter||${Renderer.spell.STR_FIGHTER} (${Renderer.spell.STR_ELD_KNIGHT})|eldritch knight} and the {@class rogue||${Renderer.spell.STR_ROGUE} (${Renderer.spell.STR_ARC_TCKER})|arcane trickster} spell lists include all {@class ${Renderer.spell.STR_WIZARD}} spells. Spells of 5th level or higher may be cast with the aid of a spell scroll or similar.}`,
      renderStack,
      { depth: 2 },
    );
    renderStack.push(`</section></td></tr>`);
  }

  renderStack.push(`
			${Renderer.utils.getPageTr(sp)}
			${Renderer.utils.getBorderTr()}
		`);

  return renderStack.join('');
};
