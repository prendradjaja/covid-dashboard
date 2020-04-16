import { deserialize } from './deserialize';
import { serialize } from './serialize';

const edit = (index, updatedDefinition) => {
  let currentState = deserialize(window.location.hash);
  currentState[index] = updatedDefinition;
  serialize(currentState);
};

const clear = () => (window.location.hash = '');

export * from './types';
export default {
  deserialize,
  serialize,
  clear,
  edit,
};
