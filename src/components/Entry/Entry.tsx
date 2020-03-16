import React from 'react';
import { PurpleEntry as ClassEntry } from 'models/class';
import { PurpleEntry as RaceEntry } from 'models/race';
import { BackgroundEntry, FluffyItem } from 'models/background';

type CombinedEntry = ClassEntry & RaceEntry & BackgroundEntry;

interface Props {
  entry: ClassEntry | RaceEntry | BackgroundEntry | string;
}

const renderItem = (item: FluffyItem | string) => {
  if (item !== typeof 'string') {
    const additionalInfoItem = item as FluffyItem;
    return (
      <div className="my-2">
        <div className="font-bold">{additionalInfoItem.name}</div>
        <div>{additionalInfoItem.entry}</div>
      </div>
    );
  } else {
    return <div>{item}</div>;
  }
};

const renderEntry = (entry: CombinedEntry | string) => {
  if (entry !== typeof 'string') {
    const additionalInfo = entry as CombinedEntry;
    switch (additionalInfo.type) {
      case 'abilityDc':
        return (
          <div>
            {`Spell Save DC mod: 
                ${additionalInfo.attributes?.length &&
                  additionalInfo.attributes[0]}`}
          </div>
        );
      case 'abilityAttackMod':
        return (
          <div>
            {`Spell Attack mod:
                ${additionalInfo.attributes?.length &&
                  additionalInfo.attributes[0]}`}
          </div>
        );
      case 'list':
        return (
          <ul className="my-2">
            {additionalInfo.items?.map(item => (
              <li>{renderItem(item)}</li>
            ))}
          </ul>
        );
      case 'table':
        return (
          <div className="my-2">
            <div className="font-bold">{additionalInfo.caption}</div>
            <table>
              <thead>
                {additionalInfo.colLabels?.map(label => (
                  <th>{label}</th>
                ))}
              </thead>
              <tbody>
                {additionalInfo.rows?.map(row => (
                  <tr className="odd:bg-gray-100 dark-odd:bg-secondary-dark">
                    {row.map(col => (
                      <td>{col}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'entries':
        return (
          <div className="my-2">
            <div className="font-bold">{additionalInfo.name}</div>
            <ul>
              {additionalInfo.entries?.map(entry => (
                <li>{renderEntry(entry as CombinedEntry)}</li>
              ))}
            </ul>
          </div>
        );
      case 'inlineBlock':
      case 'options':
        return (
          <div>
            {additionalInfo.entries?.map(entry => (
              <div>{renderEntry(entry as CombinedEntry)}</div>
            ))}
          </div>
        );
      case 'patron':
        return (
          <div className="my-2">
            {additionalInfo.name}
            <ul>
              {additionalInfo.entries?.map(entry => (
                <li>{renderEntry(entry as CombinedEntry)}</li>
              ))}
            </ul>
          </div>
        );
      case 'section':
      case 'inset':
        // TODO
        return <div>{additionalInfo.toString()}</div>;
      default:
        if (additionalInfo.entries?.length) {
          return (
            <div>
              <div>{additionalInfo.name}</div>
              <div>
                {additionalInfo.entries.map(entry =>
                  renderEntry(entry as CombinedEntry),
                )}
              </div>
            </div>
          );
        }
        return <div>{additionalInfo.toString()}</div>;
    }
  } else {
    return <p className="my-2">{entry}</p>;
  }
};

const Entry = ({ entry }: Props) => {
  return <div>{renderEntry(entry as CombinedEntry)}</div>;
};

export default Entry;
