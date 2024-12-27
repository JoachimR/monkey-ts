import { checkExhaustive } from '../../utils';
import { astNodeToString } from './ast-node-to-string';
import type { Value } from './value';

export function valueToString(value: Value): string {
  switch (value.type) {
    case 'null':
      return 'null';
    case 'returnValue':
      return valueToString(value);
    case 'integer':
    case 'boolean':
      return `${value.value}`;
    case 'string':
      return `"${value.value}"`;
    case 'function': {
      const parameters = value.parameters.map(astNodeToString).join(', ');
      const body = astNodeToString(value.body);
      return `fn(${parameters}){\n${body}\n}`;
    }
    case 'builtIn':
      return 'builtin function';
    case 'array':
      return `'[${value.elements.map(valueToString).join(', ')}]`;
    case 'object':
      return '';
    default:
      return checkExhaustive(value);
  }
}
