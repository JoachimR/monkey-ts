import { assert, checkExhaustive } from '../../utils';
import type { Value, HashKey } from './value';

export function createHashKey(arg: Value): HashKey {
  assert(arg.type === 'string' || arg.type === 'integer' || arg.type === 'boolean', 'unusable as hash key', { arg });
  switch (arg.type) {
    case 'boolean':
      return arg.value ? 1 : 0;
    case 'string':
      return hash(arg.value);
    case 'integer':
      return arg.value;
    default:
      return checkExhaustive(arg);
  }
}

function hash(str: string): number {
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
}
