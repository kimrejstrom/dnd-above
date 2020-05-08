import React from 'react';
import StyledButton from 'components/StyledButton/StyledButton';
import {
  CharacterState,
  longRest,
} from 'features/character/characterListSlice';
import { useDispatch } from 'react-redux';

interface Props {
  character: CharacterState;
}

const Rests = ({ character }: Props) => {
  const dispatch = useDispatch();
  return (
    <>
      <StyledButton
        extraClassName="ml-2 xl:-mt-1 mb-1 h-10 custom-border-medium"
        onClick={() => console.log('short')}
      >
        Short Rest
      </StyledButton>
      <StyledButton
        extraClassName="ml-2 mb-1 h-10 custom-border-medium"
        onClick={() => dispatch(longRest({ id: character.id! }))}
      >
        Long Rest
      </StyledButton>
    </>
  );
};

export default Rests;
