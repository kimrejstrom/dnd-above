import React, { useState } from 'react';
import { PresetFeature } from 'features/presets/PresetFeature';
import { RollInput } from 'features/rollInput/RollInput';
import StyledButton from 'components/StyledButton/StyledButton';

export const Roller: React.FC = () => {
  // Open presets
  const [presetsOpen, setPresetsOpen] = useState(false);
  return (
    <div className="container mx-auto mt-8 max-w-xs pt-4">
      <div className="flex justify-center items-center">
        <StyledButton onClick={() => setPresetsOpen(!presetsOpen)}>
          {presetsOpen ? 'Hide Presets' : 'Show Presets'}
        </StyledButton>
      </div>
      {presetsOpen ? <PresetFeature /> : undefined}
      <RollInput />
    </div>
  );
};
