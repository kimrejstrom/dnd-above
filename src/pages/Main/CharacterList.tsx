import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import StyledButton from 'components/StyledButton/StyledButton';
import { getFilteredCharacterList } from 'app/selectors';
import CharacterCards from 'components/CharacterCards/CharacterCards';
import Notification, {
  NotificationType,
} from 'components/Notification/Notification';

const CharacterList = () => {
  const characterList = useSelector(getFilteredCharacterList);
  const history = useHistory();
  return (
    <div className="w-full flex flex-col" style={{ maxWidth: '62rem' }}>
      <div className="w-full custom-border-lg custom-border-thin custom-border-b">
        <div className="flex justify-between items-center">
          <h1>Your Characters</h1>
          <StyledButton onClick={() => history.push('/create')}>
            Create Character
          </StyledButton>
        </div>
      </div>
      <div className="mt-3 w-full flex flex-wrap justify-center md:justify-start">
        {characterList.length > 0 ? (
          <CharacterCards type={'LOAD'} />
        ) : (
          <Notification type={NotificationType.Info}>
            You don't have any characters yet.
          </Notification>
        )}
      </div>
    </div>
  );
};

export default CharacterList;
