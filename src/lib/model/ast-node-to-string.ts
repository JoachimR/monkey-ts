import { checkExhaustive } from '../../utils';
import { AstNode, AstNodeType, StatementType, ExpressionType } from './ast';

export function astNodeToString(node: AstNode): string {
  switch (node.astType) {
    case AstNodeType.Program:
      return node.body.map(astNodeToString).join('');
    case AstNodeType.Statement:
      switch (node.statementType) {
        case StatementType.Let:
          return `let ${astNodeToString(node.name)} = ${astNodeToString(node.value)};`;
        case StatementType.Return:
          return `return ${astNodeToString(node.value)};`;
        case StatementType.Expression:
          return `${astNodeToString(node.expression)}`;
        case StatementType.Block:
          return node.statements.map(astNodeToString).join('');
        default:
          return checkExhaustive(node);
      }
    case AstNodeType.Expression:
      switch (node.expressionType) {
        case ExpressionType.Identifier:
          return node.value;
        case ExpressionType.IntegerLiteral:
          return `${node.value.toString()}`;
        case ExpressionType.StringLiteral:
          return `${node.value}`;
        case ExpressionType.BooleanLiteral:
          return `${node.value.toString()}`;
        case ExpressionType.ArrayLiteral:
          return node.elements.map(astNodeToString).join(', ');
        case ExpressionType.ObjectLiteral:
          return node.pairs.map((pair) => `${astNodeToString(pair[0])}: ${astNodeToString(pair[1])}`).join(', ');
        case ExpressionType.FunctionLiteral:
          return node.parameters.map(astNodeToString).join(', ');
        case ExpressionType.CallExpression:
          return `${astNodeToString(node.func)}(${node.args.map(astNodeToString).join(', ')})`;
        case ExpressionType.PrefixExpression:
          return `(${node.operator}${astNodeToString(node.right)})`;
        case ExpressionType.InfixExpression:
          return `(${astNodeToString(node.left)} ${node.operator} ${astNodeToString(node.right)})`;
        case ExpressionType.IfExpression:
          return node.alternative
            ? `${`if (${astNodeToString(node.condition)}) {${astNodeToString(
                node.consequence
              )}}`} else {${astNodeToString(node.alternative)}}`
            : `if (${astNodeToString(node.condition)}) {${astNodeToString(node.consequence)}}`;
        case ExpressionType.IndexExpression:
          return `${astNodeToString(node.left)}[${astNodeToString(node.index)}]`;
        default:
          return checkExhaustive(node);
      }
    default:
      return checkExhaustive(node);
  }
}
