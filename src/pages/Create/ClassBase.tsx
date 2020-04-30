import React from 'react';
import { ClassElement, Multiclassing } from 'models/class';
import mainRenderer from 'utils/mainRenderer';
import DangerousHtml from 'components/DangerousHtml/DangerousHtml';

const ClassBase = ({ cls }: { cls: ClassElement }) => {
  // HP/hit dice
  const hdEntry = {
    toRoll: `${cls.hd.number}d${cls.hd.faces}`,
  };

  const HitDice = () => (
    <tr className="odd:bg-gray-100 dark-odd:bg-secondary-dark text-sm">
      <td>
        <h3>Hit Points</h3>
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
    `${(window as any).Parser.skillProficienciesToFull(
      skills,
    ).uppercaseFirst()}.`;

  const profs = cls.startingProficiencies;

  const StartingEquipment = () => {
    const equip = cls.startingEquipment;
    return (
      <tr className="odd:bg-gray-100 dark-odd:bg-secondary-dark text-sm">
        <td>
          <h3>Starting Equipment</h3>
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

  // multiclassing
  const MultiClassing = () => {
    const renderPart = (obj: any, joiner = ', ') =>
      Object.keys(obj)
        .filter(k => k !== 'or')
        .map(k => `${(window as any).Parser.attAbvToFull(k)} ${obj[k]}`)
        .join(joiner);
    const orPart = (mc: Multiclassing) =>
      mc.requirements.or
        ? mc.requirements.or.map(obj => renderPart(obj, ' or ')).join('; ')
        : '';
    const basePart = (mc: Multiclassing) => renderPart(mc.requirements);

    if (cls.multiclassing) {
      const mc = cls.multiclassing;
      return (
        <tr className="odd:bg-gray-100 dark-odd:bg-secondary-dark text-sm">
          <td colSpan={6}>
            <h3>Multiclassing</h3>
            {mc.requirements && (
              <div>
                <div>
                  To qualify for a new class, you must meet the ability score
                  prerequisites for both your current class and your new one.
                </div>
                <b>Ability Score Minimum:</b>{' '}
                {[orPart(mc), basePart(mc)].filter(Boolean).join('; ')}
              </div>
            )}
            {mc.proficienciesGained ? (
              <div>
                <p>
                  When you gain a level in a class other than your first, you
                  gain only some of that class's starting proficiencies.
                </p>
                {mc.proficienciesGained.armor && (
                  <div>
                    <b>Armor:</b>{' '}
                    {renderArmorProfs(mc.proficienciesGained.armor)}
                  </div>
                )}
                {mc.proficienciesGained.weapons && (
                  <div>
                    <b>Weapons:</b>{' '}
                    {renderWeaponsProfs(mc.proficienciesGained.weapons)}
                  </div>
                )}
                {mc.proficienciesGained.tools && (
                  <div>
                    <b>Tools:</b> {mc.proficienciesGained.tools.join(', ')}
                  </div>
                )}
                {mc.proficienciesGained.skills && (
                  <div>
                    <b>Skills:</b>{' '}
                    {renderSkillsProfs(mc.proficienciesGained.skills)}
                  </div>
                )}
              </div>
            ) : (
              <div>Nothing</div>
            )}
          </td>
        </tr>
      );
    } else {
      return <div>Multi-classing option unavailable.</div>;
    }
  };

  return (
    <table className="w-full dnd-body">
      <tbody>
        <tr className="odd:bg-gray-100 dark-odd:bg-secondary-dark text-sm">
          <th className="border"></th>
        </tr>
        <HitDice />
        <tr className="odd:bg-gray-100 dark-odd:bg-secondary-dark text-sm">
          <td>
            <h3>Proficiencies</h3>
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
                  ? cls.proficiency
                      .map(p => (window as any).Parser.attAbvToFull(p))
                      .join(', ')
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
        <MultiClassing />
        <tr className="odd:bg-gray-100 dark-odd:bg-secondary-dark text-sm">
          <th className="border"></th>
        </tr>
      </tbody>
    </table>
  );
};

export default ClassBase;
