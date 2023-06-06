import { assert, checkExhaustive } from '../../utils';
import {
  EvaluatedTo,
  EvaluatedToBoolean,
  EvaluatedToInteger,
  EvaluatedToString,
  EvaluatedType,
  HashKey,
} from './evaluated';

export function createHashKey(arg: EvaluatedTo): HashKey {
  assert(
    arg.type === EvaluatedType.String || arg.type === EvaluatedType.Integer || arg.type === EvaluatedType.Boolean,
    'not supported for hashing',
    { arg }
  );
  switch (arg.type) {
    case EvaluatedType.Boolean:
      return hashKeyForEvaluatedToBoolean(arg);
    case EvaluatedType.String:
      return hashKeyForEvaluatedToString(arg);
    case EvaluatedType.Integer:
      return hashKeyForEvaluatedToInteger(arg);
    default:
      return checkExhaustive(arg);
  }
}

function hashKeyForEvaluatedToBoolean(arg: EvaluatedToBoolean): HashKey {
  return arg.value ? 1 : 0;
}

function hashKeyForEvaluatedToInteger(arg: EvaluatedToInteger): HashKey {
  return arg.value;
}

function hashKeyForEvaluatedToString(arg: EvaluatedToString): HashKey {
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
