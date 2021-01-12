// ************************************************************************* //
// Strict mode should not be used, as the roll20 script depends on this file //
// ************************************************************************* //

// ENTRY RENDERING =====================================================================================================
/*
 * // EXAMPLE USAGE //
 *
 * const entryRenderer = new Renderer();
 *
 * const topLevelEntry = mydata[0];
 * // prepare an array to hold the string we collect while recursing
 * const textStack = [];
 *
 * // recurse through the entry tree
 * entryRenderer.renderEntries(topLevelEntry, textStack);
 *
 * // render the final product by joining together all the collected strings
 * $("#myElement").html(toDisplay.join(""));
 */
function Renderer() {
  this.wrapperTag = 'div';
  this.baseUrl = '';

  this._lazyImages = false;
  this._subVariant = false;
  this._firstSection = true;
  this._headerIndex = 1;
  this._tagExportDict = null;
  this._trackTitles = { enabled: false, titles: {} };
  this._enumerateTitlesRel = { enabled: false, titles: {} };
  this._hooks = {};
  this._fnPostProcess = null;
  this._extraSourceClasses = null;
  this._depthTracker = null;
  this._isIternalLinksDisabled = true;

  /**
   * Other sections should be prefixed with a vertical divider
   * @param bool
   */
  this.setFirstSection = function(bool) {
    this._firstSection = bool;
    return this;
  };

  /**
   * Specify a list of extra classes to be added to those rendered on entries with sources.
   * @param arr
   */
  this.setExtraSourceClasses = function(arr) {
    this._extraSourceClasses = arr;
    return this;
  };

  /**
   * Headers are ID'd using the attribute `data-title-index` using an incrementing int. This resets it to 1.
   */
  this.resetHeaderIndex = function() {
    this._headerIndex = 1;
    this._trackTitles.titles = {};
    this._enumerateTitlesRel.titles = {};
    return this;
  };

  /**
   * Pass an object to have the renderer export lists of found @-tagged content during renders
   *
   * @param toObj the object to fill with exported data. Example results:
   * 			{
   *				commoner_mm: {page: "bestiary.html", source: "MM", hash: "commoner_mm"},
   *				storm%20giant_mm: {page: "bestiary.html", source: "MM", hash: "storm%20giant_mm"},
   *				detect%20magic_phb: {page: "spells.html", source: "PHB", hash: "detect%20magic_phb"}
   *			}
   * 			These results intentionally match those used for hover windows, so can use the same cache/loading paths
   */
  this.doExportTags = function(toObj) {
    this._tagExportDict = toObj;
    return this;
  };

  /**
   * Reset/disable tag export
   */
  this.resetExportTags = function() {
    this._tagExportDict = null;
    return this;
  };

  /** Used by Foundry config. */
  this.setInternalLinksDisabled = function(bool) {
    this._isIternalLinksDisabled = bool;
    return this;
  };

  /**
   * If enabled, titles with the same name will be given numerical identifiers.
   * This identifier is stored in `data-title-relative-index`
   */
  this.setEnumerateTitlesRel = function(bool) {
    this._enumerateTitlesRel.enabled = bool;
    return this;
  };

  this._getEnumeratedTitleRel = function(name) {
    if (this._enumerateTitlesRel.enabled && name) {
      const clean = name.toLowerCase();
      this._enumerateTitlesRel.titles[clean] =
        this._enumerateTitlesRel.titles[clean] || 0;
      return `data-title-relative-index="${this._enumerateTitlesRel.titles[
        clean
      ]++}"`;
    } else return '';
  };

  this.setTrackTitles = function(bool) {
    this._trackTitles.enabled = bool;
    return this;
  };

  this.getTrackedTitles = function() {
    return MiscUtil.copy(this._trackTitles.titles);
  };

  this._handleTrackTitles = function(name) {
    if (this._trackTitles.enabled) {
      this._trackTitles.titles[this._headerIndex] = name;
    }
  };

  this._handleTrackDepth = function(entry, depth) {
    if (entry.name && this._depthTracker) {
      this._depthTracker.push({
        depth,
        name: entry.name,
        type: entry.type,
        ixHeader: this._headerIndex,
        source: entry.source,
      });
    }
  };

  this.addHook = function(entryType, hookType, fnHook) {
    ((this._hooks[entryType] = this._hooks[entryType] || {})[hookType] =
      this._hooks[entryType][hookType] || []).push(fnHook);
  };

  this.removeHook = function(entryType, hookType, fnHook) {
    const ix = ((this._hooks[entryType] = this._hooks[entryType] || {})[
      hookType
    ] = this._hooks[entryType][hookType] || []).indexOf(fnHook);
    if (~ix) this._hooks[entryType][hookType].splice(ix, 1);
  };

  this._getHooks = function(entryType, hookType) {
    return (this._hooks[entryType] || {})[hookType] || [];
  };

  /**
   * Specify an array where the renderer will record rendered header depths.
   * Items added to the array are of the form: `{name: "Header Name", depth: 1, type: "entries"}`
   */
  this.setDepthTracker = function(arr) {
    this._depthTracker = arr;
    return this;
  };

  /**
   * Recursively walk down a tree of "entry" JSON items, adding to a stack of strings to be finally rendered to the
   * page. Note that this function does _not_ actually do the rendering, see the example code above for how to display
   * the result.
   *
   * @param entry An "entry" usually defined in JSON. A schema is available in tests/schema
   * @param textStack A reference to an array, which will hold all our strings as we recurse
   * @param meta Meta state.
   * @param meta.depth The current recursion depth. Optional; default 0, or -1 for type "section" entries.
   * @param options Render options.
   * @param options.prefix String to prefix rendered lines with.
   */
  this.recursiveRender = function(entry, textStack, meta, options) {
    if (entry instanceof Array) {
      entry.forEach(nxt => this.recursiveRender(nxt, textStack, meta, options));
      setTimeout(() => {
        throw new Error(
          `Array passed to renderer! The renderer only guarantees support for primitives and basic objects.`,
        );
      });
      return;
    }

    // respect the API of the original, but set up for using string concatenations
    if (textStack.length === 0) textStack[0] = '';
    else textStack.reverse();

    // initialise meta
    meta = meta || {};
    meta._typeStack = [];
    meta.depth = meta.depth == null ? 0 : meta.depth;

    this._recursiveRender(entry, textStack, meta, options);
    if (this._fnPostProcess) textStack[0] = this._fnPostProcess(textStack[0]);
    textStack.reverse();
  };

  /**
   * Inner rendering code. Uses string concatenation instead of an array stack, for ~2x the speed.
   * @param entry As above.
   * @param textStack As above.
   * @param meta As above, with the addition of...
   * @param options
   *          .prefix The (optional) prefix to be added to the textStack before whatever is added by the current call
   *          .suffix The (optional) suffix to be added to the textStack after whatever is added by the current call
   * @private
   */
  this._recursiveRender = function(entry, textStack, meta, options) {
    if (!meta) throw new Error('Missing metadata!');
    if (entry.type === 'section') meta.depth = -1;

    options = options || {};

    meta._didRenderPrefix = false;
    meta._didRenderSuffix = false;

    if (typeof entry === 'object') {
      // the root entry (e.g. "Rage" in barbarian "classFeatures") is assumed to be of type "entries"
      const type =
        entry.type == null || entry.type === 'section' ? 'entries' : entry.type;

      meta._typeStack.push(type);

      switch (type) {
        // recursive
        case 'entries':
          this._renderEntries(entry, textStack, meta, options);
          break;
        case 'options':
          this._renderOptions(entry, textStack, meta, options);
          break;
        case 'list':
          this._renderList(entry, textStack, meta, options);
          break;
        case 'table':
          this._renderTable(entry, textStack, meta, options);
          break;
        case 'tableGroup':
          this._renderTableGroup(entry, textStack, meta, options);
          break;
        case 'inset':
          this._renderInset(entry, textStack, meta, options);
          break;
        case 'insetReadaloud':
          this._renderInsetReadaloud(entry, textStack, meta, options);
          break;
        case 'variant':
          this._renderVariant(entry, textStack, meta, options);
          break;
        case 'variantInner':
          this._renderVariantInner(entry, textStack, meta, options);
          break;
        case 'variantSub':
          this._renderVariantSub(entry, textStack, meta, options);
          break;
        case 'spellcasting':
          this._renderSpellcasting(entry, textStack, meta, options);
          break;
        case 'quote':
          this._renderQuote(entry, textStack, meta, options);
          break;
        case 'optfeature':
          this._renderOptfeature(entry, textStack, meta, options);
          break;
        case 'patron':
          this._renderPatron(entry, textStack, meta, options);
          break;

        // block
        case 'abilityDc':
          this._renderAbilityDc(entry, textStack, meta, options);
          break;
        case 'abilityAttackMod':
          this._renderAbilityAttackMod(entry, textStack, meta, options);
          break;
        case 'abilityGeneric':
          this._renderAbilityGeneric(entry, textStack, meta, options);
          break;

        // inline
        case 'inline':
          this._renderInline(entry, textStack, meta, options);
          break;
        case 'inlineBlock':
          this._renderInlineBlock(entry, textStack, meta, options);
          break;
        case 'bonus':
          this._renderBonus(entry, textStack, meta, options);
          break;
        case 'bonusSpeed':
          this._renderBonusSpeed(entry, textStack, meta, options);
          break;
        case 'dice':
          this._renderDice(entry, textStack, meta, options);
          break;
        case 'link':
          this._renderLink(entry, textStack, meta, options);
          break;
        case 'actions':
          this._renderActions(entry, textStack, meta, options);
          break;
        case 'attack':
          this._renderAttack(entry, textStack, meta, options);
          break;

        // list items
        case 'item':
          this._renderItem(entry, textStack, meta, options);
          break;
        case 'itemSub':
          this._renderItemSub(entry, textStack, meta, options);
          break;
        case 'itemSpell':
          this._renderItemSpell(entry, textStack, meta, options);
          break;

        // entire data records
        case 'dataCreature':
          this._renderDataCreature(entry, textStack, meta, options);
          break;
        case 'dataSpell':
          this._renderDataSpell(entry, textStack, meta, options);
          break;
        case 'dataTrapHazard':
          this._renderDataTrapHazard(entry, textStack, meta, options);
          break;
        case 'dataObject':
          this._renderDataObject(entry, textStack, meta, options);
          break;
        case 'dataItem':
          this._renderDataItem(entry, textStack, meta, options);
          break;

        // flowchart
        case 'flowchart':
          this._renderFlowchart(entry, textStack, meta, options);
          break;
        case 'flowBlock':
          this._renderFlowBlock(entry, textStack, meta, options);
          break;

        // homebrew changes
        case 'homebrew':
          this._renderHomebrew(entry, textStack, meta, options);
          break;

        // misc
        case 'code':
          this._renderCode(entry, textStack, meta, options);
          break;
        case 'hr':
          this._renderHr(entry, textStack, meta, options);
          break;
      }

      meta._typeStack.pop();
    } else if (typeof entry === 'string') {
      // block
      this._renderPrefix(entry, textStack, meta, options);
      this._renderString(entry, textStack, meta, options);
      this._renderSuffix(entry, textStack, meta, options);
    } else {
      // block
      // for ints or any other types which do not require specific rendering
      this._renderPrefix(entry, textStack, meta, options);
      this._renderPrimitive(entry, textStack, meta, options);
      this._renderSuffix(entry, textStack, meta, options);
    }
  };

  this._adjustDepth = function(meta, dDepth) {
    const cachedDepth = meta.depth;
    meta.depth += dDepth;
    meta.depth = Math.min(Math.max(-1, meta.depth), 2); // cap depth between -1 and 2 for general use
    return cachedDepth;
  };

  this._renderPrefix = function(entry, textStack, meta, options) {
    if (meta._didRenderPrefix) return;
    if (options.prefix != null) {
      textStack[0] += options.prefix;
      meta._didRenderPrefix = true;
    }
  };

  this._renderSuffix = function(entry, textStack, meta, options) {
    if (meta._didRenderSuffix) return;
    if (options.suffix != null) {
      textStack[0] += options.suffix;
      meta._didRenderSuffix = true;
    }
  };

  this._renderList_getListCssClasses = function(
    entry,
    textStack,
    meta,
    options,
  ) {
    const out = [`rd__list`];
    if (entry.style || entry.columns) {
      if (entry.style)
        out.push(...entry.style.split(' ').map(it => `rd__${it}`));
      if (entry.columns) out.push(`columns-${entry.columns}`);
    }
    return out.join(' ');
  };

  this._renderTableGroup = function(entry, textStack, meta, options) {
    const len = entry.tables.length;
    for (let i = 0; i < len; ++i)
      this._recursiveRender(entry.tables[i], textStack, meta);
  };

  this._renderTable = function(entry, textStack, meta, options) {
    // TODO add handling for rowLabel property
    if (entry.intro) {
      const len = entry.intro.length;
      for (let i = 0; i < len; ++i) {
        this._recursiveRender(entry.intro[i], textStack, meta, {
          prefix: '<p>',
          suffix: '</p>',
        });
      }
    }

    textStack[0] += `<table class="${entry.style || ''} ${
      entry.isStriped === false ? '' : 'striped-odd'
    }">`;

    // caption
    if (entry.caption != null)
      textStack[0] += `<caption>${entry.caption}</caption>`;

    // body -- temporarily build this to own string; append after headers
    const rollCols = [];
    let bodyStack = [''];
    bodyStack[0] += '<tbody>';
    const len = entry.rows.length;
    for (let ixRow = 0; ixRow < len; ++ixRow) {
      bodyStack[0] += '<tr class="odd:bg-gray-200 dark:odd:bg-dark-200">';
      const r = entry.rows[ixRow];
      let roRender = r.type === 'row' ? r.row : r;

      const len = roRender.length;
      for (let ixCell = 0; ixCell < len; ++ixCell) {
        rollCols[ixCell] = rollCols[ixCell] || false;

        let toRenderCell;
        if (roRender[ixCell].type === 'cell') {
          if (roRender[ixCell].roll) {
            rollCols[ixCell] = true;
            if (roRender[ixCell].roll.entry) {
              toRenderCell = roRender[ixCell].roll.entry;
            } else if (roRender[ixCell].roll.exact != null) {
              toRenderCell = roRender[ixCell].roll.pad
                ? StrUtil.padNumber(roRender[ixCell].roll.exact, 2, '0')
                : roRender[ixCell].roll.exact;
            } else {
              if (roRender[ixCell].roll.max === Renderer.dice.POS_INFINITE) {
                toRenderCell = roRender[ixCell].roll.pad
                  ? `${StrUtil.padNumber(roRender[ixCell].roll.min, 2, '0')}+`
                  : `${roRender[ixCell].roll.min}+`;
              } else {
                toRenderCell = roRender[ixCell].roll.pad
                  ? `${StrUtil.padNumber(
                      roRender[ixCell].roll.min,
                      2,
                      '0',
                    )}-${StrUtil.padNumber(roRender[ixCell].roll.max, 2, '0')}`
                  : `${roRender[ixCell].roll.min}-${roRender[ixCell].roll.max}`;
              }
            }
          } else if (roRender[ixCell].entry) {
            toRenderCell = roRender[ixCell].entry;
          }
        } else {
          toRenderCell = roRender[ixCell];
        }
        bodyStack[0] += `<td ${this._renderTable_makeTableTdClassText(
          entry,
          ixCell,
        )} ${this._renderTable_getCellDataStr(roRender[ixCell])} ${
          roRender[ixCell].width ? `colspan="${roRender[ixCell].width}"` : ''
        }>`;
        if (r.style === 'row-indent-first' && ixCell === 0)
          bodyStack[0] += `<div class="rd__tab-indent"></div>`;
        const cacheDepth = this._adjustDepth(meta, 1);
        this._recursiveRender(toRenderCell, bodyStack, meta);
        meta.depth = cacheDepth;
        bodyStack[0] += '</td>';
      }
      bodyStack[0] += '</tr>';
    }
    bodyStack[0] += '</tbody>';

    // header
    textStack[0] += '<thead>';
    textStack[0] += '<tr>';
    if (entry.colLabels) {
      const len = entry.colLabels.length;
      for (let i = 0; i < len; ++i) {
        const lbl = entry.colLabels[i];
        textStack[0] += `<th ${this._renderTable_getTableThClassText(
          entry,
          i,
        )} data-isroller="${rollCols[i]}">`;
        this._recursiveRender(lbl, textStack, meta);
        textStack[0] += `</th>`;
      }
    }
    textStack[0] += '</tr>';
    textStack[0] += '</thead>';

    textStack[0] += bodyStack[0];

    // footer
    if (entry.footnotes != null) {
      textStack[0] += '<tfoot>';
      const len = entry.footnotes.length;
      for (let i = 0; i < len; ++i) {
        textStack[0] += `<tr><td colspan="99">`;
        const cacheDepth = this._adjustDepth(meta, 1);
        this._recursiveRender(entry.footnotes[i], textStack, meta);
        meta.depth = cacheDepth;
        textStack[0] += '</td></tr>';
      }
      textStack[0] += '</tfoot>';
    }
    textStack[0] += '</table>';

    if (entry.outro) {
      const len = entry.outro.length;
      for (let i = 0; i < len; ++i) {
        this._recursiveRender(entry.outro[i], textStack, meta, {
          prefix: '<p>',
          suffix: '</p>',
        });
      }
    }
  };

  this._renderTable_getCellDataStr = function(ent) {
    function convertZeros(num) {
      if (num === 0) return 100;
      return num;
    }

    if (ent.roll) {
      return `data-roll-min="${convertZeros(
        ent.roll.exact != null ? ent.roll.exact : ent.roll.min,
      )}" data-roll-max="${convertZeros(
        ent.roll.exact != null ? ent.roll.exact : ent.roll.max,
      )}"`;
    }

    return '';
  };

  this._renderTable_getTableThClassText = function(entry, i) {
    return entry.colStyles == null || i >= entry.colStyles.length
      ? ''
      : `class="${entry.colStyles[i]}"`;
  };

  this._renderTable_makeTableTdClassText = function(entry, i) {
    if (entry.rowStyles != null)
      return i >= entry.rowStyles.length ? '' : `class="${entry.rowStyles[i]}"`;
    else return this._renderTable_getTableThClassText(entry, i);
  };

  this._renderEntries = function(entry, textStack, meta, options) {
    this._renderEntriesSubtypes(entry, textStack, meta, options, true);
  };

  this._renderEntriesSubtypes = function(
    entry,
    textStack,
    meta,
    options,
    incDepth,
  ) {
    const isInlineTitle = meta.depth >= 2;
    const pagePart =
      !isInlineTitle && entry.page > 0
        ? ` <span class="rd__title-link">${
            entry.source
              ? `<span class="help--subtle" title="${Parser.sourceJsonToFull(
                  entry.source,
                )}">${Parser.sourceJsonToAbv(entry.source)}</span> `
              : ''
          }p${entry.page}</span>`
        : '';
    const nextDepth = incDepth && meta.depth < 2 ? meta.depth + 1 : meta.depth;
    const styleString = this._renderEntriesSubtypes_getStyleString(
      entry,
      meta,
      isInlineTitle,
    );
    const dataString = this._renderEntriesSubtypes_getDataString(entry);
    if (entry.name != null) this._handleTrackTitles(entry.name);

    const headerClass = `rd__h--${meta.depth + 1}`; // adjust as the CSS is 0..4 rather than -1..3

    this._handleTrackDepth(entry, meta.depth);

    const headerSpan = entry.name
      ? `<span class="rd__h ${headerClass}" data-title-index="${this
          ._headerIndex++}" ${this._getEnumeratedTitleRel(entry.name)}> <span ${
          !pagePart && entry.source
            ? ` title="Source: ${Parser.sourceJsonToFull(entry.source)}${
                entry.page ? `, p${entry.page}` : ''
              }"`
            : ''
        }>${this.render({ type: 'inline', entries: [entry.name] })}${
          isInlineTitle ? '.' : ''
        }</span>${pagePart}</span> `
      : '';

    if (entry.entries || entry.name) {
      textStack[0] += `<${this.wrapperTag} ${dataString} ${styleString}>${headerSpan}`;
      this._renderEntriesSubtypes_renderPreReqText(entry, textStack, meta);
      if (entry.entries) {
        const cacheDepth = meta.depth;
        const len = entry.entries.length;
        for (let i = 0; i < len; ++i) {
          meta.depth = nextDepth;
          this._recursiveRender(entry.entries[i], textStack, meta, {
            prefix: '<p>',
            suffix: '</p>',
          });
          // Add a spacer for style sets that have vertical whitespace instead of indents
          if (i === 0 && meta.depth >= 2)
            textStack[0] += `<div class="rd__spc-inline-post"></div>`;
        }
        meta.depth = cacheDepth;
      }
      textStack[0] += `</${this.wrapperTag}>`;
    }
  };

  this._renderEntriesSubtypes_getDataString = function(entry) {
    let dataString = '';
    if (entry.source) dataString += `data-source="${entry.source}"`;
    return dataString;
  };

  this._renderEntriesSubtypes_renderPreReqText = function(
    entry,
    textStack,
    meta,
  ) {
    if (entry.prerequisite) {
      textStack[0] += `<span class="rd__prerequisite">Prerequisite: `;
      this._recursiveRender(
        { type: 'inline', entries: [entry.prerequisite] },
        textStack,
        meta,
      );
      textStack[0] += `</span>`;
    }
  };

  this._renderEntriesSubtypes_getStyleString = function(
    entry,
    meta,
    isInlineTitle,
  ) {
    const styleClasses = ['rd__b'];
    styleClasses.push(this._getStyleClass(entry.source));
    if (isInlineTitle) {
      if (this._subVariant) styleClasses.push(Renderer.HEAD_2_SUB_VARIANT);
      else styleClasses.push(Renderer.HEAD_2);
    } else
      styleClasses.push(
        meta.depth === -1
          ? Renderer.HEAD_NEG_1
          : meta.depth === 0
          ? Renderer.HEAD_0
          : Renderer.HEAD_1,
      );
    return styleClasses.length > 0 ? `class="${styleClasses.join(' ')}"` : '';
  };

  this._renderOptions = function(entry, textStack, meta, options) {
    if (entry.entries) {
      entry.entries = entry.entries
        .slice()
        .sort((a, b) =>
          a.name && b.name
            ? SortUtil.ascSort(a.name, b.name)
            : a.name
            ? -1
            : b.name
            ? 1
            : 0,
        )
        .filter(entryItem => entryItem.source !== 'UAClassFeatureVariants');
      this._renderEntriesSubtypes(entry, textStack, meta, options, false);
    }
  };

  this._renderList = function(entry, textStack, meta, options) {
    if (entry.items) {
      if (entry.name)
        textStack[0] += `<p class="rd__list-name">${entry.name}</p>`;
      const cssClasses = this._renderList_getListCssClasses(
        entry,
        textStack,
        meta,
        options,
      );
      textStack[0] += `<ul ${cssClasses ? `class="${cssClasses}"` : ''}>`;
      const isListHang =
        entry.style && entry.style.split(' ').includes('list-hang');
      const len = entry.items.length;
      for (let i = 0; i < len; ++i) {
        const item = entry.items[i];
        // Special case for child lists -- avoid wrapping in LI tags to avoid double-bullet
        if (item.type !== 'list') {
          const className = `${this._getStyleClass(item.source)}${
            item.type === 'itemSpell' ? ' rd__li-spell' : ''
          }`;
          textStack[0] += `<li ${className ? `class="${className}"` : ''}>`;
        }
        // If it's a raw string in a hanging list, wrap it in a div to allow for the correct styling
        if (isListHang && typeof item === 'string') textStack[0] += '<div>';
        const cacheDepth = this._adjustDepth(meta, 1);
        this._recursiveRender(item, textStack, meta);
        meta.depth = cacheDepth;
        if (isListHang && typeof item === 'string') textStack[0] += '</div>';
        if (item.type !== 'list') textStack[0] += '</li>';
      }
      textStack[0] += '</ul>';
    }
  };

  this._renderInset = function(entry, textStack, meta, options) {
    const dataString = this._renderEntriesSubtypes_getDataString(entry);
    textStack[0] += `<${this.wrapperTag} class="rd__b-inset" ${dataString}>`;
    if (entry.name != null) {
      this._handleTrackTitles(entry.name);
      this._handleTrackDepth(entry, 1);
      textStack[0] += `<span class="rd__h rd__h--2-inset" data-title-index="${this
        ._headerIndex++}" ${this._getEnumeratedTitleRel(
        entry.name,
      )}><span class="text-xl">${entry.name}</span></span>`;
    }
    if (entry.entries) {
      const len = entry.entries.length;
      for (let i = 0; i < len; ++i) {
        const cacheDepth = meta.depth;
        meta.depth = 2;
        this._recursiveRender(entry.entries[i], textStack, meta, {
          prefix: '<p>',
          suffix: '</p>',
        });
        meta.depth = cacheDepth;
      }
    }
    textStack[0] += `<div class="float-clear"></div>`;
    textStack[0] += `</${this.wrapperTag}>`;
  };

  this._renderInsetReadaloud = function(entry, textStack, meta, options) {
    const dataString = this._renderEntriesSubtypes_getDataString(entry);
    textStack[0] += `<${this.wrapperTag} class="rd__b-inset rd__b-inset--readaloud" ${dataString}>`;
    if (entry.name != null) {
      this._handleTrackTitles(entry.name);
      this._handleTrackDepth(entry, 1);
      textStack[0] += `<span class="rd__h rd__h--2-inset" data-title-index="${this
        ._headerIndex++}" ${this._getEnumeratedTitleRel(
        entry.name,
      )}><span class="text-xl">${entry.name}</span></span>`;
    }
    const len = entry.entries.length;
    for (let i = 0; i < len; ++i) {
      const cacheDepth = meta.depth;
      meta.depth = 2;
      this._recursiveRender(entry.entries[i], textStack, meta, {
        prefix: '<p>',
        suffix: '</p>',
      });
      meta.depth = cacheDepth;
    }
    textStack[0] += `<div class="float-clear"></div>`;
    textStack[0] += `</${this.wrapperTag}>`;
  };

  this._renderVariant = function(entry, textStack, meta, options) {
    const dataString = this._renderEntriesSubtypes_getDataString(entry);
    this._handleTrackTitles(entry.name);
    this._handleTrackDepth(entry, 1);
    textStack[0] += `<${this.wrapperTag} class="rd__b-inset" ${dataString}>`;
    textStack[0] += `<span class="rd__h rd__h--2-inset" data-title-index="${this
      ._headerIndex++}" ${this._getEnumeratedTitleRel(
      entry.name,
    )}><span class="text-xl">Variant: ${entry.name}</span></span>`;
    const len = entry.entries.length;
    for (let i = 0; i < len; ++i) {
      const cacheDepth = meta.depth;
      meta.depth = 2;
      this._recursiveRender(entry.entries[i], textStack, meta, {
        prefix: '<p>',
        suffix: '</p>',
      });
      meta.depth = cacheDepth;
    }
    if (entry.variantSource)
      textStack[0] += Renderer.utils._getPageTrText(entry.variantSource);
    textStack[0] += `</${this.wrapperTag}>`;
  };

  this._renderVariantSub = function(entry, textStack, meta, options) {
    // pretend this is an inline-header'd entry, but set a flag so we know not to add bold
    this._subVariant = true;
    const fauxEntry = entry;
    fauxEntry.type = 'entries';
    const cacheDepth = meta.depth;
    meta.depth = 3;
    this._recursiveRender(fauxEntry, textStack, meta, {
      prefix: '<p>',
      suffix: '</p>',
    });
    meta.depth = cacheDepth;
    this._subVariant = false;
  };

  this._renderSpellcasting_getEntries = function(entry) {
    const hidden = new Set(entry.hidden || []);
    const toRender = [
      {
        type: 'entries',
        name: entry.name,
        entries: entry.headerEntries ? MiscUtil.copy(entry.headerEntries) : [],
      },
    ];

    if (
      entry.constant ||
      entry.will ||
      entry.rest ||
      entry.daily ||
      entry.weekly
    ) {
      const tempList = { type: 'list', style: 'list-hang-notitle', items: [] };
      if (entry.constant && !hidden.has('constant'))
        tempList.items.push({
          type: 'itemSpell',
          name: `Constant:`,
          entry: entry.constant.join(', '),
        });
      if (entry.will && !hidden.has('will'))
        tempList.items.push({
          type: 'itemSpell',
          name: `At will:`,
          entry: entry.will.join(', '),
        });
      if (entry.rest && !hidden.has('rest')) {
        for (let lvl = 9; lvl > 0; lvl--) {
          const rest = entry.rest;
          if (rest[lvl])
            tempList.items.push({
              type: 'itemSpell',
              name: `${lvl}/rest:`,
              entry: rest[lvl].join(', '),
            });
          const lvlEach = `${lvl}e`;
          if (rest[lvlEach])
            tempList.items.push({
              type: 'itemSpell',
              name: `${lvl}/rest each:`,
              entry: rest[lvlEach].join(', '),
            });
        }
      }
      if (entry.daily && !hidden.has('daily')) {
        for (let lvl = 9; lvl > 0; lvl--) {
          const daily = entry.daily;
          if (daily[lvl])
            tempList.items.push({
              type: 'itemSpell',
              name: `${lvl}/day:`,
              entry: daily[lvl].join(', '),
            });
          const lvlEach = `${lvl}e`;
          if (daily[lvlEach])
            tempList.items.push({
              type: 'itemSpell',
              name: `${lvl}/day each:`,
              entry: daily[lvlEach].join(', '),
            });
        }
      }
      if (entry.weekly && !hidden.has('weekly')) {
        for (let lvl = 9; lvl > 0; lvl--) {
          const weekly = entry.weekly;
          if (weekly[lvl])
            tempList.items.push({
              type: 'itemSpell',
              name: `${lvl}/week:`,
              entry: weekly[lvl].join(', '),
            });
          const lvlEach = `${lvl}e`;
          if (weekly[lvlEach])
            tempList.items.push({
              type: 'itemSpell',
              name: `${lvl}/week each:`,
              entry: weekly[lvlEach].join(', '),
            });
        }
      }
      if (tempList.items.length) toRender[0].entries.push(tempList);
    }

    if (entry.spells && !hidden.has('spells')) {
      const tempList = { type: 'list', style: 'list-hang-notitle', items: [] };
      for (let lvl = 0; lvl < 10; ++lvl) {
        const spells = entry.spells[lvl];
        if (spells) {
          let levelCantrip = `${Parser.spLevelToFull(lvl)}${
            lvl === 0 ? 's' : ' level'
          }`;
          let slotsAtWill = ` (at will)`;
          const slots = spells.slots;
          if (slots >= 0)
            slotsAtWill =
              slots > 0 ? ` (${slots} slot${slots > 1 ? 's' : ''})` : ``;
          if (spells.lower && spells.lower !== lvl) {
            levelCantrip = `${Parser.spLevelToFull(
              spells.lower,
            )}-${levelCantrip}`;
            if (slots >= 0)
              slotsAtWill =
                slots > 0
                  ? ` (${slots} ${Parser.spLevelToFull(lvl)}-level slot${
                      slots > 1 ? 's' : ''
                    })`
                  : ``;
          }
          tempList.items.push({
            type: 'itemSpell',
            name: `${levelCantrip} ${slotsAtWill}:`,
            entry: spells.spells.join(', '),
          });
        }
      }
      toRender[0].entries.push(tempList);
    }

    if (entry.footerEntries)
      toRender.push({ type: 'entries', entries: entry.footerEntries });
    return toRender;
  };

  this._renderSpellcasting = function(entry, textStack, meta, options) {
    const toRender = this._renderSpellcasting_getEntries(entry);
    this._recursiveRender(
      { type: 'entries', entries: toRender },
      textStack,
      meta,
    );
  };

  this._renderQuote = function(entry, textStack, meta, options) {
    textStack[0] += `<p><i>`;
    const len = entry.entries.length;
    for (let i = 0; i < len; ++i) {
      this._recursiveRender(entry.entries[i], textStack, meta);
      if (i !== entry.entries.length - 1) textStack[0] += `<br>`;
      else textStack[0] += `</i>`;
    }
    if (entry.by) {
      const tempStack = [''];
      this._recursiveRender(entry.by, tempStack, meta);
      textStack[0] += `<span class="rd__quote-by">\u2014 ${tempStack.join('')}${
        entry.from ? `, <i>${entry.from}</i>` : ''
      }</span>`;
    }
    textStack[0] += `</p>`;
  };

  this._renderOptfeature = function(entry, textStack, meta, options) {
    this._renderEntriesSubtypes(entry, textStack, meta, options, true);
  };

  this._renderPatron = function(entry, textStack, meta, options) {
    this._renderEntriesSubtypes(entry, textStack, meta, options, false);
  };

  this._renderAbilityDc = function(entry, textStack, meta, options) {
    this._renderPrefix(entry, textStack, meta, options);
    textStack[0] += `<div class="text-center"><b>`;
    this._recursiveRender(entry.name, textStack, meta);
    textStack[0] += ` save DC</b> = 8 + your proficiency bonus + your ${Parser.attrChooseToFull(
      entry.attributes,
    )}</div>`;
    this._renderSuffix(entry, textStack, meta, options);
  };

  this._renderAbilityAttackMod = function(entry, textStack, meta, options) {
    this._renderPrefix(entry, textStack, meta, options);
    textStack[0] += `<div class="text-center"><b>`;
    this._recursiveRender(entry.name, textStack, meta);
    textStack[0] += ` attack modifier</b> = your proficiency bonus + your ${Parser.attrChooseToFull(
      entry.attributes,
    )}</div>`;
    this._renderSuffix(entry, textStack, meta, options);
  };

  this._renderAbilityGeneric = function(entry, textStack, meta, options) {
    this._renderPrefix(entry, textStack, meta, options);
    textStack[0] += `<div class="text-center">`;
    if (entry.name)
      this._recursiveRender(entry.name, textStack, meta, {
        prefix: '<b>',
        suffix: '</b> = ',
      });
    textStack[0] += `${entry.text}${
      entry.attributes ? ` ${Parser.attrChooseToFull(entry.attributes)}` : ''
    }</div>`;
    this._renderSuffix(entry, textStack, meta, options);
  };

  this._renderInline = function(entry, textStack, meta, options) {
    if (entry.entries) {
      const len = entry.entries.length;
      for (let i = 0; i < len; ++i)
        this._recursiveRender(entry.entries[i], textStack, meta);
    }
  };

  this._renderInlineBlock = function(entry, textStack, meta, options) {
    this._renderPrefix(entry, textStack, meta, options);
    if (entry.entries) {
      const len = entry.entries.length;
      for (let i = 0; i < len; ++i)
        this._recursiveRender(entry.entries[i], textStack, meta);
    }
    this._renderSuffix(entry, textStack, meta, options);
  };

  this._renderBonus = function(entry, textStack, meta, options) {
    textStack[0] += (entry.value < 0 ? '' : '+') + entry.value;
  };

  this._renderBonusSpeed = function(entry, textStack, meta, options) {
    textStack[0] += `${entry.value < 0 ? '' : '+'}${entry.value} ft.`;
  };

  this._renderDice = function(entry, textStack, meta, options) {
    textStack[0] += Renderer.getEntryDice(entry, entry.name);
  };

  this._renderActions = function(entry, textStack, meta, options) {
    const dataString = this._renderEntriesSubtypes_getDataString(entry);
    this._handleTrackTitles(entry.name);
    this._handleTrackDepth(entry, 2);
    textStack[0] += `<${this.wrapperTag} class="${
      Renderer.HEAD_2
    }" ${dataString}><span class="rd__h rd__h--3" data-title-index="${this
      ._headerIndex++}" ${this._getEnumeratedTitleRel(
      entry.name,
    )}><span class="text-xl">${entry.name}.</span></span> `;
    const len = entry.entries.length;
    for (let i = 0; i < len; ++i)
      this._recursiveRender(entry.entries[i], textStack, meta, {
        prefix: '<p>',
        suffix: '</p>',
      });
    textStack[0] += `</${this.wrapperTag}>`;
  };

  this._renderAttack = function(entry, textStack, meta, options) {
    this._renderPrefix(entry, textStack, meta, options);
    textStack[0] += `<i>${Parser.attackTypeToFull(entry.attackType)}:</i> `;
    const len = entry.attackEntries.length;
    for (let i = 0; i < len; ++i)
      this._recursiveRender(entry.attackEntries[i], textStack, meta);
    textStack[0] += ` <i>Hit:</i> `;
    const len2 = entry.hitEntries.length;
    for (let i = 0; i < len2; ++i)
      this._recursiveRender(entry.hitEntries[i], textStack, meta);
    this._renderSuffix(entry, textStack, meta, options);
  };

  this._renderItem = function(entry, textStack, meta, options) {
    this._renderPrefix(entry, textStack, meta, options);
    textStack[0] += `<p><span class="font-bold list-item-title">${this.render(
      entry.name,
    )}</span> `;
    if (entry.entry) this._recursiveRender(entry.entry, textStack, meta);
    else if (entry.entries) {
      const len = entry.entries.length;
      for (let i = 0; i < len; ++i)
        this._recursiveRender(entry.entries[i], textStack, meta, {
          prefix: i > 0 ? `<span class="rd__p-cont-indent">` : '',
          suffix: i > 0 ? '</span>' : '',
        });
    }
    textStack[0] += '</p>';
    this._renderSuffix(entry, textStack, meta, options);
  };

  this._renderItemSub = function(entry, textStack, meta, options) {
    this._renderPrefix(entry, textStack, meta, options);
    this._recursiveRender(entry.entry, textStack, meta, {
      prefix: `<p><span class="italic list-item-title">${entry.name}</span> `,
      suffix: '</p>',
    });
    this._renderSuffix(entry, textStack, meta, options);
  };

  this._renderItemSpell = function(entry, textStack, meta, options) {
    this._renderPrefix(entry, textStack, meta, options);
    this._recursiveRender(entry.entry, textStack, meta, {
      prefix: `<p>${entry.name} `,
      suffix: '</p>',
    });
    this._renderSuffix(entry, textStack, meta, options);
  };

  this._renderDataCreature = function(entry, textStack, meta, options) {
    this._renderPrefix(entry, textStack, meta, options);
    this._renderDataHeader(textStack, entry.dataCreature.name);
    textStack[0] += Renderer.monster.getCompactRenderedString(
      entry.dataCreature,
      this,
    );
    this._renderDataFooter(textStack);
    this._renderSuffix(entry, textStack, meta, options);
  };

  this._renderDataSpell = function(entry, textStack, meta, options) {
    this._renderPrefix(entry, textStack, meta, options);
    this._renderDataHeader(textStack, entry.dataSpell.name);
    textStack[0] += Renderer.spell.getCompactRenderedString(entry.dataSpell);
    this._renderDataFooter(textStack);
    this._renderSuffix(entry, textStack, meta, options);
  };

  this._renderDataTrapHazard = function(entry, textStack, meta, options) {
    this._renderPrefix(entry, textStack, meta, options);
    this._renderDataHeader(textStack, entry.dataTrapHazard.name);
    textStack[0] += Renderer.traphazard.getCompactRenderedString(
      entry.dataTrapHazard,
    );
    this._renderDataFooter(textStack);
    this._renderSuffix(entry, textStack, meta, options);
  };

  this._renderDataHeader = function(textStack, name) {
    textStack[0] += `<table class="rd__b-data">`;
    textStack[0] += `<thead><tr><th class="rd__data-embed-header" colspan="6" onclick="((ele) => {
                          $(ele).find('.rd__data-embed-name').toggle();
                          $(ele).find('.rd__data-embed-toggle').text($(ele).text().includes('+') ? '[\u2013]' : '[+]');
                          $(ele).closest('table').find('tbody').toggle()
                      })(this)"><span style="display: none;" class="rd__data-embed-name">${name}</span><span class="rd__data-embed-toggle">[\u2013]</span></th></tr></thead><tbody>`;
  };

  this._renderDataFooter = function(textStack) {
    textStack[0] += `</tbody></table>`;
  };

  this._renderFlowchart = function(entry, textStack, meta, options) {
    // TODO style this
    textStack[0] += `<div class="rd__wrp-flowchart">`;
    const len = entry.blocks.length;
    for (let i = 0; i < len; ++i) {
      this._recursiveRender(entry.blocks[i], textStack, meta, options);
      if (i !== len - 1) {
        textStack[0] += `<div class="rd__s-v-flow"></div>`;
      }
    }
    textStack[0] += `</div>`;
  };

  this._renderFlowBlock = function(entry, textStack, meta, options) {
    const dataString = this._renderEntriesSubtypes_getDataString(entry);
    textStack[0] += `<${this.wrapperTag} class="rd__b-flow" ${dataString}>`;
    if (entry.name != null) {
      this._handleTrackTitles(entry.name);
      this._handleTrackDepth(entry, 1);
      textStack[0] += `<span class="rd__h rd__h--2-flow-block" data-title-index="${this
        ._headerIndex++}" ${this._getEnumeratedTitleRel(
        entry.name,
      )}><span class="text-xl">${entry.name}</span></span>`;
    }
    if (entry.entries) {
      const len = entry.entries.length;
      for (let i = 0; i < len; ++i) {
        const cacheDepth = meta.depth;
        meta.depth = 2;
        this._recursiveRender(entry.entries[i], textStack, meta, {
          prefix: '<p>',
          suffix: '</p>',
        });
        meta.depth = cacheDepth;
      }
    }
    textStack[0] += `<div class="float-clear"></div>`;
    textStack[0] += `</${this.wrapperTag}>`;
  };

  this._renderHr = function(entry, textStack, meta, options) {
    textStack[0] += `<hr class="rd__hr">`;
  };

  this._getStyleClass = function(source) {
    const outList = [];
    return outList.join(' ');
  };

  this._renderString = function(entry, textStack, meta, options) {
    const tagSplit = Renderer.splitByTags(entry);
    const len = tagSplit.length;
    for (let i = 0; i < len; ++i) {
      const s = tagSplit[i];
      if (!s) continue;
      if (s.startsWith('@')) {
        const [tag, text] = Renderer.splitFirstSpace(s);
        this._renderString_renderTag(textStack, meta, options, tag, text);
      } else textStack[0] += s;
    }
  };

  this._renderString_renderTag = function(textStack, meta, options, tag, text) {
    switch (tag) {
      // BASIC STYLES/TEXT ///////////////////////////////////////////////////////////////////////////////
      case '@b':
      case '@bold':
        textStack[0] += `<b>`;
        this._recursiveRender(text, textStack, meta);
        textStack[0] += `</b>`;
        break;
      case '@i':
      case '@italic':
        textStack[0] += `<i>`;
        this._recursiveRender(text, textStack, meta);
        textStack[0] += `</i>`;
        break;
      case '@s':
      case '@strike':
        textStack[0] += `<s>`;
        this._recursiveRender(text, textStack, meta);
        textStack[0] += `</s>`;
        break;
      case '@u':
      case '@underline':
        textStack[0] += `<u>`;
        this._recursiveRender(text, textStack, meta);
        textStack[0] += `</u>`;
        break;
      case '@note':
        textStack[0] += `<i class="ve-muted">`;
        this._recursiveRender(text, textStack, meta);
        textStack[0] += `</i>`;
        break;
      case '@atk':
        textStack[0] += `<i>${Renderer.attackTagToFull(text)}</i>`;
        break;
      case '@h':
        textStack[0] += `<i>Hit:</i> `;
        break;
      case '@color': {
        const [toDisplay, color] = Renderer.splitTagByPipe(text);
        const scrubbedColor = BrewUtil.getValidColor(color);

        textStack[0] += `<span style="color: #${scrubbedColor}">`;
        this._recursiveRender(toDisplay, textStack, meta);
        textStack[0] += `</span>`;
        break;
      }
      case '@highlight': {
        const [toDisplay, color] = Renderer.splitTagByPipe(text);
        const scrubbedColor = color ? BrewUtil.getValidColor(color) : null;

        textStack[0] += scrubbedColor
          ? `<span style="background-color: #${scrubbedColor}">`
          : `<span class="rd__highlight">`;
        textStack[0] += toDisplay;
        textStack[0] += `</span>`;
        break;
      }

      // Comic styles ////////////////////////////////////////////////////////////////////////////////////
      case '@comic':
        textStack[0] += `<span class="rd__comic">`;
        this._recursiveRender(text, textStack, meta);
        textStack[0] += `</span>`;
        break;
      case '@comicH1':
        textStack[0] += `<span class="rd__comic rd__comic--h1">`;
        this._recursiveRender(text, textStack, meta);
        textStack[0] += `</span>`;
        break;
      case '@comicH2':
        textStack[0] += `<span class="rd__comic rd__comic--h2">`;
        this._recursiveRender(text, textStack, meta);
        textStack[0] += `</span>`;
        break;
      case '@comicH3':
        textStack[0] += `<span class="rd__comic rd__comic--h3">`;
        this._recursiveRender(text, textStack, meta);
        textStack[0] += `</span>`;
        break;
      case '@comicH4':
        textStack[0] += `<span class="rd__comic rd__comic--h4">`;
        this._recursiveRender(text, textStack, meta);
        textStack[0] += `</span>`;
        break;
      case '@comicNote':
        textStack[0] += `<span class="rd__comic rd__comic--note">`;
        this._recursiveRender(text, textStack, meta);
        textStack[0] += `</span>`;
        break;

      // DCs /////////////////////////////////////////////////////////////////////////////////////////////
      case '@dc': {
        textStack[0] += `DC <span class="rd__dc">${text}</span>`;
        break;
      }

      // DICE ////////////////////////////////////////////////////////////////////////////////////////////
      case '@dice':
      case '@damage':
      case '@hit':
      case '@d20':
      case '@chance':
      case '@recharge': {
        const fauxEntry = {
          type: 'dice',
          rollable: true,
        };
        const [
          rollText,
          displayText,
          name,
          ...others
        ] = Renderer.splitTagByPipe(text);
        if (displayText) fauxEntry.displayText = displayText;
        if (name) fauxEntry.name = name;

        switch (tag) {
          case '@dice': {
            // format: {@dice 1d2 + 3 + 4d5 - 6}
            fauxEntry.toRoll = rollText;
            if (!displayText && rollText.includes(';'))
              fauxEntry.displayText = rollText.replace(/;/g, '/');
            if (
              (!fauxEntry.displayText && rollText.includes('#$')) ||
              (fauxEntry.displayText && fauxEntry.displayText.includes('#$'))
            )
              fauxEntry.displayText = (
                fauxEntry.displayText || rollText
              ).replace(/#\$prompt_number[^$]*\$#/g, '(n)');
            this._recursiveRender(fauxEntry, textStack, meta);
            break;
          }
          case '@damage': {
            fauxEntry.toRoll = rollText;
            fauxEntry.subType = 'damage';
            this._recursiveRender(fauxEntry, textStack, meta);
            break;
          }
          case '@d20':
          case '@hit': {
            // format: {@hit +1} or {@hit -2}
            let mod;
            if (!isNaN(rollText)) {
              const n = Number(rollText);
              mod = `${n >= 0 ? '+' : ''}${n}`;
            } else mod = rollText;
            fauxEntry.displayText = fauxEntry.displayText || mod;
            fauxEntry.toRoll = `1d20${mod}`;
            fauxEntry.subType = 'd20';
            fauxEntry.d20mod = mod;
            this._recursiveRender(fauxEntry, textStack, meta);
            break;
          }
          case '@chance': {
            // format: {@chance 25|display text|rollbox rollee name}
            fauxEntry.toRoll = `1d100`;
            fauxEntry.successThresh = Number(rollText);
            this._recursiveRender(fauxEntry, textStack, meta);
            break;
          }
          case '@recharge': {
            // format: {@recharge 4|flags}
            const flags = displayText ? displayText.split('') : null; // "m" for "minimal" = no brackets
            fauxEntry.toRoll = '1d6';
            const asNum = Number(rollText || 6);
            fauxEntry.successThresh = 7 - asNum;
            fauxEntry.successMax = 6;
            textStack[0] += `${
              flags && flags.includes('m') ? '' : '('
            }Recharge `;
            fauxEntry.displayText = `${asNum}${asNum < 6 ? `\u20136` : ''}`;
            this._recursiveRender(fauxEntry, textStack, meta);
            textStack[0] += `${flags && flags.includes('m') ? '' : ')'}`;
            break;
          }
        }

        break;
      }

      case '@hitYourSpellAttack': {
        const fauxEntry = {
          type: 'dice',
          rollable: true,
          subType: 'd20',
          displayText: 'your spell attack modifier',
          toRoll: `1d20 + #$prompt_number:title=Enter your Spell Attack Modifier$#`,
        };
        this._recursiveRender(fauxEntry, textStack, meta);
        break;
      }

      // SCALE DICE //////////////////////////////////////////////////////////////////////////////////////
      case '@scaledice':
      case '@scaledamage': {
        const fauxEntry = Renderer.parseScaleDice(tag, text);
        this._recursiveRender(fauxEntry, textStack, meta);
        break;
      }

      // LINKS ///////////////////////////////////////////////////////////////////////////////////////////
      case '@filter': {
        // format: {@filter Warlock Spells|spells|level=1;2|class=Warlock}
        const [displayText, page, ...filters] = Renderer.splitTagByPipe(text);

        let customHash;
        const fauxEntry = {
          type: 'link',
          text: displayText,
          href: {
            type: 'internal',
            path: `${page}.html`,
            hash: HASH_BLANK,
            hashPreEncoded: true,
            subhashes: filters
              .map(f => {
                const [fName, fVals, fMeta, fOpts] = f
                  .split('=')
                  .map(s => s.trim());
                const isBoxData = fName.startsWith('fb');
                const key = isBoxData
                  ? fName
                  : `flst${UrlUtil.encodeForHash(fName)}`;

                let value;
                // special cases for "search" and "hash" keywords
                if (isBoxData) {
                  return {
                    key,
                    value: fVals,
                    preEncoded: true,
                  };
                } else if (fName === 'search') {
                  // "search" as a filter name is hackily converted to a box meta option
                  return {
                    key: VeCt.FILTER_BOX_SUB_HASH_SEARCH_PREFIX,
                    value: UrlUtil.encodeForHash(fVals),
                    preEncoded: true,
                  };
                } else if (fName === 'hash') {
                  customHash = fVals;
                  return null;
                } else if (fVals.startsWith('[') && fVals.endsWith(']')) {
                  // range
                  const [min, max] = fVals
                    .substring(1, fVals.length - 1)
                    .split(';')
                    .map(it => it.trim());
                  if (max == null) {
                    // shorthand version, with only one value, becomes min _and_ max
                    value = [`min=${min}`, `max=${min}`].join(
                      HASH_SUB_LIST_SEP,
                    );
                  } else {
                    value = [min ? `min=${min}` : '', max ? `max=${max}` : '']
                      .filter(Boolean)
                      .join(HASH_SUB_LIST_SEP);
                  }
                } else {
                  value = fVals
                    .split(';')
                    .map(s => s.trim())
                    .filter(s => s)
                    .map(s => {
                      const spl = s.split('!');
                      if (spl.length === 2)
                        return `${UrlUtil.encodeForHash(spl[1])}=2`;
                      return `${UrlUtil.encodeForHash(s)}=1`;
                    })
                    .join(HASH_SUB_LIST_SEP);
                }

                const out = [
                  {
                    key,
                    value,
                    preEncoded: true,
                  },
                ];

                if (fMeta) {
                  out.push({
                    key: `flmt${UrlUtil.encodeForHash(fName)}`,
                    value: fMeta,
                    preEncoded: true,
                  });
                }

                if (fOpts) {
                  out.push({
                    key: `flop${UrlUtil.encodeForHash(fName)}`,
                    value: fOpts,
                    preEncoded: true,
                  });
                }

                return out;
              })
              .flat()
              .filter(Boolean),
          },
        };

        if (customHash) fauxEntry.href.hash = customHash;

        this._recursiveRender(fauxEntry, textStack, meta);

        break;
      }
      case '@link': {
        const [displayText, url] = Renderer.splitTagByPipe(text);
        let outUrl = url == null ? displayText : url;
        if (!outUrl.startsWith('http')) outUrl = `http://${outUrl}`; // avoid HTTPS, as the D&D homepage doesn't support it
        const fauxEntry = {
          type: 'link',
          href: {
            type: 'external',
            url: outUrl,
          },
          text: displayText,
        };
        this._recursiveRender(fauxEntry, textStack, meta);

        break;
      }
      case '@5etools': {
        const [displayText, page, hash] = Renderer.splitTagByPipe(text);
        const fauxEntry = {
          type: 'link',
          href: {
            type: 'internal',
            path: page,
          },
          text: displayText,
        };
        if (hash) {
          fauxEntry.hash = hash;
          fauxEntry.hashPreEncoded = true;
        }
        this._recursiveRender(fauxEntry, textStack, meta);

        break;
      }

      // OTHER HOVERABLES ////////////////////////////////////////////////////////////////////////////////
      // case '@footnote': {
      //   const [displayText, footnoteText, optTitle] = Renderer.splitTagByPipe(
      //     text,
      //   );
      //   const hoverMeta = Renderer.hover.getMakePredefinedHover({
      //     type: 'entries',
      //     name: optTitle ? optTitle.toTitleCase() : 'Footnote',
      //     entries: [footnoteText, optTitle ? `{@note ${optTitle}}` : ''].filter(
      //       Boolean,
      //     ),
      //   });
      //   textStack[0] += `<span class="help" ${hoverMeta.html}>`;
      //   this._recursiveRender(displayText, textStack, meta);
      //   textStack[0] += `</span>`;

      //   break;
      // }
      // case '@homebrew': {
      //   const [newText, oldText] = Renderer.splitTagByPipe(text);
      //   const tooltipEntries = [];
      //   if (newText && oldText) {
      //     tooltipEntries.push(
      //       '{@b This is a homebrew addition, replacing the following:}',
      //     );
      //   } else if (newText) {
      //     tooltipEntries.push('{@b This is a homebrew addition.}');
      //   } else if (oldText) {
      //     tooltipEntries.push(
      //       '{@b The following text has been removed with this homebrew:}',
      //     );
      //   }
      //   if (oldText) {
      //     tooltipEntries.push(oldText);
      //   }
      //   const hoverMeta = Renderer.hover.getMakePredefinedHover({
      //     type: 'entries',
      //     name: 'Homebrew Modifications',
      //     entries: tooltipEntries,
      //   });
      //   textStack[0] += `<span class="homebrew-inline" ${hoverMeta.html}>`;
      //   this._recursiveRender(newText || '[...]', textStack, meta);
      //   textStack[0] += `</span>`;

      //   break;
      // }
      case '@skill':
      case '@sense': {
        const expander = (() => {
          switch (tag) {
            case '@skill':
              return Parser.skillToExplanation;
            case '@sense':
              return Parser.senseToExplanation;
          }
        })();
        const [name, displayText] = Renderer.splitTagByPipe(text);
        // const hoverMeta = Renderer.hover.getMakePredefinedHover({
        //   type: 'entries',
        //   name: name.toTitleCase(),
        //   entries: expander(name),
        // });
        textStack[0] += `${displayText || name}`;

        break;
      }
      // case '@area': {
      //   const [compactText, areaId, flags, ...others] = Renderer.splitTagByPipe(
      //     text,
      //   );

      //   const renderText =
      //     flags && flags.includes('x')
      //       ? compactText
      //       : `${flags && flags.includes('u') ? 'A' : 'a'}rea ${compactText}`;

      //   if (typeof BookUtil === 'undefined') {
      //     // for the roll20 script
      //     textStack[0] += renderText;
      //   } else {
      //     const area = BookUtil.curRender.headerMap[areaId] || {
      //       entry: { name: '' },
      //     }; // default to prevent rendering crash on bad tag
      //     // const hoverMeta = Renderer.hover.getMakePredefinedHover(area.entry, {
      //     //   isLargeBookContent: true,
      //     //   depth: area.depth,
      //     // });
      //     textStack[0] += `<a href="#${BookUtil.curRender.curBookId},${
      //       area.chapter
      //     },${UrlUtil.encodeForHash(area.entry.name)},0">${renderText}</a>`;
      //   }

      //   break;
      // }

      // HOMEBREW LOADING ////////////////////////////////////////////////////////////////////////////////
      case '@loader': {
        const { name, path } = this._renderString_getLoaderTagMeta(text);
        textStack[0] += `<span onclick="BrewUtil.handleLoadbrewClick(this, '${path.escapeQuotes()}', '${name.escapeQuotes()}')" class="rd__wrp-loadbrew--ready" title="Click to install homebrew">${name}<span class="glyphicon glyphicon-download-alt rd__loadbrew-icon rd__loadbrew-icon"></span></span>`;
        break;
      }

      // CONTENT TAGS ////////////////////////////////////////////////////////////////////////////////////
      case '@book':
      case '@adventure': {
        // format: {@tag Display Text|DMG< |chapter< |section >< |number > >}
        const page = tag === '@book' ? 'book.html' : 'adventure.html';
        const [
          displayText,
          book,
          chapter,
          section,
          rawNumber,
        ] = Renderer.splitTagByPipe(text);
        const number = rawNumber || 0;
        const hash = `${book}${
          chapter
            ? `${HASH_PART_SEP}${chapter}${
                section
                  ? `${HASH_PART_SEP}${UrlUtil.encodeForHash(section)}${
                      number != null
                        ? `${HASH_PART_SEP}${UrlUtil.encodeForHash(number)}`
                        : ''
                    }`
                  : ''
              }`
            : ''
        }`;
        const fauxEntry = {
          type: 'link',
          href: {
            type: 'internal',
            path: page,
            hash,
            hashPreEncoded: true,
          },
          text: displayText,
        };
        this._recursiveRender(fauxEntry, textStack, meta);

        break;
      }

      case '@deity': {
        const [
          name,
          pantheon,
          source,
          displayText,
          ...others
        ] = Renderer.splitTagByPipe(text);
        const hash = `${name}${pantheon ? `${HASH_LIST_SEP}${pantheon}` : ''}${
          source ? `${HASH_LIST_SEP}${source}` : ''
        }`;

        const fauxEntry = {
          type: 'link',
          href: {
            type: 'internal',
            hash,
          },
          text: displayText || name,
        };

        fauxEntry.href.path = UrlUtil.PG_DEITIES;
        if (!pantheon)
          fauxEntry.href.hash += `${HASH_LIST_SEP}forgotten realms`;
        if (!source) fauxEntry.href.hash += `${HASH_LIST_SEP}${SRC_PHB}`;
        fauxEntry.href.hover = {
          page: UrlUtil.PG_DEITIES,
          source: source || SRC_PHB,
        };
        this._recursiveRender(fauxEntry, textStack, meta);

        break;
      }

      case '@classFeature': {
        const unpacked = DataUtil.class.unpackUidClassFeature(text);

        // const classPageHash = `${UrlUtil.URL_TO_HASH_BUILDER[
        //   UrlUtil.PG_CLASSES
        // ]({
        //   name: unpacked.className,
        //   source: unpacked.classSource,
        // })}${HASH_PART_SEP}${UrlUtil.getClassesPageStatePart({
        //   feature: { ixLevel: unpacked.level - 1, ixFeature: 0 },
        // })}`;

        const fauxEntry = {
          type: 'link',
          href: {
            type: 'internal',
            path: UrlUtil.PG_CLASSES,
            // hash: classPageHash,
            hashPreEncoded: true,
            // hover: {
            //   page: 'classfeature',
            //   source: unpacked.source,
            //   hash: UrlUtil.URL_TO_HASH_BUILDER['classFeature'](unpacked),
            //   hashPreEncoded: true,
            // },
          },
          text: unpacked.displayText || unpacked.name,
        };

        this._recursiveRender(fauxEntry, textStack, meta);

        break;
      }

      case '@subclassFeature': {
        const unpacked = DataUtil.class.unpackUidSubclassFeature(text);

        // const classPageHash = `${UrlUtil.URL_TO_HASH_BUILDER[
        //   UrlUtil.PG_CLASSES
        // ]({
        //   name: unpacked.className,
        //   source: unpacked.classSource,
        // })}${HASH_PART_SEP}${UrlUtil.getClassesPageStatePart({
        //   feature: { ixLevel: unpacked.level - 1, ixFeature: 0 },
        // })}`;

        const fauxEntry = {
          type: 'link',
          href: {
            type: 'internal',
            path: UrlUtil.PG_CLASSES,
            // hash: classPageHash,
            hashPreEncoded: true,
            // hover: {
            //   page: 'subclassfeature',
            //   source: unpacked.source,
            //   hash: UrlUtil.URL_TO_HASH_BUILDER['subclassFeature'](unpacked),
            //   hashPreEncoded: true,
            // },
          },
          text: unpacked.displayText || unpacked.name,
        };

        this._recursiveRender(fauxEntry, textStack, meta);

        break;
      }

      default: {
        const {
          name,
          source,
          displayText,
          others,
        } = DataUtil.generic.unpackUid(text, tag);
        const hash = `${name}${HASH_LIST_SEP}${source}`;

        const fauxEntry = {
          type: 'link',
          href: {
            type: 'internal',
            hash,
          },
          text: displayText || name,
        };
        switch (tag) {
          case '@spell':
            fauxEntry.href.path = 'spells.html';
            fauxEntry.href.hover = {
              page: UrlUtil.PG_SPELLS,
              source,
            };
            this._recursiveRender(fauxEntry, textStack, meta);
            break;
          case '@item':
            fauxEntry.href.path = 'items.html';
            fauxEntry.href.hover = {
              page: UrlUtil.PG_ITEMS,
              source,
            };
            this._recursiveRender(fauxEntry, textStack, meta);
            break;
          case '@class': {
            fauxEntry.href.hover = {
              page: UrlUtil.PG_CLASSES,
              source,
            };
            if (others.length) {
              const [subclassShortName, subclassSource, featurePart] = others;

              const classStateOpts = {
                subclass: {
                  shortName: subclassShortName.trim(),
                  source: subclassSource
                    ? // Subclass state uses the abbreviated form of the source for URL shortness
                      Parser.sourceJsonToAbv(subclassSource.trim())
                    : SRC_PHB,
                },
              };

              // Don't include the feature part for hovers, as it is unsupported
              const hoverSubhashObj = UrlUtil.unpackSubHash(
                UrlUtil.getClassesPageStatePart(classStateOpts),
              );
              fauxEntry.href.hover.subhashes = [
                {
                  key: 'state',
                  value: hoverSubhashObj.state,
                  preEncoded: true,
                },
              ];

              if (featurePart) {
                const featureParts = featurePart.trim().split('-');
                classStateOpts.feature = {
                  ixLevel: featureParts[0] || '0',
                  ixFeature: featureParts[1] || '0',
                };
              }

              const subhashObj = UrlUtil.unpackSubHash(
                UrlUtil.getClassesPageStatePart(classStateOpts),
              );

              fauxEntry.href.subhashes = [
                {
                  key: 'state',
                  value: subhashObj.state.join(HASH_SUB_LIST_SEP),
                  preEncoded: true,
                },
                { key: 'fltsource', value: 'clear' },
                { key: 'flstmiscellaneous', value: 'clear' },
              ];
            }
            fauxEntry.href.path = 'classes.html';
            this._recursiveRender(fauxEntry, textStack, meta);
            break;
          }
          case '@creature':
            fauxEntry.href.path = 'bestiary.html';
            fauxEntry.href.hover = {
              page: UrlUtil.PG_BESTIARY,
              source,
            };
            // ...|scaledCr}
            if (others.length) {
              const targetCrNum = Parser.crToNumber(others[0]);
              fauxEntry.href.hover.preloadId = `${VeCt.HASH_MON_SCALED}:${targetCrNum}`;
              fauxEntry.href.subhashes = [
                { key: VeCt.HASH_MON_SCALED, value: targetCrNum },
              ];
              fauxEntry.text = displayText || `${name} (CR ${others[0]})`;
            }
            this._recursiveRender(fauxEntry, textStack, meta);
            break;
          case '@condition':
          case '@disease':
          case '@status':
            fauxEntry.href.path = 'conditionsdiseases.html';
            fauxEntry.href.hover = {
              page: UrlUtil.PG_CONDITIONS_DISEASES,
              source,
            };
            this._recursiveRender(fauxEntry, textStack, meta);
            break;
          case '@background':
            fauxEntry.href.path = 'backgrounds.html';
            fauxEntry.href.hover = {
              page: UrlUtil.PG_BACKGROUNDS,
              source,
            };
            this._recursiveRender(fauxEntry, textStack, meta);
            break;
          case '@race':
            fauxEntry.href.path = 'races.html';
            fauxEntry.href.hover = {
              page: UrlUtil.PG_RACES,
              source,
            };
            this._recursiveRender(fauxEntry, textStack, meta);
            break;
          case '@optfeature':
            fauxEntry.href.path = 'optionalfeatures.html';
            fauxEntry.href.hover = {
              page: UrlUtil.PG_OPT_FEATURES,
              source,
            };
            this._recursiveRender(fauxEntry, textStack, meta);
            break;
          case '@reward':
            fauxEntry.href.path = 'rewards.html';
            fauxEntry.href.hover = {
              page: UrlUtil.PG_REWARDS,
              source,
            };
            this._recursiveRender(fauxEntry, textStack, meta);
            break;
          case '@feat':
            fauxEntry.href.path = 'feats.html';
            fauxEntry.href.hover = {
              page: UrlUtil.PG_FEATS,
              source,
            };
            this._recursiveRender(fauxEntry, textStack, meta);
            break;
          case '@psionic':
            fauxEntry.href.path = 'psionics.html';
            fauxEntry.href.hover = {
              page: UrlUtil.PG_PSIONICS,
              source,
            };
            this._recursiveRender(fauxEntry, textStack, meta);
            break;
          case '@object':
            fauxEntry.href.path = 'objects.html';
            fauxEntry.href.hover = {
              page: UrlUtil.PG_OBJECTS,
              source,
            };
            this._recursiveRender(fauxEntry, textStack, meta);
            break;
          case '@boon':
          case '@cult':
            fauxEntry.href.path = 'cultsboons.html';
            fauxEntry.href.hover = {
              page: UrlUtil.PG_CULTS_BOONS,
              source,
            };
            this._recursiveRender(fauxEntry, textStack, meta);
            break;
          case '@trap':
          case '@hazard':
            fauxEntry.href.path = 'trapshazards.html';
            fauxEntry.href.hover = {
              page: UrlUtil.PG_TRAPS_HAZARDS,
              source,
            };
            this._recursiveRender(fauxEntry, textStack, meta);
            break;
          case '@variantrule':
            fauxEntry.href.path = 'variantrules.html';
            fauxEntry.href.hover = {
              page: UrlUtil.PG_VARIANTRULES,
              source,
            };
            this._recursiveRender(fauxEntry, textStack, meta);
            break;
          case '@table':
            fauxEntry.href.path = 'tables.html';
            fauxEntry.href.hover = {
              page: UrlUtil.PG_TABLES,
              source,
            };
            this._recursiveRender(fauxEntry, textStack, meta);
            break;
          case '@vehicle':
            fauxEntry.href.path = UrlUtil.PG_VEHICLES;
            fauxEntry.href.hover = {
              page: UrlUtil.PG_VEHICLES,
              source,
            };
            this._recursiveRender(fauxEntry, textStack, meta);
            break;
          case '@vehupgrade':
            fauxEntry.href.path = UrlUtil.PG_VEHICLES;
            fauxEntry.href.hover = {
              page: UrlUtil.PG_VEHICLES,
              source,
            };
            this._recursiveRender(fauxEntry, textStack, meta);
            break;
          case '@action':
            fauxEntry.href.path = UrlUtil.PG_ACTIONS;
            fauxEntry.href.hover = {
              page: UrlUtil.PG_ACTIONS,
              source,
            };
            this._recursiveRender(fauxEntry, textStack, meta);
            break;
          case '@language':
            fauxEntry.href.path = UrlUtil.PG_LANGUAGES;
            fauxEntry.href.hover = {
              page: UrlUtil.PG_LANGUAGES,
              source,
            };
            this._recursiveRender(fauxEntry, textStack, meta);
            break;
          case '@charoption':
            fauxEntry.href.path = UrlUtil.PG_CHAR_CREATION_OPTIONS;
            fauxEntry.href.hover = {
              page: UrlUtil.PG_CHAR_CREATION_OPTIONS,
              source,
            };
            this._recursiveRender(fauxEntry, textStack, meta);
            break;
        }

        break;
      }
    }
  };

  this._renderPrimitive = function(entry, textStack, meta, options) {
    textStack[0] += entry;
  };

  this._renderLink = function(entry, textStack, meta, options) {
    console.log('LINK', entry, textStack);
    let href = this._renderLink_getHref(entry);

    //TODO Render DetailedEntry Trigger for all links

    if (this._isIternalLinksDisabled && entry.href.type === 'internal') {
      textStack[0] += `<span class="font-bold underline">${this.render(
        entry.text,
      )}</span>`;
    } else {
      textStack[0] += `<a href="${href}" ${
        entry.href.type === 'internal'
          ? ''
          : `target="_blank" rel="noopener noreferrer"`
      }>${this.render(entry.text)}</a>`;
    }
  };

  this._renderLink_getHref = function(entry) {
    let href;
    if (entry.href.type === 'internal') {
      // baseURL is blank by default
      href = `${this.baseUrl}${entry.href.path}#`;
      if (entry.href.hash != null) {
        href += entry.href.hashPreEncoded
          ? entry.href.hash
          : UrlUtil.encodeForHash(entry.href.hash);
      }
      if (entry.href.subhashes != null) {
        for (let i = 0; i < entry.href.subhashes.length; ++i) {
          href += this._renderLink_getSubhashPart(entry.href.subhashes[i]);
        }
      }
    } else if (entry.href.type === 'external') {
      href = entry.href.url;
    }
    return href;
  };

  this._renderLink_getSubhashPart = function(subHash) {
    let out = '';
    if (subHash.preEncoded)
      out += `${HASH_PART_SEP}${subHash.key}${HASH_SUB_KV_SEP}`;
    else
      out += `${HASH_PART_SEP}${UrlUtil.encodeForHash(
        subHash.key,
      )}${HASH_SUB_KV_SEP}`;
    if (subHash.value != null) {
      if (subHash.preEncoded) out += subHash.value;
      else out += UrlUtil.encodeForHash(subHash.value);
    } else {
      // TODO allow list of values
      out += subHash.values
        .map(v => UrlUtil.encodeForHash(v))
        .join(HASH_SUB_LIST_SEP);
    }
    return out;
  };

  /**
   * Helper function to render an entity using this renderer
   * @param entry
   * @param depth
   * @returns {string}
   */
  this.render = function(entry, depth = 0) {
    const tempStack = [];
    this.recursiveRender(entry, tempStack, { depth });
    return tempStack.join('');
  };
}

Renderer.ENTRIES_WITH_CHILDREN = [
  { type: 'section', key: 'entries' },
  { type: 'entries', key: 'entries' },
  { type: 'inset', key: 'entries' },
  { type: 'insetReadaloud', key: 'entries' },
  { type: 'list', key: 'items' },
  { type: 'table', key: 'rows' },
];

Renderer.applyProperties = function(entry, object) {
  const propSplit = Renderer.splitByPropertyInjectors(entry);
  const len = propSplit.length;
  if (len === 1) return entry;

  let textStack = '';

  for (let i = 0; i < len; ++i) {
    const s = propSplit[i];
    if (!s) continue;
    if (s[0] === '=') {
      const [path, modifiers] = s.substring(1).split('/');
      let fromProp = object[path];

      if (modifiers) {
        for (const modifier of modifiers) {
          switch (modifier) {
            case 'a': // render "a"/"an" depending on prop value
              fromProp = Renderer.applyProperties._leadingAn.has(
                fromProp[0].toLowerCase(),
              )
                ? 'an'
                : 'a';
              break;

            case 'l':
              fromProp = fromProp.toLowerCase();
              break; // convert text to lower case
            case 't':
              fromProp = fromProp.toTitleCase();
              break; // title-case text
            case 'u':
              fromProp = fromProp.toUpperCase();
              break; // uppercase text
          }
        }
      }
      textStack += fromProp;
    } else textStack += s;
  }

  return textStack;
};
Renderer.applyProperties._leadingAn = new Set(['a', 'e', 'i', 'o', 'u']);

Renderer._splitByPipeBase = function(leadingCharacter) {
  return function(string) {
    let tagDepth = 0;
    let char, char2;
    const out = [];
    let curStr = '';

    const len = string.length;
    for (let i = 0; i < len; ++i) {
      char = string[i];
      char2 = string[i + 1];

      switch (char) {
        case '{':
          if (char2 === leadingCharacter) tagDepth++;
          curStr += '{';

          break;

        case '}':
          if (tagDepth) tagDepth--;
          curStr += '}';

          break;

        case '|': {
          if (tagDepth) curStr += '|';
          else {
            out.push(curStr);
            curStr = '';
          }
          break;
        }

        default: {
          curStr += char;
          break;
        }
      }
    }

    if (curStr) out.push(curStr);
    return out;
  };
};

Renderer.splitTagByPipe = Renderer._splitByPipeBase('@');

Renderer.applyAllProperties = function(entries, object) {
  const handlers = {
    string: (ident, str) => Renderer.applyProperties(str, object),
  };
  return MiscUtil.getWalker().walk('applyAllProperties', entries, handlers);
};

Renderer.attackTagToFull = function(tagStr) {
  function renderTag(tags) {
    return `${
      tags.includes('m')
        ? 'Melee '
        : tags.includes('r')
        ? 'Ranged '
        : tags.includes('g')
        ? 'Magical '
        : tags.includes('a')
        ? 'Area '
        : ''
    }${tags.includes('w') ? 'Weapon ' : tags.includes('s') ? 'Spell ' : ''}`;
  }

  const tagGroups = tagStr
    .toLowerCase()
    .split(',')
    .map(it => it.trim())
    .filter(it => it)
    .map(it => it.split(''));
  if (tagGroups.length > 1) {
    const seen = new Set(tagGroups.last());
    for (let i = tagGroups.length - 2; i >= 0; --i) {
      tagGroups[i] = tagGroups[i].filter(it => {
        const out = !seen.has(it);
        seen.add(it);
        return out;
      });
    }
  }
  return `${tagGroups.map(it => renderTag(it)).join(' or ')}Attack:`;
};

Renderer.splitFirstSpace = function(string) {
  const firstIndex = string.indexOf(' ');
  return firstIndex === -1
    ? [string, '']
    : [string.substr(0, firstIndex), string.substr(firstIndex + 1)];
};

Renderer._splitByTagsBase = function(leadingCharacter) {
  return function(string) {
    let tagDepth = 0;
    let char, char2;
    const out = [];
    let curStr = '';
    let isLastOpen = false;

    const len = string.length;
    for (let i = 0; i < len; ++i) {
      char = string[i];
      char2 = string[i + 1];

      switch (char) {
        case '{':
          isLastOpen = true;
          if (char2 === leadingCharacter) {
            if (tagDepth++ > 0) {
              curStr += '{';
            } else {
              out.push(curStr.replace(/<VE_LEAD>/g, leadingCharacter));
              curStr = leadingCharacter;
              ++i;
            }
          } else curStr += '{';
          break;

        case '}':
          isLastOpen = false;
          if (tagDepth === 0) {
            curStr += '}';
          } else if (--tagDepth === 0) {
            out.push(curStr.replace(/<VE_LEAD>/g, leadingCharacter));
            curStr = '';
          } else curStr += '}';
          break;

        case leadingCharacter: {
          if (!isLastOpen) curStr += '<VE_LEAD>';
          else curStr += leadingCharacter;
          break;
        }

        default:
          isLastOpen = false;
          curStr += char;
          break;
      }
    }

    if (curStr) out.push(curStr.replace(/<VE_LEAD>/g, leadingCharacter));

    return out;
  };
};

Renderer.splitByTags = Renderer._splitByTagsBase('@');
Renderer.splitByPropertyInjectors = Renderer._splitByTagsBase('=');

Renderer.getEntryDice = function(entry, name) {
  const toDisplay = Renderer.getEntryDiceDisplayText(entry);
  return toDisplay;
};

Renderer.legacyDiceToString = function(array) {
  let stack = '';
  array.forEach(r => {
    stack += `${r.neg ? '-' : stack === '' ? '' : '+'}${r.number || 1}d${
      r.faces
    }${r.mod ? (r.mod > 0 ? `+${r.mod}` : r.mod) : ''}`;
  });
  return stack;
};

Renderer.getEntryDiceDisplayText = function(entry) {
  function getDiceAsStr() {
    if (entry.successThresh) return `${entry.successThresh} percent`;
    else if (typeof entry.toRoll === 'string') return entry.toRoll;
    else {
      // handle legacy format
      return Renderer.legacyDiceToString(entry.toRoll);
    }
  }

  return entry.displayText ? entry.displayText : getDiceAsStr();
};

Renderer.parseScaleDice = function(tag, text) {
  // format: {@scaledice 2d6;3d6|2-8,9|1d6|psi} (or @scaledamage)
  const [baseRoll, progression, addPerProgress, renderMode] = text.split('|');
  const progressionParse = MiscUtil.parseNumberRange(progression, 1, 9);
  const baseLevel = Math.min(...progressionParse);
  const options = {};
  const isMultableDice = /^(\d+)d(\d+)$/i.exec(addPerProgress);

  const getSpacing = () => {
    let diff = null;
    const sorted = [...progressionParse].sort(SortUtil.ascSort);
    for (let i = 1; i < sorted.length; ++i) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      if (diff == null) diff = curr - prev;
      else if (curr - prev !== diff) return null;
    }
    return diff;
  };

  const spacing = getSpacing();
  progressionParse.forEach(k => {
    const offset = k - baseLevel;
    if (isMultableDice && spacing != null) {
      options[k] = offset
        ? `${Number(isMultableDice[1]) * (offset / spacing)}d${
            isMultableDice[2]
          }`
        : '';
    } else {
      options[k] = offset
        ? [...new Array(Math.floor(offset / spacing))]
            .map(_ => addPerProgress)
            .join('+')
        : '';
    }
  });

  const out = {
    type: 'dice',
    rollable: true,
    toRoll: baseRoll,
    displayText: addPerProgress,
    prompt: {
      entry: renderMode === 'psi' ? 'Spend Psi Points...' : 'Cast at...',
      mode: renderMode,
      options,
    },
  };
  if (tag === '@scaledamage') out.subType = 'damage';

  return out;
};

Renderer.prototype.getAbilityData = function(abArr) {
  function doRenderOuter(abObj) {
    const mainAbs = [];
    const asCollection = [];
    const areNegative = [];
    const toConvertToText = [];
    const toConvertToShortText = [];

    if (abObj != null) {
      handleAllAbilities(abObj);
      handleAbilitiesChoose();
      return new Renderer._AbilityData(
        toConvertToText.join('; '),
        toConvertToShortText.join('; '),
        asCollection,
        areNegative,
      );
    }

    return new Renderer._AbilityData('', '', [], []);

    function handleAllAbilities(abObj, targetList) {
      MiscUtil.copy(Parser.ABIL_ABVS)
        .sort((a, b) => SortUtil.ascSort(abObj[b] || 0, abObj[a] || 0))
        .forEach(shortLabel => handleAbility(abObj, shortLabel, targetList));
    }

    function handleAbility(abObj, shortLabel, optToConvertToTextStorage) {
      if (abObj[shortLabel] != null) {
        const isNegMod = abObj[shortLabel] < 0;
        const toAdd = `${shortLabel.uppercaseFirst()} ${isNegMod ? '' : '+'}${
          abObj[shortLabel]
        }`;

        if (optToConvertToTextStorage) {
          optToConvertToTextStorage.push(toAdd);
        } else {
          toConvertToText.push(toAdd);
          toConvertToShortText.push(toAdd);
        }

        mainAbs.push(shortLabel.uppercaseFirst());
        asCollection.push(shortLabel);
        if (isNegMod) areNegative.push(shortLabel);
      }
    }

    function handleAbilitiesChoose() {
      if (abObj.choose != null) {
        const ch = abObj.choose;
        let outStack = '';
        if (ch.weighted) {
          const w = ch.weighted;
          const areIncreaseShort = [];
          const areIncrease = w.weights
            .filter(it => it >= 0)
            .sort(SortUtil.ascSort)
            .reverse()
            .map(it => {
              areIncreaseShort.push(`+${it}`);
              return `one ability to increase by ${it}`;
            });
          const areReduceShort = [];
          const areReduce = w.weights
            .filter(it => it < 0)
            .map(it => -it)
            .sort(SortUtil.ascSort)
            .map(it => {
              areReduceShort.push(`-${it}`);
              return `one ability to decrease by ${it}`;
            });
          const froms = w.from.map(it => it.uppercaseFirst());
          const startText =
            froms.length === 6
              ? `Choose `
              : `From ${froms.joinConjunct(', ', ' and ')} choose `;
          toConvertToText.push(
            `${startText}${areIncrease
              .concat(areReduce)
              .joinConjunct(', ', ' and ')}`,
          );
          toConvertToShortText.push(
            `${
              froms.length === 6 ? 'Any combination ' : ''
            }${areIncreaseShort.concat(areReduceShort).join('/')}${
              froms.length === 6 ? '' : ` from ${froms.join('/')}`
            }`,
          );
        } else {
          const allAbilities = ch.from.length === 6;
          const allAbilitiesWithParent = isAllAbilitiesWithParent(ch);
          let amount = ch.amount === undefined ? 1 : ch.amount;
          amount = (amount < 0 ? '' : '+') + amount;
          if (allAbilities) {
            outStack += 'any ';
          } else if (allAbilitiesWithParent) {
            outStack += 'any other ';
          }
          if (ch.count != null && ch.count > 1) {
            outStack += `${Parser.numberToText(ch.count)} `;
          }
          if (allAbilities || allAbilitiesWithParent) {
            outStack += `${ch.count > 1 ? 'unique ' : ''}${amount}`;
          } else {
            for (let j = 0; j < ch.from.length; ++j) {
              let suffix = '';
              if (ch.from.length > 1) {
                if (j === ch.from.length - 2) {
                  suffix = ' or ';
                } else if (j < ch.from.length - 2) {
                  suffix = ', ';
                }
              }
              let thsAmount = ` ${amount}`;
              if (ch.from.length > 1) {
                if (j !== ch.from.length - 1) {
                  thsAmount = '';
                }
              }
              outStack += ch.from[j].uppercaseFirst() + thsAmount + suffix;
            }
          }
        }

        if (outStack.trim()) {
          toConvertToText.push(`Choose ${outStack}`);
          toConvertToShortText.push(outStack.uppercaseFirst());
        }
      }
    }

    function isAllAbilitiesWithParent(chooseAbs) {
      const tempAbilities = [];
      for (let i = 0; i < mainAbs.length; ++i) {
        tempAbilities.push(mainAbs[i].toLowerCase());
      }
      for (let i = 0; i < chooseAbs.from.length; ++i) {
        const ab = chooseAbs.from[i].toLowerCase();
        if (!tempAbilities.includes(ab)) tempAbilities.push(ab);
        if (!asCollection.includes(ab.toLowerCase))
          asCollection.push(ab.toLowerCase());
      }
      return tempAbilities.length === 6;
    }
  }

  const outerStack = (abArr || [null]).map(it => doRenderOuter(it));
  if (outerStack.length <= 1) return outerStack[0];
  return new Renderer._AbilityData(
    `Choose one of: ${outerStack
      .map((it, i) => `(${Parser.ALPHABET[i].toLowerCase()}) ${it.asText}`)
      .join(' ')}`,
    `One from: ${outerStack
      .map((it, i) => `(${Parser.ALPHABET[i].toLowerCase()}) ${it.asTextShort}`)
      .join(' ')}`,
    [...new Set(outerStack.map(it => it.asCollection).flat())],
    [...new Set(outerStack.map(it => it.areNegative).flat())],
  );
};

Renderer._AbilityData = function(
  asText,
  asTextShort,
  asCollection,
  areNegative,
) {
  this.asText = asText;
  this.asTextShort = asTextShort;
  this.asCollection = asCollection;
  this.areNegative = areNegative;
};

Renderer.utils = {
  getBorderTr: optText => {
    return `<tr><th class="border" colspan="6">${optText || ''}</th></tr>`;
  },

  getDividerTr: () => {
    return `<tr><td class="divider" colspan="6"><div></div></td></tr>`;
  },

  getSourceSubText(it) {
    return it.sourceSub ? ` \u2014 ${it.sourceSub}` : '';
  },

  /**
   * @param it Entity to render the name row for.
   * @param [opts] Options object.
   * @param [opts.prefix] Prefix to display before the name.
   * @param [opts.suffix] Suffix to display after the name.
   * @param [opts.pronouncePart] Suffix to display after the name.
   * @param [opts.extraThClasses] Additional TH classes to include.
   * @param [opts.page] The hover page for this entity.
   */
  getNameTr: (it, opts) => {
    opts = opts || {};
    return `<tr>
              <th class="rnd-name name ${
                opts.extraThClasses ? opts.extraThClasses.join(' ') : ''
              }" colspan="6">
                  <div class="name-inner">
                      <div class="flex flex-col">
                          <span class="font-bold stats-name">${opts.prefix ||
                            ''}${it._displayName || it.name}${opts.suffix ||
      ''}</span>
                      </div>
                      <span class="stats-source flex justify-end">
                          <span class="help--subtle ${
                            it.source
                              ? `${Parser.sourceJsonToColor(
                                  it.source,
                                )}" title="${Parser.sourceJsonToFull(
                                  it.source,
                                )}${Renderer.utils.getSourceSubText(it)}`
                              : ''
                          }">${
      it.source ? Parser.sourceJsonToAbv(it.source) : ''
    }</span>
                          ${
                            it.page > 0
                              ? ` <span class="rd__stats-name-page ml-1" title="Page ${it.page}">p${it.page}</span>`
                              : ''
                          }
                      </span>
                  </div>
              </th>
          </tr>`;
  },

  getExcludedTr(it, dataProp) {
    if (!ExcludeUtil.isInitialised) return '';
    const isExcluded = ExcludeUtil.isExcluded(it.name, dataProp, it.source);
    return isExcluded
      ? `<tr><td colspan="6" class="pt-3 text-center text-danger"><b><i>Warning: This content has been blacklisted.</i></b></td></tr>`
      : '';
  },

  getPageTr: it => {
    return `<td colspan=6>${Renderer.utils._getPageTrText(it)}</td>`;
  },

  _getPageTrText: it => {
    function getAltSourceText(prop, introText) {
      if (!it[prop] || !it[prop].length) return '';

      return `${introText} ${it[prop]
        .map(as => {
          if (as.entry) return Renderer.get().render(as.entry);
          else {
            return `<i title="${Parser.sourceJsonToFull(
              as.source,
            )}">${Parser.sourceJsonToAbv(as.source)}</i>${
              as.page > 0 ? `, page ${as.page}` : ''
            }`;
          }
        })
        .join('; ')}`;
    }

    const sourceSub = Renderer.utils.getSourceSubText(it);
    const baseText =
      it.page > 0
        ? `<b>Source:</b> <i title="${Parser.sourceJsonToFull(
            it.source,
          )}${sourceSub}">${Parser.sourceJsonToAbv(
            it.source,
          )}${sourceSub}</i>, page ${it.page}`
        : '';
    const addSourceText = getAltSourceText(
      'additionalSources',
      'Additional information from',
    );
    const otherSourceText = getAltSourceText('otherSources', 'Also found in');
    const srdText = it.srd
      ? `Available in the <span title="Systems Reference Document">SRD</span>${
          typeof it.srd === 'string' ? ` (as &quot;${it.srd}&quot;)` : ''
        }`
      : '';
    const externalSourceText = getAltSourceText(
      'externalSources',
      'External sources:',
    );

    return `${[
      baseText,
      addSourceText,
      otherSourceText,
      srdText,
      externalSourceText,
    ]
      .filter(it => it)
      .join('. ')}${
      baseText &&
      (addSourceText || otherSourceText || srdText || externalSourceText)
        ? '.'
        : ''
    }`;
  },

  getAbilityRoller(statblock, ability) {
    if (statblock[ability] == null) return '\u2014';
    const mod = Parser.getAbilityModifier(statblock[ability]);
    return Renderer.get().render(
      `{@d20 ${mod}|${statblock[ability]} (${mod})|${Parser.attAbvToFull(
        ability,
      )}`,
    );
  },

  HTML_NO_INFO: '<i>No information available.</i>',
  HTML_NO_IMAGES: '<i>No images available.</i>',

  _prereqWeights: {
    level: 0,
    pact: 1,
    patron: 2,
    spell: 3,
    race: 4,
    ability: 5,
    proficiency: 6,
    spellcasting: 7,
    feature: 8,
    item: 9,
    other: 10,
    otherSummary: 11,
    [undefined]: 12,
  },
  getPrerequisiteText: (
    prerequisites,
    isListMode = false,
    blacklistKeys = new Set(),
  ) => {
    if (!prerequisites) return isListMode ? '\u2014' : '';

    const listOfChoices = prerequisites
      .map(pr => {
        return Object.entries(pr)
          .sort(
            ([kA], [kB]) =>
              Renderer.utils._prereqWeights[kA] -
              Renderer.utils._prereqWeights[kB],
          )
          .map(([k, v]) => {
            if (blacklistKeys.has(k)) return false;

            switch (k) {
              case 'level': {
                const isSubclassVisible = v.subclass && v.subclass.visible;
                const isClassVisible =
                  v.class && (v.class.visible || isSubclassVisible); // force the class name to be displayed if there's a subclass being displayed
                if (isListMode) {
                  const shortNameRaw = isClassVisible
                    ? v.class.name.toTitleCase().replace(/[aeiou]/g, '')
                    : null;
                  return `${
                    isClassVisible
                      ? `${shortNameRaw.slice(0, 4)}${
                          isSubclassVisible ? '*' : '.'
                        } `
                      : ''
                  } Lvl ${v.level}`;
                } else {
                  let classPart = '';
                  if (isClassVisible && isSubclassVisible)
                    classPart = ` ${v.class.name} (${v.subclass.name})`;
                  else if (isClassVisible) classPart = ` ${v.class.name}`;
                  else if (isSubclassVisible)
                    classPart = ` &lt;remember to insert class name here&gt; (${v.subclass.name})`; // :^)
                  return `${Parser.getOrdinalForm(v.level)} level${
                    isClassVisible ? ` ${v.class.name}` : ''
                  }`;
                }
              }
              case 'pact':
                return Parser.prereqPactToFull(v);
              case 'patron':
                return isListMode
                  ? `${Parser.prereqPatronToShort(v)} patron`
                  : `${v} patron`;
              case 'spell':
                return isListMode
                  ? v
                      .map(x =>
                        x
                          .split('#')[0]
                          .split('|')[0]
                          .toTitleCase(),
                      )
                      .join('/')
                  : v
                      .map(sp => Parser.prereqSpellToFull(sp))
                      .joinConjunct(', ', ' or ');
              case 'feature':
                return isListMode
                  ? v.map(x => x.toTitleCase()).join('/')
                  : v.joinConjunct(', ', ' or ');
              case 'item':
                return isListMode
                  ? v.map(x => x.toTitleCase()).join('/')
                  : v.joinConjunct(', ', ' or ');
              case 'otherSummary':
                return isListMode
                  ? v.entrySummary || Renderer.stripTags(v.entry)
                  : Renderer.get().render(v.entry);
              case 'other':
                return isListMode ? 'Special' : Renderer.get().render(v);
              case 'race': {
                const parts = v.map((it, i) => {
                  if (isListMode) {
                    return `${it.name.toTitleCase()}${
                      it.subrace != null ? ` (${it.subrace})` : ''
                    }`;
                  } else {
                    const raceName = it.displayEntry
                      ? Renderer.get().render(it.displayEntry)
                      : i === 0
                      ? it.name.toTitleCase()
                      : it.name;
                    return `${raceName}${
                      it.subrace != null ? ` (${it.subrace})` : ''
                    }`;
                  }
                });
                return isListMode
                  ? parts.join('/')
                  : parts.joinConjunct(', ', ' or ');
              }
              case 'ability': {
                // `v` is an array or objects with str/dex/... properties; array is "OR"'d togther, object is "AND"'d together

                let hadMultipleInner = false;
                let hadMultiMultipleInner = false;
                let allValuesEqual = null;

                outer: for (const abMeta of v) {
                  for (const req of Object.values(abMeta)) {
                    if (allValuesEqual == null) allValuesEqual = req;
                    else {
                      if (req !== allValuesEqual) {
                        allValuesEqual = null;
                        break outer;
                      }
                    }
                  }
                }

                const abilityOptions = v.map(abMeta => {
                  if (allValuesEqual) {
                    const abList = Object.keys(abMeta);
                    hadMultipleInner = hadMultipleInner || abList.length > 1;
                    return isListMode
                      ? abList.map(ab => ab.uppercaseFirst()).join(', ')
                      : abList
                          .map(ab => Parser.attAbvToFull(ab))
                          .joinConjunct(', ', ' and ');
                  } else {
                    const groups = {};

                    Object.entries(abMeta).forEach(([ab, req]) => {
                      (groups[req] = groups[req] || []).push(ab);
                    });

                    let isMulti = false;
                    const byScore = Object.entries(groups)
                      .sort(([reqA], [reqB]) =>
                        SortUtil.ascSort(Number(reqB), Number(reqA)),
                      )
                      .map(([req, abs]) => {
                        hadMultipleInner = hadMultipleInner || abs.length > 1;
                        if (abs.length > 1)
                          hadMultiMultipleInner = isMulti = true;

                        abs = abs.sort(SortUtil.ascSortAtts);
                        return isListMode
                          ? `${abs
                              .map(ab => ab.uppercaseFirst())
                              .join(', ')} ${req}+`
                          : `${abs
                              .map(ab => Parser.attAbvToFull(ab))
                              .joinConjunct(', ', ' and ')} ${req} or higher`;
                      });

                    return isListMode
                      ? `${
                          isMulti || byScore.length > 1 ? '(' : ''
                        }${byScore.join(' & ')}${
                          isMulti || byScore.length > 1 ? ')' : ''
                        }`
                      : isMulti
                      ? byScore.joinConjunct('; ', ' and ')
                      : byScore.joinConjunct(', ', ' and ');
                  }
                });

                // if all values were equal, add the "X+" text at the end, as the options render doesn't include it
                if (isListMode) {
                  return `${abilityOptions.join('/')}${
                    allValuesEqual != null ? ` ${allValuesEqual}+` : ''
                  }`;
                } else {
                  const isComplex =
                    hadMultiMultipleInner ||
                    hadMultipleInner ||
                    allValuesEqual == null;
                  const joined = abilityOptions.joinConjunct(
                    hadMultiMultipleInner
                      ? ' - '
                      : hadMultipleInner
                      ? '; '
                      : ', ',
                    isComplex ? ` <i>or</i> ` : ' or ',
                  );
                  return `${joined}${
                    allValuesEqual != null ? ` 13 or higher` : ''
                  }`;
                }
              }
              case 'proficiency': {
                // only handles armor proficiency requirements,
                const parts = v.map(obj => {
                  return Object.entries(obj).map(([profType, prof]) => {
                    if (profType === 'armor') {
                      return isListMode
                        ? `Prof ${Parser.armorFullToAbv(prof)} armor`
                        : `Proficiency with ${prof} armor`;
                    }
                  });
                });
                return isListMode
                  ? parts.join('/')
                  : parts.joinConjunct(', ', ' or ');
              }
              case 'spellcasting':
                return isListMode
                  ? 'Spellcasting'
                  : 'The ability to cast at least one spell';
              default:
                throw new Error(`Unhandled key: ${k}`);
            }
          })
          .filter(Boolean)
          .join(', ');
      })
      .filter(Boolean);

    if (!listOfChoices.length) return isListMode ? '\u2014' : '';
    return isListMode
      ? listOfChoices.join('/')
      : `Prerequisites: ${listOfChoices.joinConjunct('; ', ' or ')}`;
  },
};

Renderer.prototype.feat = {
  mergeAbilityIncrease: function(feat) {
    if (!feat.ability || feat._hasMergedAbility) return;
    feat._hasMergedAbility = true;
    const targetList = feat.entries.find(e => e.type === 'list');
    if (targetList) {
      feat.ability.forEach(abilObj =>
        targetList.items.unshift(abilityObjToListItem(abilObj)),
      );
    } else {
      // this should never happen, but display sane output anyway, and throw an out-of-order exception
      feat.ability.forEach(abilObj =>
        feat.entries.unshift(abilityObjToListItem(abilObj)),
      );

      setTimeout(() => {
        throw new Error(
          `Could not find object of type "list" in "entries" for feat "${feat.name}" from source "${feat.source}" when merging ability scores! Reformat the feat to include a "list"-type entry.`,
        );
      }, 1);
    }

    function abilityObjToListItem(abilityObj) {
      const TO_MAX_OF_TWENTY = ', to a maximum of 20.';
      const abbArr = [];
      if (!abilityObj.choose) {
        Object.keys(abilityObj).forEach(ab =>
          abbArr.push(
            `Increase your ${Parser.attAbvToFull(ab)} score by ${
              abilityObj[ab]
            }${TO_MAX_OF_TWENTY}`,
          ),
        );
      } else {
        const choose = abilityObj.choose;
        if (choose.from.length === 6) {
          if (choose.textreference) {
            // only used in "Resilient"
            abbArr.push(
              `Increase the chosen ability score by ${choose.amount}${TO_MAX_OF_TWENTY}`,
            );
          } else {
            abbArr.push(
              `Increase one ability score of your choice by ${choose.amount}${TO_MAX_OF_TWENTY}`,
            );
          }
        } else {
          const from = choose.from;
          const amount = choose.amount;
          const abbChoices = [];
          for (let j = 0; j < from.length; ++j) {
            abbChoices.push(Parser.attAbvToFull(from[j]));
          }
          const abbChoicesText = abbChoices.joinConjunct(', ', ' or ');
          abbArr.push(
            `Increase your ${abbChoicesText} by ${amount}${TO_MAX_OF_TWENTY}`,
          );
        }
      }
      return abbArr.join(' ');
    }
  },

  getCompactRenderedString(feat) {
    const renderer = Renderer.get();
    const renderStack = [];

    const prerequisite = Renderer.utils.getPrerequisiteText(feat.prerequisite);
    renderer.feat.mergeAbilityIncrease(feat);
    renderStack.push(`
              ${Renderer.utils.getExcludedTr(feat, 'feat')}
              ${Renderer.utils.getNameTr(feat, { page: UrlUtil.PG_FEATS })}
              <tr class="text"><td colspan="6" class="text">
              ${prerequisite ? `<p><i>${prerequisite}</i></p>` : ''}
          `);
    renderer.recursiveRender({ entries: feat.entries }, renderStack, {
      depth: 2,
    });
    renderStack.push(`</td></tr>`);

    return renderStack.join('');
  },
};

Renderer.get = () => {
  if (!Renderer.defaultRenderer) Renderer.defaultRenderer = new Renderer();
  return Renderer.defaultRenderer;
};

Renderer.prototype.spell = {
  getCompactRenderedString(spell) {
    const renderer = Renderer.get();
    const renderStack = [];

    renderStack.push(`
              ${Renderer.utils.getExcludedTr(spell, 'spell')}
              ${Renderer.utils.getNameTr(spell, { page: UrlUtil.PG_SPELLS })}
              <tr><td colspan="6">
                  <table class="w-full text-left">
                      <tr>
                          <th colspan="1">Level</th>
                          <th colspan="1">School</th>
                          <th colspan="2">Casting Time</th>
                          <th colspan="2">Range</th>
                      </tr>
                      <tr>
                          <td colspan="1">${Parser.spLevelToFull(
                            spell.level,
                          )}${Parser.spMetaToFull(spell.meta)}</td>
                          <td colspan="1">${Parser.spSchoolAndSubschoolsAbvsToFull(
                            spell.school,
                            spell.subschools,
                          )}</td>
                          <td colspan="2">${Parser.spTimeListToFull(
                            spell.time,
                          )}</td>
                          <td colspan="2">${Parser.spRangeToFull(
                            spell.range,
                          )}</td>
                      </tr>
                      <tr>
                          <th colspan="4">Components</th>
                          <th colspan="2">Duration</th>
                      </tr>
                      <tr>
                          <td colspan="4">${Parser.spComponentsToFull(
                            spell.components,
                            spell.level,
                          )}</td>
                          <td colspan="2">${Parser.spDurationToFull(
                            spell.duration,
                          )}</td>
                      </tr>
                  </table>
              </td></tr>
          `);

    renderStack.push(`<tr class="text"><td colspan="6" class="text">`);
    const entryList = { type: 'entries', entries: spell.entries };
    renderer.recursiveRender(entryList, renderStack, { depth: 1 });
    if (spell.entriesHigherLevel) {
      const higherLevelsEntryList = {
        type: 'entries',
        entries: spell.entriesHigherLevel,
      };
      renderer.recursiveRender(higherLevelsEntryList, renderStack, {
        depth: 2,
      });
    }
    if (spell.classes && spell.classes.fromClassList) {
      const [current] = Parser.spClassesToCurrentAndLegacy(spell.classes);
      renderStack.push(
        `<div><span class="font-bold">Classes: </span>${Parser.spMainClassesToFull(
          {
            fromClassList: current,
          },
        )}</div>`,
      );
    }
    renderStack.push(`</td></tr>`);

    return renderStack.join('');
  },

  initClasses(spell, brewSpellClasses) {
    if (spell._isInitClasses) return;
    spell._isInitClasses = true;

    // add eldritch knight and arcane trickster
    if (
      spell.classes &&
      spell.classes.fromClassList &&
      spell.classes.fromClassList.filter(
        c => c.name === Renderer.spell.STR_WIZARD && c.source === SRC_PHB,
      ).length
    ) {
      if (!spell.classes.fromSubclass) spell.classes.fromSubclass = [];
      spell.classes.fromSubclass.push({
        class: { name: Renderer.spell.STR_FIGHTER, source: SRC_PHB },
        subclass: { name: Renderer.spell.STR_ELD_KNIGHT, source: SRC_PHB },
      });
      spell.classes.fromSubclass.push({
        class: { name: Renderer.spell.STR_ROGUE, source: SRC_PHB },
        subclass: { name: Renderer.spell.STR_ARC_TCKER, source: SRC_PHB },
      });
      if (spell.level > 4) {
        spell._scrollNote = true;
      }
    }

    // add divine soul, favored soul v2, favored soul v3
    if (
      spell.classes &&
      spell.classes.fromClassList &&
      spell.classes.fromClassList.filter(
        c => c.name === Renderer.spell.STR_CLERIC && c.source === SRC_PHB,
      ).length
    ) {
      if (!spell.classes.fromSubclass) {
        spell.classes.fromSubclass = [];
        spell.classes.fromSubclass.push({
          class: { name: Renderer.spell.STR_SORCERER, source: SRC_PHB },
          subclass: { name: Renderer.spell.STR_DIV_SOUL, source: SRC_XGE },
        });
      } else {
        if (
          !spell.classes.fromSubclass.find(
            it =>
              it.class.name === Renderer.spell.STR_SORCERER &&
              it.class.source === SRC_PHB &&
              it.subclass.name === Renderer.spell.STR_DIV_SOUL &&
              it.subclass.source === SRC_XGE,
          )
        ) {
          spell.classes.fromSubclass.push({
            class: { name: Renderer.spell.STR_SORCERER, source: SRC_PHB },
            subclass: { name: Renderer.spell.STR_DIV_SOUL, source: SRC_XGE },
          });
        }
      }
      spell.classes.fromSubclass.push({
        class: { name: Renderer.spell.STR_SORCERER, source: SRC_PHB },
        subclass: { name: Renderer.spell.STR_FAV_SOUL_V2, source: SRC_UAS },
      });
      spell.classes.fromSubclass.push({
        class: { name: Renderer.spell.STR_SORCERER, source: SRC_PHB },
        subclass: { name: Renderer.spell.STR_FAV_SOUL_V3, source: SRC_UARSC },
      });
    }

    if (
      spell.classes &&
      spell.classes.fromClassList &&
      spell.classes.fromClassList.find(it => it.name === 'Wizard')
    ) {
      if (spell.level === 0) {
        // add high elf
        (spell.races || (spell.races = [])).push({
          name: 'Elf (High)',
          source: SRC_PHB,
          baseName: 'Elf',
          baseSource: SRC_PHB,
        });
        // add arcana cleric
        (spell.classes.fromSubclass = spell.classes.fromSubclass || []).push({
          class: { name: Renderer.spell.STR_CLERIC, source: SRC_PHB },
          subclass: { name: 'Arcana', source: SRC_SCAG },
        });
      }

      // add arcana cleric
      if (spell.level >= 6) {
        (spell.classes.fromSubclass = spell.classes.fromSubclass || []).push({
          class: { name: Renderer.spell.STR_CLERIC, source: SRC_PHB },
          subclass: { name: 'Arcana', source: SRC_SCAG },
        });
      }
    }

    if (
      spell.classes &&
      spell.classes.fromClassList &&
      spell.classes.fromClassList.find(it => it.name === 'Druid')
    ) {
      if (spell.level === 0) {
        // add nature cleric
        (spell.classes.fromSubclass = spell.classes.fromSubclass || []).push({
          class: { name: Renderer.spell.STR_CLERIC, source: SRC_PHB },
          subclass: { name: 'Nature', source: SRC_PHB },
        });
      }
    }

    // add homebrew class/subclass
    if (brewSpellClasses) {
      const lowName = spell.name.toLowerCase();

      if (brewSpellClasses.spell) {
        if (
          brewSpellClasses.spell[spell.source] &&
          brewSpellClasses.spell[spell.source][lowName]
        ) {
          spell.classes = spell.classes || {};
          if (
            brewSpellClasses.spell[spell.source][lowName].fromClassList.length
          ) {
            spell.classes.fromClassList = spell.classes.fromClassList || [];
            spell.classes.fromClassList.push(
              ...brewSpellClasses.spell[spell.source][lowName].fromClassList,
            );
          }
          if (
            brewSpellClasses.spell[spell.source][lowName].fromSubclass.length
          ) {
            spell.classes.fromSubclass = spell.classes.fromSubclass || [];
            spell.classes.fromSubclass.push(
              ...brewSpellClasses.spell[spell.source][lowName].fromSubclass,
            );
          }
        }
      }

      if (
        brewSpellClasses.class &&
        spell.classes &&
        spell.classes.fromClassList
      ) {
        // speed over safety
        outer: for (const src in brewSpellClasses.class) {
          const searchForClasses = brewSpellClasses.class[src];

          for (const clsLowName in searchForClasses) {
            const spellHasClass = spell.classes.fromClassList.some(
              cls =>
                cls.source === src && cls.name.toLowerCase() === clsLowName,
            );
            if (!spellHasClass) continue;

            const fromDetails = searchForClasses[clsLowName];

            if (fromDetails.fromClassList) {
              spell.classes.fromClassList.push(...fromDetails.fromClassList);
            }

            if (fromDetails.fromSubclass) {
              spell.classes.fromSubclass = spell.classes.fromSubclass || [];
              spell.classes.fromSubclass.push(...fromDetails.fromSubclass);
            }

            // Only add it once regardless of how many classes match
            break outer;
          }
        }
      }
    }
  },
  STR_WIZARD: 'Wizard',
  STR_FIGHTER: 'Fighter',
  STR_ROGUE: 'Rogue',
  STR_CLERIC: 'Cleric',
  STR_SORCERER: 'Sorcerer',
  STR_ELD_KNIGHT: 'Eldritch Knight',
  STR_ARC_TCKER: 'Arcane Trickster',
  STR_DIV_SOUL: 'Divine Soul',
  STR_FAV_SOUL_V2: 'Favored Soul v2 (UA)',
  STR_FAV_SOUL_V3: 'Favored Soul v3 (UA)',
};

Renderer.condition = {
  getCompactRenderedString(cond) {
    const renderer = Renderer.get();
    const renderStack = [];

    renderStack.push(`
              ${Renderer.utils.getExcludedTr(cond, cond.__prop || cond._type)}
              ${Renderer.utils.getNameTr(cond, {
                page: UrlUtil.PG_CONDITIONS_DISEASES,
              })}
              <tr class="text"><td colspan="6">
          `);
    renderer.recursiveRender({ entries: cond.entries }, renderStack);
    renderStack.push(`</td></tr>`);

    return renderStack.join('');
  },
};

Renderer.prototype.background = {
  getCompactRenderedString(bg) {
    return `
          ${Renderer.utils.getExcludedTr(bg, 'background')}
          ${Renderer.utils.getNameTr(bg, { page: UrlUtil.PG_BACKGROUNDS })}
          <tr class="text"><td colspan="6">
          ${Renderer.get().render({ type: 'entries', entries: bg.entries })}
          </td></tr>
          `;
  },

  getSkillSummary(skillProfsArr, short, collectIn) {
    return Renderer.background._summariseProfs(
      skillProfsArr,
      short,
      collectIn,
      `skill`,
    );
  },

  getToolSummary(toolProfsArray, short, collectIn) {
    return Renderer.background._summariseProfs(
      toolProfsArray,
      short,
      collectIn,
    );
  },

  getLanguageSummary(toolProfsArray, short, collectIn) {
    return Renderer.background._summariseProfs(
      toolProfsArray,
      short,
      collectIn,
    );
  },

  _summariseProfs(profGroupArr, short, collectIn, hoverTag) {
    if (!profGroupArr) return '';

    function getEntry(s) {
      return short
        ? s.toTitleCase()
        : hoverTag
        ? `{@${hoverTag} ${s.toTitleCase()}}`
        : s.toTitleCase();
    }

    function sortKeys(a, b) {
      if (a === b) return 0;
      if (a === 'choose') return 1;
      if (b === 'choose') return -1;
      return SortUtil.ascSort(a, b);
    }

    return profGroupArr
      .map(profGroup => {
        let sep = ', ';
        const toJoin = Object.keys(profGroup)
          .sort(sortKeys)
          .filter(k => profGroup[k])
          .map((k, i) => {
            if (k === 'choose') {
              sep = '; ';
              const choose = profGroup[k];
              const chooseProfs = choose.from.map(s => {
                collectIn && !collectIn.includes(s) && collectIn.push(s);
                return getEntry(s);
              });
              return `${
                short ? `${i === 0 ? 'C' : 'c'}hoose ` : ''
              }${choose.count || 1} ${
                short ? `of` : `from`
              } ${chooseProfs.joinConjunct(', ', ' or ')}`;
            } else {
              collectIn && !collectIn.includes(k) && collectIn.push(k);
              return getEntry(k);
            }
          });
        return toJoin.join(sep);
      })
      .join(' <i>or</i> ');
  },
};

Renderer.optionalfeature = {
  getListPrerequisiteLevelText(prerequisites) {
    if (!prerequisites || !prerequisites.some(it => it.level)) return '\u2014';
    return prerequisites.find(it => it.level).level.level;
  },

  getPreviouslyPrintedText(it) {
    return it.data && it.data.previousVersion
      ? `<tr><td colspan="6"><p>${Renderer.get().render(
          `{@i An earlier version of this ${Parser.optFeatureTypeToFull(
            it.featureType,
          )} is available in }${Parser.sourceJsonToFull(
            it.data.previousVersion.source,
          )} {@i as {@optfeature ${it.data.previousVersion.name}|${
            it.data.previousVersion.source
          }}.}`,
        )}</p></td></tr>`
      : '';
  },

  getCompactRenderedString(it) {
    const renderer = Renderer.get();
    const renderStack = [];

    renderStack.push(`
              ${Renderer.utils.getExcludedTr(it, 'optionalfeature')}
              ${Renderer.utils.getNameTr(it, { page: UrlUtil.PG_OPT_FEATURES })}
              <tr class="text"><td colspan="6">
              ${
                it.prerequisite
                  ? `<p><i>${Renderer.utils.getPrerequisiteText(
                      it.prerequisite,
                    )}</i></p>`
                  : ''
              }
          `);
    renderer.recursiveRender({ entries: it.entries }, renderStack, {
      depth: 1,
    });
    renderStack.push(`</td></tr>`);
    renderStack.push(Renderer.optionalfeature.getPreviouslyPrintedText(it));

    return renderStack.join('');
  },
};

Renderer.reward = {
  getRenderedString: reward => {
    const renderer = Renderer.get();
    const renderStack = [];
    renderer.recursiveRender({ entries: reward.entries }, renderStack, {
      depth: 1,
    });
    return `<tr class="text"><td colspan="6">${renderStack.join('')}</td></tr>`;
  },

  getCompactRenderedString(reward) {
    return `
              ${Renderer.utils.getExcludedTr(reward, 'reward')}
              ${Renderer.utils.getNameTr(reward, { page: UrlUtil.PG_REWARDS })}
              ${Renderer.reward.getRenderedString(reward)}
          `;
  },
};

Renderer.prototype.race = {
  getCompactRenderedString(race, withEntries = true) {
    const renderer = Renderer.get();
    const renderStack = [];

    const ability = renderer.getAbilityData(race.ability);
    renderStack.push(`<div class="my-3 p-3 shadow bg-light-300 dark:bg-dark-200 w-full"><table class="race-table">
              ${Renderer.utils.getExcludedTr(race, 'race')}
              ${Renderer.utils.getNameTr(race, { page: UrlUtil.PG_RACES })}
              ${
                !race._isBaseRace
                  ? `
              <tr><td colspan="6">
                  <table class="text-left">
                      <tr>
                          <th class="col-4">Ability Scores</th>
                          <th class="col-4">Size</th>
                          <th class="col-4">Speed</th>
                      </tr>
                      <tr>
                          <td>${ability.asText}</td>
                          <td>${Parser.sizeAbvToFull(race.size)}</td>
                          <td>${Parser.getSpeedString(race)}</td>
                      </tr>
                  </table>
        </td></tr></table>
        </div>`
                  : ''
              }
              <div>
      `);

    if (withEntries) {
      race._isBaseRace
        ? renderer.recursiveRender(
            { type: 'entries', entries: race._baseRaceEntries },
            renderStack,
            { depth: 1 },
          )
        : renderer.recursiveRender(
            { type: 'entries', entries: race.entries },
            renderStack,
            { depth: 1 },
          );
    }
    renderStack.push('<div>');

    return renderStack.join('');
  },

  /**
   * @param races
   * @param [opts] Options object.
   * @param [opts.isAddBaseRaces] If an entity should be created for each base race.
   */
  mergeSubraces(races, opts) {
    opts = opts || {};
    const renderer = Renderer.get();

    const out = [];
    races.forEach(r => {
      if (r.subraces) {
        r.subraces.forEach(sr => (sr.source = sr.source || r.source));
        r.subraces.sort(
          (a, b) =>
            SortUtil.ascSortLower(a.name || '_', b.name || '_') ||
            SortUtil.ascSortLower(
              Parser.sourceJsonToAbv(a.source),
              Parser.sourceJsonToAbv(b.source),
            ),
        );
      }

      if (opts.isAddBaseRaces && r.subraces) {
        const baseRace = MiscUtil.copy(r);

        baseRace._isBaseRace = true;

        const isAnyNoName = r.subraces.some(it => !it.name);
        if (isAnyNoName) baseRace.name = `${baseRace.name} (Base)`;

        const nameCounts = {};
        r.subraces
          .filter(sr => sr.name)
          .forEach(
            sr =>
              (nameCounts[sr.name.toLowerCase()] =
                (nameCounts[sr.name.toLowerCase()] || 0) + 1),
          );
        nameCounts._ = r.subraces.filter(sr => !sr.name).length;

        const lst = {
          type: 'list',
          items: r.subraces.map(sr => {
            const count = nameCounts[(sr.name || '_').toLowerCase()];
            const idName = `${r.name}${sr.name ? ` (${sr.name})` : ''}`;
            return `{@race ${idName}|${sr.source}${
              count > 1
                ? `|${idName} (<span title="${Parser.sourceJsonToFull(
                    sr.source,
                  ).escapeQuotes()}">${Parser.sourceJsonToAbv(
                    sr.source,
                  )}</span>)`
                : ''
            }}`;
          }),
        };

        baseRace._baseRaceEntries = [
          'This race has multiple subraces, as listed below:',
          lst,
        ];

        delete baseRace.subraces;

        out.push(baseRace);
      }

      out.push(...renderer.race._mergeSubrace(r));
    });

    return out;
  },

  _mergeSubrace(race) {
    if (race.subraces) {
      const srCopy = JSON.parse(JSON.stringify(race.subraces));
      const out = [];

      srCopy.forEach(s => {
        const cpy = JSON.parse(JSON.stringify(race));
        cpy._baseName = cpy.name;
        cpy._baseSource = cpy.source;
        delete cpy.subraces;
        delete cpy.srd;

        // merge names, abilities, entries, tags
        if (s.name) {
          cpy.name = `${cpy.name} (${s.name})`;
          delete s.name;
        }
        if (s.ability) {
          // If the base race doesn't have any ability scores, make a set of empty records
          if ((s.overwrite && s.overwrite.ability) || !cpy.ability)
            cpy.ability = s.ability.map(() => ({}));

          if (cpy.ability.length !== s.ability.length)
            throw new Error(
              `Race and subrace ability array lengths did not match!`,
            );
          s.ability.forEach((obj, i) => Object.assign(cpy.ability[i], obj));
          delete s.ability;
        }
        if (s.entries) {
          s.entries.forEach(e => {
            if (e.data && e.data.overwrite) {
              const toOverwrite = cpy.entries.findIndex(
                it =>
                  it.name.toLowerCase().trim() ===
                  e.data.overwrite.toLowerCase().trim(),
              );
              if (~toOverwrite) cpy.entries[toOverwrite] = e;
              else cpy.entries.push(e);
            } else {
              cpy.entries.push(e);
            }
          });
          delete s.entries;
        }

        if (s.traitTags) {
          if (s.overwrite && s.overwrite.traitTags) cpy.traitTags = s.traitTags;
          else cpy.traitTags = (cpy.traitTags || []).concat(s.traitTags);
          delete s.traitTags;
        }

        if (s.languageProficiencies) {
          if (s.overwrite && s.overwrite.languageProficiencies)
            cpy.languageProficiencies = s.languageProficiencies;
          else
            cpy.languageProficiencies = cpy.languageProficiencies = (
              cpy.languageProficiencies || []
            ).concat(s.languageProficiencies);
          delete s.languageProficiencies;
        }

        // TODO make a generalised merge system? Probably have one of those lying around somewhere [bestiary schema?]
        if (s.skillProficiencies) {
          // Overwrite if possible
          if (
            !cpy.skillProficiencies ||
            (s.overwrite && s.overwrite['skillProficiencies'])
          )
            cpy.skillProficiencies = s.skillProficiencies;
          else {
            if (!s.skillProficiencies.length || !cpy.skillProficiencies.length)
              throw new Error(`No items!`);
            if (
              s.skillProficiencies.length > 1 ||
              cpy.skillProficiencies.length > 1
            )
              throw new Error(`Subrace merging does not handle choices!`); // Implement if required

            // Otherwise, merge
            if (s.skillProficiencies.choose) {
              if (cpy.skillProficiencies.choose)
                throw new Error(`Subrace choose merging is not supported!!`); // Implement if required
              cpy.skillProficiencies.choose = s.skillProficiencies.choose;
              delete s.skillProficiencies.choose;
            }
            Object.assign(cpy.skillProficiencies[0], s.skillProficiencies[0]);
          }

          delete s.skillProficiencies;
        }

        // overwrite everything else
        Object.assign(cpy, s);

        out.push(cpy);
      });
      return out;
    } else {
      return [race];
    }
  },

  adoptSubraces(allRaces, subraces) {
    const nxtData = [];

    subraces.forEach(sr => {
      if (!sr.race || !sr.race.name || !sr.race.source)
        throw new Error(`Subrace was missing parent race!`);

      const _baseRace = allRaces.find(
        r => r.name === sr.race.name && r.source === sr.race.source,
      );
      if (!_baseRace)
        throw new Error(`Could not find parent race for subrace!`);

      const subraceListEntry = _baseRace._baseRaceEntries.find(
        it => it.type === 'list',
      );
      subraceListEntry.items.push(
        `{@race ${_baseRace.name} (${sr.name})|${sr.source ||
          _baseRace.source}}`,
      );

      // Attempt to graft multiple subraces from the same data set onto the same base race copy
      let baseRace = nxtData.find(
        r => r.name === sr.race.name && r.source === sr.race.source,
      );
      if (!baseRace) {
        // copy and remove base-race-specific data
        baseRace = MiscUtil.copy(_baseRace);
        delete baseRace._isBaseRace;
        delete baseRace._baseRaceEntries;

        nxtData.push(baseRace);
      }

      baseRace.subraces = baseRace.subraces || [];
      baseRace.subraces.push(sr);
    });

    return nxtData;
  },
};

Renderer.deity = {
  _basePartTranslators: {
    Alignment: {
      prop: 'alignment',
      displayFn: it => it.map(a => Parser.alignmentAbvToFull(a)).join(' '),
    },
    Pantheon: {
      prop: 'pantheon',
    },
    Category: {
      prop: 'category',
    },
    Domains: {
      prop: 'domains',
      displayFn: it => it.join(', '),
    },
    Province: {
      prop: 'province',
    },
    'Alternate Names': {
      prop: 'altNames',
      displayFn: it => it.join(', '),
    },
    Symbol: {
      prop: 'symbol',
    },
  },
  getOrderedParts(deity, prefix, suffix) {
    const parts = {};
    Object.entries(Renderer.deity._basePartTranslators).forEach(([k, v]) => {
      const val = deity[v.prop];
      if (val != null) {
        const outVal = v.displayFn ? v.displayFn(val) : val;
        parts[k] = outVal;
      }
    });
    if (deity.customProperties)
      Object.entries(deity.customProperties).forEach(
        ([k, v]) => (parts[k] = v),
      );
    const allKeys = Object.keys(parts).sort(SortUtil.ascSortLower);
    return allKeys
      .map(
        k =>
          `${prefix}<b>${k}: </b>${Renderer.get().render(parts[k])}${suffix}`,
      )
      .join('');
  },

  getCompactRenderedString(deity) {
    const renderer = Renderer.get();
    return `
              ${Renderer.utils.getExcludedTr(deity, 'deity')}
              ${Renderer.utils.getNameTr(deity, {
                suffix: deity.title ? `, ${deity.title.toTitleCase()}` : '',
                page: UrlUtil.PG_DEITIES,
              })}
              <tr><td colspan="6">
                  <div class="rd__compact-stat">${Renderer.deity.getOrderedParts(
                    deity,
                    `<p>`,
                    `</p>`,
                  )}</div>
              </td>
              ${
                deity.entries
                  ? `<tr><td colspan="6"><div class="border"></div></td></tr><tr><td colspan="6">${renderer.render(
                      { entries: deity.entries },
                      1,
                    )}</td></tr>`
                  : ''
              }
          `;
  },
};

Renderer.prototype.object = {
  getCompactRenderedString(obj) {
    const renderer = Renderer.get();
    const row2Width = 12 / (!!obj.resist + !!obj.vulnerable || 1);
    return `
              ${Renderer.utils.getExcludedTr(obj, 'object')}
              ${Renderer.utils.getNameTr(obj, { page: UrlUtil.PG_OBJECTS })}
              <tr><td colspan="6">
                  <table class="summary striped-even">
                      <tr>
                          <th colspan="2" class="text-center">Type</th>
                          <th colspan="2" class="text-center">AC</th>
                          <th colspan="2" class="text-center">HP</th>
                          <th colspan="2" class="text-center">Speed</th>
                          <th colspan="4" class="text-center">Damage Imm.</th>
                      </tr>
                      <tr>
                          <td colspan="2" class="text-center">${Parser.sizeAbvToFull(
                            obj.size,
                          )} object</td>
                          <td colspan="2" class="text-center">${obj.ac}</td>
                          <td colspan="2" class="text-center">${obj.hp}</td>
                          <td colspan="2" class="text-center">${Parser.getSpeedString(
                            obj,
                          )}</td>
                          <td colspan="4" class="text-center">${obj.immune}</td>
                      </tr>
                      ${
                        Parser.ABIL_ABVS.some(ab => obj[ab] != null)
                          ? `
                      <tr>${Parser.ABIL_ABVS.map(
                        it =>
                          `<td colspan="2" class="text-center">${it.toUpperCase()}</td>`,
                      ).join('')}</tr>
                      <tr>${Parser.ABIL_ABVS.map(
                        it =>
                          `<td colspan="2" class="text-center">${Renderer.utils.getAbilityRoller(
                            obj,
                            it,
                          )}</td>`,
                      ).join('')}</tr>
                      `
                          : ''
                      }
                      ${
                        obj.resist || obj.vulnerable
                          ? `
                      <tr>
                          ${
                            obj.resist
                              ? `<th colspan="${row2Width}" class="text-center">Damage Res.</th>`
                              : ''
                          }
                          ${
                            obj.vulnerable
                              ? `<th colspan="${row2Width}" class="text-center">Damage Vuln.</th>`
                              : ''
                          }
                      </tr>
                      <tr>
                          ${
                            obj.resist
                              ? `<td colspan="${row2Width}" class="text-center">${obj.resist}</td>`
                              : ''
                          }
                          ${
                            obj.vulnerable
                              ? `<td colspan="${row2Width}" class="text-center">${obj.vulnerable}</td>`
                              : ''
                          }
                      </tr>
                      `
                          : ''
                      }
                  </table>
              </td></tr>
              <tr class="text"><td colspan="6">
              ${obj.entries ? renderer.render({ entries: obj.entries }, 2) : ''}
              ${
                obj.actionEntries
                  ? renderer.render({ entries: obj.actionEntries }, 2)
                  : ''
              }
              </td></tr>
          `;
  },
};

Renderer.traphazard = {
  getSubtitle(it) {
    const type = it.trapHazType || 'HAZ';
    switch (type) {
      case 'GEN':
        return null;
      case 'SMPL':
      case 'CMPX':
        return `${Parser.trapHazTypeToFull(type)} (${Parser.tierToFullLevel(
          it.tier,
        )}, ${Parser.threatToFull(it.threat)} threat)`;
      default:
        return Parser.trapHazTypeToFull(type);
    }
  },

  getSimplePart(renderer, it) {
    if (it.trapHazType === 'SMPL') {
      return renderer.render(
        {
          entries: [
            {
              type: 'entries',
              name: 'Trigger',
              entries: it.trigger,
            },
            {
              type: 'entries',
              name: 'Effect',
              entries: it.effect,
            },
            {
              type: 'entries',
              name: 'Countermeasures',
              entries: it.countermeasures,
            },
          ],
        },
        1,
      );
    }
    return '';
  },

  getComplexPart(renderer, it) {
    if (it.trapHazType === 'CMPX') {
      return renderer.render(
        {
          entries: [
            {
              type: 'entries',
              name: 'Trigger',
              entries: it.trigger,
            },
            {
              type: 'entries',
              name: 'Initiative',
              entries: [
                `The trap acts on ${Parser.trapInitToFull(it.initiative)}${
                  it.initiativeNote ? ` (${it.initiativeNote})` : ''
                }.`,
              ],
            },
            it.eActive
              ? {
                  type: 'entries',
                  name: 'Active Elements',
                  entries: it.eActive,
                }
              : null,
            it.eDynamic
              ? {
                  type: 'entries',
                  name: 'Dynamic Elements',
                  entries: it.eDynamic,
                }
              : null,
            it.eConstant
              ? {
                  type: 'entries',
                  name: 'Constant Elements',
                  entries: it.eConstant,
                }
              : null,
            {
              type: 'entries',
              name: 'Countermeasures',
              entries: it.countermeasures,
            },
          ].filter(it => it),
        },
        1,
      );
    }
    return '';
  },

  getCompactRenderedString(it) {
    const renderer = Renderer.get();
    const subtitle = Renderer.traphazard.getSubtitle(it);
    return `
              ${Renderer.utils.getExcludedTr(
                it,
                it.__prop || (it._type === 't' ? 'trap' : 'hazard'),
              )}
              ${Renderer.utils.getNameTr(it, {
                page: UrlUtil.PG_TRAPS_HAZARDS,
              })}
              ${
                subtitle
                  ? `<tr class="text"><td colspan="6"><i>${subtitle}</i>${Renderer.traphazard.getSimplePart(
                      renderer,
                      it,
                    )}${Renderer.traphazard.getComplexPart(renderer, it)}</td>`
                  : ''
              }
              <tr class="text"><td colspan="6">${renderer.render(
                { entries: it.entries },
                2,
              )}</td></tr>
          `;
  },

  _trapTypes: new Set(['MECH', 'MAG', 'SMPL', 'CMPX']),
  isTrap(trapHazType) {
    return Renderer.traphazard._trapTypes.has(trapHazType);
  },
};

Renderer.cultboon = {
  doRenderCultParts(it, renderer, renderStack) {
    if (it.goal || it.cultists || it.signaturespells) {
      const fauxList = {
        type: 'list',
        style: 'list-hang-notitle',
        items: [],
      };
      if (it.goal) {
        fauxList.items.push({
          type: 'item',
          name: 'Goals:',
          entry: it.goal.entry,
        });
      }

      if (it.cultists) {
        fauxList.items.push({
          type: 'item',
          name: 'Typical Cultists:',
          entry: it.cultists.entry,
        });
      }
      if (it.signaturespells) {
        fauxList.items.push({
          type: 'item',
          name: 'Signature Spells:',
          entry: it.signaturespells.entry,
        });
      }
      renderer.recursiveRender(fauxList, renderStack, { depth: 2 });
    }
  },

  doRenderBoonParts(it, renderer, renderStack) {
    const benefits = { type: 'list', style: 'list-hang-notitle', items: [] };
    if (it.ability) {
      benefits.items.push({
        type: 'item',
        name: 'Ability Score Adjustment:',
        entry: it.ability ? it.ability.entry : 'None',
      });
    }
    if (it.signaturespells) {
      benefits.items.push({
        type: 'item',
        name: 'Signature Spells:',
        entry: it.signaturespells ? it.signaturespells.entry : 'None',
      });
    }
    if (benefits.items.length)
      renderer.recursiveRender(benefits, renderStack, { depth: 1 });
  },

  getCompactRenderedString(it) {
    const renderer = Renderer.get();

    const renderStack = [];
    if (it._type === 'c') {
      Renderer.cultboon.doRenderCultParts(it, renderer, renderStack);
      renderer.recursiveRender({ entries: it.entries }, renderStack, {
        depth: 2,
      });
      return `
              ${Renderer.utils.getExcludedTr(it, 'cult')}
              ${Renderer.utils.getNameTr(it, { page: UrlUtil.PG_CULTS_BOONS })}
              <tr id="text"><td class="divider" colspan="6"><div></div></td></tr>
              <tr class='text'><td colspan='6' class='text'>${renderStack.join(
                '',
              )}</td></tr>`;
    } else if (it._type === 'b') {
      Renderer.cultboon.doRenderBoonParts(it, renderer, renderStack);
      renderer.recursiveRender({ entries: it.entries }, renderStack, {
        depth: 1,
      });
      it._displayName =
        it._displayName || `${it.type || 'Demonic Boon'}: ${it.name}`;
      return `
              ${Renderer.utils.getExcludedTr(it, 'boon')}
              ${Renderer.utils.getNameTr(it, { page: UrlUtil.PG_CULTS_BOONS })}
              <tr class='text'><td colspan='6'>${renderStack.join(
                '',
              )}</td></tr>`;
    }
  },
};

Renderer.monster = {
  getLegendaryActionIntro: (mon, renderer = Renderer.get()) => {
    function getCleanName() {
      if (mon.shortName) return mon.shortName;
      const base = mon.name.split(',')[0];
      const cleanDragons = base.replace(
        /(?:adult|ancient|young) \w+ (dragon|dracolich)/gi,
        '$1',
      );
      return mon.isNamedCreature
        ? cleanDragons.split(' ')[0]
        : cleanDragons.toLowerCase();
    }

    if (mon.legendaryHeader) {
      return mon.legendaryHeader.map(line => renderer.render(line)).join('');
    } else {
      const legendaryActions = mon.legendaryActions || 3;
      const legendaryName = getCleanName();
      return `${
        mon.isNamedCreature ? '' : 'The '
      }${legendaryName} can take ${legendaryActions} legendary action${
        legendaryActions > 1 ? 's' : ''
      }, choosing from the options below. Only one legendary action can be used at a time and only at the end of another creature's turn. ${
        mon.isNamedCreature ? '' : 'The '
      }${legendaryName} regains spent legendary actions at the start of its turn.`;
    }
  },

  getSave(renderer, attr, mod) {
    if (attr === 'special') return renderer.render(mod);
    else
      return renderer.render(
        `<span data-mon-save="${attr.uppercaseFirst()}|${mod}">${attr.uppercaseFirst()} {@d20 ${mod}|${mod}|${Parser.attAbvToFull(
          [attr],
        )} save}</span>`,
      );
  },

  getDragonCasterVariant(renderer, dragon) {
    // if the dragon already has a spellcasting trait specified, don't add a note about adding a spellcasting trait
    if (!dragon.dragonCastingColor || dragon.spellcasting) return null;

    function getExampleSpells(maxSpellLevel, color) {
      const LVL_TO_COLOR_TO_SPELLS = {
        2: {
          B: ['darkness', "Melf's acid arrow", 'fog cloud', 'scorching ray'],
          G: [
            'ray of sickness',
            'charm person',
            'detect thoughts',
            'invisibility',
            'suggestion',
          ],
          W: ['ice knife|XGE', "Snilloc's snowball swarm|XGE"],
          A: [
            'see invisibility',
            'magic mouth',
            'blindness/deafness',
            'sleep',
            'detect thoughts',
          ],
          Z: [
            'gust of wind',
            'misty step',
            'locate object',
            'blur',
            'witch bolt',
            'thunderwave',
            'shield',
          ],
          C: [
            'knock',
            'sleep',
            'detect thoughts',
            'blindness/deafness',
            "tasha's hideous laughter",
          ],
        },
        3: {
          U: [
            'wall of sand|XGE',
            'thunder step|XGE',
            'lightning bolt',
            'blink',
            'magic missile',
            'slow',
          ],
          R: [
            'fireball',
            'scorching ray',
            'haste',
            'erupting earth|XGE',
            "Aganazzar's scorcher|XGE",
          ],
          O: [
            'slow',
            'slow',
            'fireball',
            'dispel magic',
            'counterspell',
            "Aganazzar's scorcher|XGE",
            'shield',
          ],
          S: [
            'sleet storm',
            'protection from energy',
            'catnap|XGE',
            'locate object',
            'identify',
            "Leomund's tiny hut",
          ],
        },
        4: {
          B: [
            'vitriolic sphere|XGE',
            'sickening radiance|XGE',
            "Evard's black tentacles",
            'blight',
            'hunger of Hadar',
          ],
          W: ['fire shield', 'ice storm', 'sleet storm'],
          A: [
            'charm monster|XGE',
            'sending',
            'wall of sand|XGE',
            'hypnotic pattern',
            'tongues',
          ],
          C: [
            'polymorph',
            'greater invisibility',
            'confusion',
            'stinking cloud',
            'major image',
            'charm monster|XGE',
          ],
        },
        5: {
          U: [
            'telekinesis',
            'hold monster',
            'dimension door',
            'wall of stone',
            'wall of force',
          ],
          G: [
            'cloudkill',
            'charm monster|XGE',
            'modify memory',
            'mislead',
            'hallucinatory terrain',
            'dimension door',
          ],
          Z: [
            'steel wind strike|XGE',
            'control weather',
            'control winds|XGE',
            'watery sphere|XGE',
            'storm sphere|XGE',
            'tidal wave|XGE',
          ],
          O: [
            'hold monster',
            'immolation|XGE',
            'wall of fire',
            'greater invisibility',
            'dimension door',
          ],
          S: [
            'cone of cold',
            'ice storm',
            'teleportation circle',
            'skill empowerment|XGE',
            'creation',
            "Mordenkainen's private sanctum",
          ],
        },
        6: {
          W: ['cone of cold', 'wall of ice'],
          A: [
            'scrying',
            "Rary's telepathic bond",
            "Otto's irresistible dance",
            'legend lore',
            'hold monster',
            'dream',
          ],
        },
        7: {
          B: [
            'power word pain|XGE',
            'finger of death',
            'disintegrate',
            'hold monster',
          ],
          U: ['chain lightning', 'forcecage', 'teleport', 'etherealness'],
          G: ['project image', 'mirage arcane', 'prismatic spray', 'teleport'],
          Z: [
            'whirlwind|XGE',
            'chain lightning',
            'scatter|XGE',
            'teleport',
            'disintegrate',
            'lightning bolt',
          ],
          C: [
            'symbol',
            'simulacrum',
            'reverse gravity',
            'project image',
            "Bigby's hand",
            'mental prison|XGE',
            'seeming',
          ],
          S: [
            "Otiluke's freezing sphere",
            'prismatic spray',
            'wall of ice',
            'contingency',
            'arcane gate',
          ],
        },
        8: {
          O: [
            'sunburst',
            'delayed blast fireball',
            'antimagic field',
            'teleport',
            'globe of invulnerability',
            'maze',
          ],
        },
      };

      return (LVL_TO_COLOR_TO_SPELLS[maxSpellLevel] || {})[color];
    }

    const chaMod = Parser.getAbilityModNumber(dragon.cha);
    const pb = Parser.crToPb(dragon.cr);
    const maxSpellLevel = Math.floor(Parser.crToNumber(dragon.cr) / 3);
    const exampleSpells = getExampleSpells(
      maxSpellLevel,
      dragon.dragonCastingColor,
    );
    const levelString =
      maxSpellLevel === 0
        ? `${chaMod === 1 ? 'This' : 'These'} spells are Cantrips.`
        : `${
            chaMod === 1 ? 'The' : 'Each'
          } spell's level can be no higher than ${Parser.spLevelToFull(
            maxSpellLevel,
          )}.`;
    const v = {
      type: 'variant',
      name: 'Dragons as Innate Spellcasters',
      entries: [
        'Dragons are innately magical creatures that can master a few spells as they age, using this variant.',
        `A young or older dragon can innately cast a number of spells equal to its Charisma modifier. Each spell can be cast once per day, requiring no material components, and the spell's level can be no higher than one-third the dragon's challenge rating (rounded down). The dragon's bonus to hit with spell attacks is equal to its proficiency bonus + its Charisma bonus. The dragon's spell save DC equals 8 + its proficiency bonus + its Charisma modifier.`,
        `{@i This dragon can innately cast ${Parser.numberToText(
          chaMod,
        )} spell${chaMod === 1 ? '' : 's'}, once per day${
          chaMod === 1 ? '' : ' each'
        }, requiring no material components. ${levelString} The dragon's spell save DC is ${pb +
          chaMod +
          8}, and it has {@hit ${pb +
          chaMod}} to hit with spell attacks. See the {@filter spell page|spells|level=${[
          ...new Array(maxSpellLevel + 1),
        ]
          .map((it, i) => i)
          .join(';')}} for a list of spells the dragon is capable of casting.${
          exampleSpells ? ` A selection of examples are shown below:` : ''
        }`,
      ],
    };
    if (exampleSpells) {
      const ls = {
        type: 'list',
        style: 'italic',
        items: exampleSpells.map(it => `{@spell ${it}}`),
      };
      v.entries.push(ls);
    }
    return renderer.render(v);
  },

  getCompactRenderedStringSection(mon, renderer, title, key, depth) {
    const noteKey = `${key}Note`;
    return mon[key]
      ? `
          <tr class="mon__stat-header-underline"><td colspan="6"><span class="mon__sect-header-inner">${title}${
          mon[noteKey] ? ` (<span class="small">${mon[noteKey]}</span>)` : ''
        }</span></td></tr>
          <tr class="text compact"><td colspan="6">
          ${
            key === 'legendary' && mon.legendary
              ? `<p>${Renderer.monster.getLegendaryActionIntro(mon)}</p>`
              : ''
          }
          ${mon[key]
            .map(it => it.rendered || renderer.render(it, depth))
            .join('')}
          </td></tr>
          `
      : '';
  },

  getTypeAlignmentPart(mon) {
    return `${
      mon.level ? `${Parser.getOrdinalForm(mon.level)}-level ` : ''
    }${Parser.sizeAbvToFull(mon.size)}${
      mon.sizeNote ? ` ${mon.sizeNote}` : ''
    } ${Parser.monTypeToFullObj(mon.type).asText}${
      mon.alignment
        ? `, ${Parser.alignmentListToFull(mon.alignment).toLowerCase()}`
        : ''
    }`;
  },
  getSavesPart(mon) {
    return `${Object.keys(mon.save)
      .sort(SortUtil.ascSortAtts)
      .map(s => Renderer.monster.getSave(Renderer.get(), s, mon.save[s]))
      .join(', ')}`;
  },
  getSensesPart(mon) {
    return `${
      mon.senses ? `${Renderer.monster.getRenderedSenses(mon.senses)}, ` : ''
    }passive Perception ${mon.passive || '\u2014'}`;
  },

  getCompactRenderedString(mon, renderer, options = {}) {
    renderer = renderer || Renderer.get();

    const renderStack = [];
    const isCrHidden = Parser.crToNumber(mon.cr) === 100;

    renderStack.push(`
              ${Renderer.utils.getExcludedTr(mon, 'monster')}
              ${Renderer.utils.getNameTr(mon, { page: UrlUtil.PG_BESTIARY })}
              <tr><td colspan="6"><i>${Renderer.monster.getTypeAlignmentPart(
                mon,
              )}</i></td></tr>
              <tr><td colspan="6"><div class="border"></div></td></tr>
              <tr><td colspan="6">
                  <table class="summary-noback" style="position: relative;">
                      <tr>
                          <th>Armor Class</th>
                          <th>Hit Points</th>
                          <th>Speed</th>
                          ${isCrHidden ? '' : '<th>Challenge Rating</th>'}
                      </tr>
                      <tr>
                          <td>${Parser.acToFull(mon.ac)}</td>
                          <td>${Renderer.monster.getRenderedHp(mon.hp)}</td>
                          <td>${Parser.getSpeedString(mon)}</td>
                          ${
                            isCrHidden
                              ? ''
                              : `
                          <td>
                              ${Parser.monCrToFull(mon.cr)}
                              ${
                                options.showScaler &&
                                Parser.isValidCr(
                                  mon.cr ? mon.cr.cr || mon.cr : null,
                                )
                                  ? `
                              <button title="Scale Creature By CR (Highly Experimental)" class="mon__btn-scale-cr btn btn-xs btn-default">
                                  <span class="glyphicon glyphicon-signal"></span>
                              </button>
                              `
                                  : ''
                              }
                              ${
                                options.isScaled
                                  ? `
                              <button title="Reset CR Scaling" class="mon__btn-reset-cr btn btn-xs btn-default">
                                  <span class="glyphicon glyphicon-refresh"></span>
                              </button>
                              `
                                  : ''
                              }
                          </td>
                          `
                          }
                      </tr>
                  </table>
              </td></tr>
              <tr><td colspan="6"><div class="border"></div></td></tr>
              <tr><td colspan="6">
                  <table class="summary striped-even">
                      <tr>
                          <th class="col-2 text-center">STR</th>
                          <th class="col-2 text-center">DEX</th>
                          <th class="col-2 text-center">CON</th>
                          <th class="col-2 text-center">INT</th>
                          <th class="col-2 text-center">WIS</th>
                          <th class="col-2 text-center">CHA</th>
                      </tr>
                      <tr>
                          <td class="text-center">${Renderer.utils.getAbilityRoller(
                            mon,
                            'str',
                          )}</td>
                          <td class="text-center">${Renderer.utils.getAbilityRoller(
                            mon,
                            'dex',
                          )}</td>
                          <td class="text-center">${Renderer.utils.getAbilityRoller(
                            mon,
                            'con',
                          )}</td>
                          <td class="text-center">${Renderer.utils.getAbilityRoller(
                            mon,
                            'int',
                          )}</td>
                          <td class="text-center">${Renderer.utils.getAbilityRoller(
                            mon,
                            'wis',
                          )}</td>
                          <td class="text-center">${Renderer.utils.getAbilityRoller(
                            mon,
                            'cha',
                          )}</td>
                      </tr>
                  </table>
              </td></tr>
              <tr><td colspan="6"><div class="border"></div></td></tr>
              <tr><td colspan="6">
                  <div class="rd__compact-stat">
                      ${
                        mon.save
                          ? `<p><b>Saving Throws</b> ${Renderer.monster.getSavesPart(
                              mon,
                            )}</p>`
                          : ''
                      }
                      ${
                        mon.skill
                          ? `<p><b>Skills</b> ${Renderer.monster.getSkillsString(
                              renderer,
                              mon,
                            )}</p>`
                          : ''
                      }
                      ${
                        mon.vulnerable
                          ? `<p><b>Damage Vuln.</b> ${Parser.monImmResToFull(
                              mon.vulnerable,
                            )}</p>`
                          : ''
                      }
                      ${
                        mon.resist
                          ? `<p><b>Damage Res.</b> ${Parser.monImmResToFull(
                              mon.resist,
                            )}</p>`
                          : ''
                      }
                      ${
                        mon.immune
                          ? `<p><b>Damage Imm.</b> ${Parser.monImmResToFull(
                              mon.immune,
                            )}</p>`
                          : ''
                      }
                      ${
                        mon.conditionImmune
                          ? `<p><b>Condition Imm.</b> ${Parser.monCondImmToFull(
                              mon.conditionImmune,
                            )}</p>`
                          : ''
                      }
                      <p><b>Senses</b> ${Renderer.monster.getSensesPart(
                        mon,
                      )}</p>
                      <p><b>Languages</b> ${Renderer.monster.getRenderedLanguages(
                        mon.languages,
                      )}</p>
                  </div>
              </td></tr>
              ${
                mon.trait || mon.spellcasting
                  ? `<tr><td colspan="6"><div class="border"></div></td></tr>
              <tr class="text compact"><td colspan="6">
              ${Renderer.monster
                .getOrderedTraits(mon, renderer)
                .map(it => it.rendered || renderer.render(it, 2))
                .join('')}
              </td></tr>`
                  : ''
              }
              ${Renderer.monster.getCompactRenderedStringSection(
                mon,
                renderer,
                'Actions',
                'action',
                2,
              )}
              ${Renderer.monster.getCompactRenderedStringSection(
                mon,
                renderer,
                'Reactions',
                'reaction',
                2,
              )}
              ${Renderer.monster.getCompactRenderedStringSection(
                mon,
                renderer,
                'Legendary Actions',
                'legendary',
                2,
              )}
              ${
                mon.variant || (mon.dragonCastingColor && !mon.spellcasting)
                  ? `
              <tr class="text compact"><td colspan="6">
              ${
                mon.variant
                  ? mon.variant
                      .map(it => it.rendered || renderer.render(it))
                      .join('')
                  : ''
              }
              ${
                mon.dragonCastingColor
                  ? Renderer.monster.getDragonCasterVariant(renderer, mon)
                  : ''
              }
              ${mon.footer ? renderer.render({ entries: mon.footer }) : ''}
              </td></tr>
              `
                  : ''
              }
          `);

    return renderStack.join('');
  },

  getRenderedHp: (hp, isPlainText) => {
    function getMaxStr() {
      const mHp = /^(\d+)d(\d+)([-+]\d+)?$/i.exec(hp.formula);
      if (mHp) {
        const num = Number(mHp[1]);
        const faces = Number(mHp[2]);
        const mod = mHp[3] ? Number(mHp[3]) : 0;
        return `Maximum: ${num * faces + mod}`;
      } else return '';
    }
    if (hp.special != null) return hp.special;
    if (/^\d+d1$/.exec(hp.formula)) {
      return hp.average;
    } else {
      const maxStr = getMaxStr(hp.formula);
      if (isPlainText) return `${maxStr}${hp.average}${hp.formula}`;
      return `${maxStr ? `<span title="${maxStr}" class="help--subtle">` : ''}${
        hp.average
      }${maxStr ? '</span>' : ''} ${Renderer.get().render(
        `({@dice ${hp.formula}|${hp.formula}|Hit Points})`,
      )}`;
    }
  },

  getSpellcastingRenderedTraits: (mon, renderer) => {
    const out = [];
    mon.spellcasting.forEach(entry => {
      entry.type = entry.type || 'spellcasting';
      const renderStack = [];
      renderer.recursiveRender(entry, renderStack, { depth: 2 });
      out.push({ name: entry.name, rendered: renderStack.join('') });
    });
    return out;
  },

  getOrderedTraits: (mon, renderer) => {
    let trait = mon.trait ? MiscUtil.copy(mon.trait) : null;
    if (mon.spellcasting) {
      const spellTraits = Renderer.monster.getSpellcastingRenderedTraits(
        mon,
        renderer,
      );
      // weave spellcasting in with other traits
      trait = trait ? trait.concat(spellTraits) : spellTraits;
    }
    if (trait)
      return trait
        .slice()
        .sort((a, b) => SortUtil.monTraitSort(a.name, b.name));
  },

  getSkillsString(renderer, mon) {
    function makeSkillRoller(name, mod) {
      return Renderer.get().render(`{@d20 ${mod}|${mod}|${name}`);
    }

    function doSortMapJoinSkillKeys(obj, keys, joinWithOr) {
      const toJoin = keys
        .sort(SortUtil.ascSort)
        .map(
          s =>
            `<span data-mon-skill="${s.toTitleCase()}|${
              obj[s]
            }">${renderer.render(
              `{@skill ${s.toTitleCase()}}`,
            )} ${makeSkillRoller(s.toTitleCase(), obj[s])}</span>`,
        );
      return joinWithOr ? toJoin.joinConjunct(', ', ' or ') : toJoin.join(', ');
    }

    const skills = doSortMapJoinSkillKeys(
      mon.skill,
      Object.keys(mon.skill).filter(k => k !== 'other' && k !== 'special'),
    );
    if (mon.skill.other || mon.skill.special) {
      const others =
        mon.skill.other &&
        mon.skill.other.map(it => {
          if (it.oneOf) {
            return `plus one of the following: ${doSortMapJoinSkillKeys(
              it.oneOf,
              Object.keys(it.oneOf),
              true,
            )}`;
          }
          throw new Error(`Unhandled monster "other" skill properties!`);
        });
      const special =
        mon.skill.special && Renderer.get().render(mon.skill.special);
      return [skills, others, special].filter(Boolean).join(', ');
    } else return skills;
  },

  getTokenUrl(mon) {
    return (
      mon.tokenUrl ||
      UrlUtil.link(
        `${Renderer.get().baseUrl}img/${Parser.sourceJsonToAbv(
          mon.source,
        )}/${Parser.nameToTokenName(mon.name)}.png`,
      )
    );
  },

  getRenderedSenses(senses, isPlainText) {
    if (typeof senses === 'string') senses = [senses]; // handle legacy format
    if (isPlainText) return senses.join(', ');
    const senseStr = senses
      .join(', ')
      .replace(
        /(^| |\()(tremorsense|blindsight|truesight|darkvision)(\)| |$)/gi,
        (...m) => `${m[1]}{@sense ${m[2]}}${m[3]}`,
      )
      .replace(
        /(^| |\()(blind|blinded)(\)| |$)/gi,
        (...m) => `${m[1]}{@condition blinded||${m[2]}}${m[3]}`,
      );
    return Renderer.get().render(senseStr);
  },

  getRenderedLanguages(languages) {
    if (typeof languages === 'string') languages = [languages]; // handle legacy format
    return languages ? languages.join(', ') : '\u2014';
  },

  initParsed(mon) {
    mon._pTypes = mon._pTypes || Parser.monTypeToFullObj(mon.type); // store the parsed type
    mon._pCr = mon._pCr || (mon.cr == null ? null : mon.cr.cr || mon.cr);
  },

  updateParsed(mon) {
    delete mon._pTypes;
    delete mon._pCr;
    Renderer.monster.initParsed(mon);
  },

  async pPopulateMetaAndLanguages(meta, languages) {
    const data = await DataUtil.loadJSON(
      `${Renderer.get().baseUrl}data/bestiary/meta.json`,
    );

    if (meta) {
      // Convert the legendary Group JSONs into a look-up, i.e. use the name as a JSON property name
      data.legendaryGroup.forEach(lg => {
        meta[lg.source] = meta[lg.source] || {};
        meta[lg.source][lg.name] = lg;
      });
    }

    if (languages)
      Object.keys(data.language).forEach(
        k => (languages[k] = data.language[k]),
      );
  },
};

Renderer.prototype.item = {
  // avoid circular references by deciding a global link direction for specific <-> general
  // default is general -> specific
  LINK_SPECIFIC_TO_GENERIC_DIRECTION: 1,

  _getPropertiesText(item) {
    const renderer = Renderer.get();
    if (item.property) {
      let renderedDmg2 = false;

      const renderedProperties = item.property.map(prop => {
        const fullProp = renderer.item.propertyMap[prop];

        if (fullProp.template) {
          const toRender = fullProp.template.replace(/{{([^}]+)}}/g, (...m) => {
            // Special case for damage dice -- need to add @damage tags
            if (m[1] === 'item.dmg1') {
              return renderer.item._renderDamage(item.dmg1);
            } else if (m[1] === 'item.dmg2') {
              renderedDmg2 = true;
              return renderer.item._renderDamage(item.dmg2);
            }

            const spl = m[1].split('.');
            switch (spl[0]) {
              case 'prop_name':
                return fullProp.name;
              case 'item': {
                const path = spl.slice(1);
                if (!path.length) return `{@i missing key path}`;
                return MiscUtil.get(item, ...path) || '';
              }
              default:
                return `{@i unknown template root: "${spl[0]}"}`;
            }
          });
          return Renderer.get().render(toRender);
        } else return fullProp.name;
      });

      if (!renderedDmg2 && item.dmg2)
        renderedProperties.unshift(
          `alt. ${renderer.item._renderDamage(item.dmg2)}`,
        );

      return `${renderedProperties.join(', ')}`;
    } else {
      const parts = [];
      if (item.dmg2)
        parts.push(`alt. ${renderer.item._renderDamage(item.dmg2)}`);
      if (item.range) parts.push(`range ${item.range} ft.`);
      return `${parts.join(', ')}`;
    }
  },

  _renderDamage(dmg) {
    if (!dmg) return '';
    const tagged = dmg.replace(
      RollerUtil.DICE_REGEX,
      (...m) => `{@damage ${m[1]}}`,
    );
    return Renderer.get().render(tagged);
  },

  getDamageAndPropertiesText: function(item) {
    const renderer = Renderer.get();
    const damageParts = [];

    if (item.dmg1) damageParts.push(renderer.item._renderDamage(item.dmg1));

    // armor
    if (item.ac != null) {
      const prefix = item.type === 'S' ? '+' : '';
      const suffix =
        item.type === 'LA'
          ? ' + Dex'
          : item.type === 'MA'
          ? ' + Dex (max 2)'
          : '';
      damageParts.push(`AC ${prefix}${item.ac}${suffix}`);
    }
    if (item.acSpecial != null)
      damageParts.push(
        item.ac != null ? item.acSpecial : `AC ${item.acSpecial}`,
      );

    // mounts
    if (item.speed != null) damageParts.push(`Speed: ${item.speed}`);
    if (item.carryingCapacity)
      damageParts.push(`Carrying Capacity: ${item.carryingCapacity} lb.`);

    // vehicles
    if (
      item.vehSpeed ||
      item.capCargo ||
      item.capPassenger ||
      item.crew ||
      item.vehAc ||
      item.vehHp ||
      item.vehDmgThresh
    ) {
      const vehPartUpper = item.vehSpeed
        ? `Speed: ${Parser.numberToVulgar(item.vehSpeed)} mph`
        : null;

      const vehPartMiddle =
        item.capCargo || item.capPassenger
          ? `Carrying Capacity: ${[
              item.capCargo
                ? `${Parser.numberToFractional(item.capCargo)} ton${
                    item.capCargo === 0 || item.capCargo > 1 ? 's' : ''
                  } cargo`
                : null,
              item.capPassenger
                ? `${item.capPassenger} passenger${
                    item.capPassenger === 1 ? '' : 's'
                  }`
                : null,
            ]
              .filter(Boolean)
              .join(', ')}`
          : null;

      // These may not be present in homebrew
      const vehPartLower = [
        item.crew ? `Crew ${item.crew}` : null,
        item.vehAc ? `AC ${item.vehAc}` : null,
        item.vehHp
          ? `HP ${item.vehHp}${
              item.vehDmgThresh ? `, Damage Threshold ${item.vehDmgThresh}` : ''
            }`
          : null,
      ]
        .filter(Boolean)
        .join(', ');

      damageParts.push(
        [vehPartUpper, vehPartMiddle, vehPartLower]
          .filter(Boolean)
          .join('<br>'),
      );
    }
    const damage = damageParts.join(', ');
    const damageType = item.dmgType ? Parser.dmgTypeToFull(item.dmgType) : '';
    const propertiesTxt = renderer.item._getPropertiesText(item);
    return [damage, damageType, propertiesTxt];
  },

  getTypeRarityAndAttunementText(item) {
    const renderer = Renderer.get();
    const typeRarity = [
      item._typeHtml === 'Other' ? '' : item._typeHtml,
      [
        item.tier,
        item.rarity && renderer.item.doRenderRarity(item.rarity)
          ? item.rarity
          : '',
      ]
        .map(it => (it || '').trim())
        .filter(it => it)
        .join(', '),
    ]
      .filter(Boolean)
      .join(', ');
    return item.reqAttune ? `${typeRarity} ${item._attunement}` : typeRarity;
  },

  getAttunementAndAttunementCatText(item) {
    let attunement = null;
    let attunementCat = 'No';
    if (item.reqAttune != null) {
      if (item.reqAttune === true) {
        attunementCat = 'Yes';
        attunement = '(Requires Attunement)';
      } else if (item.reqAttune === 'OPTIONAL') {
        attunementCat = 'Optional';
        attunement = '(Attunement Optional)';
      } else if (item.reqAttune.toLowerCase().startsWith('by')) {
        attunementCat = 'By...';
        attunement = `(Requires Attunement ${item.reqAttune})`;
      } else {
        attunementCat = 'Yes'; // throw any weird ones in the "Yes" category (e.g. "outdoors at night")
        attunement = `(Requires Attunement ${item.reqAttune})`;
      }
    }
    return [attunement, attunementCat];
  },

  getHtmlAndTextTypes(item) {
    const typeListHtml = [];
    const typeListText = [];
    let showingBase = false;
    if (item.wondrous) {
      typeListHtml.push('Wondrous Item');
      typeListText.push('Wondrous Item');
    }
    if (item.staff) {
      typeListHtml.push('Staff');
      typeListText.push('Staff');
    }
    if (item.firearm) {
      typeListHtml.push('Firearm');
      typeListText.push('Firearm');
    }
    if (item.age) {
      typeListHtml.push(item.age);
      typeListText.push(item.age);
    }
    if (item.weaponCategory) {
      typeListHtml.push(
        `${item.weaponCategory} Weapon${
          item.baseItem
            ? ` (${Renderer.get().render(`{@item ${item.baseItem}`)})`
            : ''
        }`,
      );
      typeListText.push(`${item.weaponCategory} Weapon`);
      showingBase = true;
    }
    if (item.staff && item.type !== 'M') {
      // DMG p140: "Unless a staff's description says otherwise, a staff can be used as a quarterstaff."
      typeListHtml.push('Melee Weapon');
      typeListText.push('Melee Weapon');
    }
    if (item.type) {
      const abv = Parser.itemTypeToFull(item.type);
      if (!showingBase && !!item.baseItem)
        typeListHtml.push(
          `${abv} (${Renderer.get().render(`{@item ${item.baseItem}`)})`,
        );
      else typeListHtml.push(abv);
      typeListText.push(abv);
    }
    if (item.poison) {
      typeListHtml.push('Poison');
      typeListText.push('Poison');
    }
    return [typeListText, typeListHtml.join(', ')];
  },

  getRenderedEntries(item, isCompact) {
    const renderer = Renderer.get();

    const handlers = {
      string: (ident, str) => {
        const stack = [];
        let depth = 0;

        const tgtLen = item.name.length;
        const tgtName = item.name.toLowerCase();
        const tgtLenPlural = item.name.length + 1;
        const tgtNamePlural = `${tgtName}s`;

        const len = str.length;
        for (let i = 0; i < len; ++i) {
          const c = str[i];

          switch (c) {
            case '{': {
              if (str[i + 1] === '@') depth++;
              stack.push(c);
              break;
            }
            case '}': {
              if (depth) depth--;
              stack.push(c);
              break;
            }
            default:
              stack.push(c);
              break;
          }

          if (!depth) {
            if (
              stack
                .slice(-tgtLen)
                .join('')
                .toLowerCase() === tgtName
            ) {
              stack.splice(
                stack.length - tgtLen,
                tgtLen,
                `{@i ${stack.slice(-tgtLen).join('')}}`,
              );
            } else if (
              stack
                .slice(-tgtLenPlural)
                .join('')
                .toLowerCase() === tgtNamePlural
            ) {
              stack.splice(
                stack.length - tgtLenPlural,
                tgtLenPlural,
                `{@i ${stack.slice(-tgtLenPlural).join('')}}`,
              );
            }
          }
        }

        return stack.join('');
      },
    };

    const walkerKeyBlacklist = new Set([
      'caption',
      'type',
      'colLabels',
      'dataCreature',
      'dataSpell',
      'name',
    ]);

    const renderStack = [];
    if (item._fullEntries || (item.entries && item.entries.length)) {
      const entryList = MiscUtil.copy({
        type: 'entries',
        entries: item._fullEntries || item.entries,
      });
      const procEntryList = MiscUtil.getWalker(walkerKeyBlacklist).walk(
        'italiciseName',
        entryList,
        handlers,
      );
      renderer.recursiveRender(procEntryList, renderStack, { depth: 1 });
    }

    if (item._fullAdditionalEntries || item.additionalEntries) {
      const additionEntriesList = MiscUtil.copy({
        type: 'entries',
        entries: item._fullAdditionalEntries || item.additionalEntries,
      });
      const procAdditionEntriesList = MiscUtil.getWalker(
        walkerKeyBlacklist,
      ).walk('italiciseName', additionEntriesList, handlers);
      renderer.recursiveRender(procAdditionEntriesList, renderStack, {
        depth: 1,
      });
    }

    if (!isCompact && item.lootTables) {
      renderStack.push(
        `<div><span class="font-bold">Found On: </span>${item.lootTables
          .sort(SortUtil.ascSortLower)
          .map(tbl => renderer.render(`{@table ${tbl}}`))
          .join(', ')}</div>`,
      );
    }

    return renderStack.join('').trim();
  },

  getCompactRenderedString(item, withEntries = true) {
    const renderer = Renderer.get();
    const [
      damage,
      damageType,
      propertiesTxt,
    ] = renderer.item.getDamageAndPropertiesText(item);
    const hasEntries =
      withEntries &&
      ((item._fullEntries && item._fullEntries.length) ||
        (item.entries && item.entries.length));

    return `
          ${Renderer.utils.getExcludedTr(item, 'item')}
          ${Renderer.utils.getNameTr(item)}
          <tr><td class="rd-item__type-rarity-attunement" colspan="6">${renderer.item.getTypeRarityAndAttunementText(
            item,
          )}</td></tr>
          <tr>
              <td colspan="2">${[
                Parser.itemValueToFull(item),
                Parser.itemWeightToFull(item),
              ]
                .filter(Boolean)
                .join(', ')}</td>
          </tr>
      <tr><td colspan="6">${damage}</td></tr>
      <tr><td colspan="6">${damageType}</td></tr>
      <tr><td colspan="6">${propertiesTxt}</td></tr>
          ${
            hasEntries
              ? `${Renderer.utils.getDividerTr()}<tr class="text"><td colspan="6" class="text">${renderer.item.getRenderedEntries(
                  item,
                  true,
                )}</td></tr>`
              : ''
          }`;
  },

  _hiddenRarity: new Set(['None', 'Unknown', 'Unknown (Magic)', 'Varies']),
  doRenderRarity(rarity) {
    const renderer = Renderer.get();
    return !renderer.item._hiddenRarity.has(rarity);
  },

  propertyMap: {},
  typeMap: {},
  _additionalEntriesMap: {},

  _addProperty(p) {
    const renderer = Renderer.get();
    if (renderer.item.propertyMap[p.abbreviation]) return;
    renderer.item.propertyMap[p.abbreviation] = p.name
      ? MiscUtil.copy(p)
      : {
          name: p.entries[0].name.toLowerCase(),
          entries: p.entries,
          template: p.template,
        };
  },
  _addType(t) {
    const renderer = Renderer.get();
    if (renderer.item.typeMap[t.abbreviation]) return;
    renderer.item.typeMap[t.abbreviation] = t.name
      ? MiscUtil.copy(t)
      : {
          name: t.entries[0].name.toLowerCase(),
          entries: t.entries,
        };
  },
  _addAdditionalEntries(e) {
    const renderer = Renderer.get();
    if (renderer.item._additionalEntriesMap[e.appliesTo]) return;
    renderer.item._additionalEntriesMap[e.appliesTo] = MiscUtil.copy(e.entries);
  },
};

Renderer.psionic = {
  enhanceMode: mode => {
    if (!mode.enhanced) {
      mode.name = `${mode.name} ${getModeSuffix(mode, false)}`;

      if (mode.submodes) {
        mode.submodes.forEach(sm => {
          sm.name = `${sm.name} ${getModeSuffix(sm, true)}`;
        });
      }

      mode.enhanced = true;
    }

    function getModeSuffix(mode, subMode) {
      subMode = subMode == null ? false : subMode;
      const modeTitleArray = [];
      const bracketPart = getModeTitleBracketPart();
      if (bracketPart != null) modeTitleArray.push(bracketPart);
      if (subMode) return `${modeTitleArray.join(' ')}`;
      else return `${modeTitleArray.join(' ')}`;

      function getModeTitleBracketPart() {
        const modeTitleBracketArray = [];

        if (mode.cost) modeTitleBracketArray.push(getModeTitleCost());
        if (mode.concentration)
          modeTitleBracketArray.push(getModeTitleConcentration());

        if (modeTitleBracketArray.length === 0) return null;
        return `(${modeTitleBracketArray.join('; ')})`;

        function getModeTitleCost() {
          const costMin = mode.cost.min;
          const costMax = mode.cost.max;
          const costString =
            costMin === costMax ? costMin : `${costMin}-${costMax}`;
          return `${costString} psi`;
        }

        function getModeTitleConcentration() {
          return `conc., ${mode.concentration.duration} ${mode.concentration.unit}.`;
        }
      }
    }
  },

  getBodyText(psi, renderer) {
    const renderStack = [];
    if (psi.entries)
      Renderer.get().recursiveRender(
        { entries: psi.entries, type: 'entries' },
        renderStack,
      );
    if (psi.focus)
      renderStack.push(Renderer.psionic.getFocusString(psi, renderer));
    if (psi.modes)
      renderStack.push(
        ...psi.modes.map(mode =>
          Renderer.psionic.getModeString(mode, renderer),
        ),
      );
    return renderStack.join('');
  },

  getDescriptionString: (psionic, renderer) => {
    return `<p>${renderer.render({
      type: 'inline',
      entries: [psionic.description],
    })}</p>`;
  },

  getFocusString: (psionic, renderer) => {
    return `<p><span class="psi-focus-title">Psychic Focus.</span> ${renderer.render(
      { type: 'inline', entries: [psionic.focus] },
    )}</p>`;
  },

  getModeString: (mode, renderer) => {
    Renderer.psionic.enhanceMode(mode);

    const renderStack = [];
    renderer.recursiveRender(mode, renderStack, { depth: 2 });
    const modeString = renderStack.join('');
    if (mode.submodes == null) return modeString;
    const subModeString = Renderer.psionic.getSubModeString(
      mode.submodes,
      renderer,
    );
    return `${modeString}${subModeString}`;
  },

  getSubModeString(subModes, renderer) {
    const fauxEntry = {
      type: 'list',
      style: 'list-hang-notitle',
      items: [],
    };

    for (let i = 0; i < subModes.length; ++i) {
      fauxEntry.items.push({
        type: 'item',
        name: subModes[i].name,
        entry: subModes[i].entries.join('<br>'),
      });
    }
    const renderStack = [];
    renderer.recursiveRender(fauxEntry, renderStack, { depth: 2 });
    return renderStack.join('');
  },

  getTypeOrderString(psi) {
    const typeMeta = Parser.psiTypeToMeta(psi.type);
    // if "isAltDisplay" is true, render as e.g. "Greater Discipline (Awakened)" rather than "Awakened Greater Discipline"
    return typeMeta.hasOrder
      ? typeMeta.isAltDisplay
        ? `${typeMeta.full} (${psi.order})`
        : `${psi.order} ${typeMeta.full}`
      : typeMeta.full;
  },

  getCompactRenderedString(psi) {
    return `
              ${Renderer.utils.getExcludedTr(psi, 'psionic')}
              ${Renderer.utils.getNameTr(psi, { page: UrlUtil.PG_PSIONICS })}
              <tr class="text"><td colspan="6">
              <p><i>${Renderer.psionic.getTypeOrderString(psi)}</i></p>
              ${Renderer.psionic.getBodyText(
                psi,
                Renderer.get().setFirstSection(true),
              )}
              </td></tr>
          `;
  },
};

Renderer.rule = {
  getCompactRenderedString(rule) {
    return `
              <tr><td colspan="6">
              ${Renderer.get()
                .setFirstSection(true)
                .render(rule)}
              </td></tr>
          `;
  },
};

Renderer.variantrule = {
  getCompactRenderedString(rule) {
    const cpy = MiscUtil.copy(rule);
    delete cpy.name;
    return `
              ${Renderer.utils.getExcludedTr(rule, 'variantrule')}
              ${Renderer.utils.getNameTr(rule, {
                page: UrlUtil.PG_VARIATNRULES,
              })}
              <tr><td colspan="6">
              ${Renderer.get()
                .setFirstSection(true)
                .render(cpy)}
              </td></tr>
          `;
  },
};

Renderer.table = {
  getCompactRenderedString(it) {
    it.type = it.type || 'table';
    const cpy = MiscUtil.copy(it);
    delete cpy.name;
    return `
              ${Renderer.utils.getExcludedTr(it, 'table')}
              ${Renderer.utils.getNameTr(it, { page: UrlUtil.PG_TABLES })}
              <tr><td colspan="6">
              ${Renderer.get()
                .setFirstSection(true)
                .render(it)}
              </td></tr>
          `;
  },
};

Renderer.vehicle = {
  getCompactRenderedString(veh) {
    return Renderer.vehicle.getRenderedString(veh, { isCompact: true });
  },

  getRenderedString(veh, opts) {
    opts = opts || {};
    veh.vehicleType = veh.vehicleType || 'SHIP';
    switch (veh.vehicleType) {
      case 'SHIP':
        return Renderer.vehicle._getRenderedString_ship(veh, opts);
      case 'INFWAR':
        return Renderer.vehicle._getRenderedString_infwar(veh, opts);
      default:
        throw new Error(`Unhandled vehicle type "${veh.vehicleType}"`);
    }
  },

  _getRenderedString_ship(veh, opts) {
    const renderer = Renderer.get();

    function getSectionTitle(title) {
      return `<tr class="mon__stat-header-underline"><td colspan="6"><span>${title}</span></td></tr>`;
    }

    function getActionPart() {
      return renderer.render({ entries: veh.action });
    }

    function getSectionHpPart(sect, each) {
      if (!sect.ac && !sect.hp) return '';
      return `
                  <div><b>Armor Class</b> ${sect.ac}</div>
                  <div><b>Hit Points</b> ${sect.hp}${each ? ` each` : ''}${
        sect.dt ? ` (damage threshold ${sect.dt})` : ''
      }${sect.hpNote ? `; ${sect.hpNote}` : ''}</div>
              `;
    }

    function getControlSection(control) {
      if (!control) return '';
      return `
                  <tr class="mon__stat-header-underline"><td colspan="6"><span>Control: ${
                    control.name
                  }</span></td></tr>
                  <tr><td colspan="6">
                  ${getSectionHpPart(control)}
                  <div>${renderer.render({ entries: control.entries })}</div>
                  </td></tr>
              `;
    }

    function getMovementSection(move) {
      if (!move) return '';

      function getLocomotionSection(loc) {
        const asList = {
          type: 'list',
          style: 'list-hang-notitle',
          items: [
            {
              type: 'item',
              name: `Locomotion (${loc.mode})`,
              entries: loc.entries,
            },
          ],
        };
        return `<div>${renderer.render(asList)}</div>`;
      }

      function getSpeedSection(spd) {
        const asList = {
          type: 'list',
          style: 'list-hang-notitle',
          items: [
            {
              type: 'item',
              name: `Speed (${spd.mode})`,
              entries: spd.entries,
            },
          ],
        };
        return `<div>${renderer.render(asList)}</div>`;
      }

      return `
                  <tr class="mon__stat-header-underline"><td colspan="6"><span>${
                    move.isControl ? `Control and ` : ''
                  }Movement: ${move.name}</span></td></tr>
                  <tr><td colspan="6">
                  ${getSectionHpPart(move)}
                  ${(move.locomotion || []).map(getLocomotionSection)}
                  ${(move.speed || []).map(getSpeedSection)}
                  </td></tr>
              `;
    }

    function getWeaponSection(weap) {
      return `
                  <tr class="mon__stat-header-underline"><td colspan="6"><span>Weapons: ${
                    weap.name
                  }${weap.count ? ` (${weap.count})` : ''}</span></td></tr>
                  <tr><td colspan="6">
                  ${getSectionHpPart(weap, !!weap.count)}
                  ${renderer.render({ entries: weap.entries })}
                  </td></tr>
              `;
    }

    function getOtherSection(oth) {
      return `
                  <tr class="mon__stat-header-underline"><td colspan="6"><span>${
                    oth.name
                  }</span></td></tr>
                  <tr><td colspan="6">
                  ${getSectionHpPart(oth)}
                  ${renderer.render({ entries: oth.entries })}
                  </td></tr>
              `;
    }

    return `
              ${Renderer.utils.getExcludedTr(veh, 'vehicle')}
              ${Renderer.utils.getNameTr(veh, {
                extraThClasses: !opts.isCompact ? ['veh__name--token'] : null,
                page: UrlUtil.PG_VEHICLES,
              })}
              <tr class="text"><td colspan="6"><i>${Parser.sizeAbvToFull(
                veh.size,
              )} vehicle${
      veh.dimensions ? ` (${veh.dimensions.join(' by ')})` : ''
    }</i><br></td></tr>
              <tr class="text"><td colspan="6">
                  <div><b>Creature Capacity</b> ${veh.capCrew} crew${
      veh.capPassenger ? `, ${veh.capPassenger} passengers` : ''
    }</div>
                  ${
                    veh.capCargo
                      ? `<div><b>Cargo Capacity</b> ${
                          typeof veh.capCargo === 'string'
                            ? veh.capCargo
                            : `${veh.capCargo} ton${
                                veh.capCargo === 1 ? '' : 's'
                              }`
                        }</div>`
                      : ''
                  }
                  <div><b>Travel Pace</b> ${
                    veh.pace
                  } miles per hour (${veh.pace * 24} miles per day)</div>
              </td></tr>
              <tr><td colspan="6">
                  <table class="summary striped-even">
                      <tr>
                          <th class="col-2 text-center">STR</th>
                          <th class="col-2 text-center">DEX</th>
                          <th class="col-2 text-center">CON</th>
                          <th class="col-2 text-center">INT</th>
                          <th class="col-2 text-center">WIS</th>
                          <th class="col-2 text-center">CHA</th>
                      </tr>
                      <tr>
                          <td class="text-center">${Renderer.utils.getAbilityRoller(
                            veh,
                            'str',
                          )}</td>
                          <td class="text-center">${Renderer.utils.getAbilityRoller(
                            veh,
                            'dex',
                          )}</td>
                          <td class="text-center">${Renderer.utils.getAbilityRoller(
                            veh,
                            'con',
                          )}</td>
                          <td class="text-center">${Renderer.utils.getAbilityRoller(
                            veh,
                            'int',
                          )}</td>
                          <td class="text-center">${Renderer.utils.getAbilityRoller(
                            veh,
                            'wis',
                          )}</td>
                          <td class="text-center">${Renderer.utils.getAbilityRoller(
                            veh,
                            'cha',
                          )}</td>
                      </tr>
                  </table>
              </td></tr>
              <tr class="text"><td colspan="6">
                  ${
                    veh.immune
                      ? `<div><b>Damage Immunities</b> ${Parser.monImmResToFull(
                          veh.immune,
                        )}</div>`
                      : ''
                  }
                  ${
                    veh.conditionImmune
                      ? `<div><b>Condition Immunities</b> ${Parser.monCondImmToFull(
                          veh.conditionImmune,
                        )}</div>`
                      : ''
                  }
              </td></tr>
              ${veh.action ? getSectionTitle('Actions') : ''}
              ${
                veh.action
                  ? `<tr><td colspan="6">${getActionPart()}</td></tr>`
                  : ''
              }
              ${getSectionTitle('Hull')}
              <tr><td colspan="6">
              ${getSectionHpPart(veh.hull)}
              </td></tr>
              ${(veh.control || []).map(getControlSection).join('')}
              ${(veh.movement || []).map(getMovementSection).join('')}
              ${(veh.weapon || []).map(getWeaponSection).join('')}
              ${(veh.other || []).map(getOtherSection).join('')}
              ${Renderer.utils.getPageTr(veh)}
          `;
  },

  _getRenderedString_infwar(veh, opts) {
    const renderer = Renderer.get();
    const dexMod = Parser.getAbilityModNumber(veh.dex);

    return `
              ${Renderer.utils.getExcludedTr(veh, 'vehicle')}
              ${Renderer.utils.getNameTr(veh, {
                extraThClasses: !opts.isCompact ? ['veh__name--token'] : null,
                page: UrlUtil.PG_VEHICLES,
              })}
              <tr class="text"><td colspan="6"><i>${Parser.sizeAbvToFull(
                veh.size,
              )} vehicle (${veh.weight.toLocaleString()} lb.)</i><br></td></tr>
              <tr class="text"><td colspan="6">
                  <div><b>Creature Capacity</b> ${
                    veh.capCreature
                  } Medium creatures</div>
                  <div><b>Cargo Capacity</b> ${Parser.weightToFull(
                    veh.capCargo,
                  )}</div>
                  <div><b>Armor Class</b> ${
                    dexMod === 0 ? `19` : `${19 + dexMod} (19 while motionless)`
                  }</div>
                  <div><b>Hit Points</b> ${veh.hp.hp} (damage threshold ${
      veh.hp.dt
    }, mishap threshold ${veh.hp.mt})</div>
                  <div><b>Speed</b> ${veh.speed} ft.</div>
              </td></tr>
              <tr><td colspan="6">
                  <table class="summary striped-even">
                      <tr>
                          <th class="col-2 text-center">STR</th>
                          <th class="col-2 text-center">DEX</th>
                          <th class="col-2 text-center">CON</th>
                          <th class="col-2 text-center">INT</th>
                          <th class="col-2 text-center">WIS</th>
                          <th class="col-2 text-center">CHA</th>
                      </tr>
                      <tr>
                          <td class="text-center">${Renderer.utils.getAbilityRoller(
                            veh,
                            'str',
                          )}</td>
                          <td class="text-center">${Renderer.utils.getAbilityRoller(
                            veh,
                            'dex',
                          )}</td>
                          <td class="text-center">${Renderer.utils.getAbilityRoller(
                            veh,
                            'con',
                          )}</td>
                          <td class="text-center">${Renderer.utils.getAbilityRoller(
                            veh,
                            'int',
                          )}</td>
                          <td class="text-center">${Renderer.utils.getAbilityRoller(
                            veh,
                            'wis',
                          )}</td>
                          <td class="text-center">${Renderer.utils.getAbilityRoller(
                            veh,
                            'cha',
                          )}</td>
                      </tr>
                  </table>
              </td></tr>
              <tr class="text"><td colspan="6">
                  ${
                    veh.immune
                      ? `<div><b>Damage Immunities</b> ${Parser.monImmResToFull(
                          veh.immune,
                        )}</div>`
                      : ''
                  }
                  ${
                    veh.conditionImmune
                      ? `<div><b>Condition Immunities</b> ${Parser.monCondImmToFull(
                          veh.conditionImmune,
                        )}</div>`
                      : ''
                  }
              </td></tr>
              ${
                veh.trait
                  ? `<tr><td colspan="6"><div class="border"></div></td></tr>
              <tr class="text compact"><td colspan="6">
              ${Renderer.monster
                .getOrderedTraits(veh, renderer)
                .map(it => it.rendered || renderer.render(it, 2))
                .join('')}
              </td></tr>`
                  : ''
              }
              ${Renderer.monster.getCompactRenderedStringSection(
                veh,
                renderer,
                'Action Stations',
                'actionStation',
                2,
              )}
              ${Renderer.monster.getCompactRenderedStringSection(
                veh,
                renderer,
                'Reactions',
                'reaction',
                2,
              )}
              ${Renderer.utils.getPageTr(veh)}
          `;
  },
};

Renderer.action = {
  getCompactRenderedString(it) {
    const cpy = MiscUtil.copy(it);
    delete cpy.name;
    return `${Renderer.utils.getExcludedTr(
      it,
      'action',
    )}${Renderer.utils.getNameTr(it, { page: UrlUtil.PG_ACTIONS })}
          <tr><td colspan="6">${Renderer.get()
            .setFirstSection(true)
            .render(cpy)}</td></tr>`;
  },
};

Renderer.prototype.language = {
  getCompactRenderedString(it) {
    const renderer = Renderer.get();
    return renderer.language.getRenderedString(it);
  },

  getRenderedString(it) {
    const allEntries = [];

    const hasMeta = it.typicalSpeakers || it.script;

    if (it.entries) allEntries.push(...it.entries);
    if (it.dialects) {
      allEntries.push(
        `This language is a family which includes the following dialects: ${it.dialects
          .sort(SortUtil.ascSortLower)
          .join(
            ', ',
          )}. Creatures that speak different dialects of the same language can communicate with one another.`,
      );
    }

    if (!allEntries.length && !hasMeta)
      allEntries.push('{@i No information available.}');

    return `
          ${Renderer.utils.getExcludedTr(it, 'language')}
          ${Renderer.utils.getNameTr(it, { page: UrlUtil.PG_LANGUAGES })}
          ${
            it.type
              ? `<tr class="text"><td colspan="6" class="pt-0"><i>${it.type.toTitleCase()} language</i></td></tr>`
              : ''
          }
          ${
            hasMeta
              ? `<tr class="text"><td colspan="6">
          ${
            it.typicalSpeakers
              ? `<div><b>Typical Speakers</b> ${Renderer.get().render(
                  it.typicalSpeakers.join(', '),
                )}</b>`
              : ''
          }
          ${
            it.script
              ? `<div><b>Script</b> ${Renderer.get().render(it.script)}</div>`
              : ''
          }
          <div></div>
          </td></tr>`
              : ''
          }
          ${
            allEntries.length
              ? `<tr class="text"><td colspan="6">
          ${Renderer.get()
            .setFirstSection(true)
            .render({ entries: allEntries })}
          </td></tr>`
              : ''
          }
          ${Renderer.utils.getPageTr(it)}`;
  },
};

Renderer.dice = {
  SYSTEM_USER: {
    name: 'Avandra', // goddess of luck
  },
  POS_INFINITE: 100000000000000000000, // larger than this, and we start to see "e" numbers appear
};

/**
 * Recursively find all the names of entries, useful for indexing
 * @param nameStack an array to append the names to
 * @param entry the base entry
 * @param [opts] Options object.
 * @param [opts.maxDepth] Maximum depth to search for
 * @param [opts.depth] Start depth (used internally when recursing)
 * @param [opts.typeBlacklist] A set of entry types to avoid.
 */
Renderer.getNames = function(nameStack, entry, opts) {
  opts = opts || {};
  if (opts.maxDepth == null) opts.maxDepth = false;
  if (opts.depth == null) opts.depth = 0;

  if (opts.typeBlacklist && entry.type && opts.typeBlacklist.has(entry.type))
    return;

  if (opts.maxDepth !== false && opts.depth > opts.maxDepth) return;
  if (entry.name) nameStack.push(Renderer.stripTags(entry.name));
  if (entry.entries) {
    let nextDepth =
      entry.type === 'section'
        ? -1
        : entry.type === 'entries'
        ? opts.depth + 1
        : opts.depth;
    for (const eX of entry.entries) {
      const nxtOpts = { ...opts };
      nxtOpts.depth = nextDepth;
      Renderer.getNames(nameStack, eX, nxtOpts);
    }
  } else if (entry.items) {
    for (const eX of entry.items) {
      Renderer.getNames(nameStack, eX, opts);
    }
  }
};

Renderer.getNumberedNames = function(entry) {
  const renderer = new Renderer().setTrackTitles(true);
  renderer.render(entry);
  const titles = renderer.getTrackedTitles();
  const out = {};
  Object.entries(titles).forEach(([k, v]) => {
    v = Renderer.stripTags(v);
    out[v] = Number(k);
  });
  return out;
};

// dig down until we find a name, as feature names can be nested
Renderer.findName = function(entry) {
  function search(it) {
    if (it instanceof Array) {
      for (const child of it) {
        const n = search(child);
        if (n) return n;
      }
    } else if (it instanceof Object) {
      if (it.name) return it.name;
      else {
        for (const child of Object.values(it)) {
          const n = search(child);
          if (n) return n;
        }
      }
    }
  }
  return search(entry);
};

Renderer.stripTags = function(str) {
  let nxtStr = Renderer._stripTagLayer(str);
  while (nxtStr.length !== str.length) {
    str = nxtStr;
    nxtStr = Renderer._stripTagLayer(str);
  }
  return nxtStr;
};

Renderer._stripTagLayer = function(str) {
  if (str.includes('{@')) {
    const tagSplit = Renderer.splitByTags(str);
    return tagSplit
      .filter(it => it)
      .map(it => {
        if (it.startsWith('@')) {
          let [tag, text] = Renderer.splitFirstSpace(it);
          text = text.replace(/<\$([^$]+)\$>/gi, ''); // remove any variable tags
          switch (tag) {
            case '@b':
            case '@bold':
            case '@i':
            case '@italic':
            case '@s':
            case '@strike':
            case '@u':
            case '@underline':
              return text;

            case '@h':
              return 'Hit: ';

            case '@dc':
              return `DC ${text}`;

            case '@atk':
              return Renderer.attackTagToFull(text);

            case '@chance':
            case '@d20':
            case '@damage':
            case '@dice':
            case '@hit':
            case '@recharge': {
              const [rollText, displayText] = text.split('|');
              switch (tag) {
                case '@damage':
                case '@dice': {
                  return displayText || rollText.replace(/;/g, '/');
                }
                case '@d20':
                case '@hit': {
                  return (
                    displayText ||
                    (() => {
                      const n = Number(rollText);
                      if (isNaN(n)) {
                        throw new Error(
                          `Could not parse "${rollText}" as a number!`,
                        );
                      }
                      return `${n >= 0 ? '+' : ''}${n}`;
                    })()
                  );
                }
                case '@recharge': {
                  const asNum = Number(rollText || 6);
                  if (isNaN(asNum)) {
                    throw new Error(
                      `Could not parse "${rollText}" as a number!`,
                    );
                  }
                  return `(Recharge ${asNum}${asNum < 6 ? `\u20136` : ''})`;
                }
                case '@chance': {
                  return displayText || `${rollText} percent`;
                }
              }
              throw new Error(`Unhandled tag: ${tag}`);
            }

            case '@comic':
            case '@comicH1':
            case '@comicH2':
            case '@comicH3':
            case '@comicH4':
            case '@comicNote':
            case '@note':
            case '@sense':
            case '@skill': {
              return text;
            }

            case '@5etools':
            case '@adventure':
            case '@book':
            case '@filter':
            case '@footnote':
            case '@link':
            case '@scaledice':
            case '@scaledamage':
            case '@loader':
            case '@color':
            case '@highlight': {
              const parts = text.split('|');
              return parts[0];
            }

            case '@area': {
              const [compactText, areaId, flags, ...others] = text.split('|');

              return flags && flags.includes('x')
                ? compactText
                : `${
                    flags && flags.includes('u') ? 'A' : 'a'
                  }rea ${compactText}`;
            }

            case '@action':
            case '@background':
            case '@boon':
            case '@class':
            case '@condition':
            case '@creature':
            case '@cult':
            case '@disease':
            case '@feat':
            case '@hazard':
            case '@item':
            case '@language':
            case '@object':
            case '@optfeature':
            case '@psionic':
            case '@race':
            case '@reward':
            case '@vehicle':
            case '@spell':
            case '@table':
            case '@trap':
            case '@variantrule': {
              const parts = text.split('|');
              return parts.length >= 3 ? parts[2] : parts[0];
            }

            case '@deity': {
              const parts = text.split('|');
              return parts.length >= 4 ? parts[3] : parts[0];
            }

            case '@homebrew': {
              const [newText, oldText] = text.split('|');
              if (newText && oldText) {
                return `${newText} [this is a homebrew addition, replacing the following: "${oldText}"]`;
              } else if (newText) {
                return `${newText} [this is a homebrew addition]`;
              } else if (oldText) {
                return `[the following text has been removed due to homebrew: ${oldText}]`;
              } else
                throw new Error(`Homebrew tag had neither old nor new text!`);
            }

            default:
              throw new Error(`Unhandled tag: "${tag}"`);
          }
        } else return it;
      })
      .join('');
  }
  return str;
};

Renderer.HEAD_NEG_1 = 'rd__b--0';
Renderer.HEAD_0 = 'rd__b--1';
Renderer.HEAD_1 = 'rd__b--2';
Renderer.HEAD_2 = 'rd__b--3';
Renderer.HEAD_2_SUB_VARIANT = 'rd__b--4';
Renderer.DATA_NONE = 'data-none';

// ************************************************************************* //
// Strict mode should not be used, as the roll20 script depends on this file //
// Do not use classes                                                        //
// ************************************************************************* //
// in deployment, `IS_DEPLOYED = "<version number>";` should be set below.
IS_DEPLOYED = undefined;
VERSION_NUMBER =
  /* 5ETOOLS_VERSION__OPEN */ '1.97.0' /* 5ETOOLS_VERSION__CLOSE */;
DEPLOYED_STATIC_ROOT = ''; // "https://static.5etools.com/"; // FIXME re-enable this when we have a CDN again
// for the roll20 script to set
IS_VTT = false;

IMGUR_CLIENT_ID = `abdea4de492d3b0`;

HASH_PART_SEP = ',';
HASH_LIST_SEP = '_';
HASH_SUB_LIST_SEP = '~';
HASH_SUB_KV_SEP = ':';
HASH_BLANK = 'blankhash';
HASH_SUB_NONE = 'null';

CLSS_NON_STANDARD_SOURCE = 'spicy-sauce';
CLSS_HOMEBREW_SOURCE = 'refreshing-brew';

MON_HASH_SCALED = 'scaled';

STR_NONE = 'None';
STR_SEE_CONSOLE = 'See the console (CTRL+SHIFT+J) for details.';

HOMEBREW_STORAGE = 'HOMEBREW_STORAGE';
HOMEBREW_META_STORAGE = 'HOMEBREW_META_STORAGE';
EXCLUDES_STORAGE = 'EXCLUDES_STORAGE';
DMSCREEN_STORAGE = 'DMSCREEN_STORAGE';
ROLLER_MACRO_STORAGE = 'ROLLER_MACRO_STORAGE';
ENCOUNTER_STORAGE = 'ENCOUNTER_STORAGE';
POINTBUY_STORAGE = 'POINTBUY_STORAGE';

JSON_HOMEBREW_INDEX = `homebrew/index.json`;

// STRING ==============================================================================================================
String.prototype.uppercaseFirst =
  String.prototype.uppercaseFirst ||
  function() {
    const str = this.toString();
    if (str.length === 0) return str;
    if (str.length === 1) return str.charAt(0).toUpperCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

String.prototype.lowercaseFirst =
  String.prototype.lowercaseFirst ||
  function() {
    const str = this.toString();
    if (str.length === 0) return str;
    if (str.length === 1) return str.charAt(0).toLowerCase();
    return str.charAt(0).toLowerCase() + str.slice(1);
  };

String.prototype.toTitleCase =
  String.prototype.toTitleCase ||
  function() {
    let str;
    str = this.replace(/([^\W_]+[^\s-/]*) */g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });

    if (!StrUtil._TITLE_LOWER_WORDS_RE) {
      StrUtil._TITLE_LOWER_WORDS_RE = StrUtil.TITLE_LOWER_WORDS.map(
        it => new RegExp(`\\s${it}\\s`, 'g'),
      );
    }

    for (let i = 0; i < StrUtil.TITLE_LOWER_WORDS.length; i++) {
      str = str.replace(StrUtil._TITLE_LOWER_WORDS_RE[i], txt => {
        return txt.toLowerCase();
      });
    }

    if (!StrUtil._TITLE_UPPER_WORDS_RE) {
      StrUtil._TITLE_UPPER_WORDS_RE = StrUtil.TITLE_UPPER_WORDS.map(
        it => new RegExp(`\\b${it}\\b`, 'g'),
      );
    }

    for (let i = 0; i < StrUtil.TITLE_UPPER_WORDS.length; i++) {
      str = str.replace(
        StrUtil._TITLE_UPPER_WORDS_RE[i],
        StrUtil.TITLE_UPPER_WORDS[i].toUpperCase(),
      );
    }

    return str;
  };

String.prototype.toSentenceCase =
  String.prototype.toSentenceCase ||
  function() {
    const out = [];
    const re = /([^.!?]+)([.!?]\s*|$)/gi;
    let m;
    do {
      m = re.exec(this);
      if (m) {
        out.push(m[0].toLowerCase().uppercaseFirst());
      }
    } while (m);
    return out.join('');
  };

String.prototype.toSpellCase =
  String.prototype.toSpellCase ||
  function() {
    return this.toLowerCase().replace(
      /(^|of )(bigby|otiluke|mordenkainen|evard|hadar|agatys|abi-dalzim|aganazzar|drawmij|leomund|maximilian|melf|nystul|otto|rary|snilloc|tasha|tenser|jim)('s|$| )/g,
      (...m) => `${m[1]}${m[2].toTitleCase()}${m[3]}`,
    );
  };

String.prototype.toCamelCase =
  String.prototype.toCamelCase ||
  function() {
    return this.split(' ')
      .map((word, index) => {
        if (index === 0) return word.toLowerCase();
        return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`;
      })
      .join('');
  };

String.prototype.escapeQuotes =
  String.prototype.escapeQuotes ||
  function() {
    return this.replace(/'/g, `&apos;`).replace(/"/g, `&quot;`);
  };

String.prototype.unescapeQuotes =
  String.prototype.unescapeQuotes ||
  function() {
    return this.replace(/&apos;/g, `'`).replace(/&quot;/g, `"`);
  };

String.prototype.encodeApos =
  String.prototype.encodeApos ||
  function() {
    return this.replace(/'/g, `%27`);
  };

/**
 * Calculates the Damerau-Levenshtein distance between two strings.
 * https://gist.github.com/IceCreamYou/8396172
 */
String.prototype.distance =
  String.prototype.distance ||
  function(target) {
    let source = this;
    let i;
    let j;
    if (!source) return target ? target.length : 0;
    else if (!target) return source.length;

    const m = source.length;
    const n = target.length;
    const INF = m + n;
    const score = new Array(m + 2);
    const sd = {};
    for (i = 0; i < m + 2; i++) score[i] = new Array(n + 2);
    score[0][0] = INF;
    for (i = 0; i <= m; i++) {
      score[i + 1][1] = i;
      score[i + 1][0] = INF;
      sd[source[i]] = 0;
    }
    for (j = 0; j <= n; j++) {
      score[1][j + 1] = j;
      score[0][j + 1] = INF;
      sd[target[j]] = 0;
    }

    for (i = 1; i <= m; i++) {
      let DB = 0;
      for (j = 1; j <= n; j++) {
        const i1 = sd[target[j - 1]];
        const j1 = DB;
        if (source[i - 1] === target[j - 1]) {
          score[i + 1][j + 1] = score[i][j];
          DB = j;
        } else {
          score[i + 1][j + 1] =
            Math.min(score[i][j], Math.min(score[i + 1][j], score[i][j + 1])) +
            1;
        }
        score[i + 1][j + 1] = Math.min(
          score[i + 1][j + 1],
          score[i1]
            ? score[i1][j1] + (i - i1 - 1) + 1 + (j - j1 - 1)
            : Infinity,
        );
      }
      sd[source[i - 1]] = i;
    }
    return score[m + 1][n + 1];
  };

String.prototype.isNumeric =
  String.prototype.isNumeric ||
  function() {
    return !isNaN(parseFloat(this)) && isFinite(this);
  };

String.prototype.last =
  String.prototype.last ||
  function() {
    return this[this.length - 1];
  };

String.prototype.escapeRegexp =
  String.prototype.escapeRegexp ||
  function() {
    return this.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  };

String.prototype.toUrlified =
  String.prototype.toUrlified ||
  function() {
    return encodeURIComponent(this).toLowerCase();
  };

Array.prototype.joinConjunct =
  Array.prototype.joinConjunct ||
  function(joiner, lastJoiner, nonOxford) {
    if (this.length === 0) return '';
    if (this.length === 1) return this[0];
    if (this.length === 2) return this.join(lastJoiner);
    else {
      let outStr = '';
      for (let i = 0; i < this.length; ++i) {
        outStr += this[i];
        if (i < this.length - 2) outStr += joiner;
        else if (i === this.length - 2)
          outStr += `${
            !nonOxford && this.length > 2 ? joiner.trim() : ''
          }${lastJoiner}`;
      }
      return outStr;
    }
  };

StrUtil = {
  COMMAS_NOT_IN_PARENTHESES_REGEX: /,\s?(?![^(]*\))/g,
  COMMA_SPACE_NOT_IN_PARENTHESES_REGEX: /, (?![^(]*\))/g,

  uppercaseFirst: function(string) {
    return string.uppercaseFirst();
  },
  // Certain minor words should be left lowercase unless they are the first or last words in the string
  TITLE_LOWER_WORDS: [
    'A',
    'An',
    'The',
    'And',
    'But',
    'Or',
    'For',
    'Nor',
    'As',
    'At',
    'By',
    'For',
    'From',
    'In',
    'Into',
    'Near',
    'Of',
    'On',
    'Onto',
    'To',
    'With',
  ],
  // Certain words such as initialisms or acronyms should be left uppercase
  TITLE_UPPER_WORDS: ['Id', 'Tv', 'Dm'],

  padNumber: (n, len, padder) => {
    return String(n).padStart(len, padder);
  },

  elipsisTruncate(str, atLeastPre = 5, atLeastSuff = 0, maxLen = 20) {
    if (maxLen >= str.length) return str;

    maxLen = Math.max(atLeastPre + atLeastSuff + 3, maxLen);
    let out = '';
    let remain = maxLen - (3 + atLeastPre + atLeastSuff);
    for (let i = 0; i < str.length - atLeastSuff; ++i) {
      const c = str[i];
      if (i < atLeastPre) out += c;
      else if (remain-- > 0) out += c;
    }
    if (remain < 0) out += '...';
    out += str.substring(str.length - atLeastSuff, str.length);
    return out;
  },

  toTitleCase(str) {
    return str.toTitleCase();
  },
};

CleanUtil = {
  getCleanJson(data, minify = false) {
    let str = minify
      ? JSON.stringify(data)
      : `${JSON.stringify(data, null, '\t')}\n`;
    return CleanUtil.getCleanString(str);
  },

  /**
   * @param str
   * @param isJsonDump If the string is intended to be re-parsed by `JSON.parse`
   */
  getCleanString(str, isJsonDump = true) {
    str = str
      .replace(
        CleanUtil.SHARED_REPLACEMENTS_REGEX,
        match => CleanUtil.SHARED_REPLACEMENTS[match],
      )
      .replace(/\u00AD/g, '') // soft hyphens
      .replace(/\s*(\.\s*\.\s*\.)/g, '$1');

    if (isJsonDump) {
      return str
        .replace(
          CleanUtil.STR_REPLACEMENTS_REGEX,
          match => CleanUtil.STR_REPLACEMENTS[match],
        )
        .replace(/\s*(\\u2014|\\u2013)\s*/g, '$1');
    } else {
      return str
        .replace(
          CleanUtil.JSON_REPLACEMENTS_REGEX,
          match => CleanUtil.JSON_REPLACEMENTS[match],
        )
        .replace(/\s*([\u2014\u2013])\s*/g, '$1');
    }
  },
};
CleanUtil.SHARED_REPLACEMENTS = {
  '’': "'",
  '…': '...',
  ' ': ' ', // non-breaking space
  ﬀ: 'ff',
  ﬃ: 'ffi',
  ﬄ: 'ffl',
  ﬁ: 'fi',
  ﬂ: 'fl',
  Ĳ: 'IJ',
  ĳ: 'ij',
  Ǉ: 'LJ',
  ǈ: 'Lj',
  ǉ: 'lj',
  Ǌ: 'NJ',
  ǋ: 'Nj',
  ǌ: 'nj',
  ﬅ: 'ft',
};
CleanUtil.STR_REPLACEMENTS = {
  '—': '\\u2014',
  '–': '\\u2013',
  '−': '\\u2212',
  '“': `\\"`,
  '”': `\\"`,
};
CleanUtil.JSON_REPLACEMENTS = {
  '“': `"`,
  '”': `"`,
};
CleanUtil.SHARED_REPLACEMENTS_REGEX = new RegExp(
  Object.keys(CleanUtil.SHARED_REPLACEMENTS).join('|'),
  'g',
);
CleanUtil.STR_REPLACEMENTS_REGEX = new RegExp(
  Object.keys(CleanUtil.STR_REPLACEMENTS).join('|'),
  'g',
);
CleanUtil.JSON_REPLACEMENTS_REGEX = new RegExp(
  Object.keys(CleanUtil.JSON_REPLACEMENTS).join('|'),
  'g',
);

// PARSING =============================================================================================================
Parser = {};
Parser._parse_aToB = function(abMap, a, fallback) {
  if (a === undefined || a === null)
    throw new TypeError('undefined or null object passed to parser');
  if (typeof a === 'string') a = a.trim();
  if (abMap[a] !== undefined) return abMap[a];
  return fallback !== undefined ? fallback : a;
};

Parser._parse_bToA = function(abMap, b) {
  if (b === undefined || b === null)
    throw new TypeError('undefined or null object passed to parser');
  if (typeof b === 'string') b = b.trim();
  for (const v in abMap) {
    if (!abMap.hasOwnProperty(v)) continue;
    if (abMap[v] === b) return v;
  }
  return b;
};

Parser.attrChooseToFull = function(attList) {
  if (attList.length === 1)
    return `${Parser.attAbvToFull(attList[0])} modifier`;
  else {
    const attsTemp = [];
    for (let i = 0; i < attList.length; ++i) {
      attsTemp.push(Parser.attAbvToFull(attList[i]));
    }
    return `${attsTemp.join(' or ')} modifier (your choice)`;
  }
};

Parser.numberToText = function(number) {
  if (number == null)
    throw new TypeError(`undefined or null object passed to parser`);
  if (Math.abs(number) >= 100) return `${number}`;

  function getAsText(num) {
    const abs = Math.abs(num);
    switch (abs) {
      case 0:
        return 'zero';
      case 1:
        return 'one';
      case 2:
        return 'two';
      case 3:
        return 'three';
      case 4:
        return 'four';
      case 5:
        return 'five';
      case 6:
        return 'six';
      case 7:
        return 'seven';
      case 8:
        return 'eight';
      case 9:
        return 'nine';
      case 10:
        return 'ten';
      case 11:
        return 'eleven';
      case 12:
        return 'twelve';
      case 13:
        return 'thirteen';
      case 14:
        return 'fourteen';
      case 15:
        return 'fifteen';
      case 16:
        return 'sixteen';
      case 17:
        return 'seventeen';
      case 18:
        return 'eighteen';
      case 19:
        return 'nineteen';
      case 20:
        return 'twenty';
      case 30:
        return 'thirty';
      case 40:
        return 'forty';
      case 50:
        return 'fiddy'; // :^)
      case 60:
        return 'sixty';
      case 70:
        return 'seventy';
      case 80:
        return 'eighty';
      case 90:
        return 'ninety';
      default: {
        const str = String(abs);
        return `${getAsText(Number(`${str[0]}0`))}-${getAsText(
          Number(str[1]),
        )}`;
      }
    }
  }
  return `${number < 0 ? 'negative ' : ''}${getAsText(number)}`;
};

Parser.numberToVulgar = function(number) {
  const spl = `${number}`.split('.');
  if (spl.length === 1) return number;
  if (spl[1] === '5') return `${spl[0]}½`;
  if (spl[1] === '25') return `${spl[0]}¼`;
  if (spl[1] === '75') return `${spl[0]}¾`;
  return Parser.numberToFractional(number);
};

Parser._greatestCommonDivisor = function(a, b) {
  if (b < Number.EPSILON) return a;
  return Parser._greatestCommonDivisor(b, Math.floor(a % b));
};
Parser.numberToFractional = function(number) {
  const len = number.toString().length - 2;
  let denominator = Math.pow(10, len);
  let numerator = number * denominator;
  const divisor = Parser._greatestCommonDivisor(numerator, denominator);
  numerator = Math.floor(numerator / divisor);
  denominator = Math.floor(denominator / divisor);

  return denominator === 1
    ? String(numerator)
    : `${Math.floor(numerator)}/${Math.floor(denominator)}`;
};

Parser.ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

Parser.attAbvToFull = function(abv) {
  return Parser._parse_aToB(Parser.ATB_ABV_TO_FULL, abv);
};

Parser.attFullToAbv = function(full) {
  return Parser._parse_bToA(Parser.ATB_ABV_TO_FULL, full);
};

Parser.sizeAbvToFull = function(abv) {
  return Parser._parse_aToB(Parser.SIZE_ABV_TO_FULL, abv || '');
};

Parser.getAbilityModNumber = function(abilityScore) {
  return Math.floor((abilityScore - 10) / 2);
};

Parser.getAbilityModifier = function(abilityScore) {
  let modifier = Parser.getAbilityModNumber(abilityScore);
  if (modifier >= 0) modifier = `+${modifier}`;
  return `${modifier}`;
};

Parser.getSpeedString = it => {
  if (it.speed == null) return '\u2014';

  function procSpeed(propName) {
    function addSpeed(s) {
      stack.push(
        `${propName === 'walk' ? '' : `${propName} `}${getVal(s)} ft.${getCond(
          s,
        )}`,
      );
    }

    if (it.speed[propName] || propName === 'walk')
      addSpeed(it.speed[propName] || 0);
    if (it.speed.alternate && it.speed.alternate[propName])
      it.speed.alternate[propName].forEach(addSpeed);
  }

  function getVal(speedProp) {
    return speedProp.number != null ? speedProp.number : speedProp;
  }

  function getCond(speedProp) {
    return speedProp.condition
      ? ` ${Renderer.get().render(speedProp.condition)}`
      : '';
  }

  const stack = [];
  if (typeof it.speed === 'object') {
    let joiner = ', ';
    procSpeed('walk');
    procSpeed('burrow');
    procSpeed('climb');
    procSpeed('fly');
    procSpeed('swim');
    if (it.speed.choose) {
      joiner = '; ';
      stack.push(
        `${it.speed.choose.from.sort().joinConjunct(', ', ' or ')} ${
          it.speed.choose.amount
        } ft.${it.speed.choose.note ? ` ${it.speed.choose.note}` : ''}`,
      );
    }
    return stack.join(joiner);
  } else {
    return it.speed + (it.speed === 'Varies' ? '' : ' ft. ');
  }
};

Parser.SPEED_TO_PROGRESSIVE = {
  walk: 'walking',
  burrow: 'burrowing',
  climb: 'climbing',
  fly: 'flying',
  swim: 'swimming',
};

Parser.speedToProgressive = function(prop) {
  return Parser._parse_aToB(Parser.SPEED_TO_PROGRESSIVE, prop);
};

Parser._addCommas = function(intNum) {
  return `${intNum}`.replace(/(\d)(?=(\d{3})+$)/g, '$1,');
};

Parser.crToXp = function(cr) {
  if (cr != null && cr.xp) return Parser._addCommas(cr.xp);

  const toConvert = cr ? cr.cr || cr : null;
  if (toConvert === 'Unknown' || toConvert == null) return 'Unknown';
  if (toConvert === '0') return '0 or 10';
  if (toConvert === '1/8') return '25';
  if (toConvert === '1/4') return '50';
  if (toConvert === '1/2') return '100';
  return Parser._addCommas(Parser.XP_CHART[parseInt(toConvert) - 1]);
};

Parser.crToXpNumber = function(cr) {
  if (cr != null && cr.xp) return cr.xp;
  const toConvert = cr ? cr.cr || cr : cr;
  if (toConvert === 'Unknown' || toConvert == null) return null;
  return Parser.XP_CHART_ALT[toConvert];
};

LEVEL_TO_XP_EASY = [
  0,
  25,
  50,
  75,
  125,
  250,
  300,
  350,
  450,
  550,
  600,
  800,
  1000,
  1100,
  1250,
  1400,
  1600,
  2000,
  2100,
  2400,
  2800,
];
LEVEL_TO_XP_MEDIUM = [
  0,
  50,
  100,
  150,
  250,
  500,
  600,
  750,
  900,
  1100,
  1200,
  1600,
  2000,
  2200,
  2500,
  2800,
  3200,
  3900,
  4100,
  4900,
  5700,
];
LEVEL_TO_XP_HARD = [
  0,
  75,
  150,
  225,
  375,
  750,
  900,
  1100,
  1400,
  1600,
  1900,
  2400,
  3000,
  3400,
  3800,
  4300,
  4800,
  5900,
  6300,
  7300,
  8500,
];
LEVEL_TO_XP_DEADLY = [
  0,
  100,
  200,
  400,
  500,
  1100,
  1400,
  1700,
  2100,
  2400,
  2800,
  3600,
  4500,
  5100,
  5700,
  6400,
  7200,
  8800,
  9500,
  10900,
  12700,
];
LEVEL_TO_XP_DAILY = [
  0,
  300,
  600,
  1200,
  1700,
  3500,
  4000,
  5000,
  6000,
  7500,
  9000,
  10500,
  11500,
  13500,
  15000,
  18000,
  20000,
  25000,
  27000,
  30000,
  40000,
];

Parser.LEVEL_XP_REQUIRED = [
  0,
  300,
  900,
  2700,
  6500,
  14000,
  23000,
  34000,
  48000,
  64000,
  85000,
  100000,
  120000,
  140000,
  165000,
  195000,
  225000,
  265000,
  305000,
  355000,
];

Parser.CRS = [
  '0',
  '1/8',
  '1/4',
  '1/2',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '30',
];

Parser.levelToXpThreshold = function(level) {
  return [
    LEVEL_TO_XP_EASY[level],
    LEVEL_TO_XP_MEDIUM[level],
    LEVEL_TO_XP_HARD[level],
    LEVEL_TO_XP_DEADLY[level],
  ];
};

Parser.isValidCr = function(cr) {
  return Parser.CRS.includes(cr);
};

Parser.crToNumber = function(cr) {
  if (cr === 'Unknown' || cr === '\u2014' || cr == null) return 100;
  if (cr.cr) return Parser.crToNumber(cr.cr);
  const parts = cr.trim().split('/');
  if (parts.length === 1) return Number(parts[0]);
  else if (parts.length === 2) return Number(parts[0]) / Number(parts[1]);
  else return 0;
};

Parser.numberToCr = function(number, safe) {
  // avoid dying if already-converted number is passed in
  if (safe && typeof number === 'string' && Parser.CRS.includes(number))
    return number;

  if (number == null) return 'Unknown';

  return Parser.numberToFractional(number);
};

Parser.crToPb = function(cr) {
  if (cr === 'Unknown' || cr == null) return 0;
  cr = cr.cr || cr;
  if (Parser.crToNumber(cr) < 5) return 2;
  return Math.ceil(cr / 4) + 1;
};

Parser.levelToPb = function(level) {
  if (!level) return 2;
  return Math.ceil(level / 4) + 1;
};

Parser.SKILL_TO_ATB_ABV = {
  athletics: 'str',
  acrobatics: 'dex',
  'sleight of hand': 'dex',
  stealth: 'dex',
  arcana: 'int',
  history: 'int',
  investigation: 'int',
  nature: 'int',
  religion: 'int',
  'animal handling': 'wis',
  insight: 'wis',
  medicine: 'wis',
  perception: 'wis',
  survival: 'wis',
  deception: 'cha',
  intimidation: 'cha',
  performance: 'cha',
  persuasion: 'cha',
};

Parser.skillToAbilityAbv = function(skill) {
  return Parser._parse_aToB(Parser.SKILL_TO_ATB_ABV, skill);
};

Parser.SKILL_TO_SHORT = {
  athletics: 'ath',
  acrobatics: 'acro',
  'sleight of hand': 'soh',
  stealth: 'slth',
  arcana: 'arc',
  history: 'hist',
  investigation: 'invn',
  nature: 'natr',
  religion: 'reli',
  'animal handling': 'hndl',
  insight: 'ins',
  medicine: 'med',
  perception: 'perp',
  survival: 'surv',
  deception: 'decp',
  intimidation: 'intm',
  performance: 'perf',
  persuasion: 'pers',
};

Parser.skillToShort = function(skill) {
  return Parser._parse_aToB(Parser.SKILL_TO_SHORT, skill);
};

Parser.LANGUAGES_STANDARD = [
  'Common',
  'Dwarvish',
  'Elvish',
  'Giant',
  'Gnomish',
  'Goblin',
  'Halfling',
  'Orc',
];

Parser.LANGUAGES_EXOTIC = [
  'Abyssal',
  'Celestial',
  'Draconic',
  'Deep',
  'Infernal',
  'Primordial',
  'Sylvan',
  'Undercommon',
];

Parser.LANGUAGES_SECRET = ['Druidic', "Thieves' cant"];

Parser.LANGUAGES_ALL = [
  ...Parser.LANGUAGES_STANDARD,
  ...Parser.LANGUAGES_EXOTIC,
  ...Parser.LANGUAGES_SECRET,
].sort();

Parser.dragonColorToFull = function(c) {
  return Parser._parse_aToB(Parser.DRAGON_COLOR_TO_FULL, c);
};

Parser.DRAGON_COLOR_TO_FULL = {
  B: 'black',
  U: 'blue',
  G: 'green',
  R: 'red',
  W: 'white',
  A: 'brass',
  Z: 'bronze',
  C: 'copper',
  O: 'gold',
  S: 'silver',
};

Parser.acToFull = function(ac) {
  if (typeof ac === 'string') return ac; // handle classic format

  const renderer = Renderer.get();
  let stack = '';
  let inBraces = false;
  for (let i = 0; i < ac.length; ++i) {
    const cur = ac[i];
    const nxt = ac[i + 1];

    if (cur.ac) {
      const isNxtBraces = nxt && nxt.braces;

      if (i === 0 && cur.braces) {
        stack += '(';
        inBraces = true;
      }

      stack += cur.ac;

      if (cur.from) {
        // always brace nested braces
        if (cur.braces) {
          stack += ' (';
        } else {
          stack += inBraces ? '; ' : ' (';
        }

        inBraces = true;

        stack += cur.from.map(it => renderer.render(it)).join(', ');

        if (cur.braces) {
          stack += ')';
        } else if (!isNxtBraces) {
          stack += ')';
          inBraces = false;
        }
      }

      if (cur.condition) stack += ` ${renderer.render(cur.condition)}`;

      if (cur.braces) {
        if (!isNxtBraces) {
          stack += ')';
          inBraces = false;
        }
      }
    } else {
      stack += cur;
    }

    if (nxt) {
      if (nxt.braces) stack += inBraces ? '; ' : ' (';
      else stack += ', ';
    }
  }
  if (inBraces) stack += ')';

  return stack.trim();
};

MONSTER_COUNT_TO_XP_MULTIPLIER = [
  1,
  1.5,
  2,
  2,
  2,
  2,
  2.5,
  2.5,
  2.5,
  2.5,
  3,
  3,
  3,
  3,
  4,
];
Parser.numMonstersToXpMult = function(num, playerCount = 3) {
  const baseVal = (() => {
    if (num >= MONSTER_COUNT_TO_XP_MULTIPLIER.length) return 4;
    return MONSTER_COUNT_TO_XP_MULTIPLIER[num - 1];
  })();

  if (playerCount < 3) return baseVal >= 3 ? baseVal + 1 : baseVal + 0.5;
  else if (playerCount > 5) {
    return baseVal === 4 ? 3 : baseVal - 0.5;
  } else return baseVal;
};

Parser.armorFullToAbv = function(armor) {
  return Parser._parse_bToA(Parser.ARMOR_ABV_TO_FULL, armor);
};

Parser._getSourceStringFromSource = function(source) {
  if (source && source.source) return source.source;
  return source;
};
Parser._buildSourceCache = function(dict) {
  const out = {};
  Object.entries(dict).forEach(([k, v]) => (out[k.toLowerCase()] = v));
  return out;
};
Parser._sourceFullCache = null;
Parser.hasSourceFull = function(source) {
  Parser._sourceFullCache =
    Parser._sourceFullCache ||
    Parser._buildSourceCache(Parser.SOURCE_JSON_TO_FULL);
  return !!Parser._sourceFullCache[source.toLowerCase()];
};
Parser._sourceAbvCache = null;
Parser.hasSourceAbv = function(source) {
  Parser._sourceAbvCache =
    Parser._sourceAbvCache ||
    Parser._buildSourceCache(Parser.SOURCE_JSON_TO_ABV);
  return !!Parser._sourceAbvCache[source.toLowerCase()];
};
Parser._sourceDateCache = null;
Parser.hasSourceDate = function(source) {
  Parser._sourceDateCache =
    Parser._sourceDateCache ||
    Parser._buildSourceCache(Parser.SOURCE_JSON_TO_DATE);
  return !!Parser._sourceDateCache[source.toLowerCase()];
};
Parser.sourceJsonToFull = function(source) {
  source = Parser._getSourceStringFromSource(source);
  if (Parser.hasSourceFull(source))
    return Parser._sourceFullCache[source.toLowerCase()].replace(
      /'/g,
      '\u2019',
    );
  if (BrewUtil.hasSourceJson(source))
    return BrewUtil.sourceJsonToFull(source).replace(/'/g, '\u2019');
  return Parser._parse_aToB(Parser.SOURCE_JSON_TO_FULL, source).replace(
    /'/g,
    '\u2019',
  );
};
Parser.sourceJsonToFullCompactPrefix = function(source) {
  return Parser.sourceJsonToFull(source)
    .replace(UA_PREFIX, UA_PREFIX_SHORT)
    .replace(AL_PREFIX, AL_PREFIX_SHORT)
    .replace(PS_PREFIX, PS_PREFIX_SHORT);
};
Parser.sourceJsonToAbv = function(source) {
  source = Parser._getSourceStringFromSource(source);
  if (Parser.hasSourceAbv(source))
    return Parser._sourceAbvCache[source.toLowerCase()];
  if (BrewUtil.hasSourceJson(source)) return BrewUtil.sourceJsonToAbv(source);
  return Parser._parse_aToB(Parser.SOURCE_JSON_TO_ABV, source);
};
Parser.sourceJsonToDate = function(source) {
  source = Parser._getSourceStringFromSource(source);
  if (Parser.hasSourceDate(source))
    return Parser._sourceDateCache[source.toLowerCase()];
  if (BrewUtil.hasSourceJson(source)) return BrewUtil.sourceJsonToDate(source);
  return Parser._parse_aToB(Parser.SOURCE_JSON_TO_DATE, source, null);
};

Parser.sourceJsonToColor = function(source) {
  return `source${Parser.sourceJsonToAbv(source)}`;
};

Parser.stringToSlug = function(str) {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

Parser.stringToCasedSlug = function(str) {
  return str.replace(/[^\w ]+/g, '').replace(/ +/g, '-');
};

Parser.itemTypeToFull = function(type) {
  return Parser._parse_aToB(Parser.ITEM_TYPE_JSON_TO_ABV, type);
};

Parser.itemValueToFull = function(item, isShortForm) {
  return Parser._moneyToFull(item, 'value', 'valueMult', isShortForm);
};

Parser.spellComponentCostToFull = function(item, isShortForm) {
  return Parser._moneyToFull(item, 'cost', 'costMult', isShortForm);
};

Parser._moneyToFull = function(it, prop, propMult, isShortForm) {
  if (it[prop]) {
    const { coin, mult } = Parser.getCurrencyAndMultiplier(
      it[prop],
      it.currencyConversion,
    );
    return `${(it[prop] * mult).toLocaleString()} ${coin}`;
  } else if (it[propMult])
    return isShortForm ? `×${it[propMult]}` : `base value ×${it[propMult]}`;
  return '';
};

Parser._DEFAULT_CURRENCY_CONVERSION_TABLE = [
  {
    coin: 'cp',
    mult: 1,
  },
  {
    coin: 'sp',
    mult: 0.1,
  },
  {
    coin: 'gp',
    mult: 0.01,
    isFallback: true,
  },
];
Parser.getCurrencyAndMultiplier = function(value, currencyConversionId) {
  const fromBrew = currencyConversionId
    ? MiscUtil.get(
        BrewUtil.homebrewMeta,
        'currencyConversions',
        currencyConversionId,
      )
    : null;
  const conversionTable =
    fromBrew && fromBrew.length
      ? fromBrew
      : Parser._DEFAULT_CURRENCY_CONVERSION_TABLE;
  if (conversionTable !== Parser._DEFAULT_CURRENCY_CONVERSION_TABLE)
    conversionTable.sort((a, b) => SortUtil.ascSort(b.mult, a.mult));

  if (!value)
    return conversionTable.find(it => it.isFallback) || conversionTable[0];
  if (conversionTable.length === 1) return conversionTable[0];
  if (!Number.isInteger(value) && value < conversionTable[0].mult)
    return conversionTable[0];

  for (let i = conversionTable.length - 1; i >= 0; --i) {
    if (Number.isInteger(value * conversionTable[i].mult))
      return conversionTable[i];
  }

  return conversionTable.last();
};

Parser.COIN_ABVS = ['cp', 'sp', 'ep', 'gp', 'pp'];
Parser.COIN_ABV_TO_FULL = {
  cp: 'copper pieces',
  sp: 'silver pieces',
  ep: 'electrum pieces',
  gp: 'gold pieces',
  pp: 'platinum pieces',
};
Parser.COIN_CONVERSIONS = [1, 10, 50, 100, 1000];

Parser.coinAbvToFull = function(coin) {
  return Parser._parse_aToB(Parser.COIN_ABV_TO_FULL, coin);
};

Parser.itemWeightToFull = function(item, isShortForm) {
  return item.weight
    ? `${item.weight} lb.${item.weightNote ? ` ${item.weightNote}` : ''}`
    : item.weightMult
    ? isShortForm
      ? `×${item.weightMult}`
      : `base weight ×${item.weightMult}`
    : '';
};

Parser._decimalSeparator = (0.1).toLocaleString().substring(1, 2);
Parser._numberCleanRegexp =
  Parser._decimalSeparator === '.'
    ? new RegExp(/[\s,]*/g, 'g')
    : new RegExp(/[\s.]*/g, 'g');
Parser._costSplitRegexp =
  Parser._decimalSeparator === '.'
    ? new RegExp(/(\d+(\.\d+)?)([csegp]p)/)
    : new RegExp(/(\d+(,\d+)?)([csegp]p)/);

Parser.weightValueToNumber = function(value) {
  if (!value) return 0;

  if (Number(value)) return Number(value);
  else throw new Error(`Badly formatted value ${value}`);
};

Parser.dmgTypeToFull = function(dmgType) {
  return Parser._parse_aToB(Parser.DMGTYPE_JSON_TO_FULL, dmgType);
};

Parser.skillToExplanation = function(skillType) {
  const fromBrew = MiscUtil.get(BrewUtil.homebrewMeta, 'skills', skillType);
  if (fromBrew) return fromBrew;
  return Parser._parse_aToB(Parser.SKILL_JSON_TO_FULL, skillType);
};

Parser.senseToExplanation = function(senseType) {
  senseType = senseType.toLowerCase();
  const fromBrew = MiscUtil.get(BrewUtil.homebrewMeta, 'senses', senseType);
  if (fromBrew) return fromBrew;
  return Parser._parse_aToB(Parser.SENSE_JSON_TO_FULL, senseType, [
    'No explanation available.',
  ]);
};

Parser.skillProficienciesToFull = function(skillProficiencies) {
  function renderSingle(skProf) {
    const keys = Object.keys(skProf).sort(SortUtil.ascSortLower);

    const ixChoose = keys.indexOf('choose');
    if (~ixChoose) keys.splice(ixChoose, 1);

    const baseStack = [];
    keys
      .filter(k => skProf[k])
      .forEach(k =>
        baseStack.push(Renderer.get().render(`{@skill ${k.toTitleCase()}}`)),
      );

    const chooseStack = [];
    if (~ixChoose) {
      const chObj = skProf.choose;
      if (chObj.from.length === 18) {
        chooseStack.push(
          `choose any ${
            !chObj.count || chObj.count === 1 ? 'skill' : chObj.count
          }`,
        );
      } else {
        chooseStack.push(
          `choose ${chObj.count || 1} from ${chObj.from
            .map(it => Renderer.get().render(`{@skill ${it.toTitleCase()}}`))
            .joinConjunct(', ', ' and ')}`,
        );
      }
    }

    const base = baseStack.joinConjunct(', ', ' and ');
    const choose = chooseStack.join(''); // this should currently only ever be 1-length

    if (baseStack.length && chooseStack.length) return `${base}; and ${choose}`;
    else if (baseStack.length) return base;
    else if (chooseStack.length) return choose;
  }

  return skillProficiencies.map(renderSingle).join(' <i>or</i> ');
};

// sp-prefix functions are for parsing spell data, and shared with the roll20 script
Parser.spSchoolAndSubschoolsAbvsToFull = function(school, subschools) {
  if (!subschools || !subschools.length)
    return Parser.spSchoolAbvToFull(school);
  else
    return `${Parser.spSchoolAbvToFull(school)} (${subschools
      .map(sub => Parser.spSchoolAbvToFull(sub))
      .join(', ')})`;
};

Parser.spSchoolAbvToFull = function(schoolOrSubschool) {
  const out = Parser._parse_aToB(
    Parser.SP_SCHOOL_ABV_TO_FULL,
    schoolOrSubschool,
  );
  if (Parser.SP_SCHOOL_ABV_TO_FULL[schoolOrSubschool]) return out;
  if (
    BrewUtil.homebrewMeta &&
    BrewUtil.homebrewMeta.spellSchools &&
    BrewUtil.homebrewMeta.spellSchools[schoolOrSubschool]
  )
    return BrewUtil.homebrewMeta.spellSchools[schoolOrSubschool].full;
  return out;
};

Parser.spSchoolAndSubschoolsAbvsShort = function(school, subschools) {
  if (!subschools || !subschools.length)
    return Parser.spSchoolAbvToShort(school);
  else
    return `${Parser.spSchoolAbvToShort(school)} (${subschools
      .map(sub => Parser.spSchoolAbvToShort(sub))
      .join(', ')})`;
};

Parser.spSchoolAbvToShort = function(school) {
  const out = Parser._parse_aToB(Parser.SP_SCHOOL_ABV_TO_SHORT, school);
  if (Parser.SP_SCHOOL_ABV_TO_SHORT[school]) return out;
  if (
    BrewUtil.homebrewMeta &&
    BrewUtil.homebrewMeta.spellSchools &&
    BrewUtil.homebrewMeta.spellSchools[school]
  )
    return BrewUtil.homebrewMeta.spellSchools[school].short;
  return out;
};

Parser.spSchoolAbvToStyle = function(school) {
  // For homebrew
  const rawColor = MiscUtil.get(
    BrewUtil,
    'homebrewMeta',
    'spellSchools',
    school,
    'color',
  );
  if (!rawColor || !rawColor.trim()) return '';
  const validColor = BrewUtil.getValidColor(rawColor);
  if (validColor.length) return `style="color: #${validColor}"`;
  return '';
};

Parser.getOrdinalForm = function(i) {
  i = Number(i);
  if (isNaN(i)) return '';
  const j = i % 10;
  const k = i % 100;
  if (j === 1 && k !== 11) return `${i}st`;
  if (j === 2 && k !== 12) return `${i}nd`;
  if (j === 3 && k !== 13) return `${i}rd`;
  return `${i}th`;
};

Parser.spLevelToFull = function(level) {
  if (level === 0) return 'Cantrip';
  else return Parser.getOrdinalForm(level);
};

Parser.getArticle = function(str) {
  return /^[aeiou]/.test(str) ? 'an' : 'a';
};

Parser.spLevelToFullLevelText = function(level, dash) {
  return `${Parser.spLevelToFull(level)}${
    level === 0 ? 's' : `${dash ? '-' : ' '}level`
  }`;
};

Parser.spMetaToArr = function(meta) {
  if (!meta) return [];
  return Object.entries(meta)
    .filter(([_, v]) => v)
    .sort(SortUtil.ascSort)
    .map(([k]) => k);
};

Parser.spMetaToFull = function(meta) {
  if (!meta) return '';
  const metaTags = Parser.spMetaToArr(meta);
  if (metaTags.length) return ` (${metaTags.join(', ')})`;
  return '';
};

Parser.spLevelSchoolMetaToFull = function(level, school, meta, subschools) {
  const levelPart =
    level === 0
      ? Parser.spLevelToFull(level).toLowerCase()
      : `${Parser.spLevelToFull(level)}-level`;
  const levelSchoolStr =
    level === 0
      ? `${Parser.spSchoolAbvToFull(school)} ${levelPart}`
      : `${levelPart} ${Parser.spSchoolAbvToFull(school).toLowerCase()}`;

  const metaArr = Parser.spMetaToArr(meta);
  if (metaArr.length || (subschools && subschools.length)) {
    const metaAndSubschoolPart = [
      (subschools || []).map(sub => Parser.spSchoolAbvToFull(sub)).join(', '),
      metaArr.join(', '),
    ]
      .filter(Boolean)
      .join('; ')
      .toLowerCase();
    return `${levelSchoolStr} (${metaAndSubschoolPart})`;
  }
  return levelSchoolStr;
};

Parser.spTimeListToFull = function(times, isStripTags) {
  return times
    .map(
      t =>
        `${Parser.getTimeToFull(t)}${
          t.condition
            ? `, ${
                isStripTags
                  ? Renderer.stripTags(t.condition)
                  : Renderer.get().render(t.condition)
              }`
            : ''
        }`,
    )
    .join(' or ');
};

Parser.getTimeToFull = function(time) {
  return `${time.number} ${time.unit === 'bonus' ? 'bonus action' : time.unit}${
    time.number > 1 ? 's' : ''
  }`;
};

RNG_SPECIAL = 'special';
RNG_POINT = 'point';
RNG_LINE = 'line';
RNG_CUBE = 'cube';
RNG_CONE = 'cone';
RNG_RADIUS = 'radius';
RNG_SPHERE = 'sphere';
RNG_HEMISPHERE = 'hemisphere';
RNG_CYLINDER = 'cylinder'; // homebrew only
RNG_SELF = 'self';
RNG_SIGHT = 'sight';
RNG_UNLIMITED = 'unlimited';
RNG_UNLIMITED_SAME_PLANE = 'plane';
RNG_TOUCH = 'touch';
Parser.SP_RANGE_TYPE_TO_FULL = {
  [RNG_SPECIAL]: 'Special',
  [RNG_POINT]: 'Point',
  [RNG_LINE]: 'Line',
  [RNG_CUBE]: 'Cube',
  [RNG_CONE]: 'Cone',
  [RNG_RADIUS]: 'Radius',
  [RNG_SPHERE]: 'Sphere',
  [RNG_HEMISPHERE]: 'Hemisphere',
  [RNG_CYLINDER]: 'Cylinder',
  [RNG_SELF]: 'Self',
  [RNG_SIGHT]: 'Sight',
  [RNG_UNLIMITED]: 'Unlimited',
  [RNG_UNLIMITED_SAME_PLANE]: 'Unlimited on the same plane',
  [RNG_TOUCH]: 'Touch',
};

Parser.spRangeTypeToFull = function(range) {
  return Parser._parse_aToB(Parser.SP_RANGE_TYPE_TO_FULL, range);
};

UNT_FEET = 'feet';
UNT_MILES = 'miles';
Parser.SP_DIST_TYPE_TO_FULL = {
  [UNT_FEET]: 'Feet',
  [UNT_MILES]: 'Miles',
  [RNG_SELF]: Parser.SP_RANGE_TYPE_TO_FULL[RNG_SELF],
  [RNG_TOUCH]: Parser.SP_RANGE_TYPE_TO_FULL[RNG_TOUCH],
  [RNG_SIGHT]: Parser.SP_RANGE_TYPE_TO_FULL[RNG_SIGHT],
  [RNG_UNLIMITED]: Parser.SP_RANGE_TYPE_TO_FULL[RNG_UNLIMITED],
  [RNG_UNLIMITED_SAME_PLANE]:
    Parser.SP_RANGE_TYPE_TO_FULL[RNG_UNLIMITED_SAME_PLANE],
};

Parser.spDistanceTypeToFull = function(range) {
  return Parser._parse_aToB(Parser.SP_DIST_TYPE_TO_FULL, range);
};

Parser.SP_RANGE_TO_ICON = {
  [RNG_SPECIAL]: 'fa-star',
  [RNG_POINT]: '',
  [RNG_LINE]: 'fa-grip-lines-vertical',
  [RNG_CUBE]: 'fa-cube',
  [RNG_CONE]: 'fa-traffic-cone',
  [RNG_RADIUS]: 'fa-hockey-puck',
  [RNG_SPHERE]: 'fa-globe',
  [RNG_HEMISPHERE]: 'fa-globe',
  [RNG_CYLINDER]: 'fa-database',
  [RNG_SELF]: 'fa-street-view',
  [RNG_SIGHT]: 'fa-eye',
  [RNG_UNLIMITED_SAME_PLANE]: 'fa-globe-americas',
  [RNG_UNLIMITED]: 'fa-infinity',
  [RNG_TOUCH]: 'fa-hand-paper',
};

Parser.spRangeTypeToIcon = function(range) {
  return Parser._parse_aToB(Parser.SP_RANGE_TO_ICON, range);
};

Parser.spRangeToShortHtml = function(range) {
  switch (range.type) {
    case RNG_SPECIAL:
      return `<span class="fas ${Parser.spRangeTypeToIcon(
        range.type,
      )} help--subtle" title="Special"/>`;
    case RNG_POINT:
      return Parser.spRangeToShortHtml._renderPoint(range);
    case RNG_LINE:
    case RNG_CUBE:
    case RNG_CONE:
    case RNG_RADIUS:
    case RNG_SPHERE:
    case RNG_HEMISPHERE:
    case RNG_CYLINDER:
      return Parser.spRangeToShortHtml._renderArea(range);
  }
};
Parser.spRangeToShortHtml._renderPoint = function(range) {
  const dist = range.distance;
  switch (dist.type) {
    case RNG_SELF:
    case RNG_SIGHT:
    case RNG_UNLIMITED:
    case RNG_UNLIMITED_SAME_PLANE:
    case RNG_SPECIAL:
    case RNG_TOUCH:
      return `<span class="fas ${Parser.spRangeTypeToIcon(
        dist.type,
      )} help--subtle" title="${Parser.spRangeTypeToFull(dist.type)}"/>`;
    case UNT_FEET:
    case UNT_MILES:
    default:
      return `${dist.amount} <span class="small">${Parser.getSingletonUnit(
        dist.type,
        true,
      )}</span>`;
  }
};
Parser.spRangeToShortHtml._renderArea = function(range) {
  const size = range.distance;
  return `<span class="fas ${Parser.spRangeTypeToIcon(
    RNG_SELF,
  )} help--subtle" title="Self"/> ${
    size.amount
  }<span class="small">-${Parser.getSingletonUnit(
    size.type,
    true,
  )}</span> ${Parser.spRangeToShortHtml._getAreaStyleString(range)}`;
};
Parser.spRangeToShortHtml._getAreaStyleString = function(range) {
  return `<span class="fas ${Parser.spRangeTypeToIcon(
    range.type,
  )} help--subtle" title="${Parser.spRangeTypeToFull(range.type)}"/>`;
};

Parser.spRangeToFull = function(range) {
  switch (range.type) {
    case RNG_SPECIAL:
      return Parser.spRangeTypeToFull(range.type);
    case RNG_POINT:
      return Parser.spRangeToFull._renderPoint(range);
    case RNG_LINE:
    case RNG_CUBE:
    case RNG_CONE:
    case RNG_RADIUS:
    case RNG_SPHERE:
    case RNG_HEMISPHERE:
    case RNG_CYLINDER:
      return Parser.spRangeToFull._renderArea(range);
  }
};
Parser.spRangeToFull._renderPoint = function(range) {
  const dist = range.distance;
  switch (dist.type) {
    case RNG_SELF:
    case RNG_SIGHT:
    case RNG_UNLIMITED:
    case RNG_UNLIMITED_SAME_PLANE:
    case RNG_SPECIAL:
    case RNG_TOUCH:
      return Parser.spRangeTypeToFull(dist.type);
    case UNT_FEET:
    case UNT_MILES:
    default:
      return `${dist.amount} ${
        dist.amount === 1 ? Parser.getSingletonUnit(dist.type) : dist.type
      }`;
  }
};
Parser.spRangeToFull._renderArea = function(range) {
  const size = range.distance;
  return `Self (${size.amount}-${Parser.getSingletonUnit(
    size.type,
  )}${Parser.spRangeToFull._getAreaStyleString(range)}${
    range.type === RNG_CYLINDER
      ? `${
          size.amountSecondary != null && size.typeSecondary != null
            ? `, ${size.amountSecondary}-${Parser.getSingletonUnit(
                size.typeSecondary,
              )}-high`
            : ''
        } cylinder`
      : ''
  })`;
};
Parser.spRangeToFull._getAreaStyleString = function(range) {
  switch (range.type) {
    case RNG_SPHERE:
      return ' radius';
    case RNG_HEMISPHERE:
      return `-radius ${range.type}`;
    case RNG_CYLINDER:
      return '-radius';
    default:
      return ` ${range.type}`;
  }
};

Parser.getSingletonUnit = function(unit, isShort) {
  switch (unit) {
    case UNT_FEET:
      return isShort ? 'ft.' : 'foot';
    case UNT_MILES:
      return isShort ? 'mi.' : 'mile';
    default: {
      const fromBrew = MiscUtil.get(
        BrewUtil.homebrewMeta,
        'spellDistanceUnits',
        unit,
        'singular',
      );
      if (fromBrew) return fromBrew;
      if (unit.charAt(unit.length - 1) === 's') return unit.slice(0, -1);
      return unit;
    }
  }
};

Parser.RANGE_TYPES = [
  { type: RNG_POINT, hasDistance: true, isRequireAmount: false },

  { type: RNG_LINE, hasDistance: true, isRequireAmount: true },
  { type: RNG_CUBE, hasDistance: true, isRequireAmount: true },
  { type: RNG_CONE, hasDistance: true, isRequireAmount: true },
  { type: RNG_RADIUS, hasDistance: true, isRequireAmount: true },
  { type: RNG_SPHERE, hasDistance: true, isRequireAmount: true },
  { type: RNG_HEMISPHERE, hasDistance: true, isRequireAmount: true },
  { type: RNG_CYLINDER, hasDistance: true, isRequireAmount: true },

  { type: RNG_SPECIAL, hasDistance: false, isRequireAmount: false },
];

Parser.DIST_TYPES = [
  { type: RNG_SELF, hasAmount: false },
  { type: RNG_TOUCH, hasAmount: false },

  { type: UNT_FEET, hasAmount: true },
  { type: UNT_MILES, hasAmount: true },

  { type: RNG_SIGHT, hasAmount: false },
  { type: RNG_UNLIMITED_SAME_PLANE, hasAmount: false },
  { type: RNG_UNLIMITED, hasAmount: false },
];

Parser.spComponentsToFull = function(comp, level) {
  if (!comp) return 'None';
  const out = [];
  if (comp.v) out.push('V');
  if (comp.s) out.push('S');
  if (comp.m != null)
    out.push(
      `M${
        comp.m !== true
          ? ` (${comp.m.text != null ? comp.m.text : comp.m})`
          : ''
      }`,
    );
  if (comp.r) out.push(`R (${level} gp)`);
  return out.join(', ') || 'None';
};

Parser.SP_END_TYPE_TO_FULL = {
  dispel: 'dispelled',
  trigger: 'triggered',
  discharge: 'discharged',
};
Parser.spEndTypeToFull = function(type) {
  return Parser._parse_aToB(Parser.SP_END_TYPE_TO_FULL, type);
};

Parser.spDurationToFull = function(dur) {
  let hasSubOr = false;
  const outParts = dur.map(d => {
    switch (d.type) {
      case 'special':
        return 'Special';
      case 'instant':
        return `Instantaneous${d.condition ? ` (${d.condition})` : ''}`;
      case 'timed':
        return `${d.concentration ? 'Concentration, ' : ''}${
          d.concentration ? 'u' : d.duration.upTo ? 'U' : ''
        }${d.concentration || d.duration.upTo ? 'p to ' : ''}${
          d.duration.amount
        } ${d.duration.amount === 1 ? d.duration.type : `${d.duration.type}s`}`;
      case 'permanent': {
        if (d.ends) {
          const endsToJoin = d.ends.map(m => Parser.spEndTypeToFull(m));
          hasSubOr = hasSubOr || endsToJoin.length > 1;
          return `Until ${endsToJoin.joinConjunct(', ', ' or ')}`;
        } else {
          return 'Permanent';
        }
      }
    }
  });
  return `${outParts.joinConjunct(hasSubOr ? '; ' : ', ', ' or ')}${
    dur.length > 1 ? ' (see below)' : ''
  }`;
};

Parser.DURATION_TYPES = [
  { type: 'instant', full: 'Instantaneous' },
  { type: 'timed', hasAmount: true },
  { type: 'permanent', hasEnds: true },
  { type: 'special' },
];

Parser.DURATION_AMOUNT_TYPES = [
  'turn',
  'round',
  'minute',
  'hour',
  'day',
  'week',
  'year',
];

Parser.spClassesToFull = function(classes, textOnly, subclassLookup = {}) {
  const fromSubclasses = Parser.spSubclassesToFull(
    classes,
    textOnly,
    subclassLookup,
  );
  return `${Parser.spMainClassesToFull(classes, textOnly)}${
    fromSubclasses ? `, ${fromSubclasses}` : ''
  }`;
};

Parser.spMainClassesToFull = function(
  classes,
  textOnly = false,
  prop = 'fromClassList',
) {
  if (!classes) return '';
  return (classes[prop] || [])
    .filter(
      c =>
        !ExcludeUtil.isInitialised ||
        !ExcludeUtil.isExcluded(c.name, 'class', c.source),
    )
    .sort((a, b) => SortUtil.ascSort(a.name, b.name))
    .map(c =>
      textOnly
        ? c.name
        : `<a title="Source: ${Parser.sourceJsonToFull(c.source)}" href="${
            UrlUtil.PG_CLASSES
          }#${UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES](c)}">${
            c.name
          }</a>`,
    )
    .join(', ');
};

Parser.spSubclassesToFull = function(classes, textOnly, subclassLookup = {}) {
  if (!classes || !classes.fromSubclass) return '';
  return classes.fromSubclass
    .filter(c => {
      if (!ExcludeUtil.isInitialised) return true;
      const excludeClass = ExcludeUtil.isExcluded(
        c.class.name,
        'class',
        c.class.source,
      );
      if (excludeClass) return false;
      const fromLookup = MiscUtil.get(
        subclassLookup,
        c.class.source,
        c.class.name,
        c.subclass.source,
        c.subclass.name,
      );
      if (!fromLookup) return true;
      const excludeSubclass = ExcludeUtil.isExcluded(
        fromLookup.name || c.subclass.name,
        'subclass',
        c.subclass.source,
      );
      return !excludeSubclass;
    })
    .sort((a, b) => {
      const byName = SortUtil.ascSort(a.class.name, b.class.name);
      return byName || SortUtil.ascSort(a.subclass.name, b.subclass.name);
    })
    .map(c => Parser._spSubclassItem(c, textOnly, subclassLookup))
    .join(', ');
};

Parser._spSubclassItem = function(fromSubclass, textOnly, subclassLookup) {
  const c = fromSubclass.class;
  const sc = fromSubclass.subclass;
  const text = `${sc.name}${sc.subSubclass ? ` (${sc.subSubclass})` : ''}`;
  if (textOnly) return text;
  const classPart = `<a href="${
    UrlUtil.PG_CLASSES
  }#${UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES](
    c,
  )}" title="Source: ${Parser.sourceJsonToFull(c.source)}">${c.name}</a>`;
  const fromLookup = subclassLookup
    ? MiscUtil.get(subclassLookup, c.source, c.name, sc.source, sc.name)
    : null;
  if (fromLookup)
    return `<a class="italic" href="${
      UrlUtil.PG_CLASSES
    }#${UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES](
      c,
    )}${HASH_PART_SEP}${UrlUtil.getClassesPageStatePart({
      subclass: { shortName: sc.name, source: sc.source },
    })}" title="Source: ${Parser.sourceJsonToFull(
      fromSubclass.subclass.source,
    )}">${text}</a> ${classPart}`;
  else
    return `<span class="italic" title="Source: ${Parser.sourceJsonToFull(
      fromSubclass.subclass.source,
    )}">${text}</span> ${classPart}`;
};

Parser.SPELL_ATTACK_TYPE_TO_FULL = {};
Parser.SPELL_ATTACK_TYPE_TO_FULL['M'] = 'Melee';
Parser.SPELL_ATTACK_TYPE_TO_FULL['R'] = 'Ranged';
Parser.SPELL_ATTACK_TYPE_TO_FULL['O'] = 'Other/Unknown';

Parser.spAttackTypeToFull = function(type) {
  return Parser._parse_aToB(Parser.SPELL_ATTACK_TYPE_TO_FULL, type);
};

Parser.SPELL_AREA_TYPE_TO_FULL = {
  ST: 'Single Target',
  MT: 'Multiple Targets',
  C: 'Cube',
  N: 'Cone',
  Y: 'Cylinder',
  S: 'Sphere',
  R: 'Circle',
  Q: 'Square',
  L: 'Line',
  H: 'Hemisphere',
  W: 'Wall',
};
Parser.spAreaTypeToFull = function(type) {
  return Parser._parse_aToB(Parser.SPELL_AREA_TYPE_TO_FULL, type);
};

Parser.SP_MISC_TAG_TO_FULL = {
  HL: 'Healing',
  SGT: 'Requires Sight',
  PRM: 'Permanent Effects',
  SCL: 'Scaling Effects',
  SMN: 'Summons Creature',
};
Parser.spMiscTagToFull = function(type) {
  return Parser._parse_aToB(Parser.SP_MISC_TAG_TO_FULL, type);
};

Parser.SP_CASTER_PROGRESSION_TO_FULL = {
  full: 'Full',
  '1/2': 'Half',
  '1/3': 'One-Third',
  pact: 'Pact Magic',
};
Parser.spCasterProgressionToFull = function(type) {
  return Parser._parse_aToB(Parser.SP_CASTER_PROGRESSION_TO_FULL, type);
};

// mon-prefix functions are for parsing monster data, and shared with the roll20 script
Parser.monTypeToFullObj = function(type) {
  const out = { type: '', tags: [], asText: '' };

  if (typeof type === 'string') {
    // handles e.g. "fey"
    out.type = type;
    out.asText = type;
    return out;
  }

  const tempTags = [];
  if (type.tags) {
    for (const tag of type.tags) {
      if (typeof tag === 'string') {
        // handles e.g. "fiend (devil)"
        out.tags.push(tag);
        tempTags.push(tag);
      } else {
        // handles e.g. "humanoid (Chondathan human)"
        out.tags.push(tag.tag);
        tempTags.push(`${tag.prefix} ${tag.tag}`);
      }
    }
  }
  out.type = type.type;
  if (type.swarmSize) {
    out.tags.push('swarm');
    out.asText = `swarm of ${Parser.sizeAbvToFull(
      type.swarmSize,
    ).toLowerCase()} ${Parser.monTypeToPlural(type.type)}`;
  } else {
    out.asText = `${type.type}`;
  }
  if (tempTags.length) out.asText += ` (${tempTags.join(', ')})`;
  return out;
};

Parser.monTypeToPlural = function(type) {
  return Parser._parse_aToB(Parser.MON_TYPE_TO_PLURAL, type);
};

Parser.monTypeFromPlural = function(type) {
  return Parser._parse_bToA(Parser.MON_TYPE_TO_PLURAL, type);
};

Parser.monCrToFull = function(cr, xp) {
  if (cr == null) return '';
  if (typeof cr === 'string')
    return `${cr} (${
      xp != null ? Parser._addCommas(xp) : Parser.crToXp(cr)
    } XP)`;
  else {
    const stack = [Parser.monCrToFull(cr.cr, cr.xp)];
    if (cr.lair)
      stack.push(`${Parser.monCrToFull(cr.lair)} when encountered in lair`);
    if (cr.coven)
      stack.push(`${Parser.monCrToFull(cr.coven)} when part of a coven`);
    return stack.join(' or ');
  }
};

Parser.monImmResToFull = function(toParse) {
  const outerLen = toParse.length;
  let maxDepth = 0;
  if (outerLen === 1 && (toParse[0].immune || toParse[0].resist)) {
    return toParse.map(it => toString(it, -1)).join(maxDepth ? '; ' : ', ');
  }

  function toString(it, depth = 0) {
    maxDepth = Math.max(maxDepth, depth);
    if (typeof it === 'string') {
      return it;
    } else if (it.special) {
      return it.special;
    } else {
      let stack = it.preNote ? `${it.preNote} ` : '';
      const prop = it.immune
        ? 'immune'
        : it.resist
        ? 'resist'
        : it.vulnerable
        ? 'vulnerable'
        : null;
      if (prop) {
        const toJoin = it[prop].map(nxt => toString(nxt, depth + 1));
        stack += depth
          ? toJoin.join(maxDepth ? '; ' : ', ')
          : toJoin.joinConjunct(', ', ' and ');
      }
      if (it.note) stack += ` ${it.note}`;
      return stack;
    }
  }

  function serialJoin(arr) {
    if (arr.length <= 1) return arr.join('');

    let out = '';
    for (let i = 0; i < arr.length - 1; ++i) {
      const it = arr[i];
      const nxt = arr[i + 1];
      out += it;
      out += it.includes(',') || nxt.includes(',') ? '; ' : ', ';
    }
    out += arr.last();
    return out;
  }

  return serialJoin(toParse.map(it => toString(it)));
};

Parser.monCondImmToFull = function(condImm, isPlainText) {
  function render(condition) {
    return isPlainText
      ? condition
      : Renderer.get().render(`{@condition ${condition}}`);
  }
  return condImm
    .map(it => {
      if (it.special) return it.special;
      if (it.conditionImmune)
        return `${it.preNote ? `${it.preNote} ` : ''}${it.conditionImmune
          .map(render)
          .join(', ')}${it.note ? ` ${it.note}` : ''}`;
      return render(it);
    })
    .join(', ');
};

Parser.MON_SENSE_TAG_TO_FULL = {
  B: 'blindsight',
  D: 'darkvision',
  SD: 'superior darkvision',
  T: 'tremorsense',
  U: 'truesight',
};
Parser.monSenseTagToFull = function(tag) {
  return Parser._parse_aToB(Parser.MON_SENSE_TAG_TO_FULL, tag);
};

Parser.MON_SPELLCASTING_TAG_TO_FULL = {
  P: 'Psionics',
  I: 'Innate',
  F: 'Form Only',
  S: 'Shared',
  CB: 'Class, Bard',
  CC: 'Class, Cleric',
  CD: 'Class, Druid',
  CP: 'Class, Paladin',
  CR: 'Class, Ranger',
  CS: 'Class, Sorcerer',
  CL: 'Class, Warlock',
  CW: 'Class, Wizard',
};
Parser.monSpellcastingTagToFull = function(tag) {
  return Parser._parse_aToB(Parser.MON_SPELLCASTING_TAG_TO_FULL, tag);
};

Parser.MON_MISC_TAG_TO_FULL = {
  AOE: 'Has Areas of Effect',
  MW: 'Has Melee Weapon Attacks',
  RW: 'Has Ranged Weapon Attacks',
  RNG: 'Has Ranged Weapons',
  RCH: 'Has Reach Attacks',
  THW: 'Has Thrown Weapons',
};
Parser.monMiscTagToFull = function(tag) {
  return Parser._parse_aToB(Parser.MON_MISC_TAG_TO_FULL, tag);
};

Parser.ENVIRONMENTS = [
  'arctic',
  'coastal',
  'desert',
  'forest',
  'grassland',
  'hill',
  'mountain',
  'swamp',
  'underdark',
  'underwater',
  'urban',
];

// psi-prefix functions are for parsing psionic data, and shared with the roll20 script
Parser.PSI_ABV_TYPE_TALENT = 'T';
Parser.PSI_ABV_TYPE_DISCIPLINE = 'D';
Parser.PSI_ORDER_NONE = 'None';
Parser.psiTypeToFull = type => Parser.psiTypeToMeta(type).full;

Parser.psiTypeToMeta = type => {
  let out = {};
  if (type === Parser.PSI_ABV_TYPE_TALENT)
    out = { hasOrder: false, full: 'Talent' };
  else if (type === Parser.PSI_ABV_TYPE_DISCIPLINE)
    out = { hasOrder: true, full: 'Discipline' };
  else if (
    BrewUtil.homebrewMeta &&
    BrewUtil.homebrewMeta.psionicTypes &&
    BrewUtil.homebrewMeta.psionicTypes[type]
  )
    out = BrewUtil.homebrewMeta.psionicTypes[type];
  out.full = out.full || 'Unknown';
  out.short = out.short || out.full;
  return out;
};

Parser.psiOrderToFull = order => {
  return order === undefined ? Parser.PSI_ORDER_NONE : order;
};

Parser.prereqSpellToFull = function(spell) {
  if (spell) {
    const [text, suffix] = spell.split('#');
    if (!suffix) return Renderer.get().render(`{@spell ${spell}}`);
    else if (suffix === 'c')
      return Renderer.get().render(`{@spell ${text}} cantrip`);
    else if (suffix === 'x')
      return Renderer.get().render(
        '{@spell hex} spell or a warlock feature that curses',
      );
  } else return STR_NONE;
};

Parser.prereqPactToFull = function(pact) {
  if (pact === 'Chain') return 'Pact of the Chain';
  if (pact === 'Tome') return 'Pact of the Tome';
  if (pact === 'Blade') return 'Pact of the Blade';
  if (pact === 'Talisman') return 'Pact of the Talisman';
  return pact;
};

Parser.prereqPatronToShort = function(patron) {
  if (patron === 'Any') return patron;
  const mThe = /^The (.*?)$/.exec(patron);
  if (mThe) return mThe[1];
  return patron;
};

// NOTE: These need to be reflected in omnidexer.js to be indexed
Parser.OPT_FEATURE_TYPE_TO_FULL = {
  AI: 'Artificer Infusion',
  ED: 'Elemental Discipline',
  EI: 'Eldritch Invocation',
  MM: 'Metamagic',
  MV: 'Maneuver',
  'MV:B': 'Maneuver, Battle Master',
  'MV:C2-UA': 'Maneuver, Cavalier V2 (UA)',
  'AS:V1-UA': 'Arcane Shot, V1 (UA)',
  'AS:V2-UA': 'Arcane Shot, V2 (UA)',
  AS: 'Arcane Shot',
  OTH: 'Other',
  'FS:F': 'Fighting Style; Fighter',
  'FS:B': 'Fighting Style; Bard',
  'FS:P': 'Fighting Style; Paladin',
  'FS:R': 'Fighting Style; Ranger',
  PB: 'Pact Boon',
  'SHP:H': 'Ship Upgrade, Hull',
  'SHP:M': 'Ship Upgrade, Movement',
  'SHP:W': 'Ship Upgrade, Weapon',
  'SHP:F': 'Ship Upgrade, Figurehead',
  'SHP:O': 'Ship Upgrade, Miscellaneous',
  'IWM:W': 'Infernal War Machine Variant, Weapon',
  'IWM:A': 'Infernal War Machine Upgrade, Armor',
  'IWM:G': 'Infernal War Machine Upgrade, Gadget',
  OR: 'Onomancy Resonant',
  RN: 'Rune Knight Rune',
  AF: 'Alchemical Formula',
};

Parser.optFeatureTypeToFull = function(type) {
  if (Parser.OPT_FEATURE_TYPE_TO_FULL[type])
    return Parser.OPT_FEATURE_TYPE_TO_FULL[type];
  if (
    BrewUtil.homebrewMeta &&
    BrewUtil.homebrewMeta.optionalFeatureTypes &&
    BrewUtil.homebrewMeta.optionalFeatureTypes[type]
  )
    return BrewUtil.homebrewMeta.optionalFeatureTypes[type];
  return type;
};

Parser.ALIGNMENTS = {
  CG: 'Chaotic good',
  CN: 'Chaotic neutral',
  CE: 'Chaotic evil',
  LG: 'Lawful good',
  LN: 'Lawful neutral',
  LE: 'Lawful evil',
  NG: 'Neutral good',
  N: 'Neutral',
  NE: 'Neutral evil',
};

Parser.ALIGNMENTS_DESC = {
  LG:
    'Lawful good creatures can be counted on to do the right thing as expected by society. Gold dragons, paladins, and most dwarves are lawful good.',
  NG:
    'Neutral good folk do the best they can to help others according to their needs. Many celestials, some cloud giants, and most gnomes are neutral good.',
  CG:
    'Chaotic good creatures act as their conscience directs, with little regard for what others expect. Copper dragons, many elves, and unicorns are chaotic good.',
  LN:
    'Lawful neutral individuals act in accordance with law, tradition, or personal codes. Many monks and some wizards are lawful neutral.',
  N:
    "Neutral is the alignment of those who prefer to steer clear of moral questions and don't take sides, doing what seems best at the time. Lizardfolk, most druids, and many humans are neutral.",
  CN:
    'Chaotic neutral creatures follow their whims, holding their personal freedom above all else. Many barbarians and rogues, and some bards, are chaotic neutral.',
  LE:
    'Lawful evil creatures methodically take what they want, within the limits of a code of tradition, loyalty, or order. Devils, blue dragons, and hobgoblins are lawful evil.',
  NE:
    'Neutral evil is the alignment of those who do whatever they can get away with, without compassion or qualms. Many drow, some cloud giants, and yugoloths are neutral evil.',
  CE:
    'Chaotic evil creatures act with arbitrary violence, spurred by their greed, hatred, or bloodlust. Demons, red dragons, and orcs are chaotic evil.',
};

Parser.alignmentAbvToFull = function(alignment) {
  if (!alignment) return null; // used in sidekicks
  if (typeof alignment === 'object') {
    if (alignment.special != null) {
      // use in MTF Sacred Statue
      return alignment.special;
    } else {
      // e.g. `{alignment: ["N", "G"], chance: 50}` or `{alignment: ["N", "G"]}`
      return `${alignment.alignment
        .map(a => Parser.alignmentAbvToFull(a))
        .join(' ')}${alignment.chance ? ` (${alignment.chance}%)` : ''}`;
    }
  } else {
    alignment = alignment.toUpperCase();
    switch (alignment) {
      case 'L':
        return 'Lawful';
      case 'N':
        return 'Neutral';
      case 'NX':
        return 'Neutral (Law/Chaos axis)';
      case 'NY':
        return 'Neutral (Good/Evil axis)';
      case 'C':
        return 'Chaotic';
      case 'G':
        return 'Good';
      case 'E':
        return 'Evil';
      // "special" values
      case 'U':
        return 'Unaligned';
      case 'A':
        return 'Any alignment';
    }
    return alignment;
  }
};

Parser.alignmentListToFull = function(alignList) {
  if (alignList.some(it => typeof it !== 'string')) {
    if (alignList.some(it => typeof it === 'string'))
      throw new Error(`Mixed alignment types: ${JSON.stringify(alignList)}`);
    // filter out any nonexistent alignments, as we don't care about "alignment does not exist" if there are other alignments
    alignList = alignList.filter(
      it => it.alignment === undefined || it.alignment != null,
    );
    return alignList
      .map(it =>
        it.special != null || it.chance != null
          ? Parser.alignmentAbvToFull(it)
          : Parser.alignmentListToFull(it.alignment),
      )
      .join(' or ');
  } else {
    // assume all single-length arrays can be simply parsed
    if (alignList.length === 1) return Parser.alignmentAbvToFull(alignList[0]);
    // a pair of abv's, e.g. "L" "G"
    if (alignList.length === 2) {
      return alignList.map(a => Parser.alignmentAbvToFull(a)).join(' ');
    }
    if (alignList.length === 3) {
      if (
        alignList.includes('NX') &&
        alignList.includes('NY') &&
        alignList.includes('N')
      )
        return 'Any Neutral Alignment';
    }
    // longer arrays should have a custom mapping
    if (alignList.length === 5) {
      if (!alignList.includes('G')) return 'Any Non-Good Alignment';
      if (!alignList.includes('E')) return 'Any Non-Evil Alignment';
      if (!alignList.includes('L')) return 'Any Non-Lawful Alignment';
      if (!alignList.includes('C')) return 'Any Non-Chaotic Alignment';
    }
    if (alignList.length === 4) {
      if (!alignList.includes('L') && !alignList.includes('NX'))
        return 'Any Chaotic Alignment';
      if (!alignList.includes('G') && !alignList.includes('NY'))
        return 'Any Evil Alignment';
      if (!alignList.includes('C') && !alignList.includes('NX'))
        return 'Any Lawful Alignment';
      if (!alignList.includes('E') && !alignList.includes('NY'))
        return 'Any Good Alignment';
    }
    throw new Error(`Unmapped alignment: ${JSON.stringify(alignList)}`);
  }
};

Parser.weightToFull = function(lbs, isSmallUnit) {
  const tons = Math.floor(lbs / 2000);
  lbs = lbs - 2000 * tons;
  return [
    tons
      ? `${tons}${isSmallUnit ? `<span class="small ml-1">` : ' '}ton${
          tons === 1 ? '' : 's'
        }${isSmallUnit ? `</span>` : ''}`
      : null,
    lbs
      ? `${lbs}${isSmallUnit ? `<span class="small ml-1">` : ' '}lb.${
          isSmallUnit ? `</span>` : ''
        }`
      : null,
  ]
    .filter(Boolean)
    .join(', ');
};

SRC_CoS = 'CoS';
SRC_DMG = 'DMG';
SRC_EEPC = 'EEPC';
SRC_EET = 'EET';
SRC_HotDQ = 'HotDQ';
SRC_LMoP = 'LMoP';
SRC_Mag = 'Mag';
SRC_MM = 'MM';
SRC_OotA = 'OotA';
SRC_PHB = 'PHB';
SRC_TCE = 'TCE';
SRC_PotA = 'PotA';
SRC_RoT = 'RoT';
SRC_RoTOS = 'RoTOS';
SRC_SCAG = 'SCAG';
SRC_SKT = 'SKT';
SRC_ToA = 'ToA';
SRC_ToD = 'ToD';
SRC_TTP = 'TTP';
SRC_TYP = 'TftYP';
SRC_TYP_AtG = 'TftYP-AtG';
SRC_TYP_DiT = 'TftYP-DiT';
SRC_TYP_TFoF = 'TftYP-TFoF';
SRC_TYP_THSoT = 'TftYP-THSoT';
SRC_TYP_TSC = 'TftYP-TSC';
SRC_TYP_ToH = 'TftYP-ToH';
SRC_TYP_WPM = 'TftYP-WPM';
SRC_VGM = 'VGM';
SRC_XGE = 'XGE';
SRC_OGA = 'OGA';
SRC_MTF = 'MTF';
SRC_WDH = 'WDH';
SRC_WDMM = 'WDMM';
SRC_GGR = 'GGR';
SRC_KKW = 'KKW';
SRC_LLK = 'LLK';
SRC_GoS = 'GoS';
SRC_AI = 'AI';
SRC_OoW = 'OoW';
SRC_ESK = 'ESK';
SRC_DIP = 'DIP';
SRC_HftT = 'HftT';
SRC_DC = 'DC';
SRC_SLW = 'SLW';
SRC_SDW = 'SDW';
SRC_BGDIA = 'BGDIA';
SRC_LR = 'LR';
SRC_AL = 'AL';
SRC_SAC = 'SAC';
SRC_ERLW = 'ERLW';
SRC_EFR = 'EFR';
SRC_RMBRE = 'RMBRE';
SRC_RMR = 'RMR';
SRC_MFF = 'MFF';
SRC_AWM = 'AWM';
SRC_IMR = 'IMR';
SRC_SADS = 'SADS';
SRC_SCREEN = 'Screen';

SRC_AL_PREFIX = 'AL';

SRC_ALCoS = `${SRC_AL_PREFIX}CurseOfStrahd`;
SRC_ALEE = `${SRC_AL_PREFIX}ElementalEvil`;
SRC_ALRoD = `${SRC_AL_PREFIX}RageOfDemons`;

SRC_PS_PREFIX = 'PS';

SRC_PSA = `${SRC_PS_PREFIX}A`;
SRC_PSI = `${SRC_PS_PREFIX}I`;
SRC_PSK = `${SRC_PS_PREFIX}K`;
SRC_PSZ = `${SRC_PS_PREFIX}Z`;
SRC_PSX = `${SRC_PS_PREFIX}X`;
SRC_PSD = `${SRC_PS_PREFIX}D`;

SRC_UA_PREFIX = 'UA';

SRC_UAA = `${SRC_UA_PREFIX}Artificer`;
SRC_UAEAG = `${SRC_UA_PREFIX}EladrinAndGith`;
SRC_UAEBB = `${SRC_UA_PREFIX}Eberron`;
SRC_UAFFR = `${SRC_UA_PREFIX}FeatsForRaces`;
SRC_UAFFS = `${SRC_UA_PREFIX}FeatsForSkills`;
SRC_UAFO = `${SRC_UA_PREFIX}FiendishOptions`;
SRC_UAFT = `${SRC_UA_PREFIX}Feats`;
SRC_UAGH = `${SRC_UA_PREFIX}GothicHeroes`;
SRC_UAMDM = `${SRC_UA_PREFIX}ModernMagic`;
SRC_UASSP = `${SRC_UA_PREFIX}StarterSpells`;
SRC_UATMC = `${SRC_UA_PREFIX}TheMysticClass`;
SRC_UATOBM = `${SRC_UA_PREFIX}ThatOldBlackMagic`;
SRC_UATRR = `${SRC_UA_PREFIX}TheRangerRevised`;
SRC_UAWA = `${SRC_UA_PREFIX}WaterborneAdventures`;
SRC_UAVR = `${SRC_UA_PREFIX}VariantRules`;
SRC_UALDR = `${SRC_UA_PREFIX}LightDarkUnderdark`;
SRC_UARAR = `${SRC_UA_PREFIX}RangerAndRogue`;
SRC_UAATOSC = `${SRC_UA_PREFIX}ATrioOfSubclasses`;
SRC_UABPP = `${SRC_UA_PREFIX}BarbarianPrimalPaths`;
SRC_UARSC = `${SRC_UA_PREFIX}RevisedSubclasses`;
SRC_UAKOO = `${SRC_UA_PREFIX}KitsOfOld`;
SRC_UABBC = `${SRC_UA_PREFIX}BardBardColleges`;
SRC_UACDD = `${SRC_UA_PREFIX}ClericDivineDomains`;
SRC_UAD = `${SRC_UA_PREFIX}Druid`;
SRC_UARCO = `${SRC_UA_PREFIX}RevisedClassOptions`;
SRC_UAF = `${SRC_UA_PREFIX}Fighter`;
SRC_UAM = `${SRC_UA_PREFIX}Monk`;
SRC_UAP = `${SRC_UA_PREFIX}Paladin`;
SRC_UAMC = `${SRC_UA_PREFIX}ModifyingClasses`;
SRC_UAS = `${SRC_UA_PREFIX}Sorcerer`;
SRC_UAWAW = `${SRC_UA_PREFIX}WarlockAndWizard`;
SRC_UATF = `${SRC_UA_PREFIX}TheFaithful`;
SRC_UAWR = `${SRC_UA_PREFIX}WizardRevisited`;
SRC_UAESR = `${SRC_UA_PREFIX}ElfSubraces`;
SRC_UAMAC = `${SRC_UA_PREFIX}MassCombat`;
SRC_UA3PE = `${SRC_UA_PREFIX}ThreePillarExperience`;
SRC_UAGHI = `${SRC_UA_PREFIX}GreyhawkInitiative`;
SRC_UATSC = `${SRC_UA_PREFIX}ThreeSubclasses`;
SRC_UAOD = `${SRC_UA_PREFIX}OrderDomain`;
SRC_UACAM = `${SRC_UA_PREFIX}CentaursMinotaurs`;
SRC_UAGSS = `${SRC_UA_PREFIX}GiantSoulSorcerer`;
SRC_UARoE = `${SRC_UA_PREFIX}RacesOfEberron`;
SRC_UARoR = `${SRC_UA_PREFIX}RacesOfRavnica`;
SRC_UAWGE = `${SRC_UA_PREFIX}WGE`;
SRC_UAOSS = `${SRC_UA_PREFIX}OfShipsAndSea`;
SRC_UASIK = `${SRC_UA_PREFIX}Sidekicks`;
SRC_UAAR = `${SRC_UA_PREFIX}ArtificerRevisited`;
SRC_UABAM = `${SRC_UA_PREFIX}BarbarianAndMonk`;
SRC_UASAW = `${SRC_UA_PREFIX}SorcererAndWarlock`;
SRC_UABAP = `${SRC_UA_PREFIX}BardAndPaladin`;
SRC_UACDW = `${SRC_UA_PREFIX}ClericDruidWizard`;
SRC_UAFRR = `${SRC_UA_PREFIX}FighterRangerRogue`;
SRC_UACFV = `${SRC_UA_PREFIX}ClassFeatureVariants`;
SRC_UAFRW = `${SRC_UA_PREFIX}FighterRogueWizard`;
SRC_UA2020SC1 = `${SRC_UA_PREFIX}2020SubclassesPt1`;
SRC_UA2020SC2 = `${SRC_UA_PREFIX}2020SubclassesPt2`;

SRC_3PP_SUFFIX = ' 3pp';
SRC_STREAM = 'Stream';
SRC_TWITTER = 'Twitter';

AL_PREFIX = 'Adventurers League: ';
AL_PREFIX_SHORT = 'AL: ';
PS_PREFIX = 'Plane Shift: ';
PS_PREFIX_SHORT = 'PS: ';
UA_PREFIX = 'Unearthed Arcana: ';
UA_PREFIX_SHORT = 'UA: ';
TftYP_NAME = 'Tales from the Yawning Portal';

Parser.TAG_TO_DEFAULT_SOURCE = {
  spell: SRC_PHB,
  item: SRC_DMG,
  class: SRC_PHB,
  creature: SRC_MM,
  condition: SRC_PHB,
  disease: SRC_DMG,
  background: SRC_PHB,
  race: SRC_PHB,
  optfeature: SRC_PHB,
  reward: SRC_DMG,
  feat: SRC_PHB,
  psionic: SRC_UATMC,
  object: SRC_DMG,
  cult: SRC_MTF,
  boon: SRC_MTF,
  trap: SRC_DMG,
  hazard: SRC_DMG,
  deity: SRC_PHB,
  variantrule: SRC_DMG,
  vehicle: SRC_GoS,
  vehupgrade: SRC_GoS,
  action: SRC_PHB,
  classFeature: SRC_PHB,
  subclassFeature: SRC_PHB,
  table: SRC_DMG,
  language: SRC_PHB,
};

Parser.getTagSource = function(tag, source) {
  if (source && source.trim()) return source;

  tag = tag.trim();
  if (tag.startsWith('@')) tag = tag.slice(1);

  if (!Parser.TAG_TO_DEFAULT_SOURCE[tag])
    throw new Error(`Unhandled tag "${tag}"`);
  return Parser.TAG_TO_DEFAULT_SOURCE[tag];
};

Parser.ITEM_RARITIES = [
  'None',
  'Common',
  'Uncommon',
  'Rare',
  'Very Rare',
  'Legendary',
  'Artifact',
  'Unknown',
  'Unknown (Magic)',
  'Other',
];

Parser.CAT_ID_CREATURE = 1;
Parser.CAT_ID_SPELL = 2;
Parser.CAT_ID_BACKGROUND = 3;
Parser.CAT_ID_ITEM = 4;
Parser.CAT_ID_CLASS = 5;
Parser.CAT_ID_CONDITION = 6;
Parser.CAT_ID_FEAT = 7;
Parser.CAT_ID_ELDRITCH_INVOCATION = 8;
Parser.CAT_ID_PSIONIC = 9;
Parser.CAT_ID_RACE = 10;
Parser.CAT_ID_OTHER_REWARD = 11;
Parser.CAT_ID_VARIANT_OPTIONAL_RULE = 12;
Parser.CAT_ID_ADVENTURE = 13;
Parser.CAT_ID_DEITY = 14;
Parser.CAT_ID_OBJECT = 15;
Parser.CAT_ID_TRAP = 16;
Parser.CAT_ID_HAZARD = 17;
Parser.CAT_ID_QUICKREF = 18;
Parser.CAT_ID_CULT = 19;
Parser.CAT_ID_BOON = 20;
Parser.CAT_ID_DISEASE = 21;
Parser.CAT_ID_METAMAGIC = 22;
Parser.CAT_ID_MANEUVER_BATTLEMASTER = 23;
Parser.CAT_ID_TABLE = 24;
Parser.CAT_ID_TABLE_GROUP = 25;
Parser.CAT_ID_MANEUVER_CAVALIER = 26;
Parser.CAT_ID_ARCANE_SHOT = 27;
Parser.CAT_ID_OPTIONAL_FEATURE_OTHER = 28;
Parser.CAT_ID_FIGHTING_STYLE = 29;
Parser.CAT_ID_CLASS_FEATURE = 30;
Parser.CAT_ID_VEHICLE = 31;
Parser.CAT_ID_PACT_BOON = 32;
Parser.CAT_ID_ELEMENTAL_DISCIPLINE = 33;
Parser.CAT_ID_ARTIFICER_INFUSION = 34;
Parser.CAT_ID_SHIP_UPGRADE = 35;
Parser.CAT_ID_INFERNAL_WAR_MACHINE_UPGRADE = 36;
Parser.CAT_ID_ONOMANCY_RESONANT = 37;
Parser.CAT_ID_RUNE_KNIGHT_RUNE = 37;
Parser.CAT_ID_ALCHEMICAL_FORMULA = 38;
Parser.CAT_ID_MANEUVER = 39;
Parser.CAT_ID_SUBCLASS = 40;
Parser.CAT_ID_SUBCLASS_FEATURE = 41;
Parser.CAT_ID_ACTION = 42;
Parser.CAT_ID_LANGUAGE = 43;

Parser.CAT_ID_TO_FULL = {};
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CREATURE] = 'Bestiary';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SPELL] = 'Spell';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_BACKGROUND] = 'Background';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ITEM] = 'Item';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CLASS] = 'Class';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CONDITION] = 'Condition';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_FEAT] = 'Feat';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ELDRITCH_INVOCATION] =
  'Eldritch Invocation';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_PSIONIC] = 'Psionic';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_RACE] = 'Race';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_OTHER_REWARD] = 'Other Reward';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_VARIANT_OPTIONAL_RULE] =
  'Variant/Optional Rule';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ADVENTURE] = 'Adventure';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_DEITY] = 'Deity';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_OBJECT] = 'Object';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_TRAP] = 'Trap';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_HAZARD] = 'Hazard';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_QUICKREF] = 'Quick Reference';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CULT] = 'Cult';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_BOON] = 'Boon';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_DISEASE] = 'Disease';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_METAMAGIC] = 'Metamagic';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_MANEUVER_BATTLEMASTER] =
  'Maneuver; Battlemaster';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_TABLE] = 'Table';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_TABLE_GROUP] = 'Table';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_MANEUVER_CAVALIER] = 'Maneuver; Cavalier';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ARCANE_SHOT] = 'Arcane Shot';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_OPTIONAL_FEATURE_OTHER] =
  'Optional Feature';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_FIGHTING_STYLE] = 'Fighting Style';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CLASS_FEATURE] = 'Class Feature';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_VEHICLE] = 'Vehicle';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_PACT_BOON] = 'Pact Boon';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ELEMENTAL_DISCIPLINE] =
  'Elemental Discipline';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ARTIFICER_INFUSION] = 'Infusion';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SHIP_UPGRADE] = 'Ship Upgrade';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_INFERNAL_WAR_MACHINE_UPGRADE] =
  'Infernal War Machine Upgrade';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ONOMANCY_RESONANT] = 'Onomancy Resonant';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_RUNE_KNIGHT_RUNE] = 'Rune Knight Rune';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ALCHEMICAL_FORMULA] = 'Alchemical Formula';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_MANEUVER] = 'Maneuver';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SUBCLASS] = 'Subclass';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SUBCLASS_FEATURE] = 'Subclass Feature';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ACTION] = 'Action';
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_LANGUAGE] = 'Language';

Parser.pageCategoryToFull = function(catId) {
  return Parser._parse_aToB(Parser.CAT_ID_TO_FULL, catId);
};

Parser.CAT_ID_TO_PROP = {};
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CREATURE] = 'monster';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SPELL] = 'spell';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_BACKGROUND] = 'background';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ITEM] = 'item';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CLASS] = 'class';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CONDITION] = 'condition';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_FEAT] = 'feat';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_PSIONIC] = 'psionic';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_RACE] = 'race';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_OTHER_REWARD] = 'reward';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_VARIANT_OPTIONAL_RULE] = 'variantrule';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ADVENTURE] = 'adventure';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_DEITY] = 'deity';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_OBJECT] = 'object';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_TRAP] = 'trap';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_HAZARD] = 'hazard';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CULT] = 'cult';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_BOON] = 'boon';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_DISEASE] = 'condition';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_TABLE] = 'table';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_TABLE_GROUP] = 'tableGroup';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_VEHICLE] = 'vehicle';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ELDRITCH_INVOCATION] = 'optionalfeature';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_MANEUVER_CAVALIER] = 'optionalfeature';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ARCANE_SHOT] = 'optionalfeature';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_OPTIONAL_FEATURE_OTHER] = 'optionalfeature';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_FIGHTING_STYLE] = 'optionalfeature';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_METAMAGIC] = 'optionalfeature';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_MANEUVER_BATTLEMASTER] = 'optionalfeature';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_PACT_BOON] = 'optionalfeature';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ELEMENTAL_DISCIPLINE] = 'optionalfeature';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ARTIFICER_INFUSION] = 'optionalfeature';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SHIP_UPGRADE] = 'optionalfeature';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_INFERNAL_WAR_MACHINE_UPGRADE] =
  'optionalfeature';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ONOMANCY_RESONANT] = 'optionalfeature';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_RUNE_KNIGHT_RUNE] = 'optionalfeature';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ALCHEMICAL_FORMULA] = 'optionalfeature';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_MANEUVER] = 'optionalfeature';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_QUICKREF] = null;
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CLASS_FEATURE] = 'class';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SUBCLASS] = 'subclass';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SUBCLASS_FEATURE] = 'subclass';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ACTION] = 'action';
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_LANGUAGE] = 'language';

Parser.pageCategoryToProp = function(catId) {
  return Parser._parse_aToB(Parser.CAT_ID_TO_PROP, catId);
};

Parser.ABIL_ABVS = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

Parser.spClassesToCurrentAndLegacy = function(classes) {
  const current = [];
  const legacy = [];
  classes.fromClassList.forEach(cls => {
    if (
      (cls.name === 'Artificer' && cls.source === 'UAArtificer') ||
      (cls.name === 'Artificer (Revisited)' &&
        cls.source === 'UAArtificerRevisited')
    )
      legacy.push(cls);
    else current.push(cls);
  });
  return [current, legacy];
};

Parser.attackTypeToFull = function(attackType) {
  return Parser._parse_aToB(Parser.ATK_TYPE_TO_FULL, attackType);
};

Parser.trapHazTypeToFull = function(type) {
  return Parser._parse_aToB(Parser.TRAP_HAZARD_TYPE_TO_FULL, type);
};

Parser.TRAP_HAZARD_TYPE_TO_FULL = {
  MECH: 'Mechanical trap',
  MAG: 'Magical trap',
  SMPL: 'Simple trap',
  CMPX: 'Complex trap',
  HAZ: 'Hazard',
  WTH: 'Weather',
  ENV: 'Environmental Hazard',
  WLD: 'Wilderness Hazard',
  GEN: 'Generic',
};

Parser.tierToFullLevel = function(tier) {
  return Parser._parse_aToB(Parser.TIER_TO_FULL_LEVEL, tier);
};

Parser.TIER_TO_FULL_LEVEL = {};
Parser.TIER_TO_FULL_LEVEL[1] = 'level 1\u20144';
Parser.TIER_TO_FULL_LEVEL[2] = 'level 5\u201410';
Parser.TIER_TO_FULL_LEVEL[3] = 'level 11\u201416';
Parser.TIER_TO_FULL_LEVEL[4] = 'level 17\u201420';

Parser.threatToFull = function(threat) {
  return Parser._parse_aToB(Parser.THREAT_TO_FULL, threat);
};

Parser.THREAT_TO_FULL = {};
Parser.THREAT_TO_FULL[1] = 'moderate';
Parser.THREAT_TO_FULL[2] = 'dangerous';
Parser.THREAT_TO_FULL[3] = 'deadly';

Parser.trapInitToFull = function(init) {
  return Parser._parse_aToB(Parser.TRAP_INIT_TO_FULL, init);
};

Parser.TRAP_INIT_TO_FULL = {};
Parser.TRAP_INIT_TO_FULL[1] = 'initiative count 10';
Parser.TRAP_INIT_TO_FULL[2] = 'initiative count 20';
Parser.TRAP_INIT_TO_FULL[3] = 'initiative count 20 and initiative count 10';

Parser.ATK_TYPE_TO_FULL = {};
Parser.ATK_TYPE_TO_FULL['MW'] = 'Melee Weapon Attack';
Parser.ATK_TYPE_TO_FULL['RW'] = 'Ranged Weapon Attack';

Parser.bookOrdinalToAbv = (ordinal, preNoSuff) => {
  if (ordinal === undefined) return '';
  switch (ordinal.type) {
    case 'part':
      return `${preNoSuff ? ' ' : ''}Part ${ordinal.identifier}${
        preNoSuff ? '' : ' \u2014 '
      }`;
    case 'chapter':
      return `${preNoSuff ? ' ' : ''}Ch. ${ordinal.identifier}${
        preNoSuff ? '' : ': '
      }`;
    case 'episode':
      return `${preNoSuff ? ' ' : ''}Ep. ${ordinal.identifier}${
        preNoSuff ? '' : ': '
      }`;
    case 'appendix':
      return `${preNoSuff ? ' ' : ''}App. ${ordinal.identifier}${
        preNoSuff ? '' : ': '
      }`;
    case 'level':
      return `${preNoSuff ? ' ' : ''}Level ${ordinal.identifier}${
        preNoSuff ? '' : ': '
      }`;
    default:
      throw new Error(`Unhandled ordinal type "${ordinal.type}"`);
  }
};

Parser.nameToTokenName = function(name) {
  return name
    .normalize('NFD') // replace diactrics with their individual graphemes
    .replace(/[\u0300-\u036f]/g, '') // remove accent graphemes
    .replace(/Æ/g, 'AE')
    .replace(/æ/g, 'ae')
    .replace(/"/g, '');
};

SKL_ABV_ABJ = 'A';
SKL_ABV_EVO = 'V';
SKL_ABV_ENC = 'E';
SKL_ABV_ILL = 'I';
SKL_ABV_DIV = 'D';
SKL_ABV_NEC = 'N';
SKL_ABV_TRA = 'T';
SKL_ABV_CON = 'C';
SKL_ABV_PSI = 'P';
Parser.SKL_ABVS = [
  SKL_ABV_ABJ,
  SKL_ABV_EVO,
  SKL_ABV_ENC,
  SKL_ABV_ILL,
  SKL_ABV_DIV,
  SKL_ABV_NEC,
  SKL_ABV_TRA,
  SKL_ABV_CON,
  SKL_ABV_PSI,
];

Parser.SP_TM_ACTION = 'action';
Parser.SP_TM_B_ACTION = 'bonus';
Parser.SP_TM_REACTION = 'reaction';
Parser.SP_TM_ROUND = 'round';
Parser.SP_TM_MINS = 'minute';
Parser.SP_TM_HRS = 'hour';
Parser.SP_TIME_SINGLETONS = [
  Parser.SP_TM_ACTION,
  Parser.SP_TM_B_ACTION,
  Parser.SP_TM_REACTION,
  Parser.SP_TM_ROUND,
];
Parser.SP_TIME_TO_FULL = {
  [Parser.SP_TM_ACTION]: 'Action',
  [Parser.SP_TM_B_ACTION]: 'Bonus Action',
  [Parser.SP_TM_REACTION]: 'Reaction',
  [Parser.SP_TM_ROUND]: 'Rounds',
  [Parser.SP_TM_MINS]: 'Minutes',
  [Parser.SP_TM_HRS]: 'Hours',
};
Parser.spTimeUnitToFull = function(timeUnit) {
  return Parser._parse_aToB(Parser.SP_TIME_TO_FULL, timeUnit);
};

Parser.SP_TIME_TO_ABV = {
  [Parser.SP_TM_ACTION]: 'A',
  [Parser.SP_TM_B_ACTION]: 'BA',
  [Parser.SP_TM_REACTION]: 'R',
  [Parser.SP_TM_ROUND]: 'rnd',
  [Parser.SP_TM_MINS]: 'min',
  [Parser.SP_TM_HRS]: 'hr',
};
Parser.spTimeUnitToAbv = function(timeUnit) {
  return Parser._parse_aToB(Parser.SP_TIME_TO_ABV, timeUnit);
};

SKL_ABJ = 'Abjuration';
SKL_EVO = 'Evocation';
SKL_ENC = 'Enchantment';
SKL_ILL = 'Illusion';
SKL_DIV = 'Divination';
SKL_NEC = 'Necromancy';
SKL_TRA = 'Transmutation';
SKL_CON = 'Conjuration';
SKL_PSI = 'Psionic';

Parser.SP_SCHOOL_ABV_TO_FULL = {};
Parser.SP_SCHOOL_ABV_TO_FULL[SKL_ABV_ABJ] = SKL_ABJ;
Parser.SP_SCHOOL_ABV_TO_FULL[SKL_ABV_EVO] = SKL_EVO;
Parser.SP_SCHOOL_ABV_TO_FULL[SKL_ABV_ENC] = SKL_ENC;
Parser.SP_SCHOOL_ABV_TO_FULL[SKL_ABV_ILL] = SKL_ILL;
Parser.SP_SCHOOL_ABV_TO_FULL[SKL_ABV_DIV] = SKL_DIV;
Parser.SP_SCHOOL_ABV_TO_FULL[SKL_ABV_NEC] = SKL_NEC;
Parser.SP_SCHOOL_ABV_TO_FULL[SKL_ABV_TRA] = SKL_TRA;
Parser.SP_SCHOOL_ABV_TO_FULL[SKL_ABV_CON] = SKL_CON;
Parser.SP_SCHOOL_ABV_TO_FULL[SKL_ABV_PSI] = SKL_PSI;

Parser.SP_SCHOOL_ABV_TO_SHORT = {};
Parser.SP_SCHOOL_ABV_TO_SHORT[SKL_ABV_ABJ] = 'Abj.';
Parser.SP_SCHOOL_ABV_TO_SHORT[SKL_ABV_EVO] = 'Evoc.';
Parser.SP_SCHOOL_ABV_TO_SHORT[SKL_ABV_ENC] = 'Ench.';
Parser.SP_SCHOOL_ABV_TO_SHORT[SKL_ABV_ILL] = 'Illu.';
Parser.SP_SCHOOL_ABV_TO_SHORT[SKL_ABV_DIV] = 'Divin.';
Parser.SP_SCHOOL_ABV_TO_SHORT[SKL_ABV_NEC] = 'Necro.';
Parser.SP_SCHOOL_ABV_TO_SHORT[SKL_ABV_TRA] = 'Trans.';
Parser.SP_SCHOOL_ABV_TO_SHORT[SKL_ABV_CON] = 'Conj.';
Parser.SP_SCHOOL_ABV_TO_SHORT[SKL_ABV_PSI] = 'Psi.';

Parser.ATB_ABV_TO_FULL = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

TP_ABERRATION = 'aberration';
TP_BEAST = 'beast';
TP_CELESTIAL = 'celestial';
TP_CONSTRUCT = 'construct';
TP_DRAGON = 'dragon';
TP_ELEMENTAL = 'elemental';
TP_FEY = 'fey';
TP_FIEND = 'fiend';
TP_GIANT = 'giant';
TP_HUMANOID = 'humanoid';
TP_MONSTROSITY = 'monstrosity';
TP_OOZE = 'ooze';
TP_PLANT = 'plant';
TP_UNDEAD = 'undead';
Parser.MON_TYPES = [
  TP_ABERRATION,
  TP_BEAST,
  TP_CELESTIAL,
  TP_CONSTRUCT,
  TP_DRAGON,
  TP_ELEMENTAL,
  TP_FEY,
  TP_FIEND,
  TP_GIANT,
  TP_HUMANOID,
  TP_MONSTROSITY,
  TP_OOZE,
  TP_PLANT,
  TP_UNDEAD,
];
Parser.MON_TYPE_TO_PLURAL = {};
Parser.MON_TYPE_TO_PLURAL[TP_ABERRATION] = 'aberrations';
Parser.MON_TYPE_TO_PLURAL[TP_BEAST] = 'beasts';
Parser.MON_TYPE_TO_PLURAL[TP_CELESTIAL] = 'celestials';
Parser.MON_TYPE_TO_PLURAL[TP_CONSTRUCT] = 'constructs';
Parser.MON_TYPE_TO_PLURAL[TP_DRAGON] = 'dragons';
Parser.MON_TYPE_TO_PLURAL[TP_ELEMENTAL] = 'elementals';
Parser.MON_TYPE_TO_PLURAL[TP_FEY] = 'fey';
Parser.MON_TYPE_TO_PLURAL[TP_FIEND] = 'fiends';
Parser.MON_TYPE_TO_PLURAL[TP_GIANT] = 'giants';
Parser.MON_TYPE_TO_PLURAL[TP_HUMANOID] = 'humanoids';
Parser.MON_TYPE_TO_PLURAL[TP_MONSTROSITY] = 'monstrosities';
Parser.MON_TYPE_TO_PLURAL[TP_OOZE] = 'oozes';
Parser.MON_TYPE_TO_PLURAL[TP_PLANT] = 'plants';
Parser.MON_TYPE_TO_PLURAL[TP_UNDEAD] = 'undead';

SZ_FINE = 'F';
SZ_DIMINUTIVE = 'D';
SZ_TINY = 'T';
SZ_SMALL = 'S';
SZ_MEDIUM = 'M';
SZ_LARGE = 'L';
SZ_HUGE = 'H';
SZ_GARGANTUAN = 'G';
SZ_COLOSSAL = 'C';
SZ_VARIES = 'V';
Parser.SIZE_ABVS = [
  SZ_TINY,
  SZ_SMALL,
  SZ_MEDIUM,
  SZ_LARGE,
  SZ_HUGE,
  SZ_GARGANTUAN,
  SZ_VARIES,
];
Parser.SIZE_ABV_TO_FULL = {};
Parser.SIZE_ABV_TO_FULL[SZ_FINE] = 'Fine';
Parser.SIZE_ABV_TO_FULL[SZ_DIMINUTIVE] = 'Diminutive';
Parser.SIZE_ABV_TO_FULL[SZ_TINY] = 'Tiny';
Parser.SIZE_ABV_TO_FULL[SZ_SMALL] = 'Small';
Parser.SIZE_ABV_TO_FULL[SZ_MEDIUM] = 'Medium';
Parser.SIZE_ABV_TO_FULL[SZ_LARGE] = 'Large';
Parser.SIZE_ABV_TO_FULL[SZ_HUGE] = 'Huge';
Parser.SIZE_ABV_TO_FULL[SZ_GARGANTUAN] = 'Gargantuan';
Parser.SIZE_ABV_TO_FULL[SZ_COLOSSAL] = 'Colossal';
Parser.SIZE_ABV_TO_FULL[SZ_VARIES] = 'Varies';

Parser.XP_CHART = [
  200,
  450,
  700,
  1100,
  1800,
  2300,
  2900,
  3900,
  5000,
  5900,
  7200,
  8400,
  10000,
  11500,
  13000,
  15000,
  18000,
  20000,
  22000,
  25000,
  30000,
  41000,
  50000,
  62000,
  75000,
  90000,
  105000,
  120000,
  135000,
  155000,
];

Parser.TOOL_PROFICIENCY = [
  "artisan's tools",
  "cartographer's tools",
  'disguise kit',
  'forgery kit',
  'gaming set',
  'herbalism kit',
  'musical instrument',
  "navigator's tools",
  "thieves' tools",
  'vehicles (land)',
  'vehicles (water)',
  "alchemist's supplies",
];

Parser.XP_CHART_ALT = {
  '0': 10,
  '1/8': 25,
  '1/4': 50,
  '1/2': 100,
  '1': 200,
  '2': 450,
  '3': 700,
  '4': 1100,
  '5': 1800,
  '6': 2300,
  '7': 2900,
  '8': 3900,
  '9': 5000,
  '10': 5900,
  '11': 7200,
  '12': 8400,
  '13': 10000,
  '14': 11500,
  '15': 13000,
  '16': 15000,
  '17': 18000,
  '18': 20000,
  '19': 22000,
  '20': 25000,
  '21': 30000,
  '22': 41000,
  '23': 50000,
  '24': 62000,
  '25': 75000,
  '26': 90000,
  '27': 105000,
  '28': 120000,
  '29': 135000,
  '30': 155000,
};

Parser.ARMOR_ABV_TO_FULL = {
  'l.': 'light',
  'm.': 'medium',
  'h.': 'heavy',
};

Parser.SOURCE_JSON_TO_FULL = {};
Parser.SOURCE_JSON_TO_FULL[SRC_CoS] = 'Curse of Strahd';
Parser.SOURCE_JSON_TO_FULL[SRC_DMG] = "Dungeon Master's Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_EEPC] = "Elemental Evil Player's Companion";
Parser.SOURCE_JSON_TO_FULL[SRC_EET] = 'Elemental Evil: Trinkets';
Parser.SOURCE_JSON_TO_FULL[SRC_HotDQ] = 'Hoard of the Dragon Queen';
Parser.SOURCE_JSON_TO_FULL[SRC_LMoP] = 'Lost Mine of Phandelver';
Parser.SOURCE_JSON_TO_FULL[SRC_Mag] = 'Dragon Magazine';
Parser.SOURCE_JSON_TO_FULL[SRC_MM] = 'Monster Manual';
Parser.SOURCE_JSON_TO_FULL[SRC_OotA] = 'Out of the Abyss';
Parser.SOURCE_JSON_TO_FULL[SRC_PHB] = "Player's Handbook";
Parser.SOURCE_JSON_TO_FULL[SRC_TCE] = "Tasha's Cauldron of Everything";
Parser.SOURCE_JSON_TO_FULL[SRC_PotA] = 'Princes of the Apocalypse';
Parser.SOURCE_JSON_TO_FULL[SRC_RoT] = 'The Rise of Tiamat';
Parser.SOURCE_JSON_TO_FULL[SRC_RoTOS] = 'The Rise of Tiamat Online Supplement';
Parser.SOURCE_JSON_TO_FULL[SRC_SCAG] = "Sword Coast Adventurer's Guide";
Parser.SOURCE_JSON_TO_FULL[SRC_SKT] = "Storm King's Thunder";
Parser.SOURCE_JSON_TO_FULL[SRC_ToA] = 'Tomb of Annihilation';
Parser.SOURCE_JSON_TO_FULL[SRC_ToD] = 'Tyranny of Dragons';
Parser.SOURCE_JSON_TO_FULL[SRC_TTP] = 'The Tortle Package';
Parser.SOURCE_JSON_TO_FULL[SRC_TYP] = TftYP_NAME;
Parser.SOURCE_JSON_TO_FULL[SRC_TYP_AtG] = `${TftYP_NAME}: Against the Giants`;
Parser.SOURCE_JSON_TO_FULL[SRC_TYP_DiT] = `${TftYP_NAME}: Dead in Thay`;
Parser.SOURCE_JSON_TO_FULL[SRC_TYP_TFoF] = `${TftYP_NAME}: The Forge of Fury`;
Parser.SOURCE_JSON_TO_FULL[
  SRC_TYP_THSoT
] = `${TftYP_NAME}: The Hidden Shrine of Tamoachan`;
Parser.SOURCE_JSON_TO_FULL[SRC_TYP_TSC] = `${TftYP_NAME}: The Sunless Citadel`;
Parser.SOURCE_JSON_TO_FULL[SRC_TYP_ToH] = `${TftYP_NAME}: Tomb of Horrors`;
Parser.SOURCE_JSON_TO_FULL[SRC_TYP_WPM] = `${TftYP_NAME}: White Plume Mountain`;
Parser.SOURCE_JSON_TO_FULL[SRC_VGM] = "Volo's Guide to Monsters";
Parser.SOURCE_JSON_TO_FULL[SRC_XGE] = "Xanathar's Guide to Everything";
Parser.SOURCE_JSON_TO_FULL[SRC_OGA] = 'One Grung Above';
Parser.SOURCE_JSON_TO_FULL[SRC_MTF] = "Mordenkainen's Tome of Foes";
Parser.SOURCE_JSON_TO_FULL[SRC_WDH] = 'Waterdeep: Dragon Heist';
Parser.SOURCE_JSON_TO_FULL[SRC_WDMM] = 'Waterdeep: Dungeon of the Mad Mage';
Parser.SOURCE_JSON_TO_FULL[SRC_GGR] = "Guildmasters' Guide to Ravnica";
Parser.SOURCE_JSON_TO_FULL[SRC_KKW] = "Krenko's Way";
Parser.SOURCE_JSON_TO_FULL[SRC_LLK] = 'Lost Laboratory of Kwalish';
Parser.SOURCE_JSON_TO_FULL[SRC_GoS] = 'Ghosts of Saltmarsh';
Parser.SOURCE_JSON_TO_FULL[SRC_AI] = 'Acquisitions Incorporated';
Parser.SOURCE_JSON_TO_FULL[SRC_OoW] = 'The Orrery of the Wanderer';
Parser.SOURCE_JSON_TO_FULL[SRC_ESK] = 'Essentials Kit';
Parser.SOURCE_JSON_TO_FULL[SRC_DIP] = 'Dragon of Icespire Peak';
Parser.SOURCE_JSON_TO_FULL[SRC_HftT] = 'Hunt for the Thessalhydra';
Parser.SOURCE_JSON_TO_FULL[SRC_DC] = 'Divine Contention';
Parser.SOURCE_JSON_TO_FULL[SRC_SLW] = "Storm Lord's Wrath";
Parser.SOURCE_JSON_TO_FULL[SRC_SDW] = "Sleeping Dragon's Wake";
Parser.SOURCE_JSON_TO_FULL[SRC_BGDIA] = "Baldur's Gate: Descent Into Avernus";
Parser.SOURCE_JSON_TO_FULL[SRC_LR] = 'Locathah Rising';
Parser.SOURCE_JSON_TO_FULL[SRC_AL] = "Adventurers' League";
Parser.SOURCE_JSON_TO_FULL[SRC_SAC] = 'Sage Advice Compendium';
Parser.SOURCE_JSON_TO_FULL[SRC_ERLW] = 'Eberron: Rising from the Last War';
Parser.SOURCE_JSON_TO_FULL[SRC_EFR] = 'Eberron: Forgotten Relics';
Parser.SOURCE_JSON_TO_FULL[SRC_RMBRE] =
  'The Lost Dungeon of Rickedness: Big Rick Energy';
Parser.SOURCE_JSON_TO_FULL[SRC_RMR] =
  'Dungeons & Dragons vs. Rick and Morty: Basic Rules';
Parser.SOURCE_JSON_TO_FULL[SRC_MFF] = "Mordenkainen's Fiendish Folio";
Parser.SOURCE_JSON_TO_FULL[SRC_AWM] = 'Adventure with Muk';
Parser.SOURCE_JSON_TO_FULL[SRC_IMR] = 'Infernal Machine Rebuild';
Parser.SOURCE_JSON_TO_FULL[SRC_SADS] = 'Sapphire Anniversary Dice Set';
Parser.SOURCE_JSON_TO_FULL[SRC_SCREEN] = "Dungeon Master's Screen";
Parser.SOURCE_JSON_TO_FULL[SRC_ALCoS] = `${AL_PREFIX}Curse of Strahd`;
Parser.SOURCE_JSON_TO_FULL[SRC_ALEE] = `${AL_PREFIX}Elemental Evil`;
Parser.SOURCE_JSON_TO_FULL[SRC_ALRoD] = `${AL_PREFIX}Rage of Demons`;
Parser.SOURCE_JSON_TO_FULL[SRC_PSA] = `${PS_PREFIX}Amonkhet`;
Parser.SOURCE_JSON_TO_FULL[SRC_PSI] = `${PS_PREFIX}Innistrad`;
Parser.SOURCE_JSON_TO_FULL[SRC_PSK] = `${PS_PREFIX}Kaladesh`;
Parser.SOURCE_JSON_TO_FULL[SRC_PSZ] = `${PS_PREFIX}Zendikar`;
Parser.SOURCE_JSON_TO_FULL[SRC_PSX] = `${PS_PREFIX}Ixalan`;
Parser.SOURCE_JSON_TO_FULL[SRC_PSD] = `${PS_PREFIX}Dominaria`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAA] = `${UA_PREFIX}Artificer`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAEAG] = `${UA_PREFIX}Eladrin and Gith`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAEBB] = `${UA_PREFIX}Eberron`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAFFR] = `${UA_PREFIX}Feats for Races`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAFFS] = `${UA_PREFIX}Feats for Skills`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAFO] = `${UA_PREFIX}Fiendish Options`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAFT] = `${UA_PREFIX}Feats`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAGH] = `${UA_PREFIX}Gothic Heroes`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAMDM] = `${UA_PREFIX}Modern Magic`;
Parser.SOURCE_JSON_TO_FULL[SRC_UASSP] = `${UA_PREFIX}Starter Spells`;
Parser.SOURCE_JSON_TO_FULL[SRC_UATMC] = `${UA_PREFIX}The Mystic Class`;
Parser.SOURCE_JSON_TO_FULL[SRC_UATOBM] = `${UA_PREFIX}That Old Black Magic`;
Parser.SOURCE_JSON_TO_FULL[SRC_UATRR] = `${UA_PREFIX}The Ranger, Revised`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAWA] = `${UA_PREFIX}Waterborne Adventures`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAVR] = `${UA_PREFIX}Variant Rules`;
Parser.SOURCE_JSON_TO_FULL[SRC_UALDR] = `${UA_PREFIX}Light, Dark, Underdark!`;
Parser.SOURCE_JSON_TO_FULL[SRC_UARAR] = `${UA_PREFIX}Ranger and Rogue`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAATOSC] = `${UA_PREFIX}A Trio of Subclasses`;
Parser.SOURCE_JSON_TO_FULL[SRC_UABPP] = `${UA_PREFIX}Barbarian Primal Paths`;
Parser.SOURCE_JSON_TO_FULL[SRC_UARSC] = `${UA_PREFIX}Revised Subclasses`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAKOO] = `${UA_PREFIX}Kits of Old`;
Parser.SOURCE_JSON_TO_FULL[SRC_UABBC] = `${UA_PREFIX}Bard: Bard Colleges`;
Parser.SOURCE_JSON_TO_FULL[SRC_UACDD] = `${UA_PREFIX}Cleric: Divine Domains`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAD] = `${UA_PREFIX}Druid`;
Parser.SOURCE_JSON_TO_FULL[SRC_UARCO] = `${UA_PREFIX}Revised Class Options`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAF] = `${UA_PREFIX}Fighter`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAM] = `${UA_PREFIX}Monk`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAP] = `${UA_PREFIX}Paladin`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAMC] = `${UA_PREFIX}Modifying Classes`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAS] = `${UA_PREFIX}Sorcerer`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAWAW] = `${UA_PREFIX}Warlock and Wizard`;
Parser.SOURCE_JSON_TO_FULL[SRC_UATF] = `${UA_PREFIX}The Faithful`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAWR] = `${UA_PREFIX}Wizard Revisited`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAESR] = `${UA_PREFIX}Elf Subraces`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAMAC] = `${UA_PREFIX}Mass Combat`;
Parser.SOURCE_JSON_TO_FULL[SRC_UA3PE] = `${UA_PREFIX}Three-Pillar Experience`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAGHI] = `${UA_PREFIX}Greyhawk Initiative`;
Parser.SOURCE_JSON_TO_FULL[SRC_UATSC] = `${UA_PREFIX}Three Subclasses`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAOD] = `${UA_PREFIX}Order Domain`;
Parser.SOURCE_JSON_TO_FULL[SRC_UACAM] = `${UA_PREFIX}Centaurs and Minotaurs`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAGSS] = `${UA_PREFIX}Giant Soul Sorcerer`;
Parser.SOURCE_JSON_TO_FULL[SRC_UARoE] = `${UA_PREFIX}Races of Eberron`;
Parser.SOURCE_JSON_TO_FULL[SRC_UARoR] = `${UA_PREFIX}Races of Ravnica`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAWGE] = "Wayfinder's Guide to Eberron";
Parser.SOURCE_JSON_TO_FULL[SRC_UAOSS] = `${UA_PREFIX}Of Ships and the Sea`;
Parser.SOURCE_JSON_TO_FULL[SRC_UASIK] = `${UA_PREFIX}Sidekicks`;
Parser.SOURCE_JSON_TO_FULL[SRC_UAAR] = `${UA_PREFIX}Artificer Revisited`;
Parser.SOURCE_JSON_TO_FULL[SRC_UABAM] = `${UA_PREFIX}Barbarian and Monk`;
Parser.SOURCE_JSON_TO_FULL[SRC_UASAW] = `${UA_PREFIX}Sorcerer and Warlock`;
Parser.SOURCE_JSON_TO_FULL[SRC_UABAP] = `${UA_PREFIX}Bard and Paladin`;
Parser.SOURCE_JSON_TO_FULL[SRC_UACDW] = `${UA_PREFIX}Cleric, Druid, and Wizard`;
Parser.SOURCE_JSON_TO_FULL[
  SRC_UAFRR
] = `${UA_PREFIX}Fighter, Ranger, and Rogue`;
Parser.SOURCE_JSON_TO_FULL[SRC_UACFV] = `${UA_PREFIX}Class Feature Variants`;
Parser.SOURCE_JSON_TO_FULL[
  SRC_UAFRW
] = `${UA_PREFIX}Fighter, Rogue, and Wizard`;
Parser.SOURCE_JSON_TO_FULL[
  SRC_UA2020SC1
] = `${UA_PREFIX}2020 Subclasses, Part 1`;
Parser.SOURCE_JSON_TO_FULL[
  SRC_UA2020SC2
] = `${UA_PREFIX}2020 Subclasses, Part 2`;
Parser.SOURCE_JSON_TO_FULL[SRC_STREAM] = 'Livestream';
Parser.SOURCE_JSON_TO_FULL[SRC_TWITTER] = 'Twitter';

Parser.SOURCE_JSON_TO_ABV = {};
Parser.SOURCE_JSON_TO_ABV[SRC_CoS] = 'CoS';
Parser.SOURCE_JSON_TO_ABV[SRC_DMG] = 'DMG';
Parser.SOURCE_JSON_TO_ABV[SRC_EEPC] = 'EEPC';
Parser.SOURCE_JSON_TO_ABV[SRC_EET] = 'EET';
Parser.SOURCE_JSON_TO_ABV[SRC_HotDQ] = 'HotDQ';
Parser.SOURCE_JSON_TO_ABV[SRC_LMoP] = 'LMoP';
Parser.SOURCE_JSON_TO_ABV[SRC_Mag] = 'Mag';
Parser.SOURCE_JSON_TO_ABV[SRC_MM] = 'MM';
Parser.SOURCE_JSON_TO_ABV[SRC_OotA] = 'OotA';
Parser.SOURCE_JSON_TO_ABV[SRC_PHB] = 'PHB';
Parser.SOURCE_JSON_TO_ABV[SRC_TCE] = 'TCE';
Parser.SOURCE_JSON_TO_ABV[SRC_PotA] = 'PotA';
Parser.SOURCE_JSON_TO_ABV[SRC_RoT] = 'RoT';
Parser.SOURCE_JSON_TO_ABV[SRC_RoTOS] = 'RoTOS';
Parser.SOURCE_JSON_TO_ABV[SRC_SCAG] = 'SCAG';
Parser.SOURCE_JSON_TO_ABV[SRC_SKT] = 'SKT';
Parser.SOURCE_JSON_TO_ABV[SRC_ToA] = 'ToA';
Parser.SOURCE_JSON_TO_ABV[SRC_ToD] = 'ToD';
Parser.SOURCE_JSON_TO_ABV[SRC_TTP] = 'TTP';
Parser.SOURCE_JSON_TO_ABV[SRC_TYP] = 'TftYP';
Parser.SOURCE_JSON_TO_ABV[SRC_TYP_AtG] = 'TftYP';
Parser.SOURCE_JSON_TO_ABV[SRC_TYP_DiT] = 'TftYP';
Parser.SOURCE_JSON_TO_ABV[SRC_TYP_TFoF] = 'TftYP';
Parser.SOURCE_JSON_TO_ABV[SRC_TYP_THSoT] = 'TftYP';
Parser.SOURCE_JSON_TO_ABV[SRC_TYP_TSC] = 'TftYP';
Parser.SOURCE_JSON_TO_ABV[SRC_TYP_ToH] = 'TftYP';
Parser.SOURCE_JSON_TO_ABV[SRC_TYP_WPM] = 'TftYP';
Parser.SOURCE_JSON_TO_ABV[SRC_VGM] = 'VGM';
Parser.SOURCE_JSON_TO_ABV[SRC_XGE] = 'XGE';
Parser.SOURCE_JSON_TO_ABV[SRC_OGA] = 'OGA';
Parser.SOURCE_JSON_TO_ABV[SRC_MTF] = 'MTF';
Parser.SOURCE_JSON_TO_ABV[SRC_WDH] = 'WDH';
Parser.SOURCE_JSON_TO_ABV[SRC_WDMM] = 'WDMM';
Parser.SOURCE_JSON_TO_ABV[SRC_GGR] = 'GGR';
Parser.SOURCE_JSON_TO_ABV[SRC_KKW] = 'KKW';
Parser.SOURCE_JSON_TO_ABV[SRC_LLK] = 'LLK';
Parser.SOURCE_JSON_TO_ABV[SRC_GoS] = 'GoS';
Parser.SOURCE_JSON_TO_ABV[SRC_AI] = 'AI';
Parser.SOURCE_JSON_TO_ABV[SRC_OoW] = 'OoW';
Parser.SOURCE_JSON_TO_ABV[SRC_ESK] = 'ESK';
Parser.SOURCE_JSON_TO_ABV[SRC_DIP] = 'DIP';
Parser.SOURCE_JSON_TO_ABV[SRC_HftT] = 'HftT';
Parser.SOURCE_JSON_TO_ABV[SRC_DC] = 'DC';
Parser.SOURCE_JSON_TO_ABV[SRC_SLW] = 'SLW';
Parser.SOURCE_JSON_TO_ABV[SRC_SDW] = 'SDW';
Parser.SOURCE_JSON_TO_ABV[SRC_BGDIA] = 'BGDIA';
Parser.SOURCE_JSON_TO_ABV[SRC_LR] = 'LR';
Parser.SOURCE_JSON_TO_ABV[SRC_AL] = 'AL';
Parser.SOURCE_JSON_TO_ABV[SRC_SAC] = 'SAC';
Parser.SOURCE_JSON_TO_ABV[SRC_ERLW] = 'ERLW';
Parser.SOURCE_JSON_TO_ABV[SRC_EFR] = 'EFR';
Parser.SOURCE_JSON_TO_ABV[SRC_RMBRE] = 'RMBRE';
Parser.SOURCE_JSON_TO_ABV[SRC_RMR] = 'RMR';
Parser.SOURCE_JSON_TO_ABV[SRC_MFF] = 'MFF';
Parser.SOURCE_JSON_TO_ABV[SRC_AWM] = 'AWM';
Parser.SOURCE_JSON_TO_ABV[SRC_IMR] = 'IMR';
Parser.SOURCE_JSON_TO_ABV[SRC_SADS] = 'SADS';
Parser.SOURCE_JSON_TO_ABV[SRC_SCREEN] = 'Screen';
Parser.SOURCE_JSON_TO_ABV[SRC_ALCoS] = 'ALCoS';
Parser.SOURCE_JSON_TO_ABV[SRC_ALEE] = 'ALEE';
Parser.SOURCE_JSON_TO_ABV[SRC_ALRoD] = 'ALRoD';
Parser.SOURCE_JSON_TO_ABV[SRC_PSA] = 'PSA';
Parser.SOURCE_JSON_TO_ABV[SRC_PSI] = 'PSI';
Parser.SOURCE_JSON_TO_ABV[SRC_PSK] = 'PSK';
Parser.SOURCE_JSON_TO_ABV[SRC_PSZ] = 'PSZ';
Parser.SOURCE_JSON_TO_ABV[SRC_PSX] = 'PSX';
Parser.SOURCE_JSON_TO_ABV[SRC_PSD] = 'PSD';
Parser.SOURCE_JSON_TO_ABV[SRC_UAA] = 'UAA';
Parser.SOURCE_JSON_TO_ABV[SRC_UAEAG] = 'UAEaG';
Parser.SOURCE_JSON_TO_ABV[SRC_UAEBB] = 'UAEB';
Parser.SOURCE_JSON_TO_ABV[SRC_UAFFR] = 'UAFFR';
Parser.SOURCE_JSON_TO_ABV[SRC_UAFFS] = 'UAFFS';
Parser.SOURCE_JSON_TO_ABV[SRC_UAFO] = 'UAFO';
Parser.SOURCE_JSON_TO_ABV[SRC_UAFT] = 'UAFT';
Parser.SOURCE_JSON_TO_ABV[SRC_UAGH] = 'UAGH';
Parser.SOURCE_JSON_TO_ABV[SRC_UAMDM] = 'UAMM';
Parser.SOURCE_JSON_TO_ABV[SRC_UASSP] = 'UASS';
Parser.SOURCE_JSON_TO_ABV[SRC_UATMC] = 'UAMy';
Parser.SOURCE_JSON_TO_ABV[SRC_UATOBM] = 'UAOBM';
Parser.SOURCE_JSON_TO_ABV[SRC_UATRR] = 'UATRR';
Parser.SOURCE_JSON_TO_ABV[SRC_UAWA] = 'UAWA';
Parser.SOURCE_JSON_TO_ABV[SRC_UAVR] = 'UAVR';
Parser.SOURCE_JSON_TO_ABV[SRC_UALDR] = 'UALDU';
Parser.SOURCE_JSON_TO_ABV[SRC_UARAR] = 'UARAR';
Parser.SOURCE_JSON_TO_ABV[SRC_UAATOSC] = 'UAATOSC';
Parser.SOURCE_JSON_TO_ABV[SRC_UABPP] = 'UABPP';
Parser.SOURCE_JSON_TO_ABV[SRC_UARSC] = 'UARSC';
Parser.SOURCE_JSON_TO_ABV[SRC_UAKOO] = 'UAKoO';
Parser.SOURCE_JSON_TO_ABV[SRC_UABBC] = 'UABBC';
Parser.SOURCE_JSON_TO_ABV[SRC_UACDD] = 'UACDD';
Parser.SOURCE_JSON_TO_ABV[SRC_UAD] = 'UAD';
Parser.SOURCE_JSON_TO_ABV[SRC_UARCO] = 'UARCO';
Parser.SOURCE_JSON_TO_ABV[SRC_UAF] = 'UAF';
Parser.SOURCE_JSON_TO_ABV[SRC_UAM] = 'UAMk';
Parser.SOURCE_JSON_TO_ABV[SRC_UAP] = 'UAP';
Parser.SOURCE_JSON_TO_ABV[SRC_UAMC] = 'UAMC';
Parser.SOURCE_JSON_TO_ABV[SRC_UAS] = 'UAS';
Parser.SOURCE_JSON_TO_ABV[SRC_UAWAW] = 'UAWAW';
Parser.SOURCE_JSON_TO_ABV[SRC_UATF] = 'UATF';
Parser.SOURCE_JSON_TO_ABV[SRC_UAWR] = 'UAWR';
Parser.SOURCE_JSON_TO_ABV[SRC_UAESR] = 'UAESR';
Parser.SOURCE_JSON_TO_ABV[SRC_UAMAC] = 'UAMAC';
Parser.SOURCE_JSON_TO_ABV[SRC_UA3PE] = 'UA3PE';
Parser.SOURCE_JSON_TO_ABV[SRC_UAGHI] = 'UAGHI';
Parser.SOURCE_JSON_TO_ABV[SRC_UATSC] = 'UATSC';
Parser.SOURCE_JSON_TO_ABV[SRC_UAOD] = 'UAOD';
Parser.SOURCE_JSON_TO_ABV[SRC_UACAM] = 'UACAM';
Parser.SOURCE_JSON_TO_ABV[SRC_UAGSS] = 'UAGSS';
Parser.SOURCE_JSON_TO_ABV[SRC_UARoE] = 'UARoE';
Parser.SOURCE_JSON_TO_ABV[SRC_UARoR] = 'UARoR';
Parser.SOURCE_JSON_TO_ABV[SRC_UAWGE] = 'WGE';
Parser.SOURCE_JSON_TO_ABV[SRC_UAOSS] = 'UAOSS';
Parser.SOURCE_JSON_TO_ABV[SRC_UASIK] = 'UASIK';
Parser.SOURCE_JSON_TO_ABV[SRC_UAAR] = 'UAAR';
Parser.SOURCE_JSON_TO_ABV[SRC_UABAM] = 'UABAM';
Parser.SOURCE_JSON_TO_ABV[SRC_UASAW] = 'UASAW';
Parser.SOURCE_JSON_TO_ABV[SRC_UABAP] = 'UABAP';
Parser.SOURCE_JSON_TO_ABV[SRC_UACDW] = 'UACDW';
Parser.SOURCE_JSON_TO_ABV[SRC_UAFRR] = 'UAFRR';
Parser.SOURCE_JSON_TO_ABV[SRC_UACFV] = 'UACFV';
Parser.SOURCE_JSON_TO_ABV[SRC_UAFRW] = 'UAFRW';
Parser.SOURCE_JSON_TO_ABV[SRC_UA2020SC1] = 'UA20S1';
Parser.SOURCE_JSON_TO_ABV[SRC_UA2020SC2] = 'UA20S2';
Parser.SOURCE_JSON_TO_ABV[SRC_STREAM] = 'Stream';
Parser.SOURCE_JSON_TO_ABV[SRC_TWITTER] = 'Twitter';

Parser.SOURCE_JSON_TO_DATE = {};
Parser.SOURCE_JSON_TO_DATE[SRC_CoS] = '2016-03-15';
Parser.SOURCE_JSON_TO_DATE[SRC_DMG] = '2014-12-09';
Parser.SOURCE_JSON_TO_DATE[SRC_EEPC] = '2015-03-10';
Parser.SOURCE_JSON_TO_DATE[SRC_EET] = '2015-03-10';
Parser.SOURCE_JSON_TO_DATE[SRC_HotDQ] = '2014-08-19';
Parser.SOURCE_JSON_TO_DATE[SRC_LMoP] = '2014-07-15';
Parser.SOURCE_JSON_TO_DATE[SRC_MM] = '2014-09-30';
Parser.SOURCE_JSON_TO_DATE[SRC_OotA] = '2015-09-15';
Parser.SOURCE_JSON_TO_DATE[SRC_PHB] = '2014-08-19';
Parser.SOURCE_JSON_TO_DATE[SRC_PotA] = '2015-04-07';
Parser.SOURCE_JSON_TO_DATE[SRC_RoT] = '2014-11-04';
Parser.SOURCE_JSON_TO_DATE[SRC_RoTOS] = '2014-11-04';
Parser.SOURCE_JSON_TO_DATE[SRC_TCE] = '2020-11-17';
Parser.SOURCE_JSON_TO_DATE[SRC_SCAG] = '2015-11-03';
Parser.SOURCE_JSON_TO_DATE[SRC_SKT] = '2016-09-06';
Parser.SOURCE_JSON_TO_DATE[SRC_ToA] = '2017-09-19';
Parser.SOURCE_JSON_TO_DATE[SRC_ToD] = '2019-10-22';
Parser.SOURCE_JSON_TO_DATE[SRC_TTP] = '2017-09-19';
Parser.SOURCE_JSON_TO_DATE[SRC_TYP] = '2017-04-04';
Parser.SOURCE_JSON_TO_DATE[SRC_TYP_AtG] = '2017-04-04';
Parser.SOURCE_JSON_TO_DATE[SRC_TYP_DiT] = '2017-04-04';
Parser.SOURCE_JSON_TO_DATE[SRC_TYP_TFoF] = '2017-04-04';
Parser.SOURCE_JSON_TO_DATE[SRC_TYP_THSoT] = '2017-04-04';
Parser.SOURCE_JSON_TO_DATE[SRC_TYP_TSC] = '2017-04-04';
Parser.SOURCE_JSON_TO_DATE[SRC_TYP_ToH] = '2017-04-04';
Parser.SOURCE_JSON_TO_DATE[SRC_TYP_WPM] = '2017-04-04';
Parser.SOURCE_JSON_TO_DATE[SRC_VGM] = '2016-11-15';
Parser.SOURCE_JSON_TO_DATE[SRC_XGE] = '2017-11-21';
Parser.SOURCE_JSON_TO_DATE[SRC_OGA] = '2017-10-11';
Parser.SOURCE_JSON_TO_DATE[SRC_MTF] = '2018-05-29';
Parser.SOURCE_JSON_TO_DATE[SRC_WDH] = '2018-09-18';
Parser.SOURCE_JSON_TO_DATE[SRC_WDMM] = '2018-11-20';
Parser.SOURCE_JSON_TO_DATE[SRC_GGR] = '2018-11-20';
Parser.SOURCE_JSON_TO_DATE[SRC_KKW] = '2018-11-20';
Parser.SOURCE_JSON_TO_DATE[SRC_LLK] = '2018-11-10';
Parser.SOURCE_JSON_TO_DATE[SRC_GoS] = '2019-05-21';
Parser.SOURCE_JSON_TO_DATE[SRC_AI] = '2019-06-18';
Parser.SOURCE_JSON_TO_DATE[SRC_OoW] = '2019-06-18';
Parser.SOURCE_JSON_TO_DATE[SRC_ESK] = '2019-06-24';
Parser.SOURCE_JSON_TO_DATE[SRC_DIP] = '2019-06-24';
Parser.SOURCE_JSON_TO_DATE[SRC_HftT] = '2019-05-01';
Parser.SOURCE_JSON_TO_DATE[SRC_DC] = '2019-06-24';
Parser.SOURCE_JSON_TO_DATE[SRC_SLW] = '2019-06-24';
Parser.SOURCE_JSON_TO_DATE[SRC_SDW] = '2019-06-24';
Parser.SOURCE_JSON_TO_DATE[SRC_BGDIA] = '2019-09-17';
Parser.SOURCE_JSON_TO_DATE[SRC_LR] = '2019-09-19';
Parser.SOURCE_JSON_TO_DATE[SRC_SAC] = '2019-01-31';
Parser.SOURCE_JSON_TO_DATE[SRC_ERLW] = '2019-11-19';
Parser.SOURCE_JSON_TO_DATE[SRC_EFR] = '2019-11-19';
Parser.SOURCE_JSON_TO_DATE[SRC_RMBRE] = '2019-11-19';
Parser.SOURCE_JSON_TO_DATE[SRC_RMR] = '2019-11-19';
Parser.SOURCE_JSON_TO_DATE[SRC_MFF] = '2019-11-12';
Parser.SOURCE_JSON_TO_DATE[SRC_AWM] = '2019-11-12';
Parser.SOURCE_JSON_TO_DATE[SRC_IMR] = '2019-11-12';
Parser.SOURCE_JSON_TO_DATE[SRC_SADS] = '2019-12-12';
Parser.SOURCE_JSON_TO_DATE[SRC_SCREEN] = '2015-01-20';
Parser.SOURCE_JSON_TO_DATE[SRC_ALCoS] = '2016-03-15';
Parser.SOURCE_JSON_TO_DATE[SRC_ALEE] = '2015-04-07';
Parser.SOURCE_JSON_TO_DATE[SRC_ALRoD] = '2015-09-15';
Parser.SOURCE_JSON_TO_DATE[SRC_PSA] = '2017-07-06';
Parser.SOURCE_JSON_TO_DATE[SRC_PSI] = '2016-07-12';
Parser.SOURCE_JSON_TO_DATE[SRC_PSK] = '2017-02-16';
Parser.SOURCE_JSON_TO_DATE[SRC_PSZ] = '2016-04-27';
Parser.SOURCE_JSON_TO_DATE[SRC_PSX] = '2018-01-09';
Parser.SOURCE_JSON_TO_DATE[SRC_PSD] = '2018-07-31';
Parser.SOURCE_JSON_TO_DATE[SRC_UAEBB] = '2015-02-02';
Parser.SOURCE_JSON_TO_DATE[SRC_UAA] = '2017-01-09';
Parser.SOURCE_JSON_TO_DATE[SRC_UAEAG] = '2017-09-11';
Parser.SOURCE_JSON_TO_DATE[SRC_UAFFR] = '2017-04-24';
Parser.SOURCE_JSON_TO_DATE[SRC_UAFFS] = '2017-04-17';
Parser.SOURCE_JSON_TO_DATE[SRC_UAFO] = '2017-10-09';
Parser.SOURCE_JSON_TO_DATE[SRC_UAFT] = '2016-06-06';
Parser.SOURCE_JSON_TO_DATE[SRC_UAGH] = '2016-04-04';
Parser.SOURCE_JSON_TO_DATE[SRC_UAMDM] = '2015-08-03';
Parser.SOURCE_JSON_TO_DATE[SRC_UASSP] = '2017-04-03';
Parser.SOURCE_JSON_TO_DATE[SRC_UATMC] = '2017-03-13';
Parser.SOURCE_JSON_TO_DATE[SRC_UATOBM] = '2015-12-07';
Parser.SOURCE_JSON_TO_DATE[SRC_UATRR] = '2016-09-12';
Parser.SOURCE_JSON_TO_DATE[SRC_UAWA] = '2015-05-04';
Parser.SOURCE_JSON_TO_DATE[SRC_UAVR] = '2015-06-08';
Parser.SOURCE_JSON_TO_DATE[SRC_UALDR] = '2015-11-02';
Parser.SOURCE_JSON_TO_DATE[SRC_UARAR] = '2017-01-16';
Parser.SOURCE_JSON_TO_DATE[SRC_UAATOSC] = '2017-03-27';
Parser.SOURCE_JSON_TO_DATE[SRC_UABPP] = '2016-11-07';
Parser.SOURCE_JSON_TO_DATE[SRC_UARSC] = '2017-05-01';
Parser.SOURCE_JSON_TO_DATE[SRC_UAKOO] = '2016-01-04';
Parser.SOURCE_JSON_TO_DATE[SRC_UABBC] = '2016-11-14';
Parser.SOURCE_JSON_TO_DATE[SRC_UACDD] = '2016-11-12';
Parser.SOURCE_JSON_TO_DATE[SRC_UAD] = '2016-11-28';
Parser.SOURCE_JSON_TO_DATE[SRC_UARCO] = '2017-06-05';
Parser.SOURCE_JSON_TO_DATE[SRC_UAF] = '2016-12-5';
Parser.SOURCE_JSON_TO_DATE[SRC_UAM] = '2016-12-12';
Parser.SOURCE_JSON_TO_DATE[SRC_UAP] = '2016-12-19';
Parser.SOURCE_JSON_TO_DATE[SRC_UAMC] = '2015-04-06';
Parser.SOURCE_JSON_TO_DATE[SRC_UAS] = '2017-02-06';
Parser.SOURCE_JSON_TO_DATE[SRC_UAWAW] = '2017-02-13';
Parser.SOURCE_JSON_TO_DATE[SRC_UATF] = '2016-08-01';
Parser.SOURCE_JSON_TO_DATE[SRC_UAWR] = '2017-03-20';
Parser.SOURCE_JSON_TO_DATE[SRC_UAESR] = '2017-11-13';
Parser.SOURCE_JSON_TO_DATE[SRC_UAMAC] = '2017-02-21';
Parser.SOURCE_JSON_TO_DATE[SRC_UA3PE] = '2017-08-07';
Parser.SOURCE_JSON_TO_DATE[SRC_UAGHI] = '2017-07-10';
Parser.SOURCE_JSON_TO_DATE[SRC_UATSC] = '2018-01-08';
Parser.SOURCE_JSON_TO_DATE[SRC_UAOD] = '2018-04-09';
Parser.SOURCE_JSON_TO_DATE[SRC_UACAM] = '2018-05-14';
Parser.SOURCE_JSON_TO_DATE[SRC_UAGSS] = '2018-06-11';
Parser.SOURCE_JSON_TO_DATE[SRC_UARoE] = '5018-07-23';
Parser.SOURCE_JSON_TO_DATE[SRC_UARoR] = '2018-08-13';
Parser.SOURCE_JSON_TO_DATE[SRC_UAWGE] = '2018-07-23';
Parser.SOURCE_JSON_TO_DATE[SRC_UAOSS] = '2018-11-12';
Parser.SOURCE_JSON_TO_DATE[SRC_UASIK] = '2018-12-17';
Parser.SOURCE_JSON_TO_DATE[SRC_UAAR] = '2019-02-28';
Parser.SOURCE_JSON_TO_DATE[SRC_UABAM] = '2019-08-15';
Parser.SOURCE_JSON_TO_DATE[SRC_UASAW] = '2019-09-05';
Parser.SOURCE_JSON_TO_DATE[SRC_UABAP] = '2019-09-18';
Parser.SOURCE_JSON_TO_DATE[SRC_UACDW] = '2019-10-03';
Parser.SOURCE_JSON_TO_DATE[SRC_UAFRR] = '2019-10-17';
Parser.SOURCE_JSON_TO_DATE[SRC_UACFV] = '2019-11-04';
Parser.SOURCE_JSON_TO_DATE[SRC_UAFRW] = '2019-11-25';
Parser.SOURCE_JSON_TO_DATE[SRC_UA2020SC1] = '2020-01-14';
Parser.SOURCE_JSON_TO_DATE[SRC_UA2020SC2] = '2020-02-04';

Parser.SOURCES_ADVENTURES = new Set([
  SRC_LMoP,
  SRC_HotDQ,
  SRC_RoT,
  SRC_PotA,
  SRC_OotA,
  SRC_CoS,
  SRC_SKT,
  SRC_TYP,
  SRC_TYP_AtG,
  SRC_TYP_DiT,
  SRC_TYP_TFoF,
  SRC_TYP_THSoT,
  SRC_TYP_TSC,
  SRC_TYP_ToH,
  SRC_TYP_WPM,
  SRC_ToA,
  SRC_WDH,
  SRC_LLK,
  SRC_WDMM,
  SRC_KKW,
  SRC_GoS,
  SRC_HftT,
  SRC_OoW,
  SRC_DIP,
  SRC_SLW,
  SRC_SDW,
  SRC_DC,
  SRC_BGDIA,
  SRC_LR,
  SRC_EFR,
  SRC_RMBRE,
  SRC_IMR,
  SRC_AWM,
]);
Parser.SOURCES_CORE_SUPPLEMENTS = new Set(
  Object.keys(Parser.SOURCE_JSON_TO_FULL).filter(
    it => !Parser.SOURCES_ADVENTURES.has(it),
  ),
);
Parser.SOURCES_NON_STANDARD_WOTC = new Set([
  SRC_OGA,
  SRC_Mag,
  SRC_STREAM,
  SRC_TWITTER,
  SRC_LLK,
  SRC_LR,
  SRC_AWM,
  SRC_IMR,
  SRC_SADS,
]);

Parser.ITEM_TYPE_JSON_TO_ABV = {
  A: 'Ammunition',
  AF: 'Ammunition',
  AT: "Artisan's Tools",
  EM: 'Eldritch Machine',
  EXP: 'Explosive',
  G: 'Adventuring Gear',
  GS: 'Gaming Set',
  HA: 'Heavy Armor',
  INS: 'Instrument',
  LA: 'Light Armor',
  M: 'Melee Weapon',
  MA: 'Medium Armor',
  MNT: 'Mount',
  GV: 'Generic Variant',
  P: 'Potion',
  R: 'Ranged Weapon',
  RD: 'Rod',
  RG: 'Ring',
  S: 'Shield',
  SC: 'Scroll',
  SCF: 'Spellcasting Focus',
  OTH: 'Other',
  T: 'Tools',
  TAH: 'Tack and Harness',
  TG: 'Trade Good',
  $: 'Treasure',
  VEH: 'Vehicle (land)',
  SHP: 'Vehicle (water)',
  AIR: 'Vehicle (air)',
  WD: 'Wand',
};

Parser.DMGTYPE_JSON_TO_FULL = {
  A: 'acid',
  B: 'bludgeoning',
  C: 'cold',
  F: 'fire',
  O: 'force',
  L: 'lightning',
  N: 'necrotic',
  P: 'piercing',
  I: 'poison',
  Y: 'psychic',
  R: 'radiant',
  S: 'slashing',
  T: 'thunder',
};

Parser.DMG_TYPES = [
  'acid',
  'bludgeoning',
  'cold',
  'fire',
  'force',
  'lightning',
  'necrotic',
  'piercing',
  'poison',
  'psychic',
  'radiant',
  'slashing',
  'thunder',
];
Parser.CONDITIONS = [
  'blinded',
  'charmed',
  'deafened',
  'exhaustion',
  'frightened',
  'grappled',
  'incapacitated',
  'invisible',
  'paralyzed',
  'petrified',
  'poisoned',
  'prone',
  'restrained',
  'stunned',
  'unconscious',
];

Parser.SKILL_JSON_TO_FULL = {
  Acrobatics: [
    "Your Dexterity (Acrobatics) check covers your attempt to stay on your feet in a tricky situation, such as when you're trying to run across a sheet of ice, balance on a tightrope, or stay upright on a rocking ship's deck. The DM might also call for a Dexterity (Acrobatics) check to see if you can perform acrobatic stunts, including dives, rolls, somersaults, and flips.",
  ],
  'Animal Handling': [
    "When there is any question whether you can calm down a domesticated animal, keep a mount from getting spooked, or intuit an animal's intentions, the DM might call for a Wisdom (Animal Handling) check. You also make a Wisdom (Animal Handling) check to control your mount when you attempt a risky maneuver.",
  ],
  Arcana: [
    'Your Intelligence (Arcana) check measures your ability to recall lore about spells, magic items, eldritch symbols, magical traditions, the planes of existence, and the inhabitants of those planes.',
  ],
  Athletics: [
    'Your Strength (Athletics) check covers difficult situations you encounter while climbing, jumping, or swimming. Examples include the following activities:',
    {
      type: 'list',
      items: [
        'You attempt to climb a sheer or slippery cliff, avoid hazards while scaling a wall, or cling to a surface while something is trying to knock you off.',
        'You try to jump an unusually long distance or pull off a stunt mid jump.',
        'You struggle to swim or stay afloat in treacherous currents, storm-tossed waves, or areas of thick seaweed. Or another creature tries to push or pull you underwater or otherwise interfere with your swimming.',
      ],
    },
  ],
  Deception: [
    "Your Charisma (Deception) check determines whether you can convincingly hide the truth, either verbally or through your actions. This deception can encompass everything from misleading others through ambiguity to telling outright lies. Typical situations include trying to fast-talk a guard, con a merchant, earn money through gambling, pass yourself off in a disguise, dull someone's suspicions with false assurances, or maintain a straight face while telling a blatant lie.",
  ],
  History: [
    'Your Intelligence (History) check measures your ability to recall lore about historical events, legendary people, ancient kingdoms, past disputes, recent wars, and lost civilizations.',
  ],
  Insight: [
    "Your Wisdom (Insight) check decides whether you can determine the true intentions of a creature, such as when searching out a lie or predicting someone's next move. Doing so involves gleaning clues from body language, speech habits, and changes in mannerisms.",
  ],
  Intimidation: [
    'When you attempt to influence someone through overt threats, hostile actions, and physical violence, the DM might ask you to make a Charisma (Intimidation) check. Examples include trying to pry information out of a prisoner, convincing street thugs to back down from a confrontation, or using the edge of a broken bottle to convince a sneering vizier to reconsider a decision.',
  ],
  Investigation: [
    'When you look around for clues and make deductions based on those clues, you make an Intelligence (Investigation) check. You might deduce the location of a hidden object, discern from the appearance of a wound what kind of weapon dealt it, or determine the weakest point in a tunnel that could cause it to collapse. Poring through ancient scrolls in search of a hidden fragment of knowledge might also call for an Intelligence (Investigation) check.',
  ],
  Medicine: [
    'A Wisdom (Medicine) check lets you try to stabilize a dying companion or diagnose an illness.',
  ],
  Nature: [
    'Your Intelligence (Nature) check measures your ability to recall lore about terrain, plants and animals, the weather, and natural cycles.',
  ],
  Perception: [
    'Your Wisdom (Perception) check lets you spot, hear, or otherwise detect the presence of something. It measures your general awareness of your surroundings and the keenness of your senses.',
    'For example, you might try to hear a conversation through a closed door, eavesdrop under an open window, or hear monsters moving stealthily in the forest. Or you might try to spot things that are obscured or easy to miss, whether they are orcs lying in ambush on a road, thugs hiding in the shadows of an alley, or candlelight under a closed secret door.',
  ],
  Performance: [
    'Your Charisma (Performance) check determines how well you can delight an audience with music, dance, acting, storytelling, or some other form of entertainment.',
  ],
  Persuasion: [
    'When you attempt to influence someone or a group of people with tact, social graces, or good nature, the DM might ask you to make a Charisma (Persuasion) check. Typically, you use persuasion when acting in good faith, to foster friendships, make cordial requests, or exhibit proper etiquette. Examples of persuading others include convincing a chamberlain to let your party see the king, negotiating peace between warring tribes, or inspiring a crowd of townsfolk.',
  ],
  Religion: [
    'Your Intelligence (Religion) check measures your ability to recall lore about deities, rites and prayers, religious hierarchies, holy symbols, and the practices of secret cults.',
  ],
  'Sleight of Hand': [
    "Whenever you attempt an act of legerdemain or manual trickery, such as planting something on someone else or concealing an object on your person, make a Dexterity (Sleight of Hand) check. The DM might also call for a Dexterity (Sleight of Hand) check to determine whether you can lift a coin purse off another person or slip something out of another person's pocket.",
  ],
  Stealth: [
    'Make a Dexterity (Stealth) check when you attempt to conceal yourself from enemies, slink past guards, slip away without being noticed, or sneak up on someone without being seen or heard.',
  ],
  Survival: [
    'The DM might ask you to make a Wisdom (Survival) check to follow tracks, hunt wild game, guide your group through frozen wastelands, identify signs that owlbears live nearby, predict the weather, or avoid quicksand and other natural hazards.',
  ],
};

Parser.SENSE_JSON_TO_FULL = {
  blindsight: [
    'A creature with blindsight can perceive its surroundings without relying on sight, within a specific radius. Creatures without eyes, such as oozes, and creatures with echolocation or heightened senses, such as bats and true dragons, have this sense.',
  ],
  darkvision: [
    "Many creatures in fantasy gaming worlds, especially those that dwell underground, have darkvision. Within a specified range, a creature with darkvision can see in dim light as if it were bright light and in darkness as if it were dim light, so areas of darkness are only lightly obscured as far as that creature is concerned. However, the creature can't discern color in that darkness, only shades of gray.",
  ],
  tremorsense: [
    "A creature with tremorsense can detect and pinpoint the origin of vibrations within a specific radius, provided that the creature and the source of the vibrations are in contact with the same ground or substance. Tremorsense can't be used to detect flying or incorporeal creatures. Many burrowing creatures, such as ankhegs and umber hulks, have this special sense.",
  ],
  truesight: [
    'A creature with truesight can, out to a specific range, see in normal and magical darkness, see invisible creatures and objects, automatically detect visual illusions and succeed on saving throws against them, and perceives the original form of a shapechanger or a creature that is transformed by magic. Furthermore, the creature can see into the Ethereal Plane.',
  ],
};

Parser.NUMBERS_ONES = [
  '',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
];
Parser.NUMBERS_TENS = [
  '',
  '',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
];
Parser.NUMBERS_TEENS = [
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
];

// SOURCES =============================================================================================================
SourceUtil = {
  _subclassReprintLookup: {},
  async pInitSubclassReprintLookup() {
    SourceUtil._subclassReprintLookup = await DataUtil.loadJSON(
      `${Renderer.get().baseUrl}data/generated/gendata-subclass-lookup.json`,
    );
  },

  isSubclassReprinted(
    className,
    classSource,
    subclassShortName,
    subclassSource,
  ) {
    const fromLookup = MiscUtil.get(
      SourceUtil._subclassReprintLookup,
      classSource,
      className,
      subclassSource,
      subclassShortName,
    );
    return fromLookup ? fromLookup.isReprinted : false;
  },

  isAdventure(source) {
    // if (source instanceof FilterItem) source = source.item;
    return Parser.SOURCES_ADVENTURES.has(source);
  },

  isCoreOrSupplement(source) {
    // if (source instanceof FilterItem) source = source.item;
    return Parser.SOURCES_CORE_SUPPLEMENTS.has(source);
  },

  isNonstandardSource(source) {
    return (
      source != null &&
      // !BrewUtil.hasSourceJson(source) &&
      SourceUtil._isNonstandardSourceWiz(source)
    );
  },

  _isNonstandardSourceWiz(source) {
    return (
      source.startsWith(SRC_UA_PREFIX) ||
      source.startsWith(SRC_PS_PREFIX) ||
      source.startsWith(SRC_AL_PREFIX) ||
      Parser.SOURCES_NON_STANDARD_WOTC.has(source)
    );
  },

  getFilterGroup(source) {
    // if (source instanceof FilterItem) source = source.item;
    if (BrewUtil.hasSourceJson(source)) return 2;
    return Number(SourceUtil.isNonstandardSource(source));
  },
};

// CONVENIENCE/ELEMENTS ================================================================================================
Math.sum =
  Math.sum ||
  function(...values) {
    return values.reduce((a, b) => a + b, 0);
  };

Math.mean =
  Math.mean ||
  function(...values) {
    return Math.sum(...values) / values.length;
  };

Math.meanAbsoluteDeviation =
  Math.meanAbsoluteDeviation ||
  function(...values) {
    const mean = Math.mean(...values);
    return Math.mean(...values.map(num => Math.abs(num - mean)));
  };

Math.seed =
  Math.seed ||
  function(s) {
    return function() {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
    };
  };

ObjUtil = {
  mergeWith(source, target, fnMerge, options = { depth: 1 }) {
    if (!source || !target || typeof fnMerge !== 'function')
      throw new Error(
        'Must include a source, target and a fnMerge to handle merging',
      );

    const recursive = function(deepSource, deepTarget, depth = 1) {
      if (depth > options.depth || !deepSource || !deepTarget) return;
      for (let prop of Object.keys(deepSource)) {
        deepTarget[prop] = fnMerge(
          deepSource[prop],
          deepTarget[prop],
          source,
          target,
        );
        recursive(source[prop], deepTarget[prop], depth + 1);
      }
    };
    recursive(source, target, 1);
  },

  async pForEachDeep(
    source,
    pCallback,
    options = { depth: Infinity, callEachLevel: false },
  ) {
    const path = [];
    const pDiveDeep = async function(val, path, depth = 0) {
      if (
        options.callEachLevel ||
        typeof val !== 'object' ||
        options.depth === depth
      ) {
        await pCallback(val, path, depth);
      }
      if (options.depth !== depth && typeof val === 'object') {
        for (const key of Object.keys(val)) {
          path.push(key);
          await pDiveDeep(val[key], path, depth + 1);
        }
      }
      path.pop();
    };
    await pDiveDeep(source, path);
  },
};

// TODO refactor other misc utils into this
MiscUtil = {
  COLOR_HEALTHY: '#00bb20',
  COLOR_HURT: '#c5ca00',
  COLOR_BLOODIED: '#f7a100',
  COLOR_DEFEATED: '#cc0000',

  STR_SEE_CONSOLE: 'See the console (CTRL+SHIFT+J) for more information.',

  copy(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  async pCopyTextToClipboard(text) {
    function doCompatabilityCopy() {
      const $temp = $(
        `<textarea id="copy-temp" style="position: fixed; top: -1000px; left: -1000px; width: 1px; height: 1px;">${text}</textarea>`,
      );
      $(`body`).append($temp);
      $temp.select();
      document.execCommand('Copy');
      $temp.remove();
    }

    if (navigator && navigator.permissions) {
      try {
        const access = await navigator.permissions.query({
          name: 'clipboard-write',
        });
        if (access.state === 'granted' || access.state === 'prompt') {
          await navigator.clipboard.writeText(text);
        } else doCompatabilityCopy();
      } catch (e) {
        doCompatabilityCopy();
      }
    } else doCompatabilityCopy();
  },

  checkProperty(object, ...path) {
    for (let i = 0; i < path.length; ++i) {
      object = object[path[i]];
      if (object == null) return false;
    }
    return true;
  },

  get(object, ...path) {
    if (object == null) return null;
    for (let i = 0; i < path.length; ++i) {
      object = object[path[i]];
      if (object == null) return object;
    }
    return object;
  },

  mix: superclass => new MiscUtil._MixinBuilder(superclass),
  _MixinBuilder: function(superclass) {
    this.superclass = superclass;

    this.with = function(...mixins) {
      return mixins.reduce((c, mixin) => mixin(c), this.superclass);
    };
  },

  clearSelection() {
    if (document.getSelection) {
      document.getSelection().removeAllRanges();
      document.getSelection().addRange(document.createRange());
    } else if (window.getSelection) {
      if (window.getSelection().removeAllRanges) {
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(document.createRange());
      } else if (window.getSelection().empty) {
        window.getSelection().empty();
      }
    } else if (document.selection) {
      document.selection.empty();
    }
  },

  randomColor() {
    let r;
    let g;
    let b;
    const h = RollerUtil.randomise(30, 0) / 30;
    const i = ~~(h * 6);
    const f = h * 6 - i;
    const q = 1 - f;
    switch (i % 6) {
      case 0:
        r = 1;
        g = f;
        b = 0;
        break;
      case 1:
        r = q;
        g = 1;
        b = 0;
        break;
      case 2:
        r = 0;
        g = 1;
        b = f;
        break;
      case 3:
        r = 0;
        g = q;
        b = 1;
        break;
      case 4:
        r = f;
        g = 0;
        b = 1;
        break;
      case 5:
        r = 1;
        g = 0;
        b = q;
        break;
    }
    return `#${`00${(~~(r * 255)).toString(16)}`.slice(-2)}${`00${(~~(
      g * 255
    )).toString(16)}`.slice(-2)}${`00${(~~(b * 255)).toString(16)}`.slice(-2)}`;
  },

  /**
   * @param hex Original hex color.
   * @param [opts] Options object.
   * @param [opts.bw] True if the color should be returnes as black/white depending on contrast ratio.
   * @param [opts.dark] Color to return if a "dark" color would contrast best.
   * @param [opts.light] Color to return if a "light" color would contrast best.
   */
  invertColor(hex, opts) {
    opts = opts || {};

    hex = hex.slice(1); // remove #

    let r = parseInt(hex.slice(0, 2), 16);
    let g = parseInt(hex.slice(2, 4), 16);
    let b = parseInt(hex.slice(4, 6), 16);

    // http://stackoverflow.com/a/3943023/112731
    const isDark = r * 0.299 + g * 0.587 + b * 0.114 > 186;
    if (opts.dark && opts.light) return isDark ? opts.dark : opts.light;
    else if (opts.bw) return isDark ? '#000000' : '#FFFFFF';

    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    return `#${[r, g, b].map(it => it.padStart(2, '0')).join('')}`;
  },

  scrollPageTop() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  },

  isInInput(event) {
    return (
      event.target.nodeName === 'INPUT' ||
      event.target.nodeName === 'TEXTAREA' ||
      event.target.getAttribute('contenteditable') === 'true'
    );
  },

  expEval(str) {
    // eslint-disable-next-line no-new-func
    return new Function(`return ${str.replace(/[^-()\d/*+.]/g, '')}`)();
  },

  parseNumberRange(
    input,
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
  ) {
    function errInvalid(input) {
      throw new Error(`Could not parse range input "${input}"`);
    }

    function errOutOfRange() {
      throw new Error(
        `Number was out of range! Range was ${min}-${max} (inclusive).`,
      );
    }

    function isOutOfRange(num) {
      return num < min || num > max;
    }

    function addToRangeVal(range, num) {
      range.add(num);
    }

    function addToRangeLoHi(range, lo, hi) {
      for (let i = lo; i <= hi; ++i) range.add(i);
    }

    while (true) {
      if (input && input.trim()) {
        const clean = input.replace(/\s*/g, '');
        if (/^((\d+-\d+|\d+),)*(\d+-\d+|\d+)$/.exec(clean)) {
          const parts = clean.split(',');
          const out = new Set();

          for (const part of parts) {
            if (part.includes('-')) {
              const spl = part.split('-');
              const numLo = Number(spl[0]);
              const numHi = Number(spl[1]);

              if (
                isNaN(numLo) ||
                isNaN(numHi) ||
                numLo === 0 ||
                numHi === 0 ||
                numLo > numHi
              )
                errInvalid();

              if (isOutOfRange(numLo) || isOutOfRange(numHi)) errOutOfRange();

              if (numLo === numHi) addToRangeVal(out, numLo);
              else addToRangeLoHi(out, numLo, numHi);
            } else {
              const num = Number(part);
              if (isNaN(num) || num === 0) errInvalid();
              else {
                if (isOutOfRange(num)) errOutOfRange();
                addToRangeVal(out, num);
              }
            }
          }

          return out;
        } else errInvalid();
      } else return null;
    }
  },

  MONTH_NAMES: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  dateToStr(date, short) {
    const month = MiscUtil.MONTH_NAMES[date.getMonth()];
    return `${
      short ? month.substring(0, 3) : month
    } ${date.getDate()}, ${date.getFullYear()}`;
  },

  findCommonPrefix(strArr) {
    let prefix = null;
    strArr.forEach(s => {
      if (prefix == null) {
        prefix = s;
      } else {
        const minLen = Math.min(s.length, prefix.length);
        for (let i = 0; i < minLen; ++i) {
          const cp = prefix[i];
          const cs = s[i];
          if (cp !== cs) {
            prefix = prefix.substring(0, i);
            break;
          }
        }
      }
    });
    return prefix;
  },

  /**
   * @param fgHexTarget Target/resultant color for the foreground item
   * @param fgOpacity Desired foreground transparency (0-1 inclusive)
   * @param bgHex Background color
   */
  calculateBlendedColor(fgHexTarget, fgOpacity, bgHex) {
    const fgDcTarget = CryptUtil.hex2Dec(fgHexTarget);
    const bgDc = CryptUtil.hex2Dec(bgHex);
    return ((fgDcTarget - (1 - fgOpacity) * bgDc) / fgOpacity).toString(16);
  },

  /**
   * Borrowed from lodash.
   *
   * @param func The function to debounce.
   * @param wait Minimum duration between calls.
   * @param options Options object.
   * @return {Function} The debounced function.
   */
  debounce(func, wait, options) {
    let lastArgs;
    let lastThis;
    let maxWait;
    let result;
    let timerId;
    let lastCallTime;
    let lastInvokeTime = 0;
    let leading = false;
    let maxing = false;
    let trailing = true;

    wait = Number(wait) || 0;
    if (typeof options === 'object') {
      leading = !!options.leading;
      maxing = 'maxWait' in options;
      maxWait = maxing ? Math.max(Number(options.maxWait) || 0, wait) : maxWait;
      trailing = 'trailing' in options ? !!options.trailing : trailing;
    }

    function invokeFunc(time) {
      let args = lastArgs;
      let thisArg = lastThis;

      lastArgs = lastThis = undefined;
      lastInvokeTime = time;
      result = func.apply(thisArg, args);
      return result;
    }

    function leadingEdge(time) {
      lastInvokeTime = time;
      timerId = setTimeout(timerExpired, wait);
      return leading ? invokeFunc(time) : result;
    }

    function remainingWait(time) {
      let timeSinceLastCall = time - lastCallTime;
      let timeSinceLastInvoke = time - lastInvokeTime;
      let result = wait - timeSinceLastCall;
      return maxing ? Math.min(result, maxWait - timeSinceLastInvoke) : result;
    }

    function shouldInvoke(time) {
      let timeSinceLastCall = time - lastCallTime;
      let timeSinceLastInvoke = time - lastInvokeTime;

      return (
        lastCallTime === undefined ||
        timeSinceLastCall >= wait ||
        timeSinceLastCall < 0 ||
        (maxing && timeSinceLastInvoke >= maxWait)
      );
    }

    function timerExpired() {
      const time = Date.now();
      if (shouldInvoke(time)) {
        return trailingEdge(time);
      }
      // Restart the timer.
      timerId = setTimeout(timerExpired, remainingWait(time));
    }

    function trailingEdge(time) {
      timerId = undefined;

      if (trailing && lastArgs) return invokeFunc(time);
      lastArgs = lastThis = undefined;
      return result;
    }

    function cancel() {
      if (timerId !== undefined) clearTimeout(timerId);
      lastInvokeTime = 0;
      lastArgs = lastCallTime = lastThis = timerId = undefined;
    }

    function flush() {
      return timerId === undefined ? result : trailingEdge(Date.now());
    }

    function debounced() {
      let time = Date.now();
      let isInvoking = shouldInvoke(time);
      lastArgs = arguments;
      lastThis = this;
      lastCallTime = time;

      if (isInvoking) {
        if (timerId === undefined) return leadingEdge(lastCallTime);
        if (maxing) {
          // Handle invocations in a tight loop.
          timerId = setTimeout(timerExpired, wait);
          return invokeFunc(lastCallTime);
        }
      }
      if (timerId === undefined) timerId = setTimeout(timerExpired, wait);
      return result;
    }

    debounced.cancel = cancel;
    debounced.flush = flush;
    return debounced;
  },

  // from lodash
  throttle(func, wait, options) {
    let leading = true;
    let trailing = true;

    if (typeof options === 'object') {
      leading = 'leading' in options ? !!options.leading : leading;
      trailing = 'trailing' in options ? !!options.trailing : trailing;
    }

    return this.debounce(func, wait, { leading, maxWait: wait, trailing });
  },

  pDelay(msecs, resolveAs) {
    return new Promise(resolve => setTimeout(() => resolve(resolveAs), msecs));
  },

  getWalker(keyBlacklist = new Set()) {
    function applyHandlers(handlers, ident, obj, lastKey) {
      if (!(handlers instanceof Array)) handlers = [handlers];
      handlers.forEach(h => (obj = h(ident, obj, lastKey)));
      return obj;
    }

    const fn = (ident, obj, primitiveHandlers, lastKey) => {
      if (obj == null) {
        if (primitiveHandlers.null)
          return applyHandlers(primitiveHandlers.null, ident, obj, lastKey);
        return obj;
      }

      const to = typeof obj;
      switch (to) {
        case undefined:
          if (primitiveHandlers.undefined)
            return applyHandlers(
              primitiveHandlers.undefined,
              ident,
              obj,
              lastKey,
            );
          return obj;
        case 'boolean':
          if (primitiveHandlers.boolean)
            return applyHandlers(
              primitiveHandlers.boolean,
              ident,
              obj,
              lastKey,
            );
          return obj;
        case 'number':
          if (primitiveHandlers.number)
            return applyHandlers(primitiveHandlers.number, ident, obj, lastKey);
          return obj;
        case 'string':
          if (primitiveHandlers.string)
            return applyHandlers(primitiveHandlers.string, ident, obj, lastKey);
          return obj;
        case 'object': {
          if (obj instanceof Array) {
            if (primitiveHandlers.array)
              obj = applyHandlers(primitiveHandlers.array, ident, obj, lastKey);
            return obj.map(it => fn(ident, it, primitiveHandlers, lastKey));
          } else {
            if (primitiveHandlers.object)
              obj = applyHandlers(
                primitiveHandlers.object,
                ident,
                obj,
                lastKey,
              );
            Object.keys(obj).forEach(k => {
              const v = obj[k];
              if (!keyBlacklist.has(k))
                obj[k] = fn(ident, v, primitiveHandlers, k);
            });
            return obj;
          }
        }
        default:
          throw new Error(`Unhandled type "${to}"`);
      }
    };

    return { walk: fn };
  },

  pDefer(fn) {
    return (async () => fn())();
  },
};

// JSON LOADING ========================================================================================================
DataUtil = {
  _loading: {},
  _loaded: {},
  _merging: {},
  _merged: {},

  async _pLoad(url) {
    if (DataUtil._loading[url]) {
      await DataUtil._loading[url];
      return DataUtil._loaded[url];
    }

    DataUtil._loading[url] = new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.overrideMimeType('application/json');
      request.onload = function() {
        try {
          DataUtil._loaded[url] = JSON.parse(this.response);
          resolve();
        } catch (e) {
          reject(new Error(`Could not parse JSON from ${url}: ${e.message}`));
        }
      };
      request.onerror = e =>
        reject(new Error(`Error during JSON request: ${e.target.status}`));
      request.send();
    });

    await DataUtil._loading[url];
    return DataUtil._loaded[url];
  },

  async loadJSON(url, ...otherData) {
    const procUrl = UrlUtil.link(url);

    let ident = procUrl;
    let data;
    try {
      data = await DataUtil._pLoad(procUrl);
    } catch (e) {
      setTimeout(() => {
        throw e;
      });
    }

    // Fallback to the un-processed URL
    if (!data) {
      ident = url;
      data = await DataUtil._pLoad(url);
    }

    await DataUtil.pDoMetaMerge(ident, data);

    return data;
  },

  async pDoMetaMerge(ident, data, options) {
    DataUtil._merging[ident] =
      DataUtil._merging[ident] || DataUtil._pDoMetaMerge(ident, data, options);
    await DataUtil._merging[ident];
    return DataUtil._merged[ident];
  },

  _pDoMetaMerge_handleCopyProp(prop, arr, entry, options) {
    if (entry._copy) {
      switch (prop) {
        case 'monster':
          return DataUtil.monster.pMergeCopy(arr, entry, options);
        case 'monsterFluff':
          return DataUtil.monsterFluff.pMergeCopy(arr, entry, options);
        case 'spell':
          return DataUtil.spell.pMergeCopy(arr, entry, options);
        case 'spellFluff':
          return DataUtil.spellFluff.pMergeCopy(arr, entry, options);
        case 'item':
          return DataUtil.item.pMergeCopy(arr, entry, options);
        case 'itemFluff':
          return DataUtil.itemFluff.pMergeCopy(arr, entry, options);
        case 'background':
          return DataUtil.background.pMergeCopy(arr, entry, options);
        case 'race':
          return DataUtil.race.pMergeCopy(arr, entry, options);
        case 'raceFluff':
          return DataUtil.raceFluff.pMergeCopy(arr, entry, options);
        case 'deity':
          return DataUtil.deity.pMergeCopy(arr, entry, options);
        default:
          throw new Error(
            `No dependency _copy merge strategy specified for property "${prop}"`,
          );
      }
    }
  },

  async _pDoMetaMerge(ident, data, options) {
    if (data._meta) {
      if (data._meta.dependencies) {
        await Promise.all(
          Object.entries(data._meta.dependencies).map(
            async ([prop, sources]) => {
              if (!data[prop]) return; // if e.g. monster dependencies are declared, but there are no monsters to merge with, bail out

              const toLoads = await Promise.all(
                sources.map(async source =>
                  DataUtil.pGetLoadableByMeta(prop, source),
                ),
              );
              const dependencyData = await Promise.all(
                toLoads.map(toLoad => DataUtil.loadJSON(toLoad)),
              );
              const flatDependencyData = dependencyData
                .map(dd => dd[prop])
                .flat();
              await Promise.all(
                data[prop].map(entry =>
                  DataUtil._pDoMetaMerge_handleCopyProp(
                    prop,
                    flatDependencyData,
                    entry,
                    options,
                  ),
                ),
              );
            },
          ),
        );
        delete data._meta.dependencies;
      }

      if (data._meta.internalCopies) {
        for (const prop of data._meta.internalCopies) {
          if (!data[prop]) continue;
          for (const entry of data[prop]) {
            await DataUtil._pDoMetaMerge_handleCopyProp(
              prop,
              data[prop],
              entry,
              options,
            );
          }
        }
        delete data._meta.internalCopies;
      }
    }

    if (data._meta && data._meta.otherSources) {
      await Promise.all(
        Object.entries(data._meta.otherSources).map(async ([prop, sources]) => {
          const toLoads = await Promise.all(
            Object.entries(sources).map(async ([source, findWith]) => ({
              findWith,
              url: await DataUtil.pGetLoadableByMeta(prop, source),
            })),
          );

          const additionalData = await Promise.all(
            toLoads.map(async ({ findWith, url }) => ({
              findWith,
              sourceData: await DataUtil.loadJSON(url),
            })),
          );

          additionalData.forEach(dataAndSource => {
            const findWith = dataAndSource.findWith;
            const ad = dataAndSource.sourceData;
            const toAppend = ad[prop].filter(
              it =>
                it.otherSources &&
                it.otherSources.find(os => os.source === findWith),
            );
            if (toAppend.length)
              data[prop] = (data[prop] || []).concat(toAppend);
          });
        }),
      );
      delete data._meta.otherSources;
    }
    DataUtil._merged[ident] = data;
  },

  getCleanFilename(filename) {
    return filename.replace(/[^-_a-zA-Z0-9]/g, '_');
  },

  getCsv(headers, rows) {
    function escapeCsv(str) {
      return `"${str
        .replace(/"/g, `""`)
        .replace(/ +/g, ' ')
        .replace(/\n\n+/gi, '\n\n')}"`;
    }

    function toCsv(row) {
      return row.map(str => escapeCsv(str)).join(',');
    }

    return `${toCsv(headers)}\n${rows.map(r => toCsv(r)).join('\n')}`;
  },

  userDownload(filename, data) {
    if (typeof data !== 'string') data = JSON.stringify(data, null, '\t');
    return DataUtil._userDownload(`${filename}.json`, data, 'text/json');
  },

  userDownloadText(filename, string) {
    return DataUtil._userDownload(filename, string, 'text/plain');
  },

  _userDownload(filename, data, mimeType) {
    const a = document.createElement('a');
    const t = new Blob([data], { type: mimeType });
    a.href = URL.createObjectURL(t);
    a.download = filename;
    a.target = '_blank';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },

  pUserUpload() {
    return new Promise(resolve => {
      const $iptAdd = $(
        `<input type="file" accept=".json" style="position: fixed; top: -100px; left: -100px; display: none;">`,
      )
        .on('change', evt => {
          const input = evt.target;

          const reader = new FileReader();
          reader.onload = () => {
            const text = reader.result;
            const json = JSON.parse(text);
            resolve(json);
          };

          reader.readAsText(input.files[0]);
        })
        .appendTo($(`body`));
      $iptAdd.click();
    });
  },

  cleanJson(cpy) {
    cpy.name = cpy._displayName || cpy.name;
    delete cpy.uniqueId;
    DataUtil.__cleanJsonObject(cpy);
    return cpy;
  },

  __cleanJsonObject(obj) {
    if (obj == null) return obj;
    if (typeof obj === 'object') {
      if (obj instanceof Array) {
        obj.forEach(it => DataUtil.__cleanJsonObject(it));
      } else {
        Object.entries(obj).forEach(([k, v]) => {
          if (k.startsWith('_') || k === 'customHashId') delete obj[k];
          else DataUtil.__cleanJsonObject(v);
        });
      }
    }
  },

  async pGetLoadableByMeta(key, value) {
    // TODO(future) allow value to be e.g. a string (assumed to be an official data's source); an object e.g. `{type: external, url: <>}`,...
    // TODO(future) have this return the data, not a URL
    // TODO(future) handle homebrew dependencies/refactor "monster" and "spell" + have this be the general form.
    switch (key) {
      case 'monster': {
        const index = await DataUtil.loadJSON(
          `${Renderer.get().baseUrl}data/bestiary/index.json`,
        );
        if (index[value])
          return `${Renderer.get().baseUrl}data/bestiary/${index[value]}`;
        const brewIndex = await DataUtil.brew.pLoadSourceIndex();
        if (!brewIndex[value])
          throw new Error(`Bestiary index did not contain source "${value}"`);
        const urlRoot = await StorageUtil.pGet(`HOMEBREW_CUSTOM_REPO_URL`);
        const brewUrl = DataUtil.brew.getFileUrl(brewIndex[value], urlRoot);
        await BrewUtil.pDoHandleBrewJson(
          await DataUtil.loadJSON(brewUrl),
          UrlUtil.getCurrentPage(),
        );
        return brewUrl;
      }
      case 'monsterFluff': {
        const index = await DataUtil.loadJSON(
          `${Renderer.get().baseUrl}data/bestiary/fluff-index.json`,
        );
        if (!index[value])
          throw new Error(
            `Bestiary fluff index did not contain source "${value}"`,
          );
        return `${Renderer.get().baseUrl}data/bestiary/${index[value]}`;
      }
      case 'spell': {
        const index = await DataUtil.loadJSON(
          `${Renderer.get().baseUrl}data/spells/index.json`,
        );
        if (index[value])
          return `${Renderer.get().baseUrl}data/spells/${index[value]}`;
        const brewIndex = await DataUtil.brew.pLoadSourceIndex();
        if (!brewIndex[value])
          throw new Error(`Spell index did not contain source "${value}"`);
        const urlRoot = await StorageUtil.pGet(`HOMEBREW_CUSTOM_REPO_URL`);
        const brewUrl = DataUtil.brew.getFileUrl(brewIndex[value], urlRoot);
        await BrewUtil.pDoHandleBrewJson(
          await DataUtil.loadJSON(brewUrl),
          UrlUtil.getCurrentPage(),
        );
        return brewUrl;
      }
      case 'spellFluff': {
        const index = await DataUtil.loadJSON(
          `${Renderer.get().baseUrl}data/spells/fluff-index.json`,
        );
        if (!index[value])
          throw new Error(
            `Spell fluff index did not contain source "${value}"`,
          );
        return `${Renderer.get().baseUrl}data/spells/${index[value]}`;
      }
      // case "item":
      // case "itemFluff":
      case 'background':
        return `${Renderer.get().baseUrl}data/backgrounds.json`;
      // case "race":
      case 'raceFluff':
        return `${Renderer.get().baseUrl}data/fluff-races.json`;
      // case "deity":
      default:
        throw new Error(
          `Could not get loadable URL for \`${JSON.stringify({
            key,
            value,
          })}\``,
        );
    }
  },

  generic: {
    _walker_replaceTxt: null,

    /**
     * @param uid
     * @param tag
     * @param [opts]
     * @param [opts.isLower] If the returned values should be lowercase.
     */
    unpackUid(uid, tag, opts) {
      opts = opts || {};
      if (opts.isLower) uid = uid.toLowerCase();
      let [name, source, displayText, ...others] = uid
        .split('|')
        .map(it => it.trim());

      source = Parser.getTagSource(tag, source);
      if (opts.isLower) source = source.toLowerCase();

      return {
        name,
        source,
        displayText,
        others,
      };
    },

    async _pMergeCopy(impl, page, entryList, entry, options) {
      if (entry._copy) {
        const hash = UrlUtil.URL_TO_HASH_BUILDER[page](entry._copy);
        const it =
          impl._mergeCache[hash] ||
          DataUtil.generic._pMergeCopy_search(
            impl,
            page,
            entryList,
            entry,
            options,
          );
        if (!it) return;
        // Handle recursive copy
        if (it._copy)
          await DataUtil.generic._pMergeCopy(
            impl,
            page,
            entryList,
            it,
            options,
          );
        return DataUtil.generic._pApplyCopy(
          impl,
          MiscUtil.copy(it),
          entry,
          options,
        );
      }
    },

    _pMergeCopy_search(impl, page, entryList, entry, options) {
      const entryHash = UrlUtil.URL_TO_HASH_BUILDER[page](entry._copy);
      return entryList.find(it => {
        const hash = UrlUtil.URL_TO_HASH_BUILDER[page](it);
        impl._mergeCache[hash] = it;
        return hash === entryHash;
      });
    },

    async _pApplyCopy(impl, copyFrom, copyTo, options = {}) {
      if (options.doKeepCopy) copyTo.__copy = MiscUtil.copy(copyFrom);

      // convert everything to arrays
      function normaliseMods(obj) {
        Object.entries(obj._mod).forEach(([k, v]) => {
          if (!(v instanceof Array)) obj._mod[k] = [v];
        });
      }

      const copyMeta = copyTo._copy || {};

      if (copyMeta._mod) normaliseMods(copyMeta);

      // fetch and apply any external traits -- append them to existing copy mods where available
      let racials = null;
      if (copyMeta._trait) {
        const traitData = await DataUtil.loadJSON(
          `${Renderer.get().baseUrl}data/bestiary/traits.json`,
        );
        racials = traitData.trait.find(
          t =>
            t.name.toLowerCase() === copyMeta._trait.name.toLowerCase() &&
            t.source.toLowerCase() === copyMeta._trait.source.toLowerCase(),
        );
        if (!racials)
          throw new Error(
            `Could not find traits to apply with name "${copyMeta._trait.name}" and source "${copyMeta._trait.source}"`,
          );
        racials = MiscUtil.copy(racials);

        if (racials.apply._mod) {
          normaliseMods(racials.apply);

          if (copyMeta._mod) {
            Object.entries(racials.apply._mod).forEach(([k, v]) => {
              if (copyMeta._mod[k])
                copyMeta._mod[k] = copyMeta._mod[k].concat(v);
              else copyMeta._mod[k] = v;
            });
          } else copyMeta._mod = racials.apply._mod;
        }

        delete copyMeta._trait;
      }

      const copyToRootProps = new Set(Object.keys(copyTo));

      // copy over required values
      Object.keys(copyFrom).forEach(k => {
        if (copyTo[k] === null) return delete copyTo[k];
        if (copyTo[k] == null) {
          if (impl._MERGE_REQUIRES_PRESERVE[k]) {
            if (copyTo._copy._preserve && copyTo._copy._preserve[k])
              copyTo[k] = copyFrom[k];
          } else copyTo[k] = copyFrom[k];
        }
      });

      // apply any root racial properties after doing base copy
      if (racials && racials.apply._root) {
        Object.entries(racials.apply._root)
          .filter(([k, v]) => !copyToRootProps.has(k)) // avoid overwriting any real root properties
          .forEach(([k, v]) => (copyTo[k] = v));
      }

      // mod helpers /////////////////
      function doEnsureArray(obj, prop) {
        if (!(obj[prop] instanceof Array)) obj[prop] = [obj[prop]];
      }

      function doMod_appendStr(modInfo, prop) {
        if (copyTo[prop])
          copyTo[prop] = `${copyTo[prop]}${modInfo.joiner || ''}${modInfo.str}`;
        else copyTo[prop] = modInfo.str;
      }

      function doMod_replaceTxt(modInfo, prop) {
        if (!copyTo[prop]) return;

        DataUtil.generic._walker_replaceTxt =
          DataUtil.generic._walker_replaceTxt || MiscUtil.getWalker();
        const re = new RegExp(modInfo.replace, `g${modInfo.flags || ''}`);
        const handlers = {
          // TODO(Future) may need to have this handle replaces inside _some_ tags
          string: str => {
            const split = Renderer.splitByTags(str);
            const len = split.length;
            for (let i = 0; i < len; ++i) {
              if (split[i].startsWith('{@')) continue;
              split[i] = split[i].replace(re, modInfo.with);
            }
            return split.join('');
          },
        };

        // Handle any pure strings, e.g. `"legendaryHeader"`
        copyTo[prop] = copyTo[prop].map(it => {
          if (typeof it !== 'string') return it;
          return DataUtil.generic._walker_replaceTxt.walk(it, handlers);
        });

        copyTo[prop].forEach(it => {
          if (it.entries)
            it.entries = DataUtil.generic._walker_replaceTxt.walk(
              it.entries,
              handlers,
            );
          if (it.headerEntries)
            it.headerEntries = DataUtil.generic._walker_replaceTxt.walk(
              it.headerEntries,
              handlers,
            );
          if (it.footerEntries)
            it.footerEntries = DataUtil.generic._walker_replaceTxt.walk(
              it.footerEntries,
              handlers,
            );
        });
      }

      function doMod_prependArr(modInfo, prop) {
        doEnsureArray(modInfo, 'items');
        copyTo[prop] = copyTo[prop]
          ? modInfo.items.concat(copyTo[prop])
          : modInfo.items;
      }

      function doMod_appendArr(modInfo, prop) {
        doEnsureArray(modInfo, 'items');
        copyTo[prop] = copyTo[prop]
          ? copyTo[prop].concat(modInfo.items)
          : modInfo.items;
      }

      function doMod_appendIfNotExistsArr(modInfo, prop) {
        doEnsureArray(modInfo, 'items');
        if (!copyTo[prop]) return (copyTo[prop] = modInfo.items);
        copyTo[prop] = copyTo[prop].concat(
          modInfo.items.filter(
            it => !copyTo[prop].some(x => CollectionUtil.deepEquals(it, x)),
          ),
        );
      }

      function doMod_replaceArr(modInfo, prop, isThrow = true) {
        doEnsureArray(modInfo, 'items');

        if (!copyTo[prop]) {
          if (isThrow) throw new Error(`Could not find "${prop}" array`);
          return false;
        }

        let ixOld;
        if (modInfo.replace.regex) {
          const re = new RegExp(
            modInfo.replace.regex,
            modInfo.replace.flags || '',
          );
          ixOld = copyTo[prop].findIndex(it =>
            it.name
              ? re.test(it.name)
              : typeof it === 'string'
              ? re.test(it)
              : false,
          );
        } else if (modInfo.replace.index != null) {
          ixOld = modInfo.replace.index;
        } else {
          ixOld = copyTo[prop].findIndex(it =>
            it.name ? it.name === modInfo.replace : it === modInfo.replace,
          );
        }

        if (~ixOld) {
          copyTo[prop].splice(ixOld, 1, ...modInfo.items);
          return true;
        } else if (isThrow)
          throw new Error(
            `Could not find "${prop}" item with name "${modInfo.replace}" to replace`,
          );
        return false;
      }

      function doMod_replaceOrAppendArr(modInfo, prop) {
        const didReplace = doMod_replaceArr(modInfo, prop, false);
        if (!didReplace) doMod_appendArr(modInfo, prop);
      }

      function doMod_insertArr(modInfo, prop) {
        doEnsureArray(modInfo, 'items');
        if (!copyTo[prop]) throw new Error(`Could not find "${prop}" array`);
        copyTo[prop].splice(modInfo.index, 0, ...modInfo.items);
      }

      function doMod_removeArr(modInfo, prop) {
        if (modInfo.names) {
          doEnsureArray(modInfo, 'names');
          modInfo.names.forEach(nameToRemove => {
            const ixOld = copyTo[prop].findIndex(
              it => it.name === nameToRemove,
            );
            if (~ixOld) copyTo[prop].splice(ixOld, 1);
            else {
              if (!modInfo.force)
                throw new Error(
                  `Could not find "${prop}" item with name "${nameToRemove}" to remove`,
                );
            }
          });
        } else if (modInfo.items) {
          doEnsureArray(modInfo, 'items');
          modInfo.items.forEach(itemToRemove => {
            const ixOld = copyTo[prop].findIndex(it => it === itemToRemove);
            if (~ixOld) copyTo[prop].splice(ixOld, 1);
            else
              throw new Error(
                `Could not find "${prop}" item "${itemToRemove}" to remove`,
              );
          });
        } else throw new Error(`One of "names" or "items" must be provided!`);
      }

      function doMod_calculateProp(modInfo, prop) {
        copyTo[prop] = copyTo[prop] || {};
        const toExec = modInfo.formula.replace(/<\$([^$]+)\$>/g, (...m) => {
          switch (m[1]) {
            case 'prof_bonus':
              return Parser.crToPb(copyTo.cr);
            case 'dex_mod':
              return Parser.getAbilityModNumber(copyTo.dex);
            default:
              throw new Error(`Unknown variable "${m[1]}"`);
          }
        });
        // eslint-disable-next-line no-eval
        copyTo[prop][modInfo.prop] = eval(toExec);
      }

      function doMod_scalarAddProp(modInfo, prop) {
        function applyTo(k) {
          const out = Number(copyTo[prop][k]) + modInfo.scalar;
          const isString = typeof copyTo[prop][k] === 'string';
          copyTo[prop][k] = isString ? `${out >= 0 ? '+' : ''}${out}` : out;
        }

        if (!copyTo[prop]) return;
        if (modInfo.prop === '*')
          Object.keys(copyTo[prop]).forEach(k => applyTo(k));
        else applyTo(modInfo.prop);
      }

      function doMod_scalarMultProp(modInfo, prop) {
        function applyTo(k) {
          let out = Number(copyTo[prop][k]) * modInfo.scalar;
          if (modInfo.floor) out = Math.floor(out);
          const isString = typeof copyTo[prop][k] === 'string';
          copyTo[prop][k] = isString ? `${out >= 0 ? '+' : ''}${out}` : out;
        }

        if (!copyTo[prop]) return;
        if (modInfo.prop === '*')
          Object.keys(copyTo[prop]).forEach(k => applyTo(k));
        else applyTo(modInfo.prop);
      }

      function doMod_addSenses(modInfo) {
        doEnsureArray(modInfo, 'senses');
        copyTo.senses = copyTo.senses || [];
        modInfo.senses.forEach(sense => {
          let found = false;
          for (let i = 0; i < copyTo.senses.length; ++i) {
            const m = new RegExp(`${sense.type} (\\d+)`, 'i').exec(
              copyTo.senses[i],
            );
            if (m) {
              found = true;
              // if the creature already has a greater sense of this type, do nothing
              if (Number(m[1]) < sense.type) {
                copyTo.senses[i] = `${sense.type} ${sense.range} ft.`;
              }
              break;
            }
          }

          if (!found) copyTo.senses.push(`${sense.type} ${sense.range} ft.`);
        });
      }

      function doMod_addSkills(modInfo) {
        copyTo.skill = copyTo.skill || [];
        Object.entries(modInfo.skills).forEach(([skill, mode]) => {
          // mode: 1 = proficient; 2 = expert
          const total =
            mode * Parser.crToPb(copyTo.cr) +
            Parser.getAbilityModNumber(copyTo[Parser.skillToAbilityAbv(skill)]);
          const asText = total >= 0 ? `+${total}` : `-${total}`;
          if (copyTo.skill && copyTo.skill[skill]) {
            // update only if ours is larger (prevent reduction in skill score)
            if (Number(copyTo.skill[skill]) < total)
              copyTo.skill[skill] = asText;
          } else copyTo.skill[skill] = asText;
        });
      }

      function doMod_addSpells(modInfo) {
        if (!copyTo.spellcasting)
          throw new Error(`Creature did not have a spellcasting property!`);

        // TODO could accept a "position" or "name" parameter should spells need to be added to other spellcasting traits
        const spellcasting = copyTo.spellcasting[0];

        if (modInfo.spells) {
          const spells = spellcasting.spells;

          Object.keys(modInfo.spells).forEach(k => {
            if (!spells[k]) spells[k] = modInfo.spells[k];
            else {
              // merge the objects
              const spellCategoryNu = modInfo.spells[k];
              const spellCategoryOld = spells[k];
              Object.keys(spellCategoryNu).forEach(kk => {
                if (!spellCategoryOld[kk])
                  spellCategoryOld[kk] = spellCategoryNu[kk];
                else {
                  if (typeof spellCategoryOld[kk] === 'object') {
                    if (spellCategoryOld[kk] instanceof Array)
                      spellCategoryOld[kk] = spellCategoryOld[kk]
                        .concat(spellCategoryNu[kk])
                        .sort(SortUtil.ascSortLower);
                    else throw new Error(`Object at key ${kk} not an array!`);
                  } else spellCategoryOld[kk] = spellCategoryNu[kk];
                }
              });
            }
          });
        }

        if (modInfo.will) {
          modInfo.will.forEach(sp =>
            (modInfo.will = modInfo.will || []).push(sp),
          );
        }

        if (modInfo.daily) {
          for (let i = 1; i <= 9; ++i) {
            const e = `${i}e`;

            spellcasting.daily = spellcasting.daily || {};

            if (modInfo.daily[i]) {
              modInfo.daily[i].forEach(sp =>
                (spellcasting.daily[i] = spellcasting.daily[i] || []).push(sp),
              );
            }

            if (modInfo.daily[e]) {
              modInfo.daily[e].forEach(sp =>
                (spellcasting.daily[e] = spellcasting.daily[e] || []).push(sp),
              );
            }
          }
        }
      }

      function doMod_replaceSpells(modInfo) {
        if (!copyTo.spellcasting)
          throw new Error(`Creature did not have a spellcasting property!`);

        // TODO could accept a "position" or "name" parameter should spells need to be added to other spellcasting traits
        const spellcasting = copyTo.spellcasting[0];

        const handleReplace = (curSpells, replaceMeta, k) => {
          doEnsureArray(replaceMeta, 'with');

          const ix = curSpells[k].indexOf(replaceMeta.replace);
          if (~ix) {
            curSpells[k].splice(ix, 1, ...replaceMeta.with);
            curSpells[k].sort(SortUtil.ascSortLower);
          } else
            throw new Error(
              `Could not find spell "${replaceMeta.replace}" to replace`,
            );
        };

        if (modInfo.spells) {
          const trait0 = spellcasting.spells;
          Object.keys(modInfo.spells).forEach(k => {
            // k is e.g. "4"
            if (trait0[k]) {
              const replaceMetas = modInfo.spells[k];
              const curSpells = trait0[k];
              replaceMetas.forEach(replaceMeta =>
                handleReplace(curSpells, replaceMeta, 'spells'),
              );
            }
          });
        }

        // TODO should be extended  to handle all non-slot-based spellcasters
        if (modInfo.daily) {
          for (let i = 1; i <= 9; ++i) {
            const e = `${i}e`;

            if (modInfo.daily[i]) {
              modInfo.daily[i].forEach(replaceMeta =>
                handleReplace(spellcasting.daily, replaceMeta, i),
              );
            }

            if (modInfo.daily[e]) {
              modInfo.daily[e].forEach(replaceMeta =>
                handleReplace(spellcasting.daily, replaceMeta, e),
              );
            }
          }
        }
      }

      function doMod_scalarAddHit(modInfo, prop) {
        if (!copyTo[prop]) return;
        copyTo[prop] = JSON.parse(
          JSON.stringify(copyTo[prop]).replace(
            /{@hit ([-+]?\d+)}/g,
            (m0, m1) => `{@hit ${Number(m1) + modInfo.scalar}}`,
          ),
        );
      }

      function doMod_scalarAddDc(modInfo, prop) {
        if (!copyTo[prop]) return;
        copyTo[prop] = JSON.parse(
          JSON.stringify(copyTo[prop]).replace(
            /{@dc (\d+)}/g,
            (m0, m1) => `{@dc ${Number(m1) + modInfo.scalar}}`,
          ),
        );
      }

      function doMod_maxSize(modInfo) {
        const ixCur = Parser.SIZE_ABVS.indexOf(copyTo.size);
        const ixMax = Parser.SIZE_ABVS.indexOf(modInfo.max);
        if (ixCur < 0 || ixMax < 0) throw new Error(`Unhandled size!`);
        copyTo.size = Parser.SIZE_ABVS[Math.min(ixCur, ixMax)];
      }

      function doMod_scalarMultXp(modInfo) {
        function getOutput(input) {
          let out = input * modInfo.scalar;
          if (modInfo.floor) out = Math.floor(out);
          return out;
        }

        if (copyTo.cr.xp) copyTo.cr.xp = getOutput(copyTo.cr.xp);
        else {
          const curXp = Parser.crToXpNumber(copyTo.cr);
          if (!copyTo.cr.cr) copyTo.cr = { cr: copyTo.cr };
          copyTo.cr.xp = getOutput(curXp);
        }
      }

      function doMod(modInfos, ...properties) {
        function handleProp(prop) {
          modInfos.forEach(modInfo => {
            if (typeof modInfo === 'string') {
              switch (modInfo) {
                case 'remove':
                  return delete copyTo[prop];
                default:
                  throw new Error(`Unhandled mode: ${modInfo}`);
              }
            } else {
              switch (modInfo.mode) {
                case 'appendStr':
                  return doMod_appendStr(modInfo, prop);
                case 'replaceTxt':
                  return doMod_replaceTxt(modInfo, prop);
                case 'prependArr':
                  return doMod_prependArr(modInfo, prop);
                case 'appendArr':
                  return doMod_appendArr(modInfo, prop);
                case 'replaceArr':
                  return doMod_replaceArr(modInfo, prop);
                case 'replaceOrAppendArr':
                  return doMod_replaceOrAppendArr(modInfo, prop);
                case 'appendIfNotExistsArr':
                  return doMod_appendIfNotExistsArr(modInfo, prop);
                case 'insertArr':
                  return doMod_insertArr(modInfo, prop);
                case 'removeArr':
                  return doMod_removeArr(modInfo, prop);
                case 'calculateProp':
                  return doMod_calculateProp(modInfo, prop);
                case 'scalarAddProp':
                  return doMod_scalarAddProp(modInfo, prop);
                case 'scalarMultProp':
                  return doMod_scalarMultProp(modInfo, prop);
                // bestiary specific
                case 'addSenses':
                  return doMod_addSenses(modInfo);
                case 'addSkills':
                  return doMod_addSkills(modInfo);
                case 'addSpells':
                  return doMod_addSpells(modInfo);
                case 'replaceSpells':
                  return doMod_replaceSpells(modInfo);
                case 'scalarAddHit':
                  return doMod_scalarAddHit(modInfo, prop);
                case 'scalarAddDc':
                  return doMod_scalarAddDc(modInfo, prop);
                case 'maxSize':
                  return doMod_maxSize(modInfo);
                case 'scalarMultXp':
                  return doMod_scalarMultXp(modInfo);
                default:
                  throw new Error(`Unhandled mode: ${modInfo.mode}`);
              }
            }
          });
        }

        properties.forEach(prop => handleProp(prop));
        // special case for "no property" modifications, i.e. underscore-key'd
        if (!properties.length) handleProp();
      }

      // apply mods
      if (copyMeta._mod) {
        // pre-convert any dynamic text
        Object.entries(copyMeta._mod).forEach(([k, v]) => {
          copyMeta._mod[k] = JSON.parse(
            JSON.stringify(v).replace(/<\$([^$]+)\$>/g, (...m) => {
              const parts = m[1].split('__');

              switch (parts[0]) {
                case 'name':
                  return copyTo.name;
                case 'short_name':
                case 'title_short_name': {
                  return Renderer.monster.getShortName(
                    copyTo,
                    parts[0] === 'title_short_name',
                  );
                }
                case 'spell_dc': {
                  if (!Parser.ABIL_ABVS.includes(parts[1]))
                    throw new Error(`Unknown ability score "${parts[1]}"`);
                  return (
                    8 +
                    Parser.getAbilityModNumber(Number(copyTo[parts[1]])) +
                    Parser.crToPb(copyTo.cr)
                  );
                }
                case 'to_hit': {
                  if (!Parser.ABIL_ABVS.includes(parts[1]))
                    throw new Error(`Unknown ability score "${parts[1]}"`);
                  const total =
                    Parser.crToPb(copyTo.cr) +
                    Parser.getAbilityModNumber(Number(copyTo[parts[1]]));
                  return total >= 0 ? `+${total}` : total;
                }
                case 'damage_mod': {
                  if (!Parser.ABIL_ABVS.includes(parts[1]))
                    throw new Error(`Unknown ability score "${parts[1]}"`);
                  const total = Parser.getAbilityModNumber(
                    Number(copyTo[parts[1]]),
                  );
                  return total === 0
                    ? ''
                    : total > 0
                    ? ` +${total}`
                    : ` ${total}`;
                }
                case 'damage_avg': {
                  const replaced = parts[1].replace(
                    /(str|dex|con|int|wis|cha)/gi,
                    (...m2) =>
                      Parser.getAbilityModNumber(Number(copyTo[m2[0]])),
                  );
                  const clean = replaced.replace(/[^-+/*0-9.,]+/g, '');
                  // eslint-disable-next-line no-eval
                  return Math.floor(eval(clean));
                }
                default:
                  return m[0];
              }
            }),
          );
        });

        Object.entries(copyMeta._mod).forEach(([prop, modInfos]) => {
          if (prop === '*')
            doMod(
              modInfos,
              'action',
              'bonus',
              'reaction',
              'trait',
              'legendary',
              'mythic',
              'variant',
              'spellcasting',
              'legendaryHeader',
            );
          else if (prop === '_') doMod(modInfos);
          else doMod(modInfos, prop);
        });
      }

      // add filter tag
      copyTo._isCopy = true;

      // cleanup
      delete copyTo._copy;
    },
  },

  monster: {
    _MERGE_REQUIRES_PRESERVE: {
      legendaryGroup: true,
      environment: true,
      soundClip: true,
      page: true,
      altArt: true,
      otherSources: true,
      variant: true,
      dragonCastingColor: true,
      srd: true,
      hasToken: true,
    },
    _mergeCache: {},
    async pMergeCopy(monList, mon, options) {
      return DataUtil.generic._pMergeCopy(
        DataUtil.monster,
        UrlUtil.PG_BESTIARY,
        monList,
        mon,
        options,
      );
    },

    async pPreloadMeta() {
      if (DataUtil.monster._isMetaLoaded) return;

      const legendaryGroups = await DataUtil.legendaryGroup.pLoadAll();
      DataUtil.monster.populateMetaReference({
        legendaryGroup: legendaryGroups,
      });
      DataUtil.monster._isMetaLoaded = true;
    },

    async pLoadAll() {
      const [index, legendaryGroups] = await Promise.all([
        DataUtil.loadJSON(`${Renderer.get().baseUrl}data/bestiary/index.json`),
        DataUtil.legendaryGroup.pLoadAll(),
      ]);

      if (!DataUtil.monster._isMetaLoaded) {
        DataUtil.monster.populateMetaReference({
          legendaryGroup: legendaryGroups,
        });
        DataUtil.monster._isMetaLoaded = true;
      }

      const allData = await Promise.all(
        Object.entries(index).map(async ([source, file]) => {
          const data = await DataUtil.loadJSON(
            `${Renderer.get().baseUrl}data/bestiary/${file}`,
          );
          return data.monster.filter(it => it.source === source);
        }),
      );
      return allData.flat();
    },

    _isMetaLoaded: false,
    metaGroupMap: {},
    getMetaGroup(mon) {
      if (
        !mon.legendaryGroup ||
        !mon.legendaryGroup.source ||
        !mon.legendaryGroup.name
      )
        return null;
      return (DataUtil.monster.metaGroupMap[mon.legendaryGroup.source] || {})[
        mon.legendaryGroup.name
      ];
    },
    populateMetaReference(data) {
      (data.legendaryGroup || []).forEach(it => {
        (DataUtil.monster.metaGroupMap[it.source] =
          DataUtil.monster.metaGroupMap[it.source] || {})[it.name] =
          DataUtil.monster.metaGroupMap[it.source][it.name] || it;
      });
    },
  },

  monsterFluff: {
    _MERGE_REQUIRES_PRESERVE: {},
    _mergeCache: {},
    async pMergeCopy(monFlfList, monFlf, options) {
      return DataUtil.generic._pMergeCopy(
        DataUtil.monsterFluff,
        UrlUtil.PG_BESTIARY,
        monFlfList,
        monFlf,
        options,
      );
    },
  },

  spell: {
    _MERGE_REQUIRES_PRESERVE: {
      page: true,
      otherSources: true,
      srd: true,
    },
    _mergeCache: {},
    async pMergeCopy(spellList, spell, options) {
      return DataUtil.generic._pMergeCopy(
        DataUtil.spell,
        UrlUtil.PG_SPELLS,
        spellList,
        spell,
        options,
      );
    },

    async pLoadAll() {
      const index = await DataUtil.loadJSON(
        `${Renderer.get().baseUrl}data/spells/index.json`,
      );
      const allData = await Promise.all(
        Object.entries(index).map(async ([source, file]) => {
          const data = await DataUtil.loadJSON(
            `${Renderer.get().baseUrl}data/spells/${file}`,
          );
          return data.spell.filter(it => it.source === source);
        }),
      );
      return allData.flat();
    },
  },

  spellFluff: {
    _MERGE_REQUIRES_PRESERVE: {},
    _mergeCache: {},
    async pMergeCopy(spellFlfList, spellFlf, options) {
      return DataUtil.generic._pMergeCopy(
        DataUtil.spellFluff,
        UrlUtil.PG_SPELLS,
        spellFlfList,
        spellFlf,
        options,
      );
    },
  },

  item: {
    _MERGE_REQUIRES_PRESERVE: {
      lootTables: true,
      tier: true,
      page: true,
      otherSources: true,
      srd: true,
    },
    _mergeCache: {},
    async pMergeCopy(itemList, item, options) {
      return DataUtil.generic._pMergeCopy(
        DataUtil.item,
        UrlUtil.PG_ITEMS,
        itemList,
        item,
        options,
      );
    },
  },

  itemFluff: {
    _MERGE_REQUIRES_PRESERVE: {},
    _mergeCache: {},
    async pMergeCopy(itemFlfList, itemFlf, options) {
      return DataUtil.generic._pMergeCopy(
        DataUtil.itemFluff,
        UrlUtil.PG_ITEMS,
        itemFlfList,
        itemFlf,
        options,
      );
    },
  },

  background: {
    _MERGE_REQUIRES_PRESERVE: {
      page: true,
      otherSources: true,
      srd: true,
    },
    _mergeCache: {},
    async pMergeCopy(bgList, bg, options) {
      return DataUtil.generic._pMergeCopy(
        DataUtil.background,
        UrlUtil.PG_BACKGROUNDS,
        bgList,
        bg,
        options,
      );
    },
  },

  race: {
    _MERGE_REQUIRES_PRESERVE: {
      subraces: true,
      page: true,
      otherSources: true,
      srd: true,
    },
    _mergeCache: {},
    async pMergeCopy(raceList, race, options) {
      return DataUtil.generic._pMergeCopy(
        DataUtil.race,
        UrlUtil.PG_RACES,
        raceList,
        race,
        options,
      );
    },
  },

  raceFluff: {
    _MERGE_REQUIRES_PRESERVE: {},
    _mergeCache: {},
    async pMergeCopy(raceFlfList, raceFlf, options) {
      return DataUtil.generic._pMergeCopy(
        DataUtil.raceFluff,
        UrlUtil.PG_RACES,
        raceFlfList,
        raceFlf,
        options,
      );
    },
  },

  class: {
    _pLoadingJson: null,
    _pLoadingRawJson: null,
    _loadedJson: null,
    _loadedRawJson: null,
    async loadJSON() {
      if (DataUtil.class._loadedJson) return DataUtil.class._loadedJson;

      DataUtil.class._pLoadingJson = (async () => {
        const index = await DataUtil.loadJSON(
          `${Renderer.get().baseUrl}data/class/index.json`,
        );
        const allData = await Promise.all(
          Object.values(index).map(it =>
            DataUtil.loadJSON(`${Renderer.get().baseUrl}data/class/${it}`),
          ),
        );

        const allDereferencedData = await Promise.all(
          allData.map(json =>
            Promise.all(
              (json.class || []).map(cls =>
                DataUtil.class.pGetDereferencedClassData(cls),
              ),
            ),
          ),
        );
        DataUtil.class._loadedJson = { class: allDereferencedData.flat() };
      })();
      await DataUtil.class._pLoadingJson;

      return DataUtil.class._loadedJson;
    },

    async loadRawJSON() {
      if (DataUtil.class._loadedRawJson) return DataUtil.class._loadedRawJson;

      DataUtil.class._pLoadingRawJson = (async () => {
        const index = await DataUtil.loadJSON(
          `${Renderer.get().baseUrl}data/class/index.json`,
        );
        const allData = await Promise.all(
          Object.values(index).map(it =>
            DataUtil.loadJSON(`${Renderer.get().baseUrl}data/class/${it}`),
          ),
        );

        DataUtil.class._loadedRawJson = {
          class: allData.map(it => it.class || []).flat(),
          classFeature: allData.map(it => it.classFeature || []).flat(),
          subclassFeature: allData.map(it => it.subclassFeature || []).flat(),
        };
      })();
      await DataUtil.class._pLoadingRawJson;

      return DataUtil.class._loadedRawJson;
    },

    /**
     * @param uid
     * @param [opts]
     * @param [opts.isLower] If the returned values should be lowercase.
     */
    unpackUidClassFeature(uid, opts) {
      opts = opts || {};
      if (opts.isLower) uid = uid.toLowerCase();
      let [
        name,
        className,
        classSource,
        level,
        source,
        displayText,
      ] = uid.split('|').map(it => it.trim());
      classSource =
        classSource || (opts.isLower ? SRC_PHB.toLowerCase() : SRC_PHB);
      source = source || classSource;
      level = Number(level);
      return {
        name,
        className,
        classSource,
        level,
        source,
        displayText,
      };
    },

    /**
     * @param uid
     * @param [opts]
     * @param [opts.isLower] If the returned values should be lowercase.
     */
    unpackUidSubclassFeature(uid, opts) {
      opts = opts || {};
      if (opts.isLower) uid = uid.toLowerCase();
      let [
        name,
        className,
        classSource,
        subclassShortName,
        subclassSource,
        level,
        source,
        displayText,
      ] = uid.split('|').map(it => it.trim());
      classSource =
        classSource || (opts.isLower ? SRC_PHB.toLowerCase() : SRC_PHB);
      subclassSource =
        subclassSource || (opts.isLower ? SRC_PHB.toLowerCase() : SRC_PHB);
      source = source || subclassSource;
      level = Number(level);
      return {
        name,
        className,
        classSource,
        subclassShortName,
        subclassSource,
        level,
        source,
        displayText,
      };
    },

    _mutEntryNestLevel(feature) {
      const depth = (feature.header == null ? 1 : feature.header) - 1;
      for (let i = 0; i < depth; ++i) {
        const nxt = {
          name: feature.name,
          page: feature.page,
          source: feature.source,
          type: 'entries',
          entries: feature.entries,
        };
        if (!nxt.name) delete nxt.name;
        if (!nxt.page) delete nxt.page;
        if (!nxt.source) delete nxt.source;
        feature.entries = [nxt];
        delete feature.name;
        delete feature.page;
        delete feature.source;
      }
    },

    async pGetDereferencedClassData(cls) {
      // Gracefully handle legacy class data
      if (
        cls.classFeatures &&
        cls.classFeatures.every(
          it => typeof it !== 'string' && !it.classFeature,
        )
      )
        return cls;

      cls = MiscUtil.copy(cls);

      const byLevel = {}; // Build a map of `level: [classFeature]`
      for (const classFeatureRef of cls.classFeatures || []) {
        const uid = classFeatureRef.classFeature
          ? classFeatureRef.classFeature
          : classFeatureRef;
        const {
          name,
          className,
          classSource,
          level,
          source,
        } = DataUtil.class.unpackUidClassFeature(uid);
        if (!name || !className || !level || isNaN(level)) continue; // skip over broken links

        const hash = UrlUtil.URL_TO_HASH_BUILDER['classFeature']({
          name,
          className,
          classSource,
          level,
          source,
        });

        // Skip blacklisted
        if (
          ExcludeUtil.isInitialised &&
          ExcludeUtil.isExcluded(hash, 'classFeature', source, {
            isNoCount: true,
          })
        )
          continue;

        const classFeature = await Renderer.hover.pCacheAndGet(
          'classFeature',
          source,
          hash,
          { isCopy: true },
        );
        // skip over missing links
        if (!classFeature) {
          JqueryUtil.doToast({
            type: 'danger',
            content: `Failed to find <code>classFeature</code> <code>${uid}</code>`,
          });
          continue;
        }

        if (classFeatureRef.gainSubclassFeature)
          classFeature.gainSubclassFeature = true;
        // Remove sources to avoid colouring e.g. entire UA classes with the "spicy green" styling
        if (classFeature.source === cls.source) delete classFeature.source;

        DataUtil.class._mutEntryNestLevel(classFeature);

        const key = `${classFeature.level || 1}`;
        (byLevel[key] = byLevel[key] || []).push(classFeature);
      }

      const outClassFeatures = [];
      const maxLevel = Math.max(...Object.keys(byLevel).map(it => Number(it)));
      for (let i = 1; i <= maxLevel; ++i) {
        outClassFeatures[i - 1] = byLevel[i] || [];
      }
      cls.classFeatures = outClassFeatures;

      if (cls.subclasses) {
        const outSubclasses = [];
        for (const sc of cls.subclasses) {
          outSubclasses.push(
            await DataUtil.class.pGetDereferencedSubclassData(sc),
          );
        }
        cls.subclasses = outSubclasses;
      }

      return cls;
    },

    async pGetDereferencedSubclassData(sc) {
      // Gracefully handle legacy class data
      if (
        sc.subclassFeatures &&
        sc.subclassFeatures.every(
          it => typeof it !== 'string' && !it.subclassFeature,
        )
      )
        return sc;

      sc = MiscUtil.copy(sc);

      const byLevel = {}; // Build a map of `level: [subclassFeature]`

      for (const subclassFeatureRef of sc.subclassFeatures || []) {
        const uid = subclassFeatureRef.subclassFeature
          ? subclassFeatureRef.subclassFeature
          : subclassFeatureRef;
        const {
          name,
          className,
          classSource,
          subclassShortName,
          subclassSource,
          level,
          source,
        } = DataUtil.class.unpackUidSubclassFeature(uid);
        if (!name || !className || !subclassShortName || !level || isNaN(level))
          continue; // skip over broken links

        const hash = UrlUtil.URL_TO_HASH_BUILDER['subclassFeature']({
          name,
          className,
          classSource,
          subclassShortName,
          subclassSource,
          level,
          source,
        });

        // Skip blacklisted
        if (
          ExcludeUtil.isInitialised &&
          ExcludeUtil.isExcluded(hash, 'subclassFeature', source, {
            isNoCount: true,
          })
        )
          continue;

        const subclassFeature = await Renderer.hover.pCacheAndGet(
          'subclassFeature',
          source,
          hash,
          { isCopy: true },
        );
        // skip over missing links
        if (!subclassFeature) {
          JqueryUtil.doToast({
            type: 'danger',
            content: `Failed to find <code>subclassFeature</code> <code>${uid}</code>`,
          });
          continue;
        }

        // Remove sources to avoid colouring e.g. entire UA classes with the "spicy green" styling
        if (subclassFeature.source === sc.source) delete subclassFeature.source;

        DataUtil.class._mutEntryNestLevel(subclassFeature);

        const key = `${subclassFeature.level || 1}`;
        (byLevel[key] = byLevel[key] || []).push(subclassFeature);
      }

      sc.subclassFeatures = Object.keys(byLevel)
        .map(it => Number(it))
        .sort(SortUtil.ascSort)
        .map(k => byLevel[k]);

      return sc;
    },
  },

  deity: {
    _MERGE_REQUIRES_PRESERVE: {
      page: true,
      otherSources: true,
      srd: true,
    },
    _mergeCache: {},
    async pMergeCopy(deityList, deity, options) {
      return DataUtil.generic._pMergeCopy(
        DataUtil.deity,
        UrlUtil.PG_DEITIES,
        deityList,
        deity,
        options,
      );
    },

    doPostLoad: function(data) {
      const PRINT_ORDER = [
        SRC_PHB,
        SRC_DMG,
        SRC_SCAG,
        SRC_VGM,
        SRC_MTF,
        SRC_ERLW,
      ];

      const inSource = {};
      PRINT_ORDER.forEach(src => {
        inSource[src] = {};
        data.deity
          .filter(it => it.source === src)
          .forEach(it => (inSource[src][it.reprintAlias || it.name] = it)); // TODO need to handle similar names
      });

      const laterPrinting = [PRINT_ORDER.last()];
      [...PRINT_ORDER]
        .reverse()
        .slice(1)
        .forEach(src => {
          laterPrinting.forEach(laterSrc => {
            Object.keys(inSource[src]).forEach(name => {
              const newer = inSource[laterSrc][name];
              if (newer) {
                const old = inSource[src][name];
                old.reprinted = true;
                if (!newer._isEnhanced) {
                  newer.previousVersions = newer.previousVersions || [];
                  newer.previousVersions.push(old);
                }
              }
            });
          });

          laterPrinting.push(src);
        });
      data.deity.forEach(g => (g._isEnhanced = true));
    },

    loadJSON: async function() {
      const data = await DataUtil.loadJSON(
        `${Renderer.get().baseUrl}data/deities.json`,
      );
      DataUtil.deity.doPostLoad(data);
      return data;
    },
  },

  table: {
    async pLoadAll() {
      const datas = await Promise.all(
        [
          `${Renderer.get().baseUrl}data/generated/gendata-tables.json`,
          `${Renderer.get().baseUrl}data/tables.json`,
        ].map(url => DataUtil.loadJSON(url)),
      );
      const combined = {};
      datas.forEach(data => {
        Object.entries(data).forEach(([k, v]) => {
          if (combined[k] && combined[k] instanceof Array && v instanceof Array)
            combined[k] = combined[k].concat(v);
          else if (combined[k] == null) combined[k] = v;
          else throw new Error(`Could not merge keys for key "${k}"`);
        });
      });
      return combined;
    },
  },

  legendaryGroup: {
    async pLoadAll() {
      return (
        await DataUtil.loadJSON(
          `${Renderer.get().baseUrl}data/bestiary/legendarygroups.json`,
        )
      ).legendaryGroup;
    },
  },

  brew: {
    _getCleanUrlRoot(urlRoot) {
      if (urlRoot && urlRoot.trim()) {
        urlRoot = urlRoot.trim();
        if (!urlRoot.endsWith('/')) urlRoot = `${urlRoot}/`;
      } else
        urlRoot = `https://raw.githubusercontent.com/TheGiddyLimit/homebrew/master/`;
      return urlRoot;
    },

    async pLoadTimestamps(urlRoot) {
      urlRoot = DataUtil.brew._getCleanUrlRoot(urlRoot);
      return DataUtil.loadJSON(`${urlRoot}_generated/index-timestamps.json`);
    },

    async pLoadPropIndex(urlRoot) {
      urlRoot = DataUtil.brew._getCleanUrlRoot(urlRoot);
      return DataUtil.loadJSON(`${urlRoot}_generated/index-props.json`);
    },

    async pLoadSourceIndex(urlRoot) {
      urlRoot = DataUtil.brew._getCleanUrlRoot(urlRoot);
      return DataUtil.loadJSON(`${urlRoot}_generated/index-sources.json`);
    },

    getFileUrl(path, urlRoot) {
      urlRoot = DataUtil.brew._getCleanUrlRoot(urlRoot);
      return `${urlRoot}${path}`;
    },
  },
};

// EVENT HANDLERS ======================================================================================================
EventUtil = {
  getClientX(evt) {
    return evt.touches && evt.touches.length
      ? evt.touches[0].clientX
      : evt.clientX;
  },
  getClientY(evt) {
    return evt.touches && evt.touches.length
      ? evt.touches[0].clientY
      : evt.clientY;
  },
};

// CONTEXT MENUS =======================================================================================================
ContextUtil = {
  _ctxInit: {},
  _ctxClick: {},
  _ctxOpenRefsNextId: 1,
  _ctxOpenRefs: {},
  _handlePreInitContextMenu: menuId => {
    if (ContextUtil._ctxInit[menuId]) return;
    ContextUtil._ctxInit[menuId] = true;
    const clickId = `click.${menuId}`;
    $('body')
      .off(clickId)
      .on(clickId, evt => {
        if ($(evt.target).data('ctx-id') != null) return; // ignore clicks on context menus

        Object.entries(ContextUtil._ctxOpenRefs[menuId] || {}).forEach(
          ([k, v]) => {
            v(false);
            delete ContextUtil._ctxOpenRefs[menuId][k];
          },
        );
        $(`#${menuId}`).hide();
      });
  },

  _getMenuPosition: (menuId, mouse, direction, scrollDir) => {
    const win = $(window)[direction]();
    const scroll = $(window)[scrollDir]();
    const menu = $(`#${menuId}`)[direction]();
    let position = mouse + scroll;
    // opening menu would pass the side of the page
    if (mouse + menu > win && menu < mouse) position -= menu;
    return position;
  },

  _lastMenuId: 1,
  getNextGenericMenuId() {
    return `contextMenu_${ContextUtil._lastMenuId++}`;
  },

  doInitContextMenu: (menuId, clickFn, labels) => {
    ContextUtil._ctxClick[menuId] = clickFn;
    ContextUtil._handlePreInitContextMenu(menuId);
    let tempString = `<ul id="${menuId}" class="dropdown-menu ui-ctx" role="menu">`;
    let i = 0;
    labels.forEach(it => {
      if (it === null) tempString += `<li class="divider"/>`;
      else if (typeof it === 'object') {
        tempString += `<li class="${
          it.isDisabled ? `disabled` : ``
        } ${it.style || ''}"><span ${
          !it.isDisabled ? `data-ctx-id="${i}"` : ''
        } ${it.title ? `title="${it.title.escapeQuotes()}"` : ''}>${
          it.text
        }</span></li>`;
        if (!it.isDisabled) i++;
      } else {
        tempString += `<li><span data-ctx-id="${i}">${it}</span></li>`;
        i++;
      }
    });
    tempString += `</ul>`;
    $(`#${menuId}`).remove();
    $('body').append(tempString);
  },

  doInitActionContextMenu(contextId, actionOptions) {
    ContextUtil.doInitContextMenu(
      contextId,
      (evt, ele, $invokedOn, $selectedMenu) => {
        const val = Number($selectedMenu.data('ctx-id'));
        actionOptions.filter(Boolean)[val].action(evt, $invokedOn);
      },
      actionOptions,
    );
  },

  doTeardownContextMenu(menuId) {
    delete ContextUtil._ctxInit[menuId];
    delete ContextUtil._ctxClick[menuId];
    delete ContextUtil._ctxOpenRefs[menuId];
    $(`#${menuId}`).remove();
  },

  handleOpenContextMenu: (evt, ele, menuId, closeHandler, data) => {
    // anything specified in "data" is passed through to the final handler(s)
    evt.preventDefault();
    evt.stopPropagation();
    const thisId = ContextUtil._ctxOpenRefsNextId++;
    (ContextUtil._ctxOpenRefs[menuId] = ContextUtil._ctxOpenRefs[menuId] || {})[
      thisId
    ] = closeHandler || (() => {});
    const $menu = $(`#${menuId}`)
      .show()
      .css({
        position: 'absolute',
        left: ContextUtil._getMenuPosition(
          menuId,
          evt.clientX,
          'width',
          'scrollLeft',
        ),
        top: ContextUtil._getMenuPosition(
          menuId,
          evt.clientY,
          'height',
          'scrollTop',
        ),
      })
      .off('click')
      .on('click', 'span', function(e) {
        $menu.hide();
        if (ContextUtil._ctxOpenRefs[menuId][thisId])
          ContextUtil._ctxOpenRefs[menuId][thisId](true);
        delete ContextUtil._ctxOpenRefs[menuId][thisId];
        const $invokedOn = $(evt.target).closest(`li.row`);
        const $selectedMenu = $(e.target);
        const invokedOnId = Number($selectedMenu.data('ctx-id'));
        ContextUtil._ctxClick[menuId](
          e,
          ele,
          $invokedOn,
          $selectedMenu,
          isNaN(invokedOnId) ? null : invokedOnId,
          data,
        );
      });
  },

  /**
   * @param name
   * @param fnAction
   * @param [opts] Options object.
   * @param [opts.isDisabled] If this action is disabled.
   * @param [opts.helpText] Help (title) text.
   * @param [opts.style] Additional CSS classes to add (e.g. `ctx-danger`).
   */
  Action: function(text, fnAction, opts) {
    opts = opts || {};

    this.text = text;
    this.action = fnAction;

    this.isDisabled = opts.isDisabled;
    this.helpText = opts.helpText;
    this.style = opts.style;
  },
};

function getAsiFilter(options) {
  const baseOptions = {
    header: 'Ability Bonus',
    items: ['str', 'dex', 'con', 'int', 'wis', 'cha'],
    displayFn: Parser.attAbvToFull,
    itemSortFn: null,
  };
  return getFilterWithMergedOptions(baseOptions, options);
}

function getFilterWithMergedOptions(baseOptions, addOptions) {
  if (addOptions) Object.assign(baseOptions, addOptions); // merge in anything we get passed
  return new Filter(baseOptions);
}

/**
 * @param opts Options object.
 * @param opts.filters Array of filters to be included in this box.
 * @param [opts.isCompact] True if this box should have a compact/reduced UI.
 */
async function pInitFilterBox(opts) {
  opts.$iptSearch = $(`#lst__search`);
  opts.$wrpFormTop = $(`#filter-search-input-group`).title('Hotkey: f');
  opts.$btnReset = $(`#reset`);
  const filterBox = new FilterBox(opts);
  await filterBox.pDoLoadState();
  return filterBox;
}

// ENCODING/DECODING ===================================================================================================
UrlUtil = {
  encodeForHash(toEncode) {
    if (toEncode instanceof Array)
      return toEncode.map(it => `${it}`.toUrlified()).join(HASH_LIST_SEP);
    else return `${toEncode}`.toUrlified();
  },

  autoEncodeHash(obj) {
    const curPage = UrlUtil.getCurrentPage();
    const encoder = UrlUtil.URL_TO_HASH_BUILDER[curPage];
    if (!encoder) throw new Error(`No encoder found for page ${curPage}`);
    return encoder(obj);
  },

  getCurrentPage() {
    const pSplit = window.location.pathname.split('/');
    let out = pSplit[pSplit.length - 1];
    if (!out.toLowerCase().endsWith('.html')) out += '.html';
    return out;
  },

  /**
   * All internal URL construction should pass through here, to ensure `static.5etools.com` is used when required.
   *
   * @param href the link
   */
  link(href) {
    return href;
  },

  unpackSubHash(subHash, unencode) {
    // format is "key:value~list~sep~with~tilde"
    if (subHash.includes(HASH_SUB_KV_SEP)) {
      const keyValArr = subHash.split(HASH_SUB_KV_SEP).map(s => s.trim());
      const out = {};
      let k = keyValArr[0].toLowerCase();
      if (unencode) k = decodeURIComponent(k);
      let v = keyValArr[1].toLowerCase();
      if (unencode) v = decodeURIComponent(v);
      out[k] = v.split(HASH_SUB_LIST_SEP).map(s => s.trim());
      if (out[k].length === 1 && out[k] === HASH_SUB_NONE) out[k] = [];
      return out;
    } else {
      throw new Error(`Badly formatted subhash ${subHash}`);
    }
  },

  /**
   * @param key The subhash key.
   * @param values The subhash values.
   * @param [opts] Options object.
   * @param [opts.isEncodeBoth] If both the key and values should be URl encoded.
   * @param [opts.isEncodeKey] If the key should be URL encoded.
   * @param [opts.isEncodeValues] If the values should be URL encoded.
   * @returns {string}
   */
  packSubHash(key, values, opts) {
    opts = opts || {};
    if (opts.isEncodeBoth || opts.isEncodeKey) key = key.toUrlified();
    if (opts.isEncodeBoth || opts.isEncodeValues)
      values = values.map(it => it.toUrlified());
    return `${key}${HASH_SUB_KV_SEP}${values.join(HASH_SUB_LIST_SEP)}`;
  },

  categoryToPage(category) {
    return UrlUtil.CAT_TO_PAGE[category];
  },

  bindLinkExportButton(filterBox, $btn) {
    $btn = $btn || ListUtil.getOrTabRightButton(`btn-link-export`, `magnet`);
    $btn
      .addClass('btn-copy-effect')
      .off('click')
      .on('click', async evt => {
        let url = window.location.href;

        const parts = filterBox.getSubHashes();
        parts.unshift(url);

        if (evt.shiftKey && ListUtil.sublist) {
          const toEncode = JSON.stringify(ListUtil.getExportableSublist());
          const part2 = UrlUtil.packSubHash(
            ListUtil.SUB_HASH_PREFIX,
            [toEncode],
            { isEncodeBoth: true },
          );
          parts.push(part2);
        }

        await MiscUtil.pCopyTextToClipboard(parts.join(HASH_PART_SEP));
        JqueryUtil.showCopiedEffect($btn);
      })
      .title('Get Link to Filters (SHIFT adds List)');
  },

  mini: {
    compress(primitive) {
      const type = typeof primitive;
      if (primitive == null) return `x`;
      switch (type) {
        case 'boolean':
          return `b${Number(primitive)}`;
        case 'number':
          return `n${primitive}`;
        case 'string':
          return `s${primitive.toUrlified()}`;
        default:
          throw new Error(`Unhandled type "${type}"`);
      }
    },

    decompress(raw) {
      const [type, data] = [raw.slice(0, 1), raw.slice(1)];
      switch (type) {
        case 'x':
          return null;
        case 'b':
          return !!Number(data);
        case 'n':
          return Number(data);
        case 's':
          return String(data);
        default:
          throw new Error(`Unhandled type "${type}"`);
      }
    },
  },

  class: {
    getIndexedEntries(cls) {
      const out = [];
      let scFeatureI = 0;
      (cls.classFeatures || []).forEach((lvlFeatureList, ixLvl) => {
        // class features
        lvlFeatureList
          .filter(
            feature =>
              !feature.gainSubclassFeature &&
              feature.name !== 'Ability Score Improvement',
          ) // don't add "you gain a subclass feature" or ASI's
          .forEach((feature, ixFeature) => {
            const name = Renderer.findName(feature);
            if (!name) {
              // tolerate missing names in homebrew
              if (BrewUtil.hasSourceJson(cls.source)) return;
              else throw new Error('Class feature had no name!');
            }
            out.push({
              _type: 'classFeature',
              source: cls.source.source || cls.source,
              name,
              hash: `${UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES](
                cls,
              )}${HASH_PART_SEP}${UrlUtil.getClassesPageStatePart({
                feature: { ixLevel: ixLvl, ixFeature: ixFeature },
              })}`,
              entry: feature,
              level: ixLvl + 1,
            });
          });

        // subclass features
        const ixGainSubclassFeatures = lvlFeatureList.findIndex(
          feature => feature.gainSubclassFeature,
        );
        if (~ixGainSubclassFeatures) {
          cls.subclasses.forEach(sc => {
            const features = (sc.subclassFeatures || [])[scFeatureI] || [];
            sc.source = sc.source || cls.source; // default to class source if required
            const tempStack = [];
            features.forEach(feature => {
              const subclassFeatureHash = `${UrlUtil.URL_TO_HASH_BUILDER[
                UrlUtil.PG_CLASSES
              ](cls)}${HASH_PART_SEP}${UrlUtil.getClassesPageStatePart({
                subclass: sc,
                feature: { ixLevel: ixLvl, ixFeature: ixGainSubclassFeatures },
              })}`;
              const name = Renderer.findName(feature);
              if (!name) {
                // tolerate missing names in homebrew
                if (BrewUtil.hasSourceJson(sc.source)) return;
                else throw new Error('Subclass feature had no name!');
              }
              tempStack.push({
                _type: 'subclassFeature',
                name,
                subclassName: sc.name,
                subclassShortName: sc.shortName,
                source: sc.source.source || sc.source,
                hash: subclassFeatureHash,
                entry: feature,
                level: ixLvl + 1,
              });

              if (feature.entries) {
                const namedFeatureParts = feature.entries.filter(it => it.name);
                namedFeatureParts.forEach(it => {
                  const lvl = ixLvl + 1;
                  if (
                    tempStack.find(
                      existing =>
                        it.name === existing.name && lvl === existing.level,
                    )
                  )
                    return;
                  tempStack.push({
                    _type: 'subclassFeaturePart',
                    name: it.name,
                    subclassName: sc.name,
                    subclassShortName: sc.shortName,
                    source: sc.source.source || sc.source,
                    hash: subclassFeatureHash,
                    entry: feature,
                    level: lvl,
                  });
                });
              }
            });
            out.push(...tempStack);
          });
          scFeatureI++;
        } else if (ixGainSubclassFeatures.length > 1) {
          setTimeout(() => {
            throw new Error(
              `Multiple subclass features gained at level ${ixLvl +
                1} for class "${cls.name}" from source "${cls.source}"!`,
            );
          });
        }
      });
      return out;
    },
  },

  getStateKeySubclass(sc) {
    return Parser.stringToSlug(
      `sub ${sc.shortName || sc.name} ${Parser.sourceJsonToAbv(sc.source)}`,
    );
  },

  /**
   * @param opts Options object.
   * @param [opts.subclass] Subclass (or object of the form `{shortName: "str", source: "str"}`)
   * @param [opts.feature] Object of the form `{ixLevel: 0, ixFeature: 0}`
   */
  getClassesPageStatePart(opts) {
    const stateParts = [
      opts.subclass
        ? `${UrlUtil.getStateKeySubclass(
            opts.subclass,
          )}=${UrlUtil.mini.compress(true)}`
        : null,
      opts.feature
        ? `feature=${UrlUtil.mini.compress(
            `${opts.feature.ixLevel}-${opts.feature.ixFeature}`,
          )}`
        : '',
    ].filter(Boolean);
    return stateParts.length ? UrlUtil.packSubHash('state', stateParts) : '';
  },
};

UrlUtil.PG_BESTIARY = 'bestiary.html';
UrlUtil.PG_SPELLS = 'spells.html';
UrlUtil.PG_BACKGROUNDS = 'backgrounds.html';
UrlUtil.PG_ITEMS = 'items.html';
UrlUtil.PG_CLASSES = 'classes.html';
UrlUtil.PG_CONDITIONS_DISEASES = 'conditionsdiseases.html';
UrlUtil.PG_FEATS = 'feats.html';
UrlUtil.PG_OPT_FEATURES = 'optionalfeatures.html';
UrlUtil.PG_PSIONICS = 'psionics.html';
UrlUtil.PG_RACES = 'races.html';
UrlUtil.PG_REWARDS = 'rewards.html';
UrlUtil.PG_VARIATNRULES = 'variantrules.html';
UrlUtil.PG_ADVENTURE = 'adventure.html';
UrlUtil.PG_ADVENTURES = 'adventures.html';
UrlUtil.PG_BOOK = 'book.html';
UrlUtil.PG_BOOKS = 'books.html';
UrlUtil.PG_DEITIES = 'deities.html';
UrlUtil.PG_CULTS_BOONS = 'cultsboons.html';
UrlUtil.PG_OBJECTS = 'objects.html';
UrlUtil.PG_TRAPS_HAZARDS = 'trapshazards.html';
UrlUtil.PG_QUICKREF = 'quickreference.html';
UrlUtil.PG_MAKE_SHAPED = 'makeshaped.html';
UrlUtil.PG_MANAGE_BREW = 'managebrew.html';
UrlUtil.PG_MAKE_BREW = 'makebrew.html';
UrlUtil.PG_DEMO_RENDER = 'renderdemo.html';
UrlUtil.PG_TABLES = 'tables.html';
UrlUtil.PG_VEHICLES = 'vehicles.html';
UrlUtil.PG_CHARACTERS = 'characters.html';
UrlUtil.PG_ACTIONS = 'actions.html';
UrlUtil.PG_LANGUAGES = 'languages.html';

UrlUtil.URL_TO_HASH_BUILDER = {};
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_BESTIARY] = it =>
  UrlUtil.encodeForHash([it.name, it.source]);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_SPELLS] = it =>
  UrlUtil.encodeForHash([it.name, it.source]);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_BACKGROUNDS] = it =>
  UrlUtil.encodeForHash([it.name, it.source]);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ITEMS] = it =>
  UrlUtil.encodeForHash([it.name, it.source]);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES] = it =>
  UrlUtil.encodeForHash([it.name, it.source]);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CONDITIONS_DISEASES] = it =>
  UrlUtil.encodeForHash([it.name, it.source]);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_FEATS] = it =>
  UrlUtil.encodeForHash([it.name, it.source]);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_OPT_FEATURES] = it =>
  UrlUtil.encodeForHash([it.name, it.source]);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_PSIONICS] = it =>
  UrlUtil.encodeForHash([it.name, it.source]);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_RACES] = it =>
  UrlUtil.encodeForHash([it.name, it.source]);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_REWARDS] = it =>
  UrlUtil.encodeForHash([it.name, it.source]);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_VARIATNRULES] = it =>
  UrlUtil.encodeForHash([it.name, it.source]);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ADVENTURE] = it =>
  UrlUtil.encodeForHash(it.id);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_BOOK] = it =>
  UrlUtil.encodeForHash(it.id);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_DEITIES] = it =>
  UrlUtil.encodeForHash([it.name, it.pantheon, it.source]);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CULTS_BOONS] = it =>
  UrlUtil.encodeForHash([it.name, it.source]);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_OBJECTS] = it =>
  UrlUtil.encodeForHash([it.name, it.source]);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_TRAPS_HAZARDS] = it =>
  UrlUtil.encodeForHash([it.name, it.source]);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_TABLES] = it =>
  UrlUtil.encodeForHash([it.name, it.source]);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_VEHICLES] = it =>
  UrlUtil.encodeForHash([it.name, it.source]);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ACTIONS] = it =>
  UrlUtil.encodeForHash([it.name, it.source]);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_LANGUAGES] = it =>
  UrlUtil.encodeForHash([it.name, it.source]);

UrlUtil.CAT_TO_PAGE = {};
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_CREATURE] = UrlUtil.PG_BESTIARY;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_SPELL] = UrlUtil.PG_SPELLS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_BACKGROUND] = UrlUtil.PG_BACKGROUNDS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ITEM] = UrlUtil.PG_ITEMS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_CLASS] = UrlUtil.PG_CLASSES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_CLASS_FEATURE] = UrlUtil.PG_CLASSES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_SUBCLASS] = UrlUtil.PG_CLASSES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_SUBCLASS_FEATURE] = UrlUtil.PG_CLASSES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_CONDITION] = UrlUtil.PG_CONDITIONS_DISEASES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_FEAT] = UrlUtil.PG_FEATS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ELDRITCH_INVOCATION] =
  UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_METAMAGIC] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_MANEUVER_BATTLEMASTER] =
  UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_MANEUVER_CAVALIER] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ARCANE_SHOT] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_OPTIONAL_FEATURE_OTHER] =
  UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_FIGHTING_STYLE] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_PSIONIC] = UrlUtil.PG_PSIONICS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_RACE] = UrlUtil.PG_RACES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_OTHER_REWARD] = UrlUtil.PG_REWARDS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_VARIANT_OPTIONAL_RULE] =
  UrlUtil.PG_VARIATNRULES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ADVENTURE] = UrlUtil.PG_ADVENTURE;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_DEITY] = UrlUtil.PG_DEITIES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_OBJECT] = UrlUtil.PG_OBJECTS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_TRAP] = UrlUtil.PG_TRAPS_HAZARDS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_HAZARD] = UrlUtil.PG_TRAPS_HAZARDS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_QUICKREF] = UrlUtil.PG_QUICKREF;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_CULT] = UrlUtil.PG_CULTS_BOONS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_BOON] = UrlUtil.PG_CULTS_BOONS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_DISEASE] = UrlUtil.PG_CONDITIONS_DISEASES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_TABLE] = UrlUtil.PG_TABLES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_TABLE_GROUP] = UrlUtil.PG_TABLES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_VEHICLE] = UrlUtil.PG_VEHICLES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_PACT_BOON] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ELEMENTAL_DISCIPLINE] =
  UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ARTIFICER_INFUSION] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_SHIP_UPGRADE] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_INFERNAL_WAR_MACHINE_UPGRADE] =
  UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ONOMANCY_RESONANT] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_RUNE_KNIGHT_RUNE] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ALCHEMICAL_FORMULA] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_MANEUVER] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ACTION] = UrlUtil.PG_ACTIONS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_LANGUAGE] = UrlUtil.PG_LANGUAGES;

// SORTING =============================================================================================================
SortUtil = {
  ascSort: (a, b) => {
    if (typeof FilterItem !== 'undefined') {
      if (a instanceof FilterItem) a = a.item;
      if (b instanceof FilterItem) b = b.item;
    }

    return SortUtil._ascSort(a, b);
  },

  ascSortProp: (prop, a, b) => {
    return SortUtil.ascSort(a[prop], b[prop]);
  },

  ascSortLower: (a, b) => {
    if (typeof FilterItem !== 'undefined') {
      if (a instanceof FilterItem) a = a.item;
      if (b instanceof FilterItem) b = b.item;
    }

    return SortUtil._ascSort(a.toLowerCase(), b.toLowerCase());
  },

  ascSortLowerProp: (prop, a, b) => {
    return SortUtil.ascSortLower(a[prop], b[prop]);
  },

  // warning: slow
  ascSortNumericalSuffix(a, b) {
    if (typeof FilterItem !== 'undefined') {
      if (a instanceof FilterItem) a = a.item;
      if (b instanceof FilterItem) b = b.item;
    }

    function popEndNumber(str) {
      const spl = str.split(' ');
      return spl.last().isNumeric()
        ? [
            spl.slice(0, -1).join(' '),
            Number(spl.last().replace(Parser._numberCleanRegexp, '')),
          ]
        : [spl.join(' '), 0];
    }

    const [aStr, aNum] = popEndNumber(a.item || a);
    const [bStr, bNum] = popEndNumber(b.item || b);
    const initialSort = SortUtil.ascSort(aStr, bStr);
    if (initialSort) return initialSort;
    return SortUtil.ascSort(aNum, bNum);
  },

  _ascSort: (a, b) => {
    if (b === a) return 0;
    return b < a ? 1 : -1;
  },

  ascSortDate(a, b) {
    return b.getTime() - a.getTime();
  },

  ascSortDateString(a, b) {
    return SortUtil.ascSortDate(
      new Date(a || '1970-01-0'),
      new Date(b || '1970-01-0'),
    );
  },

  compareListNames(a, b) {
    return SortUtil._ascSort(a.name.toLowerCase(), b.name.toLowerCase());
  },

  listSort(a, b, opts) {
    opts = opts || { sortBy: 'name' };
    if (opts.sortBy === 'name') return SortUtil.compareListNames(a, b);
    else
      return SortUtil._compareByOrDefault_compareByOrDefault(a, b, opts.sortBy);
  },

  _listSort_compareBy(a, b, sortBy) {
    const aValue =
      typeof a.values[sortBy] === 'string'
        ? a.values[sortBy].toLowerCase()
        : a.values[sortBy];
    const bValue =
      typeof b.values[sortBy] === 'string'
        ? b.values[sortBy].toLowerCase()
        : b.values[sortBy];

    return SortUtil._ascSort(aValue, bValue);
  },

  _compareByOrDefault_compareByOrDefault(a, b, sortBy) {
    return (
      SortUtil._listSort_compareBy(a, b, sortBy) ||
      SortUtil.compareListNames(a, b)
    );
  },

  /**
   * "Special Equipment" first, then alphabetical
   */
  _MON_TRAIT_ORDER: ['special equipment', 'shapechanger'],
  monTraitSort: (a, b) => {
    if (!a && !b) return 0;
    const aClean = a.toLowerCase().trim();
    const bClean = b.toLowerCase().trim();

    const ixA = SortUtil._MON_TRAIT_ORDER.indexOf(aClean);
    const ixB = SortUtil._MON_TRAIT_ORDER.indexOf(bClean);
    if (~ixA && ~ixB) return ixA - ixB;
    else if (~ixA) return -1;
    else if (~ixB) return 1;
    else return SortUtil.ascSort(aClean, bClean);
  },

  _alignFirst: ['L', 'C'],
  _alignSecond: ['G', 'E'],
  alignmentSort: (a, b) => {
    if (a === b) return 0;
    if (SortUtil._alignFirst.includes(a)) return -1;
    if (SortUtil._alignSecond.includes(a)) return 1;
    if (SortUtil._alignFirst.includes(b)) return 1;
    if (SortUtil._alignSecond.includes(b)) return -1;
    return 0;
  },

  ascSortCr(a, b) {
    if (typeof FilterItem !== 'undefined') {
      if (a instanceof FilterItem) a = a.item;
      if (b instanceof FilterItem) b = b.item;
    }
    // always put unknown values last
    if (a === 'Unknown' || a === undefined) a = '999';
    if (b === 'Unknown' || b === undefined) b = '999';
    return SortUtil.ascSort(Parser.crToNumber(a), Parser.crToNumber(b));
  },

  ascSortAtts(a, b) {
    const aSpecial = a === 'special';
    const bSpecial = b === 'special';
    return aSpecial && bSpecial
      ? 0
      : aSpecial
      ? 1
      : bSpecial
      ? -1
      : Parser.ABIL_ABVS.indexOf(a) - Parser.ABIL_ABVS.indexOf(b);
  },
};

// HOMEBREW ============================================================================================================
BrewUtil = {
  homebrew: null,
  homebrewMeta: null,
  _lists: null,
  _sourceCache: null,
  _filterBox: null,
  _sourceFilter: null,
  _pHandleBrew: null,
  _lockHandleBrewJson: null,

  /**
   * @param options Options object.
   * @param [options.list] List.
   * @param [options.lists] Lists.
   * @param [options.filterBox] Filter box.
   * @param [options.sourceFilter] Source filter.
   * @param [options.pHandleBrew] Brew handling function.
   */
  bind(options) {
    // provide ref to List.js instance
    if (options.list) BrewUtil._lists = [options.list];
    else if (options.lists) BrewUtil._lists = options.lists;
    // provide ref to FilterBox and Filter instance
    if (options.filterBox) BrewUtil._filterBox = options.filterBox;
    if (options.sourceFilter) BrewUtil._sourceFilter = options.sourceFilter;
    // allow external source for handleBrew
    if (options.pHandleBrew !== undefined)
      this._pHandleBrew = options.pHandleBrew;
  },

  async pAddBrewData() {
    if (BrewUtil.homebrew) {
      return BrewUtil.homebrew;
    } else {
      try {
        const homebrew = (await StorageUtil.pGet(HOMEBREW_STORAGE)) || {};
        BrewUtil.homebrewMeta = StorageUtil.syncGet(HOMEBREW_META_STORAGE) || {
          sources: [],
        };
        BrewUtil.homebrewMeta.sources = BrewUtil.homebrewMeta.sources || [];

        BrewUtil.homebrew = homebrew;

        BrewUtil._resetSourceCache();

        return BrewUtil.homebrew;
      } catch (e) {
        BrewUtil.pPurgeBrew(e);
      }
    }
  },

  async pPurgeBrew(error) {
    JqueryUtil.doToast({
      content:
        'Error when loading homebrew! Purged homebrew data. (See the log for more information.)',
      type: 'danger',
    });
    await StorageUtil.pRemove(HOMEBREW_STORAGE);
    StorageUtil.syncRemove(HOMEBREW_META_STORAGE);
    BrewUtil.homebrew = null;
    window.location.hash = '';
    BrewUtil.homebrew = {};
    BrewUtil.homebrewMeta = { sources: [] };
    if (error)
      setTimeout(() => {
        throw error;
      });
  },

  async pAddLocalBrewData(
    callbackFn = async (d, page) => BrewUtil.pDoHandleBrewJson(d, page, null),
  ) {
    if (!IS_VTT && !IS_DEPLOYED) {
      const data = await DataUtil.loadJSON(
        `${Renderer.get().baseUrl}${JSON_HOMEBREW_INDEX}`,
      );
      // auto-load from `homebrew/`, for custom versions of the site
      if (data.toImport.length) {
        const page = UrlUtil.getCurrentPage();
        const allData = await Promise.all(
          data.toImport.map(it => DataUtil.loadJSON(`homebrew/${it}`)),
        );
        await Promise.all(allData.map(d => callbackFn(d, page)));
      }
    }
  },

  async _pRenderBrewScreen($appendTo, isModal, cbGetBrewOnClose) {
    const page = UrlUtil.getCurrentPage();

    const $brewList = $(`<div class="manbrew__current_brew flex-col h-100"/>`);

    await BrewUtil._pRenderBrewScreen_pRefreshBrewList($brewList);

    const $iptAdd = $(
      `<input multiple type="file" accept=".json" style="display: none;">`,
    ).change(evt => {
      const input = evt.target;

      let readIndex = 0;
      const reader = new FileReader();
      reader.onload = async () => {
        const json = JSON.parse(reader.result);

        await DataUtil.pDoMetaMerge(CryptUtil.uid(), json);

        await BrewUtil.pDoHandleBrewJson(
          json,
          page,
          BrewUtil._pRenderBrewScreen_pRefreshBrewList.bind(this, $brewList),
        );

        if (input.files[readIndex]) reader.readAsText(input.files[readIndex++]);
        else $(evt.target).val(''); // reset the input
      };
      reader.readAsText(input.files[readIndex++]);
    });

    const $btnLoadFromUrl = $(
      `<button class="btn btn-default btn-sm mr-2">Load from URL</button>`,
    ).click(async () => {
      const enteredUrl = await InputUiUtil.pGetUserString({
        title: 'Homebrew URL',
      });
      if (!enteredUrl || !enteredUrl.trim()) return;

      let parsedUrl;
      try {
        parsedUrl = new URL(enteredUrl);
      } catch (e) {
        JqueryUtil.doToast({
          content: `The provided URL does not appear to be valid.`,
          type: 'danger',
        });
        return;
      }
      BrewUtil.addBrewRemote(null, parsedUrl.href).catch(() => {
        JqueryUtil.doToast({
          content: 'Could not load homebrew from the provided URL.',
          type: 'danger',
        });
      });
    });

    const $btnGet = $(
      `<button class="btn btn-info btn-sm">Get Homebrew</button>`,
    ).click(async () => {
      const $btnAll = $(
        `<button class="btn btn-default btn-xs manbrew__load_all" disabled title="(Excluding samples)">Add All</button>`,
      );

      const $ulRows = $$`<ul class="list"><li><div class="lst__wrp-cells"><span style="font-style: italic;">Loading...</span></div></li></ul>`;

      const $iptSearch = $(
        `<input type="search" class="search manbrew__search form-control w-100" placeholder="Find homebrew...">`,
      ).keydown(evt => {
        switch (evt.which) {
          case 13: {
            // enter
            return $ulRows
              .find(`li`)
              .first()
              .find(`.manbrew__load_from_url`)
              .click();
          }
          case 40: {
            // down
            const firstItem = list.visibleItems[0];
            if (firstItem) firstItem.ele.focus();
          }
        }
      });

      const { $modalInner } = UiUtil.getShowModal({
        fullHeight: true,
        title: `Get Homebrew`,
        cbClose: () => {
          if (cbGetBrewOnClose) cbGetBrewOnClose();
        },
        isLarge: true,
        overlayColor: 'transparent',
      });

      $$($modalInner)`
                      <p><i>A list of homebrew available in the public repository. Click a name to load the homebrew, or view the source directly.<br>
                      Contributions are welcome; see the <a href="https://github.com/TheGiddyLimit/homebrew/blob/master/README.md" target="_blank" rel="noopener noreferrer">README</a>, or stop by our <a href="https://discord.gg/nGvRCDs" target="_blank" rel="noopener noreferrer">Discord</a>.</i></p>
                      <hr class="manbrew__hr">
                      <div class="manbrew__load_all_wrp">${$btnAll}</div>
                      ${$iptSearch}
                      <div class="filtertools manbrew__filtertools sortlabel btn-group lst__form-bottom">
                          <button class="col-4 sort btn btn-default btn-xs" data-sort="name">Name</button>
                          <button class="col-3 sort btn btn-default btn-xs" data-sort="author">Author</button>
                          <button class="col-1-2 sort btn btn-default btn-xs" data-sort="category">Category</button>
                          <button class="col-1-4 sort btn btn-default btn-xs" data-sort="modified">Modified</button>
                          <button class="col-1-4 sort btn btn-default btn-xs" data-sort="added">Added</button>
                          <button class="sort btn btn-default btn-xs" disabled>Source</button>
                      </div>
                      ${$ulRows}`;

      // populate list
      function getBrewDirs() {
        switch (page) {
          case UrlUtil.PG_SPELLS:
            return ['spell'];
          case UrlUtil.PG_CLASSES:
            return ['class', 'subclass'];
          case UrlUtil.PG_BESTIARY:
            return ['creature'];
          case UrlUtil.PG_BACKGROUNDS:
            return ['background'];
          case UrlUtil.PG_FEATS:
            return ['feat'];
          case UrlUtil.PG_OPT_FEATURES:
            return ['optionalfeature'];
          case UrlUtil.PG_RACES:
            return ['race', 'subrace'];
          case UrlUtil.PG_OBJECTS:
            return ['object'];
          case UrlUtil.PG_TRAPS_HAZARDS:
            return ['trap', 'hazard'];
          case UrlUtil.PG_DEITIES:
            return ['deity'];
          case UrlUtil.PG_ITEMS:
            return ['item', 'magicvariant'];
          case UrlUtil.PG_REWARDS:
            return ['reward'];
          case UrlUtil.PG_PSIONICS:
            return ['psionic'];
          case UrlUtil.PG_VARIATNRULES:
            return ['variantrule'];
          case UrlUtil.PG_CONDITIONS_DISEASES:
            return ['condition', 'disease'];
          case UrlUtil.PG_ADVENTURES:
            return ['adventure'];
          case UrlUtil.PG_BOOKS:
            return ['book'];
          case UrlUtil.PG_TABLES:
            return ['table'];
          case UrlUtil.PG_MAKE_SHAPED:
            return ['spell', 'creature'];
          case UrlUtil.PG_MANAGE_BREW:
          case UrlUtil.PG_MAKE_BREW:
          case UrlUtil.PG_DEMO_RENDER:
            return BrewUtil._DIRS;
          case UrlUtil.PG_VEHICLES:
            return ['vehicle'];
          case UrlUtil.PG_ACTIONS:
            return ['action'];
          case UrlUtil.PG_CULTS_BOONS:
            return ['cult', 'boon'];
          case UrlUtil.PG_LANGUAGES:
            return ['language'];
          default:
            throw new Error(
              `No homebrew directories defined for category ${page}`,
            );
        }
      }

      let dataList;
      function fnSort(a, b, o) {
        a = dataList[a.ix];
        b = dataList[b.ix];

        if (o.sortBy === 'name') return byName();
        if (o.sortBy === 'author')
          return orFallback(SortUtil.ascSortLower, '_brewAuthor');
        if (o.sortBy === 'category')
          return orFallback(SortUtil.ascSortLower, '_brewCat');
        if (o.sortBy === 'added')
          return orFallback(SortUtil.ascSort, '_brewAdded');
        if (o.sortBy === 'modified')
          return orFallback(SortUtil.ascSort, '_brewModified');

        function byName() {
          return SortUtil.ascSortLower(a._brewName, b._brewName);
        }
        function orFallback(func, prop) {
          return func(a[prop], b[prop]) || byName();
        }
      }

      const urlRoot = await StorageUtil.pGet(`HOMEBREW_CUSTOM_REPO_URL`);
      const timestamps = await DataUtil.brew.pLoadTimestamps(urlRoot);
      const collectionIndex = await DataUtil.brew.pLoadCollectionIndex(urlRoot);
      const collectionFiles = (() => {
        const dirs = new Set(
          getBrewDirs().map(dir => BrewUtil._pRenderBrewScreen_dirToCat(dir)),
        );
        return Object.keys(collectionIndex).filter(k =>
          collectionIndex[k].find(it => dirs.has(it)),
        );
      })();

      const toLoads = getBrewDirs().map(it => ({
        url: DataUtil.brew.getDirUrl(it, urlRoot),
        _cat: BrewUtil._pRenderBrewScreen_dirToCat(it),
      }));
      if (collectionFiles.length)
        toLoads.push({
          url: DataUtil.brew.getDirUrl('collection', urlRoot),
          _collection: true,
          _cat: 'collection',
        });

      const jsonStack = (
        await Promise.all(
          toLoads.map(async toLoad => {
            const json = await DataUtil.loadJSON(toLoad.url);
            if (toLoad._collection)
              json
                .filter(
                  it =>
                    it.name === 'index.json' ||
                    !collectionFiles.includes(it.name),
                )
                .forEach(it => (it._brewSkip = true));
            json.forEach(it => (it._cat = toLoad._cat));
            return json;
          }),
        )
      ).flat();

      const all = jsonStack.flat();
      all.forEach(it => {
        const cleanFilename = it.name.trim().replace(/\.json$/, '');
        const spl = cleanFilename.split(';').map(it => it.trim());
        if (spl.length > 1) {
          it._brewName = spl[1];
          it._brewAuthor = spl[0];
        } else {
          it._brewName = cleanFilename;
          it._brewAuthor = '';
        }
      });
      all.sort((a, b) => SortUtil.ascSortLower(a._brewName, b._brewName));

      const list = new List({
        $iptSearch,
        $wrpList: $ulRows,
        fnSort,
        isUseJquery: true,
      });
      SortUtil.initBtnSortHandlers(
        $modalInner.find('.manbrew__filtertools'),
        list,
      );

      dataList = all.filter(it => !it._brewSkip);
      dataList.forEach((it, i) => {
        it._brewAdded = (timestamps[it.path] || {}).a || 0;
        it._brewModified = (timestamps[it.path] || {}).m || 0;
        it._brewCat = BrewUtil._pRenderBrewScreen_getDisplayCat(
          BrewUtil._pRenderBrewScreen_dirToCat(it._cat),
        );

        const timestampAdded = it._brewAdded
          ? MiscUtil.dateToStr(new Date(it._brewAdded * 1000), true)
          : '';
        const timestampModified = it._brewModified
          ? MiscUtil.dateToStr(new Date(it._brewModified * 1000), true)
          : '';

        const $btnAdd = $(
          `<span class="col-4 font-bold manbrew__load_from_url pl-0 clickable"/>`,
        )
          .text(it._brewName)
          .click(() =>
            BrewUtil.addBrewRemote($btnAdd, it.download_url || '', true),
          );

        const $li = $$`<li class="not-clickable lst--border lst__row--focusable" tabindex="1">
                          <div class="lst__wrp-cells">
                              ${$btnAdd}
                              <span class="col-3">${it._brewAuthor}</span>
                              <span class="col-1-2 text-center">${it._brewCat}</span>
                              <span class="col-1-4 text-center">${timestampModified}</span>
                              <span class="col-1-4 text-center">${timestampAdded}</span>
                              <span class="col-1 manbrew__source text-center pr-0"><a href="${it.download_url}" target="_blank" rel="noopener noreferrer">View Raw</a></span>
                          </div>
                      </li>`;

        $li.keydown(evt => {
          switch (evt.which) {
            case 13: {
              // enter
              return $btnAdd.click();
            }
            case 38: {
              // up
              const ixCur = list.visibleItems.indexOf(listItem);
              if (~ixCur) {
                const prevItem = list.visibleItems[ixCur - 1];
                if (prevItem) prevItem.ele.focus();
              } else {
                const firstItem = list.visibleItems[0];
                if (firstItem) firstItem.ele.focus();
              }
              return;
            }
            case 40: {
              // down
              const ixCur = list.visibleItems.indexOf(listItem);
              if (~ixCur) {
                const nxtItem = list.visibleItems[ixCur + 1];
                if (nxtItem) nxtItem.ele.focus();
              } else {
                const lastItem = list.visibleItems.last();
                if (lastItem) lastItem.ele.focus();
              }
            }
          }
        });

        const listItem = new ListItem(
          i,
          $li,
          it._brewName,
          {
            author: it._brewAuthor,
            category: it._brewCat,
            added: timestampAdded,
            modified: timestampAdded,
          },
          {
            $btnAdd,
            isSample: it._brewAuthor.toLowerCase().startsWith('sample -'),
          },
        );
        list.addItem(listItem);
      });

      list.init();

      ListUtil.bindEscapeKey(list, $iptSearch, true);

      $btnAll
        .prop('disabled', false)
        .click(() =>
          list.visibleItems
            .filter(it => !it.data.isSample)
            .forEach(it => it.data.$btnAdd.click()),
        );

      $iptSearch.focus();
    });

    const $btnCustomUrl = $(
      `<button class="btn btn-info btn-sm px-2" title="Set Custom Repository URL"><span class="glyphicon glyphicon-cog"/></button>`,
    ).click(async () => {
      const customBrewUtl = await StorageUtil.pGet(`HOMEBREW_CUSTOM_REPO_URL`);

      const nxtUrl = await InputUiUtil.pGetUserString({
        title: 'Homebrew Repository URL (Blank for Default)',
        default: customBrewUtl,
      });

      if (nxtUrl == null) await StorageUtil.pRemove(`HOMEBREW_CUSTOM_REPO_URL`);
      else await StorageUtil.pSet(`HOMEBREW_CUSTOM_REPO_URL`, nxtUrl);
    });

    const $btnDelAll = isModal ? null : BrewUtil._$getBtnDeleteAll();

    const $wrpBtns = $$`<div class="flex-vh-center no-shrink">
              <div class="flex-v-center btn-group mr-2">
                  ${$btnGet}
                  ${$btnCustomUrl}
              </div>
              <label role="button" class="btn btn-default btn-sm btn-file mr-2">Upload File${$iptAdd}</label>
              ${$btnLoadFromUrl}
              <a href="https://github.com/TheGiddyLimit/homebrew" class="flex-v-center" target="_blank" rel="noopener noreferrer"><button class="btn btn-default btn-sm btn-file">Browse Source Repository</button></a>
              ${$btnDelAll}
          </div>`;

    if (isModal) {
      $$($appendTo)`
              <hr class="manbrew__hr no-shrink">
              ${$brewList}
              <div class="mb-3 text-center no-shrink">${$wrpBtns}</div>
          `;
    } else {
      $$($appendTo)`
              <div class="mb-3 text-center no-shrink">${$wrpBtns}</div>
              <hr class="manbrew__hr no-shrink">
              ${$brewList}
          `;
    }

    BrewUtil.addBrewRemote = async ($ele, jsonUrl, doUnescape) => {
      let cached;
      if ($ele) {
        cached = $ele.html();
        $ele.text('Loading...');
      }
      if (doUnescape) jsonUrl = jsonUrl.unescapeQuotes();
      const data = await DataUtil.loadJSON(
        `${jsonUrl}?${new Date().getTime()}`,
      );
      await BrewUtil.pDoHandleBrewJson(
        data,
        page,
        BrewUtil._pRenderBrewScreen_pRefreshBrewList.bind(this, $brewList),
      );
      if ($ele) {
        $ele.text('Done!');
        setTimeout(() => $ele.html(cached), 500);
      }
    };
  },

  _$getBtnDeleteAll(isModal) {
    return $(
      `<button class="btn ${
        isModal ? 'btn-xs' : 'btn-sm ml-2'
      } btn-danger">Delete All</button>`,
    ).click(async () => {
      if (!window.confirm('Are you sure?')) return;
      await StorageUtil.pSet(HOMEBREW_STORAGE, {});
      StorageUtil.syncSet(HOMEBREW_META_STORAGE, {});
      window.location.hash = '';
      location.reload();
    });
  },

  async _pCleanSaveBrew() {
    const cpy = MiscUtil.copy(BrewUtil.homebrew);
    BrewUtil._STORABLE.forEach(prop => {
      (BrewUtil.homebrew[prop] || []).forEach(ent => {
        Object.keys(ent)
          .filter(k => k.startsWith('_'))
          .forEach(k => delete ent[k]);
      });
    });
    await StorageUtil.pSet(HOMEBREW_STORAGE, cpy);
  },

  async _pRenderBrewScreen_pDeleteSource(
    $brewList,
    source,
    doConfirm,
    isAllSources,
  ) {
    if (
      doConfirm &&
      !window.confirm(
        `Are you sure you want to remove all homebrew${
          !isAllSources
            ? ` with${
                source
                  ? ` source "${Parser.sourceJsonToFull(source)}"`
                  : `out a source`
              }`
            : ''
        }?`,
      )
    )
      return;

    const vetoolsSourceSet = new Set(
      BrewUtil._getActiveVetoolsSources().map(it => it.json),
    );
    const isMatchingSource = itSrc =>
      isAllSources ||
      itSrc === source ||
      (source === undefined &&
        !vetoolsSourceSet.has(itSrc) &&
        !BrewUtil.hasSourceJson(itSrc));

    await Promise.all(
      BrewUtil._getBrewCategories().map(async k => {
        const cat = BrewUtil.homebrew[k];
        const pDeleteFn = BrewUtil._getPDeleteFunction(k);
        const toDel = [];
        cat
          .filter(it => isMatchingSource(it.source))
          .forEach(it => toDel.push(it.uniqueId));
        await Promise.all(toDel.map(async uId => pDeleteFn(uId)));
      }),
    );
    if (BrewUtil._lists) BrewUtil._lists.forEach(l => l.update());
    BrewUtil._persistHomebrewDebounced();
    BrewUtil.removeJsonSource(source);
    if (UrlUtil.getCurrentPage() === UrlUtil.PG_MAKE_SHAPED)
      removeBrewSource(source);
    // remove the source from the filters and re-render the filter box
    if (BrewUtil._sourceFilter) BrewUtil._sourceFilter.removeItem(source);
    if (BrewUtil._filterBox) BrewUtil._filterBox.render();
    await BrewUtil._pRenderBrewScreen_pRefreshBrewList($brewList);
    window.location.hash = '';
    if (BrewUtil._filterBox) BrewUtil._filterBox.fireChangeEvent();
  },

  async _pRenderBrewScreen_pRefreshBrewList($brewList) {
    function showSourceManager(source, showAll) {
      const $wrpBtnDel = $(`<div class="flex-v-center"/>`);

      const { $modalInner, doClose } = UiUtil.getShowModal({
        fullHeight: true,
        title: `View/Manage ${
          source
            ? `Source Contents: ${Parser.sourceJsonToFull(source)}`
            : showAll
            ? 'Entries from All Sources'
            : `Entries with No Source`
        }`,
        isLarge: true,
        overlayColor: 'transparent',
        titleSplit: $wrpBtnDel,
      });

      const $cbAll = $(`<input type="checkbox">`);
      const $ulRows = $$`<ul class="list"/>`;
      const $iptSearch = $(
        `<input type="search" class="search manbrew__search form-control w-100" placeholder="Search entries...">`,
      );
      $$($modalInner)`
                  ${$iptSearch}
                  <div class="filtertools manbrew__filtertools sortlabel btn-group">
                      <button class="col-6 sort btn btn-default btn-xs" data-sort="name">Name</button>
                      <button class="col-5 sort btn btn-default btn-xs" data-sort="category">Category</button>
                      <label class="col-1 wrp-cb-all pr-0">${$cbAll}</label>
                  </div>
                  ${$ulRows}`;

      let list;

      // populate list
      function populateList() {
        $ulRows.empty();

        list = new List({
          $iptSearch,
          $wrpList: $ulRows,
          fnSort: SortUtil.listSort,
        });

        function mapCategoryEntry(cat, bru) {
          const out = {};
          out.name = bru.name;
          out.uniqueId = bru.uniqueId;
          out.extraInfo = '';
          switch (cat) {
            case 'subclass':
              out.extraInfo = ` (${bru.class})`;
              break;
            case 'subrace':
              out.extraInfo = ` (${(bru.race || {}).name})`;
              break;
            case 'psionic':
              out.extraInfo = ` (${Parser.psiTypeToMeta(bru.type).short})`;
              break;
            case 'itemProperty': {
              if (bru.entries) out.name = Renderer.findName(bru.entries);
              if (!out.name) out.name = bru.abbreviation;
              break;
            }
            case 'adventureData':
            case 'bookData': {
              const assocData = {
                adventureData: 'adventure',
                bookData: 'book',
              };
              out.name =
                (
                  (BrewUtil.homebrew[assocData[cat]] || []).find(
                    a => a.id === bru.id,
                  ) || {}
                ).name || bru.id;
            }
          }
          out.name = out.name || `(Unknown)`;
          return out;
        }

        const vetoolsSourceSet = new Set(
          BrewUtil._getActiveVetoolsSources().map(it => it.json),
        );

        const isMatchingSource = itSrc =>
          showAll ||
          itSrc === source ||
          (source === undefined &&
            !vetoolsSourceSet.has(itSrc) &&
            !BrewUtil.hasSourceJson(itSrc));
        BrewUtil._getBrewCategories().forEach(cat => {
          BrewUtil.homebrew[cat]
            .filter(it => isMatchingSource(it.source))
            .map(it => mapCategoryEntry(cat, it))
            .sort((a, b) => SortUtil.ascSort(a.name, b.name))
            .forEach((it, i) => {
              const dispCat = BrewUtil._pRenderBrewScreen_getDisplayCat(
                cat,
                true,
              );

              const eleLi = $(`<li class="lst--border"><label class="mb-0 flex-v-center row">
                                      <span class="col-6 font-bold">${it.name}</span>
                                      <span class="col-5 text-center">${dispCat}${it.extraInfo}</span>
                                      <span class="pr-0 col-1 text-center"><input type="checkbox"></span>
                                  </label></li>`)[0];

              const listItem = new ListItem(
                i,
                eleLi,
                it.name,
                {
                  category: dispCat,
                  category_raw: cat,
                },
                { uniqueId: it.uniqueId },
              );
              list.addItem(listItem);
            });
        });
        $ulRows.empty();

        list.init();
        if (!list.items.length)
          $ulRows.append(`<h5 class="text-center">No results found.</h5>`);
        ListUtil.bindEscapeKey(list, $iptSearch, true);
      }
      populateList();

      $cbAll.change(function() {
        const val = this.checked;
        list.items.forEach(it =>
          $(it.ele)
            .find(`input`)
            .prop('checked', val),
        );
      });
      $(`<button class="btn btn-danger btn-xs">Delete Selected</button>`)
        .on('click', async () => {
          const toDel = list.items
            .filter(it =>
              $(it.ele)
                .find(`input`)
                .prop('checked'),
            )
            .map(it => ({ ...it.values, ...it.data }));

          if (!toDel.length) return;
          if (!window.confirm('Are you sure?')) return;

          if (toDel.length === list.items.length) {
            await BrewUtil._pRenderBrewScreen_pDeleteSource(
              $brewList,
              source,
              false,
              false,
            );
            doClose();
          } else {
            await Promise.all(
              toDel.map(async it => {
                const pDeleteFn = BrewUtil._getPDeleteFunction(it.category_raw);
                await pDeleteFn(it.uniqueId);
              }),
            );
            if (BrewUtil._lists) BrewUtil._lists.forEach(l => l.update());
            BrewUtil._persistHomebrewDebounced();
            populateList();
            await BrewUtil._pRenderBrewScreen_pRefreshBrewList($brewList);
            window.location.hash = '';
          }
        })
        .appendTo($wrpBtnDel);

      $iptSearch.focus();
    }

    $brewList.empty();
    if (BrewUtil.homebrew) {
      const $iptSearch = $(
        `<input type="search" class="search manbrew__search form-control" placeholder="Search active homebrew...">`,
      );
      const $wrpList = $(
        `<ul class="list-display-only brew-list brew-list--target manbrew__list"></ul>`,
      );
      const $ulGroup = $(
        `<ul class="list-display-only brew-list brew-list--groups no-shrink" style="height: initial;"></ul>`,
      );

      const list = new List({ $iptSearch, $wrpList, isUseJquery: true });

      const $lst = $$`
                  <div class="flex-col h-100">
                      ${$iptSearch}
                      <div class="filtertools manbrew__filtertools sortlabel btn-group lst__form-bottom">
                          <button class="col-5 sort btn btn-default btn-xs" data-sort="source">Source</button>
                          <button class="col-4 sort btn btn-default btn-xs" data-sort="authors">Authors</button>
                          <button class="col-1 btn btn-default btn-xs" disabled>Origin</button>
                          <button class="btn btn-default btn-xs" disabled>&nbsp;</button>
                      </div>
                      <div class="flex w-100 h-100 overflow-y-auto relative">${$wrpList}</div>
                  </div>
              `.appendTo($brewList);
      $ulGroup.appendTo($brewList);
      SortUtil.initBtnSortHandlers($lst.find('.manbrew__filtertools'), list);

      const createButtons = (src, $row) => {
        const $btns = $(`<span class="col-2 text-right"/>`).appendTo($row);
        $(`<button class="btn btn-sm btn-default">View/Manage</button>`)
          .on('click', () => {
            showSourceManager(src.json, src._all);
          })
          .appendTo($btns);
        $btns.append(' ');
        $(
          `<button class="btn btn-danger btn-sm"><span class="glyphicon glyphicon-trash"></span></button>`,
        )
          .on('click', () =>
            BrewUtil._pRenderBrewScreen_pDeleteSource(
              $brewList,
              src.json,
              true,
              src._all,
            ),
          )
          .appendTo($btns);
      };

      const page = UrlUtil.getCurrentPage();
      const isSourceRelevantForCurrentPage = source => {
        const getPageCats = () => {
          switch (page) {
            case UrlUtil.PG_SPELLS:
              return ['spell'];
            case UrlUtil.PG_CLASSES:
              return ['class', 'subclass'];
            case UrlUtil.PG_BESTIARY:
              return ['monster', 'legendaryGroup', 'monsterFluff'];
            case UrlUtil.PG_BACKGROUNDS:
              return ['background'];
            case UrlUtil.PG_FEATS:
              return ['feat'];
            case UrlUtil.PG_OPT_FEATURES:
              return ['optionalfeature'];
            case UrlUtil.PG_RACES:
              return ['race', 'raceFluff', 'subrace'];
            case UrlUtil.PG_OBJECTS:
              return ['object'];
            case UrlUtil.PG_TRAPS_HAZARDS:
              return ['trap', 'hazard'];
            case UrlUtil.PG_DEITIES:
              return ['deity'];
            case UrlUtil.PG_ITEMS:
              return [
                'item',
                'baseitem',
                'variant',
                'itemProperty',
                'itemType',
              ];
            case UrlUtil.PG_REWARDS:
              return ['reward'];
            case UrlUtil.PG_PSIONICS:
              return ['psionic'];
            case UrlUtil.PG_VARIATNRULES:
              return ['variantrule'];
            case UrlUtil.PG_CONDITIONS_DISEASES:
              return ['condition', 'disease'];
            case UrlUtil.PG_ADVENTURES:
              return ['adventure', 'adventureData'];
            case UrlUtil.PG_BOOKS:
              return ['book', 'bookData'];
            case UrlUtil.PG_TABLES:
              return ['table', 'tableGroup'];
            case UrlUtil.PG_MAKE_SHAPED:
              return ['spell', 'creature'];
            case UrlUtil.PG_MANAGE_BREW:
            case UrlUtil.PG_MAKE_BREW:
            case UrlUtil.PG_DEMO_RENDER:
              return BrewUtil._STORABLE;
            case UrlUtil.PG_VEHICLES:
              return ['vehicle'];
            case UrlUtil.PG_ACTIONS:
              return ['action'];
            case UrlUtil.PG_CULTS_BOONS:
              return ['cult', 'boon'];
            case UrlUtil.PG_LANGUAGES:
              return ['language'];
            default:
              throw new Error(
                `No homebrew properties defined for category ${page}`,
              );
          }
        };

        const cats = getPageCats();
        return !!cats.find(
          cat =>
            !!(BrewUtil.homebrew[cat] || []).some(
              entry => entry.source === source,
            ),
        );
      };

      const brewSources = MiscUtil.copy(BrewUtil.getJsonSources()).filter(src =>
        isSourceRelevantForCurrentPage(src.json),
      );
      brewSources.sort((a, b) => SortUtil.ascSort(a.full, b.full));

      brewSources.forEach((src, i) => {
        const validAuthors = (!src.authors
          ? []
          : !(src.authors instanceof Array)
          ? []
          : src.authors
        ).join(', ');
        const isGroup = src._unknown || src._all;

        const $row = $(`<li class="row manbrew__row lst--border">
                          <span class="col-5 manbrew__col--tall source manbrew__source">${
                            isGroup ? '<i>' : ''
                          }${src.full}${isGroup ? '</i>' : ''}</span>
                          <span class="col-4 manbrew__col--tall authors">${validAuthors}</span>
                          <${
                            src.url ? 'a' : 'span'
                          } class="col-1 manbrew__col--tall text-center" ${
          src.url
            ? `href="${src.url}" target="_blank" rel="noopener noreferrer"`
            : ''
        }>${src.url ? 'View Source' : ''}</${src.url ? 'a' : 'span'}>
                          <span class="hidden">${src.abbreviation}</span>
                      </li>`);
        createButtons(src, $row);

        const listItem = new ListItem(i, $row, src.full, {
          authors: validAuthors,
          abbreviation: src.abbreviation,
        });
        list.addItem(listItem);
      });

      const createGroupRow = (fullText, modeProp) => {
        const $row = $(`<li class="row manbrew__row">
                      <span class="col-10 manbrew__col--tall source manbrew__source text-right"><i>${fullText}</i></span>
                  </li>`);
        createButtons({ [modeProp]: true }, $row);
        $ulGroup.append($row);
      };
      createGroupRow('Entries From All Sources', '_all');
      createGroupRow('Entries Without Sources', '_unknown');

      list.init();
      ListUtil.bindEscapeKey(list, $iptSearch, true);
      $iptSearch.focus();
    }
  },

  _pRenderBrewScreen_dirToCat(dir) {
    if (!dir) return '';
    else if (BrewUtil._STORABLE.includes(dir)) return dir;
    else {
      switch (dir) {
        case 'creature':
          return 'monster';
        case 'collection':
          return dir;
        case 'magicvariant':
          return 'variant';
      }
      throw new Error(`Directory was not mapped to a category: "${dir}"`);
    }
  },

  _pRenderBrewScreen_getDisplayCat(cat, isManager) {
    if (cat === 'variantrule') return 'Variant Rule';
    if (cat === 'legendaryGroup') return 'Legendary Group';
    if (cat === 'optionalfeature') return 'Optional Feature';
    if (cat === 'adventure')
      return isManager ? 'Adventure Contents/Info' : 'Adventure';
    if (cat === 'adventureData') return 'Adventure Text';
    if (cat === 'book') return isManager ? 'Book Contents/Info' : 'Book';
    if (cat === 'bookData') return 'Book Text';
    if (cat === 'itemProperty') return 'Item Property';
    if (cat === 'baseitem') return 'Base Item';
    if (cat === 'variant') return 'Magic Item Variant';
    if (cat === 'monsterFluff') return 'Monster Fluff';
    return cat.uppercaseFirst();
  },

  handleLoadbrewClick: async (ele, jsonUrl, name) => {
    const $ele = $(ele);
    if (!$ele.hasClass('rd__wrp-loadbrew--ready')) return; // an existing click is being handled
    const cached = $ele.html();
    const cachedTitle = $ele.title();
    $ele.title('');
    $ele
      .removeClass('rd__wrp-loadbrew--ready')
      .html(
        `${name}<span class="glyphicon glyphicon-refresh rd__loadbrew-icon rd__loadbrew-icon--active"/>`,
      );
    jsonUrl = jsonUrl.unescapeQuotes();
    const data = await DataUtil.loadJSON(`${jsonUrl}?${new Date().getTime()}`);
    await BrewUtil.pDoHandleBrewJson(data, UrlUtil.getCurrentPage());
    $ele.html(
      `${name}<span class="glyphicon glyphicon-saved rd__loadbrew-icon"/>`,
    );
    setTimeout(
      () =>
        $ele
          .html(cached)
          .addClass('rd__wrp-loadbrew--ready')
          .title(cachedTitle),
      500,
    );
  },

  async _pDoRemove(arrName, uniqueId, isChild) {
    function getIndex(arrName, uniqueId, isChild) {
      return BrewUtil.homebrew[arrName].findIndex(it =>
        isChild ? it.parentUniqueId : it.uniqueId === uniqueId,
      );
    }

    const index = getIndex(arrName, uniqueId, isChild);
    if (~index) {
      BrewUtil.homebrew[arrName].splice(index, 1);
      if (BrewUtil._lists) {
        BrewUtil._lists.forEach(l =>
          l.removeItemByData(isChild ? 'parentuniqueId' : 'uniqueId', uniqueId),
        );
      }
    }
  },

  _getPDeleteFunction(category) {
    switch (category) {
      case 'spell':
      case 'monster':
      case 'monsterFluff':
      case 'background':
      case 'feat':
      case 'optionalfeature':
      case 'race':
      case 'raceFluff':
      case 'subrace':
      case 'object':
      case 'trap':
      case 'hazard':
      case 'deity':
      case 'item':
      case 'baseitem':
      case 'variant':
      case 'itemType':
      case 'itemProperty':
      case 'reward':
      case 'psionic':
      case 'variantrule':
      case 'legendaryGroup':
      case 'condition':
      case 'disease':
      case 'table':
      case 'tableGroup':
      case 'vehicle':
      case 'action':
      case 'cult':
      case 'boon':
      case 'language':
        return BrewUtil._genPDeleteGenericBrew(category);
      case 'subclass':
        return BrewUtil._pDeleteSubclassBrew;
      case 'class':
        return BrewUtil._pDeleteClassBrew;
      case 'adventure':
      case 'book':
        return BrewUtil._genPDeleteGenericBookBrew(category);
      case 'adventureData':
      case 'bookData':
        return () => {}; // Do nothing, handled by deleting the associated book/adventure
      default:
        throw new Error(
          `No homebrew delete function defined for category ${category}`,
        );
    }
  },

  async _pDeleteClassBrew(uniqueId) {
    await BrewUtil._pDoRemove('class', uniqueId);
  },

  async _pDeleteSubclassBrew(uniqueId) {
    let subClass;
    let index = 0;
    for (; index < BrewUtil.homebrew.subclass.length; ++index) {
      if (BrewUtil.homebrew.subclass[index].uniqueId === uniqueId) {
        subClass = BrewUtil.homebrew.subclass[index];
        break;
      }
    }
    if (subClass) {
      const forClass = subClass.class;
      BrewUtil.homebrew.subclass.splice(index, 1);
      BrewUtil._persistHomebrewDebounced();

      // FIXME
      if (typeof ClassData !== 'undefined') {
        const c = ClassData.classes.find(
          c => c.name.toLowerCase() === forClass.toLowerCase(),
        );

        const indexInClass = c.subclasses.findIndex(
          it => it.uniqueId === uniqueId,
        );
        if (~indexInClass) {
          c.subclasses.splice(indexInClass, 1);
          c.subclasses = c.subclasses.sort((a, b) =>
            SortUtil.ascSort(a.name, b.name),
          );
        }
      }
    }
  },

  _genPDeleteGenericBrew(category) {
    return async uniqueId => {
      await BrewUtil._pDoRemove(category, uniqueId);
    };
  },

  _genPDeleteGenericBookBrew(category) {
    return async uniqueId => {
      await BrewUtil._pDoRemove(category, uniqueId);
      await BrewUtil._pDoRemove(`${category}Data`, uniqueId, true);
    };
  },

  manageBrew: () => {
    const { $modalInner } = UiUtil.getShowModal({
      fullHeight: true,
      title: `Manage Homebrew`,
      isLarge: true,
      titleSplit: BrewUtil._$getBtnDeleteAll(true),
    });

    BrewUtil._pRenderBrewScreen($modalInner, true);
  },

  async pAddEntry(prop, obj) {
    BrewUtil._mutUniqueId(obj);
    (BrewUtil.homebrew[prop] = BrewUtil.homebrew[prop] || []).push(obj);
    BrewUtil._persistHomebrewDebounced();
    return BrewUtil.homebrew[prop].length - 1;
  },

  async pRemoveEntry(prop, obj) {
    const ix = (BrewUtil.homebrew[prop] =
      BrewUtil.homebrew[prop] || []).findIndex(
      it => it.uniqueId === obj.uniqueId,
    );
    if (~ix) {
      BrewUtil.homebrew[prop].splice(ix, 1);
      BrewUtil._persistHomebrewDebounced();
    } else
      throw new Error(
        `Could not find object with ID "${obj.uniqueId}" in "${prop}" list`,
      );
  },

  getEntryIxByName(prop, obj) {
    return (BrewUtil.homebrew[prop] = BrewUtil.homebrew[prop] || []).findIndex(
      it => it.name === obj.name && it.source === obj.source,
    );
  },

  async pUpdateEntryByIx(prop, ix, obj) {
    if (~ix && ix < BrewUtil.homebrew[prop].length) {
      BrewUtil._mutUniqueId(obj);
      BrewUtil.homebrew[prop].splice(ix, 1, obj);
      BrewUtil._persistHomebrewDebounced();
    } else throw new Error(`Index "${ix}" was not valid!`);
  },

  _mutUniqueId(obj) {
    delete obj.uniqueId; // avoid basing the hash on the previous hash
    obj.uniqueId = CryptUtil.md5(JSON.stringify(obj));
  },

  _DIRS: [
    'action',
    'adventure',
    'background',
    'book',
    'boon',
    'class',
    'condition',
    'creature',
    'cult',
    'deity',
    'disease',
    'feat',
    'hazard',
    'item',
    'language',
    'magicvariant',
    'object',
    'optionalfeature',
    'psionic',
    'race',
    'reward',
    'spell',
    'subclass',
    'subrace',
    'table',
    'trap',
    'variantrule',
    'vehicle',
  ],
  _STORABLE: [
    'class',
    'subclass',
    'spell',
    'monster',
    'legendaryGroup',
    'monsterFluff',
    'background',
    'feat',
    'optionalfeature',
    'race',
    'raceFluff',
    'subrace',
    'deity',
    'item',
    'baseitem',
    'variant',
    'itemProperty',
    'itemType',
    'psionic',
    'reward',
    'object',
    'trap',
    'hazard',
    'variantrule',
    'condition',
    'disease',
    'adventure',
    'adventureData',
    'book',
    'bookData',
    'table',
    'tableGroup',
    'vehicle',
    'action',
    'cult',
    'boon',
    'language',
  ],
  async pDoHandleBrewJson(json, page, pFuncRefresh) {
    await BrewUtil._lockHandleBrewJson.pLock();
    try {
      return BrewUtil._pDoHandleBrewJson(json, page, pFuncRefresh);
    } finally {
      BrewUtil._lockHandleBrewJson.unlock();
    }
  },

  async _pDoHandleBrewJson(json, page, pFuncRefresh) {
    function storePrep(arrName) {
      if (json[arrName]) {
        json[arrName].forEach(it => BrewUtil._mutUniqueId(it));
      } else json[arrName] = [];
    }

    // prepare for storage
    if (json.race && json.race.length)
      json.race = Renderer.race.mergeSubraces(json.race);
    BrewUtil._STORABLE.forEach(storePrep);

    const bookPairs = [
      ['adventure', 'adventureData'],
      ['book', 'bookData'],
    ];
    bookPairs.forEach(([bookMetaKey, bookDataKey]) => {
      if (json[bookMetaKey] && json[bookDataKey]) {
        json[bookMetaKey].forEach(book => {
          const data = json[bookDataKey].find(it => it.id === book.id);
          if (data) {
            data.parentUniqueId = book.uniqueId;
          }
        });
      }
    });

    // store
    async function pCheckAndAdd(prop) {
      if (!BrewUtil.homebrew[prop]) BrewUtil.homebrew[prop] = [];
      if (IS_DEPLOYED) {
        // in production mode, skip any existing brew
        const areNew = [];
        const existingIds = BrewUtil.homebrew[prop].map(it => it.uniqueId);
        json[prop].forEach(it => {
          if (!existingIds.find(id => it.uniqueId === id)) {
            BrewUtil.homebrew[prop].push(it);
            areNew.push(it);
          }
        });
        return areNew;
      } else {
        // in development mode, replace any existing brew
        const existing = {};
        BrewUtil.homebrew[prop].forEach(it => {
          existing[it.source] = existing[it.source] || {};
          existing[it.source][it.name] = it.uniqueId;
        });
        const pDeleteFn = BrewUtil._getPDeleteFunction(prop);
        await Promise.all(
          json[prop].map(async it => {
            // Handle magic variants
            const itSource =
              it.inherits && it.inherits.source
                ? it.inherits.source
                : it.source;
            if (existing[itSource] && existing[itSource][it.name]) {
              await pDeleteFn(existing[itSource][it.name]);
            }
            BrewUtil.homebrew[prop].push(it);
          }),
        );
        return json[prop];
      }
    }

    function checkAndAddMetaGetNewSources() {
      const areNew = [];
      if (json._meta) {
        if (!BrewUtil.homebrewMeta) BrewUtil.homebrewMeta = { sources: [] };

        Object.keys(json._meta).forEach(k => {
          switch (k) {
            case 'dateAdded':
            case 'dateLastModified':
              break;
            case 'sources': {
              const existing = BrewUtil.homebrewMeta.sources.map(
                src => src.json,
              );
              json._meta.sources.forEach(src => {
                if (!existing.find(it => it === src.json)) {
                  BrewUtil.homebrewMeta.sources.push(src);
                  areNew.push(src);
                }
              });
              break;
            }
            default: {
              BrewUtil.homebrewMeta[k] = BrewUtil.homebrewMeta[k] || {};
              Object.assign(BrewUtil.homebrewMeta[k], json._meta[k]);
              break;
            }
          }
        });
      }
      return areNew;
    }

    let sourcesToAdd = json._meta ? json._meta.sources : [];
    const toAdd = {};
    BrewUtil._STORABLE.forEach(k => (toAdd[k] = json[k]));
    BrewUtil.homebrew = BrewUtil.homebrew || {};
    sourcesToAdd = checkAndAddMetaGetNewSources(); // adding source(s) to Filter should happen in per-page addX functions
    await Promise.all(
      BrewUtil._STORABLE.map(async k => (toAdd[k] = await pCheckAndAdd(k))),
    ); // only add if unique ID not already present
    BrewUtil._persistHomebrewDebounced(); // Debounce this for mass adds, e.g. "Add All"
    StorageUtil.syncSet(HOMEBREW_META_STORAGE, BrewUtil.homebrewMeta);

    // wipe old cache
    BrewUtil._resetSourceCache();

    // display on page
    switch (page) {
      case UrlUtil.PG_SPELLS:
      case UrlUtil.PG_CLASSES:
      case UrlUtil.PG_BESTIARY:
      case UrlUtil.PG_BACKGROUNDS:
      case UrlUtil.PG_FEATS:
      case UrlUtil.PG_OPT_FEATURES:
      case UrlUtil.PG_RACES:
      case UrlUtil.PG_OBJECTS:
      case UrlUtil.PG_TRAPS_HAZARDS:
      case UrlUtil.PG_DEITIES:
      case UrlUtil.PG_ITEMS:
      case UrlUtil.PG_REWARDS:
      case UrlUtil.PG_PSIONICS:
      case UrlUtil.PG_VARIATNRULES:
      case UrlUtil.PG_CONDITIONS_DISEASES:
      case UrlUtil.PG_ADVENTURE:
      case UrlUtil.PG_ADVENTURES:
      case UrlUtil.PG_BOOK:
      case UrlUtil.PG_BOOKS:
      case UrlUtil.PG_MAKE_SHAPED:
      case UrlUtil.PG_TABLES:
      case UrlUtil.PG_VEHICLES:
      case UrlUtil.PG_ACTIONS:
      case UrlUtil.PG_CULTS_BOONS:
      case UrlUtil.PG_LANGUAGES:
        await (BrewUtil._pHandleBrew || handleBrew)(MiscUtil.copy(toAdd));
        break;
      case UrlUtil.PG_MANAGE_BREW:
      case UrlUtil.PG_MAKE_BREW:
      case UrlUtil.PG_DEMO_RENDER:
      case 'NO_PAGE':
        break;
      default:
        throw new Error(
          `No homebrew add function defined for category ${page}`,
        );
    }

    if (pFuncRefresh) await pFuncRefresh();

    if (BrewUtil._filterBox && BrewUtil._sourceFilter) {
      const cur = BrewUtil._filterBox.getValues();
      if (cur.Source) {
        const toSet = JSON.parse(JSON.stringify(cur.Source));

        if (toSet._totals.yes || toSet._totals.no) {
          if (page === UrlUtil.PG_CLASSES) toSet['Core'] = 1;
          else sourcesToAdd.forEach(src => (toSet[src.json] = 1));
          BrewUtil._filterBox.setFromValues({ Source: toSet });
        }
      }
      if (BrewUtil._filterBox) BrewUtil._filterBox.fireChangeEvent();
    }
  },

  makeBrewButton: id => {
    $(`#${id}`).on('click', () => BrewUtil.manageBrew());
  },

  _getBrewCategories() {
    return Object.keys(BrewUtil.homebrew).filter(it => !it.startsWith('_'));
  },

  // region sources
  _buildSourceCache() {
    function doBuild() {
      if (BrewUtil.homebrewMeta && BrewUtil.homebrewMeta.sources) {
        BrewUtil.homebrewMeta.sources.forEach(
          src => (BrewUtil._sourceCache[src.json.toLowerCase()] = { ...src }),
        );
      }
    }

    if (!BrewUtil._sourceCache) {
      BrewUtil._sourceCache = {};

      if (!BrewUtil.homebrewMeta) {
        const temp = StorageUtil.syncGet(HOMEBREW_META_STORAGE) || {};
        temp.sources = temp.sources || [];
        BrewUtil.homebrewMeta = temp;
        doBuild();
      } else {
        doBuild();
      }
    }
  },

  _resetSourceCache() {
    BrewUtil._sourceCache = null;
  },

  removeJsonSource(source) {
    if (!source) return;
    source = source.toLowerCase();
    BrewUtil._resetSourceCache();
    const ix = BrewUtil.homebrewMeta.sources.findIndex(
      it => it.json.toLowerCase() === source,
    );
    if (~ix) BrewUtil.homebrewMeta.sources.splice(ix, 1);
    StorageUtil.syncSet(HOMEBREW_META_STORAGE, BrewUtil.homebrewMeta);
  },

  getJsonSources() {
    BrewUtil._buildSourceCache();
    return BrewUtil.homebrewMeta && BrewUtil.homebrewMeta.sources
      ? BrewUtil.homebrewMeta.sources
      : [];
  },

  hasSourceJson(source) {
    if (!source) return false;
    source = source.toLowerCase();
    BrewUtil._buildSourceCache();
    return !!BrewUtil._sourceCache[source];
  },

  sourceJsonToFull(source) {
    if (!source) return '';
    source = source.toLowerCase();
    BrewUtil._buildSourceCache();
    return BrewUtil._sourceCache[source]
      ? BrewUtil._sourceCache[source].full || source
      : source;
  },

  sourceJsonToAbv(source) {
    if (!source) return '';
    source = source.toLowerCase();
    BrewUtil._buildSourceCache();
    return BrewUtil._sourceCache[source]
      ? BrewUtil._sourceCache[source].abbreviation || source
      : source;
  },

  sourceJsonToDate(source) {
    if (!source) return '';
    source = source.toLowerCase();
    BrewUtil._buildSourceCache();
    return BrewUtil._sourceCache[source]
      ? BrewUtil._sourceCache[source].dateReleased || source
      : source;
  },

  sourceJsonToSource(source) {
    if (!source) return null;
    source = source.toLowerCase();
    BrewUtil._buildSourceCache();
    return BrewUtil._sourceCache[source] ? BrewUtil._sourceCache[source] : null;
  },

  sourceJsonToStyle(source) {
    if (!source) return '';
    source = source.toLowerCase();
    const color = BrewUtil.sourceJsonToColor(source);
    if (color) return `style="color: #${color};"`;
    return '';
  },

  sourceJsonToColor(source) {
    if (!source) return '';
    source = source.toLowerCase();
    BrewUtil._buildSourceCache();
    if (BrewUtil._sourceCache[source] && BrewUtil._sourceCache[source].color) {
      const validColor = BrewUtil.getValidColor(
        BrewUtil._sourceCache[source].color,
      );
      if (validColor.length) return validColor;
      return '';
    } else return '';
  },

  getValidColor(color) {
    // Prevent any injection shenanigans
    return color.replace(/[^a-fA-F0-9]/g, '').slice(0, 8);
  },

  addSource(sourceObj) {
    BrewUtil._resetSourceCache();
    const exists = BrewUtil.homebrewMeta.sources.some(
      it => it.json === sourceObj.json,
    );
    if (exists) throw new Error(`Source "${sourceObj.json}" already exists!`);
    (BrewUtil.homebrewMeta.sources = BrewUtil.homebrewMeta.sources || []).push(
      sourceObj,
    );
    StorageUtil.syncSet(HOMEBREW_META_STORAGE, BrewUtil.homebrewMeta);
  },

  updateSource(sourceObj) {
    BrewUtil._resetSourceCache();
    const ix = BrewUtil.homebrewMeta.sources.findIndex(
      it => it.json === sourceObj.json,
    );
    if (!~ix) throw new Error(`Source "${sourceObj.json}" does not exist!`);
    const json = BrewUtil.homebrewMeta.sources[ix].json;
    BrewUtil.homebrewMeta.sources[ix] = {
      ...sourceObj,
      json,
    };
    StorageUtil.syncSet(HOMEBREW_META_STORAGE, BrewUtil.homebrewMeta);
  },

  _getActiveVetoolsSources() {
    if (BrewUtil.homebrew === null)
      throw new Error(`Homebrew was not initialized!`);

    const allActiveSources = new Set();
    Object.keys(BrewUtil.homebrew).forEach(k =>
      BrewUtil.homebrew[k].forEach(
        it => it.source && allActiveSources.add(it.source),
      ),
    );
    return Object.keys(Parser.SOURCE_JSON_TO_FULL)
      .map(k => ({
        json: k,
        full: Parser.SOURCE_JSON_TO_FULL[k],
        abbreviation: Parser.SOURCE_JSON_TO_ABV[k],
        dateReleased: Parser.SOURCE_JSON_TO_DATE[k],
      }))
      .sort((a, b) => SortUtil.ascSort(a.full, b.full))
      .filter(it => allActiveSources.has(it.json));
  },
  // endregion

  /**
   * Get data in a format similar to the main search index
   */
  async pGetSearchIndex() {
    BrewUtil._buildSourceCache();
    const indexer = new Omnidexer(Omnisearch.highestId + 1);

    await BrewUtil.pAddBrewData();
    if (BrewUtil.homebrew) {
      const INDEX_DEFINITIONS = [
        Omnidexer.TO_INDEX__FROM_INDEX_JSON,
        Omnidexer.TO_INDEX,
      ];

      // Run these in serial, to prevent any ID race condition antics
      for (const IX_DEF of INDEX_DEFINITIONS) {
        for (const arbiter of IX_DEF) {
          if (
            !(BrewUtil.homebrew[arbiter.brewProp || arbiter.listProp] || [])
              .length
          )
            continue;

          if (arbiter.pFnPreProcBrew) {
            const toProc = await arbiter.pFnPreProcBrew(
              arbiter,
              BrewUtil.homebrew,
            );
            indexer.addToIndex(arbiter, toProc);
          } else {
            indexer.addToIndex(arbiter, BrewUtil.homebrew);
          }
        }
      }
    }
    return Omnidexer.decompressIndex(indexer.getIndex());
  },

  async pGetAdditionalSearchIndices(highestId, addiProp) {
    BrewUtil._buildSourceCache();
    const indexer = new Omnidexer(highestId + 1);

    await BrewUtil.pAddBrewData();
    if (BrewUtil.homebrew) {
      const INDEX_DEFINITIONS = [
        Omnidexer.TO_INDEX__FROM_INDEX_JSON,
        Omnidexer.TO_INDEX,
      ];

      await Promise.all(
        INDEX_DEFINITIONS.map(IXDEF => {
          return Promise.all(
            IXDEF.filter(
              ti =>
                ti.additionalIndexes &&
                (BrewUtil.homebrew[ti.listProp] || []).length,
            ).map(ti => {
              return Promise.all(
                Object.entries(ti.additionalIndexes)
                  .filter(([prop]) => prop === addiProp)
                  .map(async ([prop, pGetIndex]) => {
                    const toIndex = await pGetIndex(indexer, {
                      [ti.listProp]: BrewUtil.homebrew[ti.listProp],
                    });
                    toIndex.forEach(add => indexer.pushToIndex(add));
                  }),
              );
            }),
          );
        }),
      );
    }
    return Omnidexer.decompressIndex(indexer.getIndex());
  },

  async pGetAlternateSearchIndices(highestId, altProp) {
    BrewUtil._buildSourceCache();
    const indexer = new Omnidexer(highestId + 1);

    await BrewUtil.pAddBrewData();
    if (BrewUtil.homebrew) {
      const INDEX_DEFINITIONS = [
        Omnidexer.TO_INDEX__FROM_INDEX_JSON,
        Omnidexer.TO_INDEX,
      ];

      INDEX_DEFINITIONS.forEach(IXDEF => {
        IXDEF.filter(
          ti =>
            ti.alternateIndexes &&
            (BrewUtil.homebrew[ti.listProp] || []).length,
        ).forEach(ti => {
          Object.entries(ti.alternateIndexes)
            .filter(([prop]) => prop === altProp)
            .map(async ([prop, pGetIndex]) => {
              indexer.addToIndex(ti, BrewUtil.homebrew, {
                alt: ti.alternateIndexes[prop],
              });
            });
        });
      });
    }
    return Omnidexer.decompressIndex(indexer.getIndex());
  },

  __pPersistHomebrewDebounced: null,
  _persistHomebrewDebounced() {
    if (BrewUtil.__pPersistHomebrewDebounced == null) {
      BrewUtil.__pPersistHomebrewDebounced = MiscUtil.debounce(
        () => BrewUtil._pCleanSaveBrew(),
        125,
      );
    }
    BrewUtil.__pPersistHomebrewDebounced();
  },
};

// ROLLING =============================================================================================================
RollerUtil = {
  isCrypto() {
    return (
      typeof window !== 'undefined' && typeof window.crypto !== 'undefined'
    );
  },

  randomise(max, min = 1) {
    if (min > max) return 0;
    if (max === min) return max;
    if (RollerUtil.isCrypto()) {
      return RollerUtil._randomise(min, max + 1);
    } else {
      return RollerUtil.roll(max) + min;
    }
  },

  rollOnArray(array) {
    return array[RollerUtil.randomise(array.length) - 1];
  },

  /**
   * Cryptographically secure RNG
   */
  _randomise: (min, max) => {
    const range = max - min;
    const bytesNeeded = Math.ceil(Math.log2(range) / 8);
    const randomBytes = new Uint8Array(bytesNeeded);
    const maximumRange = Math.pow(Math.pow(2, 8), bytesNeeded);
    const extendedRange = Math.floor(maximumRange / range) * range;
    let i;
    let randomInteger;
    while (true) {
      window.crypto.getRandomValues(randomBytes);
      randomInteger = 0;
      for (i = 0; i < bytesNeeded; i++) {
        randomInteger <<= 8;
        randomInteger += randomBytes[i];
      }
      if (randomInteger < extendedRange) {
        randomInteger %= range;
        return min + randomInteger;
      }
    }
  },

  /**
   * Result in range: 0 to (max-1); inclusive
   * e.g. roll(20) gives results ranging from 0 to 19
   * @param max range max (exclusive)
   * @param fn funciton to call to generate random numbers
   * @returns {number} rolled
   */
  roll(max, fn = Math.random) {
    return Math.floor(fn() * max);
  },

  _DICE_REGEX_STR:
    '((([1-9]\\d*)?d([1-9]\\d*)(\\s*?[-+×x*÷/]\\s*?(\\d,\\d|\\d)+(\\.\\d+)?)?))+?',
};
RollerUtil.DICE_REGEX = new RegExp(RollerUtil._DICE_REGEX_STR, 'g');
RollerUtil.REGEX_DAMAGE_DICE = /(\d+)( \((?:{@dice |{@damage ))([-+0-9d ]*)(}\) [a-z]+( \([-a-zA-Z0-9 ]+\))?( or [a-z]+( \([-a-zA-Z0-9 ]+\))?)? damage)/gi;
RollerUtil.REGEX_DAMAGE_FLAT = /(Hit: |{@h})([0-9]+)( [a-z]+( \([-a-zA-Z0-9 ]+\))?( or [a-z]+( \([-a-zA-Z0-9 ]+\))?)? damage)/gi;

// CONTENT EXCLUSION ===================================================================================================
ExcludeUtil = {
  isInitialised: false,
  _excludes: null,

  async pInitialise() {
    ExcludeUtil.pSave = MiscUtil.throttle(ExcludeUtil._pSave, 50);
    try {
      ExcludeUtil._excludes = (await StorageUtil.pGet(EXCLUDES_STORAGE)) || [];
    } catch (e) {
      JqueryUtil.doToast({
        content:
          'Error when loading content blacklist! Purged blacklist data. (See the log for more information.)',
        type: 'danger',
      });
      try {
        await StorageUtil.pRemove(EXCLUDES_STORAGE);
      } catch (e) {
        setTimeout(() => {
          throw e;
        });
      }
      ExcludeUtil._excludes = null;
      window.location.hash = '';
      setTimeout(() => {
        throw e;
      });
    }
    ExcludeUtil.isInitialised = true;
  },

  getList() {
    return ExcludeUtil._excludes || [];
  },

  async pSetList(toSet) {
    ExcludeUtil._excludes = toSet;
    await ExcludeUtil.pSave();
  },

  _excludeCount: 0,
  isExcluded(name, category, source) {
    if (!ExcludeUtil._excludes || !ExcludeUtil._excludes.length) return false;
    source = source.source || source;
    const out = !!ExcludeUtil._excludes.find(
      row =>
        (row.source === '*' || row.source === source) &&
        (row.category === '*' || row.category === category) &&
        (row.name === '*' || row.name === name),
    );
    if (out) ++ExcludeUtil._excludeCount;
    return out;
  },

  checkShowAllExcluded(list, $pagecontent) {
    if (
      (!list.length && ExcludeUtil._excludeCount) ||
      (list.length > 0 && list.length === ExcludeUtil._excludeCount)
    ) {
      $pagecontent.html(`
                  <tr><th class="border" colspan="6"></th></tr>
                  <tr><td colspan="6" class="initial-message">(Content <a href="blacklist.html">blacklisted</a>)</td></tr>
                  <tr><th class="border" colspan="6"></th></tr>
              `);
    }
  },

  addExclude(name, category, source) {
    if (
      !ExcludeUtil._excludes.find(
        row =>
          row.source === source &&
          row.category === category &&
          row.name === name,
      )
    ) {
      ExcludeUtil._excludes.push({ name, category, source });
      ExcludeUtil.pSave();
      return true;
    }
    return false;
  },

  removeExclude(name, category, source) {
    const ix = ExcludeUtil._excludes.findIndex(
      row =>
        row.source === source && row.category === category && row.name === name,
    );
    if (~ix) {
      ExcludeUtil._excludes.splice(ix, 1);
      ExcludeUtil.pSave();
    }
  },

  async _pSave() {
    return StorageUtil.pSet(EXCLUDES_STORAGE, ExcludeUtil._excludes);
  },

  // The throttled version, available post-initialisation
  async pSave() {
    /* no-op */
  },

  resetExcludes() {
    ExcludeUtil._excludes = [];
    ExcludeUtil.pSave();
  },
};

if (typeof module !== 'undefined') {
  module.exports.Renderer = Renderer;
  module.exports.SourceUtil = SourceUtil;
  module.exports.Parser = Parser;
}
