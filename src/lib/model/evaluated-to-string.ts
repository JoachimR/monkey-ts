import { checkExhaustive } from '../../utils';
import { astNodeToString } from './ast-node-to-string';
import type { EvaluatedTo } from './evaluated-to';
import { evaluatedTypes } from './evaluated-to';

export function evaluatedToString(evaluatedTo: EvaluatedTo): string {
  switch (evaluatedTo.type) {
    case evaluatedTypes.Null:
      return 'null';
    case evaluatedTypes.ReturnValue:
      return evaluatedToString(evaluatedTo);
    case evaluatedTypes.Integer:
    case evaluatedTypes.Boolean:
      return `${evaluatedTo.value}`;
    case evaluatedTypes.String:
      return `"${evaluatedTo.value}"`;
    case evaluatedTypes.Function: {
      const parameters = evaluatedTo.parameters.map(astNodeToString).join(', ');
      const body = astNodeToString(evaluatedTo.body);
      return `fn(${parameters}){\n${body}\n}`;
    }
    case evaluatedTypes.BuiltIn:
      return 'builtin function';
    case evaluatedTypes.Array:
      return `'[${evaluatedTo.elements.map(evaluatedToString).join(', ')}]`;
    case evaluatedTypes.Object:
      return '';
    default:
      return checkExhaustive(evaluatedTo);
  }
}
