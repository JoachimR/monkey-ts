import { astNodeToString } from './ast-node-to-string';
import { EvaluatedTo, EvaluatedType } from './evaluated';

export function evaluatedToString(evaluatedTo: EvaluatedTo): string {
  switch (evaluatedTo.type) {
    case EvaluatedType.Boolean:
      return `${evaluatedTo.value}: boolean`;
    case EvaluatedType.Integer:
      return `${evaluatedTo.value}: integer`;
    case EvaluatedType.String:
      return `${evaluatedTo.value}: string`;
    case EvaluatedType.Array:
      return `'[${evaluatedTo.elements.map(toString).join(', ')}]`;
    case EvaluatedType.Null:
      return 'null';
    case EvaluatedType.ReturnValue:
      return evaluatedToString(evaluatedTo);
    case EvaluatedType.Function: {
      const parameters = evaluatedTo.parameters.map(astNodeToString).join(', ');
      const body = astNodeToString(evaluatedTo.body);
      return `fn(${parameters}){\n${body}\n}`;
    }
  }
}
