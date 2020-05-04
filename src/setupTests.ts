import 'jest-enzyme';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

// Mock 5e-tools
jest.mock('utils/mainRenderer', () => ({
  mainRenderer: {
    race: {
      mergeSubraces: jest.fn(() => []),
    },
    item: {
      _addProperty: jest.fn(),
      _addType: jest.fn(),
      _addAdditionalEntries: jest.fn(),
    },
  },
  SourceUtil: {
    isCoreOrSupplement: jest.fn(),
    isNonstandardSource: jest.fn(),
  },
}));
