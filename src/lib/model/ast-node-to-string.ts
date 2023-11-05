import { checkExhaustive } from '../../utils';
import type { AstNode } from './ast';
import { astNodeTypes, expressionTypes, statementTypes } from './ast';

export function astNodeToString(node: AstNode): string {
  switch (node.astType) {
    case astNodeTypes.Program:
      return node.body.map(astNodeToString).join('');
    case astNodeTypes.Statement:
      switch (node.statementType) {
        case statementTypes.Let:
          return `let ${astNodeToString(node.name)} = ${astNodeToString(node.value)};`;
        case statementTypes.Return:
          return `return ${astNodeToString(node.value)};`;
        case statementTypes.Expression:
          return `${astNodeToString(node.expression)}`;
        case statementTypes.Block:
          return node.statements.map(astNodeToString).join('');
        default:
          return checkExhaustive(node);
      }
    case astNodeTypes.Expression:
      switch (node.expressionType) {
        case expressionTypes.Identifier:
          return node.value;
        case expressionTypes.IntegerLiteral:
          return `${node.value.toString()}`;
        case expressionTypes.StringLiteral:
          return `${node.value}`;
        case expressionTypes.BooleanLiteral:
          return `${node.value.toString()}`;
        case expressionTypes.ArrayLiteral:
          return node.elements.map(astNodeToString).join(', ');
        case expressionTypes.ObjectLiteral:
          return node.pairs.map((pair) => `${astNodeToString(pair[0])}: ${astNodeToString(pair[1])}`).join(', ');
        case expressionTypes.FunctionLiteral:
          return node.parameters.map(astNodeToString).join(', ');
        case expressionTypes.CallExpression:
          return `${astNodeToString(node.func)}(${node.args.map(astNodeToString).join(', ')})`;
        case expressionTypes.PrefixExpression:
          return `(${node.operator}${astNodeToString(node.right)})`;
        case expressionTypes.InfixExpression:
          return `(${astNodeToString(node.left)} ${node.operator} ${astNodeToString(node.right)})`;
        case expressionTypes.IfExpression:
          return node.alternative
            ? `${`if (${astNodeToString(node.condition)}) {${astNodeToString(
                node.consequence
              )}}`} else {${astNodeToString(node.alternative)}}`
            : `if (${astNodeToString(node.condition)}) {${astNodeToString(node.consequence)}}`;
        case expressionTypes.IndexExpression:
          return `${astNodeToString(node.left)}[${astNodeToString(node.index)}]`;
        default:
          return checkExhaustive(node);
      }
    default:
      return checkExhaustive(node);
  }
}
