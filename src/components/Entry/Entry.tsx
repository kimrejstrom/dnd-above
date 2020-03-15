import React from 'react';
import { PurpleEntry } from 'models/class';

interface Props {
  entry: string | PurpleEntry;
}

const renderEntry = (entry: string | PurpleEntry) => {
  if (entry !== typeof 'string') {
    const additionalInfo = entry as PurpleEntry;
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
              <li>{item}</li>
            ))}
          </ul>
        );
      case 'table':
        return (
          <div className="my-2">
            {additionalInfo.caption}
            <table>
              <thead>
                {additionalInfo.colLabels?.map(label => (
                  <th>{label}</th>
                ))}
              </thead>
              <tbody>
                {additionalInfo.rows?.map(row => (
                  <tr>
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
            {additionalInfo.name}
            <ul>
              {additionalInfo.entries?.map(entry => (
                <li>{renderEntry(entry)}</li>
              ))}
            </ul>
          </div>
        );
      case 'inlineBlock':
      case 'options':
        return (
          <div>
            {additionalInfo.entries?.map(entry => (
              <div>{renderEntry(entry)}</div>
            ))}
          </div>
        );
      case 'patron':
        return (
          <div className="my-2">
            {additionalInfo.name}
            <ul>
              {additionalInfo.entries?.map(entry => (
                <li>{renderEntry(entry)}</li>
              ))}
            </ul>
          </div>
        );
      case 'inset':
        // TODO
        return <div>{additionalInfo.toString()}</div>;
      default:
        if (additionalInfo.entries?.length) {
          return (
            <div>
              <div>{additionalInfo.name}</div>
              <div>
                {additionalInfo.entries.map(entry => renderEntry(entry))}
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
  return <div>{renderEntry(entry)}</div>;
};

export default Entry;
