import React, { useState } from 'react';
import { Spells } from 'components/Spells/Spells';
import { ALL_SPELLS } from 'utils/data';

interface Props {}

const SpellsModal = (props: Props) => {
  const [selectedRows, setSelectedRows] = useState({ '9': true });

  const selectedRowKeys = Object.keys(selectedRows);
  return (
    <div>
      <p>Selected Rows: {selectedRowKeys.length}</p>
      <div>
        <code>
          {JSON.stringify(
            {
              selectedRowKeys,
            },
            null,
            2,
          )}
        </code>
      </div>
      <Spells
        spells={ALL_SPELLS}
        withSelection={true}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
      />
    </div>
  );
};

export default SpellsModal;
