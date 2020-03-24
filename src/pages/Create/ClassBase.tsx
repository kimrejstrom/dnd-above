import React from 'react';
import { ClassElement } from 'models/class';
import mainRenderer from 'utils/mainRenderer';
import DangerousHtml from 'components/DangerousHtml/DangerousHtml';
// import DangerousHtml from 'components/DangerousHtml/DangerousHtml';

const ClassBase = ({ cls }: { cls: ClassElement }) => {
  // HP/hit dice
  const hdEntry = {
    toRoll: `${cls.hd.number}d${cls.hd.faces}`,
  };

  const HitDice = () => (
    <tr className="cls-side__show-hide">
      <td className="cls-side__section">
        <h3 className="cls-side__section-head">Hit Points</h3>
        <div>
          <strong>Hit Dice:</strong> {hdEntry.toRoll}
        </div>
        <div>
          <strong>Hit Points at 1st Level:</strong> {cls.hd.faces} + your
          Constitution modifier
        </div>
        <div>
          <strong>Hit Points at Higher Levels:</strong> {hdEntry.toRoll}
          {`(or ${cls.hd.faces / 2 + 1})`}+ your Constitution modifier per{' '}
          {cls.name} level after 1st
        </div>
      </td>
    </tr>
  );

  //   let $ptHp = null;
  //   if (cls.hd) {
  //     const hdEntry = {
  //       toRoll: `${cls.hd.number}d${cls.hd.faces}`,
  //     };

  //     $ptHp = `<tr class="cls-side__show-hide">
  //                     <td class="cls-side__section">
  //                         <h3 class="cls-side__section-head">Hit Points</h3>
  //                         <div><strong>Hit Dice:</strong> ${hdEntry.toRoll}</div>
  //                         <div><strong>Hit Points at 1st Level:</strong> ${
  //                           cls.hd.faces
  //                         } + your Constitution modifier</div>
  //                         <div><strong>Hit Points at Higher Levels:</strong> ${
  //                           hdEntry.toRoll
  //                         } (or ${cls.hd.faces / 2 +
  //       1}) + your Constitution modifier per ${cls.name} level after 1st</div>
  //                     </td>
  //                 </tr>`;
  //   }

  // starting proficiencies
  const renderArmorProfs = (armorProfs: any) =>
    armorProfs
      .map((a: any) =>
        a.full
          ? a.full
          : a === 'light' || a === 'medium' || a === 'heavy'
          ? `${a} armor`
          : a,
      )
      .join(', ');
  const renderWeaponsProfs = (weaponProfs: any) =>
    weaponProfs
      .map((w: string) =>
        w === 'simple' || w === 'martial' ? `${w} weapons` : w,
      )
      .join(', ');
  const renderSkillsProfs = (skills: any) =>
    `${Parser.skillProficienciesToFull(skills).uppercaseFirst()}.`;

  const profs = cls.startingProficiencies;

  const StartingEquipment = () => {
    const equip = cls.startingEquipment;
    return (
      <tr className="cls-side__show-hide">
        <td className="cls-side__section">
          <h3 className="cls-side__section-head">Starting Equipment</h3>
          <div>
            {equip.additionalFromBackground && (
              <p>
                You start with the following items, plus anything provided by
                your background.
              </p>
            )}
            {equip.default && equip.default.length && (
              <ul className="pl-4">
                {equip.default.map((it, index) => (
                  <li key={index}>
                    <DangerousHtml data={mainRenderer.render(it)} />
                  </li>
                ))}
              </ul>
            )}
            {equip.goldAlternative && (
              <p>
                Alternatively, you may start with
                {mainRenderer.render(equip.goldAlternative)} gp to buy your own
                equipment.
              </p>
            )}
          </div>
        </td>
      </tr>
    );
  };
  //   // starting equipment
  //   let $ptEquipment = null;
  //   if (cls.startingEquipment) {
  //     const equip = cls.startingEquipment;
  //     const rendered = [
  //       equip.additionalFromBackground
  //         ? '<p>You start with the following items, plus anything provided by your background.</p>'
  //         : '',
  //       equip.default && equip.default.length
  //         ? `<ul class="pl-4"><li>${equip.default
  //             .map(it => mainRenderer.render(it))
  //             .join('</li><li>')}</ul>`
  //         : '',
  //       equip.goldAlternative != null
  //         ? `<p>Alternatively, you may start with ${mainRenderer.render(
  //             equip.goldAlternative,
  //           )} gp to buy your own equipment.</p>`
  //         : '',
  //     ]
  //       .filter(Boolean)
  //       .join('');

  //     $ptEquipment = `<tr class="cls-side__show-hide">
  //                     <td class="cls-side__section"
  //                         <h3 class="cls-side__section-head">Starting Equipment</h3>
  //                         <div>${rendered}</div>
  //                     </td>
  //                 </tr>`;
  //   }

  return (
    <table className="w-full">
      <tbody>
        <tr>
          <th className="border"></th>
        </tr>
        <tr className="cls-side__show-hide">
          <td className="divider">
            <div className="my-0" />
          </td>
        </tr>
        <HitDice />
        <tr className="cls-side__show-hide">
          <td className="cls-side__section">
            <h3 className="cls-side__section-head">Proficiencies</h3>
            <div>
              <b>Armor: </b>
              <span>
                {profs.armor ? renderArmorProfs(profs.armor) : 'none'}
              </span>
            </div>
            <div>
              <b>Weapons: </b>
              <span>
                {profs.weapons ? renderWeaponsProfs(profs.weapons) : 'none'}
              </span>
            </div>
            <div>
              <b>Tools: </b>
              <span>{profs.tools ? profs.tools.join(', ') : 'none'}</span>
            </div>
            <div>
              <b>Saving Throws: </b>
              <span>
                {cls.proficiency
                  ? cls.proficiency.map(p => Parser.attAbvToFull(p)).join(', ')
                  : 'none'}
              </span>
            </div>
            <div>
              <b>Skills: </b>
              <span>
                {profs.skills ? renderSkillsProfs(profs.skills) : 'none'}
              </span>
            </div>
          </td>
        </tr>
        <StartingEquipment />
        <tr>
          <th className="border"></th>
        </tr>
      </tbody>
    </table>
  );

  //   const finalHtml = `<table class="w-full">
  //                 <tr><th class="border" </th></tr>
  //                 <tr><th <div class="split-v-center pr-1"><div class="cls-side__name">${
  //                   cls.name
  //                 }</div></div></th></tr>

  //                 <tr class="cls-side__show-hide"><td class="divider" <div class="my-0"/></td></tr>

  //                 ${$ptHp}

  //                 <tr class="cls-side__show-hide">
  //                     <td class="cls-side__section">
  //                         <h3 class="cls-side__section-head">Proficiencies</h3>
  //                         <div><b>Armor:</b> <span>${
  //                           profs.armor ? renderArmorProfs(profs.armor) : 'none'
  //                         }</span></div>
  //                         <div><b>Weapons:</b> <span>${
  //                           profs.weapons
  //                             ? renderWeaponsProfs(profs.weapons)
  //                             : 'none'
  //                         }</span></div>
  //                         <div><b>Tools:</b> <span>${
  //                           profs.tools ? profs.tools.join(', ') : 'none'
  //                         }</span></div>
  //                         <div><b>Saving Throws:</b> <span>${
  //                           cls.proficiency
  //                             ? cls.proficiency
  //                                 .map(p => Parser.attAbvToFull(p))
  //                                 .join(', ')
  //                             : 'none'
  //                         }</span></div>
  //                         <div><b>Skills:</b> <span>${
  //                           profs.skills
  //                             ? renderSkillsProfs(profs.skills)
  //                             : 'none'
  //                         }</span></div>
  //                     </td>
  //                 </tr>

  //                 ${$ptEquipment}

  //                 <tr><th class="border" </th></tr>
  //             </table>`;

  //   return (
  //     <div>
  //       <DangerousHtml data={finalHtml} />
  //     </div>
  //   );
};

export default ClassBase;
