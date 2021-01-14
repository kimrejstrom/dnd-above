import React, { useState } from 'react';
import { PresetFeature } from 'features/presets/PresetFeature';
import { RollInput } from 'features/rollInput/RollInput';
import Button from 'components/Button/Button';

export const Roller: React.FC = () => {
  // Open presets
  const [presetsOpen, setPresetsOpen] = useState(false);
  return (
    <div className="container mx-auto mt-8 max-w-xs pt-4">
      <div className="flex justify-center items-center">
        <Button
          title={presetsOpen ? 'Hide Presets' : 'Show Presets'}
          onClick={() => setPresetsOpen(!presetsOpen)}
          className="dark:hover:bg-dark-100 bg-light-100 hover:bg-yellow-100 dark:bg-transparent dark:text-light-100 py-2 px-4 border dark:border-light-100 rounded"
        />
      </div>
      {presetsOpen ? <PresetFeature /> : undefined}
      <RollInput />
    </div>
  );
};
