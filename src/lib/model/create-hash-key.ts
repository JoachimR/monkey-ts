import { assert, checkExhaustive } from '../../utils';
import type { Value, ValueBoolean, ValueInteger, ValueString, HashKey } from './value';
import { valueTypes } from './value';

export function createHashKey(arg: Value): HashKey {
  assert(
    arg.type === valueTypes.String || arg.type === valueTypes.Integer || arg.type === valueTypes.Boolean,
    'not supported for hashing',
    { arg }
  );
  switch (arg.type) {
    case valueTypes.Boolean:
      return hashKeyForValueBoolean(arg);
    case valueTypes.String:
      return hashKeyForValueString(arg);
    case valueTypes.Integer:
      return hashKeyForValueInteger(arg);
    default:
      return checkExhaustive(arg);
  }
}

function hashKeyForValueBoolean(arg: ValueBoolean): HashKey {
  return arg.value ? 1 : 0;
}

function hashKeyForValueInteger(arg: ValueInteger): HashKey {
  return arg.value;
}

function hashKeyForValueString(arg: ValueString): HashKey {
  const getHashKey = (str: string): number => {
    let hash = 0;
    if (str.length === 0) {
      return hash;
    }
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash;
  };
  return getHashKey(arg.value);
}
