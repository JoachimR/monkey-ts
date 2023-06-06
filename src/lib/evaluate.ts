import { assert, checkExhaustive } from '../utils';
import { builtins } from './builtins';
import {
  ArrayLiteralExpression,
  BlockStatement,
  BooleanLiteralExpression,
  CallExpression,
  Expression,
  ExpressionType,
  FunctionLiteralExpression,
  IdentifierExpression,
  IfExpression,
  IndexExpression,
  InfixExpression,
  IntegerLiteralExpression,
  LetStatement,
  PrefixExpression,
  Program,
  ReturnStatement,
  Statement,
  StatementType,
  StringLiteralExpression,
} from './model/ast';
import { Environment } from './model/environment';
import {
  EvaluatedTo,
  EvaluatedToArray,
  EvaluatedToBoolean,
  EvaluatedToFunction,
  EvaluatedToInteger,
  EvaluatedToString,
  EvaluatedType,
} from './model/evaluated';
import {
  AsteriskOperator,
  BangOperator,
  EqualsOperator,
  GreaterThanOperator,
  LessThanOperator,
  MinusOperator,
  NotEqualsOperator,
  PlusOperator,
  SlashOperator,
} from './model/token';

export function evaluate(node: Program): EvaluatedTo {
  return evaluateProgram(node, new Environment());
}

function evaluateProgram(node: Program, env: Environment): EvaluatedTo {
  let result!: EvaluatedTo;
  for (const statement of node.body) {
    result = evaluateStatement(statement, env);
    if (result.type === EvaluatedType.ReturnValue) {
      return result.value;
    }
  }
  return result;
}

function evaluateStatement(node: Statement, env: Environment): EvaluatedTo {
  switch (node.statementType) {
    case StatementType.Let:
      return evaluateLetStatement(node, env);
    case StatementType.Expression:
      return evaluateExpression(node.expression, env);
    case StatementType.Block:
      return evaluateBlockStatement(node, env);
    case StatementType.Return:
      return evaluateReturnStatement(node, env);
    default:
      return checkExhaustive(node);
  }
}

function evaluateExpression(node: Expression, env: Environment): EvaluatedTo {
  switch (node.expressionType) {
    case ExpressionType.BooleanLiteral:
      return evaluateBooleanLiteralExpression(node);
    case ExpressionType.IntegerLiteral:
      return evaluateIntegerLiteralExpression(node);
    case ExpressionType.StringLiteral:
      return evaluateStringLiteral(node);
    case ExpressionType.Identifier:
      return evaluateIdentifierExpression(node, env);
    case ExpressionType.PrefixExpression:
      return evaluatePrefixExpression(node, env);
    case ExpressionType.InfixExpression:
      return evaluateInfixExpression(node, env);
    case ExpressionType.FunctionLiteral:
      return evaluateFunctionLiteralExpression(node, env);
    case ExpressionType.CallExpression:
      return evaluateCallExpression(node, env);
    case ExpressionType.ArrayLiteral:
      return evaluateArrayLiteralExpression(node, env);
    case ExpressionType.IfExpression:
      return evaluateIfExpression(node, env);
    case ExpressionType.IndexExpression:
      return evaluateIndexExpression(node, env);
    default:
      return checkExhaustive(node);
  }
}

function evaluateBooleanLiteralExpression(node: BooleanLiteralExpression): EvaluatedToBoolean {
  return {
    type: EvaluatedType.Boolean,
    value: node.value,
  };
}

function evaluateIntegerLiteralExpression(node: IntegerLiteralExpression): EvaluatedToInteger {
  return {
    type: EvaluatedType.Integer,
    value: node.value,
  };
}

function evaluateStringLiteral(node: StringLiteralExpression): EvaluatedTo {
  return {
    type: EvaluatedType.String,
    value: node.value,
  };
}

function evaluateIdentifierExpression(node: IdentifierExpression, env: Environment): EvaluatedTo {
  const value = env.get(node.value) ?? builtins[node.value];
  assert(value !== undefined, 'identifier not found', { node, env });
  return value;
}

function evaluateFunctionLiteralExpression(node: FunctionLiteralExpression, env: Environment): EvaluatedToFunction {
  return {
    type: EvaluatedType.Function,
    parameters: node.parameters,
    body: node.body,
    environment: env,
  };
}

function evaluateCallExpression(node: CallExpression, env: Environment): EvaluatedTo {
  const createArgs = () => node.args.map((arg) => evaluateExpression(arg, env));

  const expression = evaluateExpression(node.func, env);
  if (expression.type === EvaluatedType.BuiltIn) {
    return expression.fn(...createArgs());
  }

  assert(expression.type === EvaluatedType.Function, 'not a function', { expression });
  const extendedEnv = new Environment(expression.environment, {
    parameters: expression.parameters,
    values: createArgs(),
  });
  const result = evaluateStatement(expression.body, extendedEnv);
  if (result.type === EvaluatedType.ReturnValue) {
    return result.value;
  }
  return result;
}

function evaluateInfixExpression(
  node: InfixExpression,
  env: Environment
): EvaluatedToBoolean | EvaluatedToInteger | EvaluatedToString {
  switch (node.operator) {
    case EqualsOperator:
      return {
        type: EvaluatedType.Boolean,
        value: equals(evaluateExpression(node.left, env), evaluateExpression(node.right, env), env),
      };
    case NotEqualsOperator:
      return {
        type: EvaluatedType.Boolean,
        value: !equals(evaluateExpression(node.left, env), evaluateExpression(node.right, env), env),
      };
    case GreaterThanOperator:
      return {
        type: EvaluatedType.Boolean,
        value: greaterThan(node.left, node.right, env),
      };
    case LessThanOperator:
      return {
        type: EvaluatedType.Boolean,
        value: lessThan(node.left, node.right, env),
      };
    case PlusOperator: {
      const value = plus(node.left, node.right, env);
      return typeof value === 'number' ? { type: EvaluatedType.Integer, value } : { type: EvaluatedType.String, value };
    }
    case MinusOperator:
      return {
        type: EvaluatedType.Integer,
        value: minus(node.left, node.right, env),
      };
    case AsteriskOperator:
      return {
        type: EvaluatedType.Integer,
        value: multiply(node.left, node.right, env),
      };
    case SlashOperator:
      return {
        type: EvaluatedType.Integer,
        value: divide(node.left, node.right, env),
      };
    default:
      return checkExhaustive(node.operator);
  }
}

function evaluatePrefixExpression(node: PrefixExpression, env: Environment): EvaluatedToBoolean | EvaluatedToInteger {
  switch (node.operator) {
    case BangOperator:
      return evaluateBangOperatorExpression(evaluateExpression(node.right, env));
    case MinusOperator:
      return evaluateMinusOperatorExpression(evaluateExpression(node.right, env));
    default:
      return checkExhaustive(node.operator);
  }
}

function evaluateIfExpression(node: IfExpression, env: Environment): EvaluatedTo {
  const evaluatedCondition = evaluateExpression(node.condition, env);
  if (isTruthy(evaluatedCondition)) {
    return evaluateStatement(node.consequence, env);
  }
  if (node.alternative !== undefined) {
    return evaluateStatement(node.alternative, env);
  }
  return { type: EvaluatedType.Null };
}

function evaluateBlockStatement(node: BlockStatement, env: Environment): EvaluatedTo {
  assert(node.statements.length > 0, 'invalid block statement', { node, env });
  let result!: EvaluatedTo;
  for (const statement of node.statements) {
    result = evaluateStatement(statement, env);
    if (result.type === EvaluatedType.ReturnValue) {
      return result;
    }
  }
  return result;
}

function evaluateLetStatement(node: LetStatement, env: Environment): EvaluatedTo {
  const value = evaluateExpression(node.value, env);
  env.set(node.name.value, value);
  return value;
}

function evaluateReturnStatement(node: ReturnStatement, env: Environment): EvaluatedTo {
  return {
    type: EvaluatedType.ReturnValue,
    value: evaluateExpression(node.value, env),
  };
}

function evaluateArrayLiteralExpression(node: ArrayLiteralExpression, env: Environment): EvaluatedTo {
  return {
    type: EvaluatedType.Array,
    elements: node.elements.map((element) => evaluateExpression(element, env)),
  };
}

function evaluateIndexExpression(node: IndexExpression, env: Environment): EvaluatedTo {
  const left = evaluateExpression(node.left, env);
  const index = evaluateExpression(node.index, env);
  assert(left.type === EvaluatedType.Array && index.type === EvaluatedType.Integer, 'not supported for indexing', {
    left,
    index,
  });
  return evalArrayIndexAccess(left, index);
}

function evalArrayIndexAccess(node: EvaluatedToArray, index: EvaluatedToInteger): EvaluatedTo {
  const idx = index.value;
  assert(idx > -1 && idx < node.elements.length, 'invalid index', { node, index });
  return node.elements[idx];
}

function evaluateBangOperatorExpression(right: EvaluatedTo): EvaluatedToBoolean {
  switch (right.type) {
    case EvaluatedType.Boolean:
      return {
        type: EvaluatedType.Boolean,
        value: !right.value,
      };
    case EvaluatedType.Null:
      return {
        type: EvaluatedType.Boolean,
        value: true,
      };
    default:
      return {
        type: EvaluatedType.Boolean,
        value: false,
      };
  }
}

function evaluateMinusOperatorExpression(argument: EvaluatedTo): EvaluatedToInteger {
  assert(argument.type === EvaluatedType.Integer, 'invalid argument for minus operator', { argument });
  return {
    type: EvaluatedType.Integer,
    value: -argument.value,
  };
}

function equals(a: EvaluatedTo, b: EvaluatedTo, env: Environment): boolean {
  return (
    (a.type === EvaluatedType.Null && b.type === EvaluatedType.Null) ||
    (a.type === EvaluatedType.Boolean && b.type === EvaluatedType.Boolean && a.value === b.value) ||
    (a.type === EvaluatedType.String && b.type === EvaluatedType.String && a.value === b.value) ||
    (a.type === EvaluatedType.Integer && b.type === EvaluatedType.Integer && a.value === b.value) ||
    (a.type === EvaluatedType.Array &&
      b.type === EvaluatedType.Array &&
      a.elements.length === b.elements.length &&
      a.elements.every((item, index) => equals(item, b.elements[index], env)))
  );
}

function greaterThan(left: Expression, right: Expression, env: Environment): boolean {
  return integerOperation(left, right, env, (a, b) => a > b);
}

function lessThan(left: Expression, right: Expression, env: Environment): boolean {
  return integerOperation(left, right, env, (a, b) => a < b);
}

function plus(left: Expression, right: Expression, env: Environment): string | number {
  const a = evaluateExpression(left, env);
  if (a.type === EvaluatedType.String) {
    const b = evaluateExpression(right, env);
    assert(b.type === EvaluatedType.String, 'invalid argument for string infix operation', { right: b });
    return a.value + b.value;
  }
  assert(a.type === EvaluatedType.Integer, 'invalid argument for integer infix operation', { left: a });
  const b = evaluateExpression(right, env);
  assert(b.type === EvaluatedType.Integer, 'invalid argument for integer infix operation', { right: b });
  return a.value + b.value;
}

function minus(left: Expression, right: Expression, env: Environment): number {
  return integerOperation(left, right, env, (a, b) => a - b);
}

function divide(left: Expression, right: Expression, env: Environment): number {
  return integerOperation(left, right, env, (a, b) => a / b);
}

function multiply(left: Expression, right: Expression, env: Environment): number {
  return integerOperation(left, right, env, (a, b) => a * b);
}

function integerOperation<T>(
  left: Expression,
  right: Expression,
  env: Environment,
  operation: (a: number, b: number) => T
): T {
  const a = evaluateExpression(left, env);
  assert(a.type === EvaluatedType.Integer, 'invalid argument for integer infix operation', { left: a });
  const b = evaluateExpression(right, env);
  assert(b.type === EvaluatedType.Integer, 'invalid argument for integer infix operation', { right: b });
  return operation(a.value, b.value);
}

function isTruthy(arg: EvaluatedTo): boolean {
  switch (arg.type) {
    case EvaluatedType.Null:
      return false;
    case EvaluatedType.Boolean:
      return arg.value;
    default:
      return true;
  }
}
