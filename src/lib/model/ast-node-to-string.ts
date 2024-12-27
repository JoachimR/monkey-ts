import { checkExhaustive } from '../../utils';
import type { AstNode } from './ast';

export function astNodeToString(node: AstNode): string {
  switch (node.astType) {
    case 'program':
      return node.body.map(astNodeToString).join('');
    case 'statement':
      switch (node.statementType) {
        case 'let':
          return `let ${astNodeToString(node.name)} = ${astNodeToString(node.value)};`;
        case 'return':
          return `return ${astNodeToString(node.value)};`;
        case 'expression':
          return `${astNodeToString(node.expression)}`;
        case 'block':
          return node.statements.map(astNodeToString).join('');
        case 'reassign':
          return `${astNodeToString(node.name)} = ${astNodeToString(node.value)};`;
        case 'forEach':
          return `forEach in ${astNodeToString(node.array)}; { ${node.body.statements
            .map(astNodeToString)
            .join('')} } `;
        default:
          return checkExhaustive(node);
      }
    case 'expression':
      switch (node.expressionType) {
        case 'identifier':
          return node.value;
        case 'integerLiteral':
          return node.value.toString();
        case 'stringLiteral':
          return `"${node.value}"`;
        case 'booleanLiteral':
          return node.value.toString();
        case 'arrayLiteral':
          return `[${node.elements.map(astNodeToString).join(', ')}]`;
        case 'objectLiteral':
          return `{${node.pairs
            .map(([key, value]) => `${astNodeToString(key)}: ${astNodeToString(value)}`)
            .join(', ')}}`;
        case 'functionLiteral':
          return `fn(${node.parameters.map(astNodeToString).join(', ')}) ${astNodeToString(node.body)}`;
        case 'callExpression':
          return `${astNodeToString(node.func)}(${node.args.map(astNodeToString).join(', ')})`;
        case 'prefixExpression':
          return `(${node.operator}${astNodeToString(node.right)})`;
        case 'infixExpression':
          return `(${astNodeToString(node.left)} ${node.operator} ${astNodeToString(node.right)})`;
        case 'ifExpression':
          return `if (${astNodeToString(node.condition)}) ${astNodeToString(node.consequence)}${
            node.alternative ? ` else ${astNodeToString(node.alternative)}` : ''
          }`;
        case 'indexExpression':
          return `${astNodeToString(node.left)}[${astNodeToString(node.index)}]`;
        default:
          return checkExhaustive(node);
      }
    default:
      return checkExhaustive(node);
  }
}
