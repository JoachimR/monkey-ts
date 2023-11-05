import { checkExhaustive } from '../../utils';
import { astNodeToString } from './ast-node-to-string';
import type { Value } from './value';
import { valueTypes } from './value';

export function valueToString(value: Value): string {
  switch (value.type) {
    case valueTypes.Null:
      return 'null';
    case valueTypes.ReturnValue:
      return valueToString(value);
    case valueTypes.Integer:
    case valueTypes.Boolean:
      return `${value.value}`;
    case valueTypes.String:
      return `"${value.value}"`;
    case valueTypes.Function: {
      const parameters = value.parameters.map(astNodeToString).join(', ');
      const body = astNodeToString(value.body);
      return `fn(${parameters}){\n${body}\n}`;
    }
    case valueTypes.BuiltIn:
      return 'builtin function';
    case valueTypes.Array:
      return `'[${value.elements.map(valueToString).join(', ')}]`;
    case valueTypes.Object:
      return '';
    default:
      return checkExhaustive(value);
  }
}
