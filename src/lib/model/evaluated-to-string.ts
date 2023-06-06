import { checkExhaustive } from '../../utils';
import { astNodeToString } from './ast-node-to-string';
import { EvaluatedTo, EvaluatedType } from './evaluated';

export function evaluatedToString(evaluatedTo: EvaluatedTo): string {
  switch (evaluatedTo.type) {
    case EvaluatedType.Null:
      return 'null';
    case EvaluatedType.ReturnValue:
      return evaluatedToString(evaluatedTo);
    case EvaluatedType.Integer:
    case EvaluatedType.Boolean:
      return `${evaluatedTo.value}`;
    case EvaluatedType.String:
      return `"${evaluatedTo.value}"`;
    case EvaluatedType.Function: {
      const parameters = evaluatedTo.parameters.map(astNodeToString).join(', ');
      const body = astNodeToString(evaluatedTo.body);
      return `fn(${parameters}){\n${body}\n}`;
    }
    case EvaluatedType.BuiltIn:
      return 'builtin function';
    case EvaluatedType.Array:
      return `'[${evaluatedTo.elements.map(toString).join(', ')}]`;
    case EvaluatedType.Object:
      return '';
    default:
      return checkExhaustive(evaluatedTo);
  }
}
