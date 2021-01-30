import React from 'react';
import { shallow } from 'enzyme';
import { Roller } from 'pages/Roller/Roller';
import StyledButton from 'components/StyledButton/StyledButton';

it('renders Roller page with preset button', () => {
  const wrapper = shallow(<Roller />);
  expect(wrapper.find(StyledButton)).toHaveLength(1);
});
