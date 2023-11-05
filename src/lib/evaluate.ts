import { assert, checkExhaustive, log } from '../utils';
import type {
  ArrayLiteralExpression,
  BlockStatement,
  BooleanLiteralExpression,
  CallExpression,
  Expression,
  FunctionLiteralExpression,
  IdentifierExpression,
  IfExpression,
  IndexExpression,
  InfixExpression,
  IntegerLiteralExpression,
  LetStatement,
  ObjectLiteralExpression,
  PrefixExpression,
  Program,
  ReturnStatement,
  Statement,
  StringLiteralExpression,
} from './model/ast';
import { expressionTypes, statementTypes } from './model/ast';
import { createHashKey } from './model/create-hash-key';
import type { Environment } from './model/environment';
import { createEnvironment, getFromEnvironment, storeInEnvironment } from './model/environment';
import type {
  EvaluatedTo,
  EvaluatedToArray,
  EvaluatedToBoolean,
  EvaluatedToBuiltIn,
  EvaluatedToFunction,
  EvaluatedToInteger,
  EvaluatedToObject,
  EvaluatedToString,
} from './model/evaluated-to';
import { evaluatedTypes } from './model/evaluated-to';
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
import { evaluatedToString } from './model/evaluated-to-string';

export function evaluate(node: Program): EvaluatedTo {
  return evaluateProgram(node, createEnvironment());
}

function evaluateProgram(node: Program, env: Environment): EvaluatedTo {
  let result!: EvaluatedTo;
  for (const statement of node.body) {
    result = evaluateStatement(statement, env);
    if (result.type === evaluatedTypes.ReturnValue) {
      return result.value;
    }
  }
  return result;
}

function evaluateStatement(node: Statement, env: Environment): EvaluatedTo {
  switch (node.statementType) {
    case statementTypes.Let:
      return evaluateLetStatement(node, env);
    case statementTypes.Expression:
      return evaluateExpression(node.expression, env);
    case statementTypes.Block:
      return evaluateBlockStatement(node, env);
    case statementTypes.Return:
      return evaluateReturnStatement(node, env);
    default:
      return checkExhaustive(node);
  }
}

function evaluateExpression(node: Expression, env: Environment): EvaluatedTo {
  switch (node.expressionType) {
    case expressionTypes.BooleanLiteral:
      return evaluateBooleanLiteralExpression(node);
    case expressionTypes.IntegerLiteral:
      return evaluateIntegerLiteralExpression(node);
    case expressionTypes.StringLiteral:
      return evaluateStringLiteral(node);
    case expressionTypes.Identifier:
      return evaluateIdentifierExpression(node, env);
    case expressionTypes.PrefixExpression:
      return evaluatePrefixExpression(node, env);
    case expressionTypes.InfixExpression:
      return evaluateInfixExpression(node, env);
    case expressionTypes.FunctionLiteral:
      return evaluateFunctionLiteralExpression(node, env);
    case expressionTypes.CallExpression:
      return evaluateCallExpression(node, env);
    case expressionTypes.ArrayLiteral:
      return evaluateArrayLiteralExpression(node, env);
    case expressionTypes.IfExpression:
      return evaluateIfExpression(node, env);
    case expressionTypes.IndexExpression:
      return evaluateIndexExpression(node, env);
    case expressionTypes.ObjectLiteral:
      return evaluateObjectLiteralExpression(node, env);
    default:
      return checkExhaustive(node);
  }
}

function evaluateBooleanLiteralExpression(node: BooleanLiteralExpression): EvaluatedToBoolean {
  return {
    type: evaluatedTypes.Boolean,
    value: node.value,
  };
}

function evaluateIntegerLiteralExpression(node: IntegerLiteralExpression): EvaluatedToInteger {
  return {
    type: evaluatedTypes.Integer,
    value: node.value,
  };
}

function evaluateStringLiteral(node: StringLiteralExpression): EvaluatedTo {
  return {
    type: evaluatedTypes.String,
    value: node.value,
  };
}

function evaluateIdentifierExpression(node: IdentifierExpression, env: Environment): EvaluatedTo {
  const value = getFromEnvironment(env, node.value) ?? builtins[node.value];
  assert(value !== undefined, 'identifier not found', { node, env });
  return value;
}

function evaluateFunctionLiteralExpression(node: FunctionLiteralExpression, env: Environment): EvaluatedToFunction {
  return {
    type: evaluatedTypes.Function,
    parameters: node.parameters,
    body: node.body,
    environment: env,
  };
}

function evaluateCallExpression(node: CallExpression, env: Environment): EvaluatedTo {
  const createArgs = () => node.args.map((arg) => evaluateExpression(arg, env));

  const expression = evaluateExpression(node.func, env);
  if (expression.type === evaluatedTypes.BuiltIn) {
    return expression.fn(...createArgs());
  }

  assert(expression.type === evaluatedTypes.Function, 'not a function', { expression });
  const extendedEnv = createEnvironment(expression.environment, {
    parameters: expression.parameters,
    values: createArgs(),
  });
  const result = evaluateStatement(expression.body, extendedEnv);
  if (result.type === evaluatedTypes.ReturnValue) {
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
        type: evaluatedTypes.Boolean,
        value: equals(evaluateExpression(node.left, env), evaluateExpression(node.right, env), env),
      };
    case NotEqualsOperator:
      return {
        type: evaluatedTypes.Boolean,
        value: !equals(evaluateExpression(node.left, env), evaluateExpression(node.right, env), env),
      };
    case GreaterThanOperator:
      return {
        type: evaluatedTypes.Boolean,
        value: greaterThan(node.left, node.right, env),
      };
    case LessThanOperator:
      return {
        type: evaluatedTypes.Boolean,
        value: lessThan(node.left, node.right, env),
      };
    case PlusOperator: {
      const value = plus(node.left, node.right, env);
      return typeof value === 'number'
        ? { type: evaluatedTypes.Integer, value }
        : { type: evaluatedTypes.String, value };
    }
    case MinusOperator:
      return {
        type: evaluatedTypes.Integer,
        value: minus(node.left, node.right, env),
      };
    case AsteriskOperator:
      return {
        type: evaluatedTypes.Integer,
        value: multiply(node.left, node.right, env),
      };
    case SlashOperator:
      return {
        type: evaluatedTypes.Integer,
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
  return { type: evaluatedTypes.Null };
}

function evaluateBlockStatement(node: BlockStatement, env: Environment): EvaluatedTo {
  assert(node.statements.length > 0, 'invalid block statement', { node, env });
  let result!: EvaluatedTo;
  for (const statement of node.statements) {
    result = evaluateStatement(statement, env);
    if (result.type === evaluatedTypes.ReturnValue) {
      return result;
    }
  }
  return result;
}

function evaluateLetStatement(node: LetStatement, env: Environment): EvaluatedTo {
  const value = evaluateExpression(node.value, env);
  storeInEnvironment(env, node.name.value, value);
  return value;
}

function evaluateReturnStatement(node: ReturnStatement, env: Environment): EvaluatedTo {
  return {
    type: evaluatedTypes.ReturnValue,
    value: evaluateExpression(node.value, env),
  };
}

function evaluateArrayLiteralExpression(node: ArrayLiteralExpression, env: Environment): EvaluatedTo {
  return {
    type: evaluatedTypes.Array,
    elements: node.elements.map((element) => evaluateExpression(element, env)),
  };
}

function evaluateObjectLiteralExpression(node: ObjectLiteralExpression, env: Environment): EvaluatedToObject {
  const pairs: EvaluatedToObject['pairs'] = {};
  for (const pair of node.pairs) {
    const key = evaluateExpression(pair[0], env);
    const hashKey = createHashKey(key);
    const value = evaluateExpression(pair[1], env);
    pairs[hashKey] = { key, value };
  }
  return {
    type: evaluatedTypes.Object,
    pairs,
  };
}

function evaluateIndexExpression(node: IndexExpression, env: Environment): EvaluatedTo {
  const left = evaluateExpression(node.left, env);
  const index = evaluateExpression(node.index, env);
  if (left.type === evaluatedTypes.Array) {
    assert(index.type === evaluatedTypes.Integer, 'not supported for indexing', { left, index });
    return evalArrayIndexAccess(left, index);
  }
  assert(left.type === evaluatedTypes.Object, 'not supported for indexing', { left });
  assert(
    index.type === evaluatedTypes.Integer ||
      index.type === evaluatedTypes.String ||
      index.type === evaluatedTypes.Boolean,
    'not supported for indexing',
    { left, index }
  );
  return evalObjectIndexAccess(left, index);
}

function evalArrayIndexAccess(node: EvaluatedToArray, index: EvaluatedToInteger): EvaluatedTo {
  const idx = index.value;
  assert(idx > -1 && idx < node.elements.length, 'invalid index', { node, index });
  return node.elements[idx];
}

function evalObjectIndexAccess(
  node: EvaluatedToObject,
  index: EvaluatedToInteger | EvaluatedToString | EvaluatedToBoolean
): EvaluatedTo {
  const idx = createHashKey(index);
  const val = node.pairs[idx];
  if (!val) {
    return { type: evaluatedTypes.Null };
  }
  return val.value;
}

function evaluateBangOperatorExpression(right: EvaluatedTo): EvaluatedToBoolean {
  switch (right.type) {
    case evaluatedTypes.Boolean:
      return {
        type: evaluatedTypes.Boolean,
        value: !right.value,
      };
    case evaluatedTypes.Null:
      return {
        type: evaluatedTypes.Boolean,
        value: true,
      };
    default:
      return {
        type: evaluatedTypes.Boolean,
        value: false,
      };
  }
}

function evaluateMinusOperatorExpression(argument: EvaluatedTo): EvaluatedToInteger {
  assert(argument.type === evaluatedTypes.Integer, 'invalid argument for minus operator', { argument });
  return {
    type: evaluatedTypes.Integer,
    value: -argument.value,
  };
}

function equals(a: EvaluatedTo, b: EvaluatedTo, env: Environment): boolean {
  return (
    (a.type === evaluatedTypes.Null && b.type === evaluatedTypes.Null) ||
    (a.type === evaluatedTypes.Boolean && b.type === evaluatedTypes.Boolean && a.value === b.value) ||
    (a.type === evaluatedTypes.String && b.type === evaluatedTypes.String && a.value === b.value) ||
    (a.type === evaluatedTypes.Integer && b.type === evaluatedTypes.Integer && a.value === b.value) ||
    (a.type === evaluatedTypes.Array &&
      b.type === evaluatedTypes.Array &&
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
  if (a.type === evaluatedTypes.String) {
    const b = evaluateExpression(right, env);
    assert(b.type === evaluatedTypes.String, 'invalid argument for string infix operation', { right: b });
    return a.value + b.value;
  }
  assert(a.type === evaluatedTypes.Integer, 'invalid argument for integer infix operation', { left: a });
  const b = evaluateExpression(right, env);
  assert(b.type === evaluatedTypes.Integer, 'invalid argument for integer infix operation', { right: b });
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
  assert(a.type === evaluatedTypes.Integer, 'invalid argument for integer infix operation', { left: a });
  const b = evaluateExpression(right, env);
  assert(b.type === evaluatedTypes.Integer, 'invalid argument for integer infix operation', { right: b });
  return operation(a.value, b.value);
}

function isTruthy(arg: EvaluatedTo): boolean {
  switch (arg.type) {
    case evaluatedTypes.Null:
      return false;
    case evaluatedTypes.Boolean:
      return arg.value;
    default:
      return true;
  }
}

const builtins: Record<string, EvaluatedToBuiltIn> = {
  len: {
    type: evaluatedTypes.BuiltIn,
    fn: (...args: EvaluatedTo[]) => {
      assert(args.length === 1, 'wrong number of arguments', { args });
      const arg = args[0];
      if (arg.type === evaluatedTypes.String) {
        return {
          type: evaluatedTypes.Integer,
          value: arg.value.length,
        };
      }
      assert(arg.type === evaluatedTypes.Array, 'invalid argument', { args });
      return {
        type: evaluatedTypes.Integer,
        value: arg.elements.length,
      };
    },
  },
  first: {
    type: evaluatedTypes.BuiltIn,
    fn: (...args: EvaluatedTo[]) => {
      assert(args.length === 1, 'wrong number of arguments', { args });
      const arg = args[0];
      assert(arg.type === evaluatedTypes.Array, 'invalid argument', { args });
      if (arg.elements.length === 0) {
        return { type: evaluatedTypes.Null };
      }
      return arg.elements[0];
    },
  },
  last: {
    type: evaluatedTypes.BuiltIn,
    fn: (...args: EvaluatedTo[]) => {
      assert(args.length === 1, 'wrong number of arguments', { args });
      const arg = args[0];
      assert(arg.type === evaluatedTypes.Array, 'invalid argument', { args });
      if (arg.elements.length === 0) {
        return { type: evaluatedTypes.Null };
      }
      const last = arg.elements.at(-1);
      assert(last, 'invalid argument', { args });
      return last;
    },
  },
  rest: {
    type: evaluatedTypes.BuiltIn,
    fn: (...args: EvaluatedTo[]) => {
      assert(args.length === 1, 'wrong number of arguments', { args });
      const arg = args[0];
      assert(arg.type === evaluatedTypes.Array, 'invalid argument', { args });
      if (arg.elements.length === 0) {
        return { type: evaluatedTypes.Null };
      }
      return {
        type: evaluatedTypes.Array,
        elements: arg.elements.slice(1),
      };
    },
  },
  push: {
    type: evaluatedTypes.BuiltIn,
    fn: (...args: EvaluatedTo[]) => {
      assert(args.length === 2, 'wrong number of arguments', { args });
      const arg = args[0];
      assert(arg.type === evaluatedTypes.Array, 'invalid argument', { args });
      return {
        type: evaluatedTypes.Array,
        elements: [...arg.elements, args[1]],
      };
    },
  },
  puts: {
    type: evaluatedTypes.BuiltIn,
    fn: (...args: EvaluatedTo[]) => {
      for (const arg of args) {
        const val = evaluatedToString(arg);
        log(val);
      }
      return { type: evaluatedTypes.Null };
    },
  },
};
