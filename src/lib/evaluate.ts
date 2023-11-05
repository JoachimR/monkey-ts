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
  Value,
  ValueArray,
  ValueBoolean,
  ValueBuiltIn,
  ValueFunction,
  ValueInteger,
  ValueObject,
  ValueString,
} from './model/value';
import { valueTypes } from './model/value';
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
import { valueToString } from './model/value-to-string';

export function evaluate(node: Program): Value {
  return evaluateProgram(node, createEnvironment());
}

function evaluateProgram(node: Program, env: Environment): Value {
  let result!: Value;
  for (const statement of node.body) {
    result = evaluateStatement(statement, env);
    if (result.type === valueTypes.ReturnValue) {
      return result.value;
    }
  }
  return result;
}

function evaluateStatement(node: Statement, env: Environment): Value {
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

function evaluateExpression(node: Expression, env: Environment): Value {
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

function evaluateBooleanLiteralExpression(node: BooleanLiteralExpression): ValueBoolean {
  return {
    type: valueTypes.Boolean,
    value: node.value,
  };
}

function evaluateIntegerLiteralExpression(node: IntegerLiteralExpression): ValueInteger {
  return {
    type: valueTypes.Integer,
    value: node.value,
  };
}

function evaluateStringLiteral(node: StringLiteralExpression): Value {
  return {
    type: valueTypes.String,
    value: node.value,
  };
}

function evaluateIdentifierExpression(node: IdentifierExpression, env: Environment): Value {
  const value = getFromEnvironment(env, node.value) ?? builtins[node.value];
  assert(value !== undefined, 'identifier not found', { node, env });
  return value;
}

function evaluateFunctionLiteralExpression(node: FunctionLiteralExpression, env: Environment): ValueFunction {
  return {
    type: valueTypes.Function,
    parameters: node.parameters,
    body: node.body,
    environment: env,
  };
}

function evaluateCallExpression(node: CallExpression, env: Environment): Value {
  const createArgs = () => node.args.map((arg) => evaluateExpression(arg, env));

  const expression = evaluateExpression(node.func, env);
  if (expression.type === valueTypes.BuiltIn) {
    return expression.fn(...createArgs());
  }

  assert(expression.type === valueTypes.Function, 'not a function', { expression });
  const extendedEnv = createEnvironment(expression.environment, {
    parameters: expression.parameters,
    values: createArgs(),
  });
  const result = evaluateStatement(expression.body, extendedEnv);
  if (result.type === valueTypes.ReturnValue) {
    return result.value;
  }
  return result;
}

function evaluateInfixExpression(node: InfixExpression, env: Environment): ValueBoolean | ValueInteger | ValueString {
  switch (node.operator) {
    case EqualsOperator:
      return {
        type: valueTypes.Boolean,
        value: equals(evaluateExpression(node.left, env), evaluateExpression(node.right, env), env),
      };
    case NotEqualsOperator:
      return {
        type: valueTypes.Boolean,
        value: !equals(evaluateExpression(node.left, env), evaluateExpression(node.right, env), env),
      };
    case GreaterThanOperator:
      return {
        type: valueTypes.Boolean,
        value: greaterThan(node.left, node.right, env),
      };
    case LessThanOperator:
      return {
        type: valueTypes.Boolean,
        value: lessThan(node.left, node.right, env),
      };
    case PlusOperator: {
      const value = plus(node.left, node.right, env);
      return typeof value === 'number' ? { type: valueTypes.Integer, value } : { type: valueTypes.String, value };
    }
    case MinusOperator:
      return {
        type: valueTypes.Integer,
        value: minus(node.left, node.right, env),
      };
    case AsteriskOperator:
      return {
        type: valueTypes.Integer,
        value: multiply(node.left, node.right, env),
      };
    case SlashOperator:
      return {
        type: valueTypes.Integer,
        value: divide(node.left, node.right, env),
      };
    default:
      return checkExhaustive(node.operator);
  }
}

function evaluatePrefixExpression(node: PrefixExpression, env: Environment): ValueBoolean | ValueInteger {
  switch (node.operator) {
    case BangOperator:
      return evaluateBangOperatorExpression(evaluateExpression(node.right, env));
    case MinusOperator:
      return evaluateMinusOperatorExpression(evaluateExpression(node.right, env));
    default:
      return checkExhaustive(node.operator);
  }
}

function evaluateIfExpression(node: IfExpression, env: Environment): Value {
  const value = evaluateExpression(node.condition, env);
  if (isTruthy(value)) {
    return evaluateStatement(node.consequence, env);
  }
  if (node.alternative !== undefined) {
    return evaluateStatement(node.alternative, env);
  }
  return { type: valueTypes.Null };
}

function evaluateBlockStatement(node: BlockStatement, env: Environment): Value {
  assert(node.statements.length > 0, 'invalid block statement', { node, env });
  let result!: Value;
  for (const statement of node.statements) {
    result = evaluateStatement(statement, env);
    if (result.type === valueTypes.ReturnValue) {
      return result;
    }
  }
  return result;
}

function evaluateLetStatement(node: LetStatement, env: Environment): Value {
  const value = evaluateExpression(node.value, env);
  storeInEnvironment(env, node.name.value, value);
  return value;
}

function evaluateReturnStatement(node: ReturnStatement, env: Environment): Value {
  return {
    type: valueTypes.ReturnValue,
    value: evaluateExpression(node.value, env),
  };
}

function evaluateArrayLiteralExpression(node: ArrayLiteralExpression, env: Environment): Value {
  return {
    type: valueTypes.Array,
    elements: node.elements.map((element) => evaluateExpression(element, env)),
  };
}

function evaluateObjectLiteralExpression(node: ObjectLiteralExpression, env: Environment): ValueObject {
  const pairs: ValueObject['pairs'] = {};
  for (const pair of node.pairs) {
    const key = evaluateExpression(pair[0], env);
    const hashKey = createHashKey(key);
    const value = evaluateExpression(pair[1], env);
    pairs[hashKey] = { key, value };
  }
  return {
    type: valueTypes.Object,
    pairs,
  };
}

function evaluateIndexExpression(node: IndexExpression, env: Environment): Value {
  const left = evaluateExpression(node.left, env);
  const index = evaluateExpression(node.index, env);
  if (left.type === valueTypes.Array) {
    assert(index.type === valueTypes.Integer, 'not supported for indexing', { left, index });
    return evalArrayIndexAccess(left, index);
  }
  assert(left.type === valueTypes.Object, 'not supported for indexing', { left });
  assert(
    index.type === valueTypes.Integer || index.type === valueTypes.String || index.type === valueTypes.Boolean,
    'not supported for indexing',
    { left, index }
  );
  return evalObjectIndexAccess(left, index);
}

function evalArrayIndexAccess(node: ValueArray, index: ValueInteger): Value {
  const idx = index.value;
  assert(idx > -1 && idx < node.elements.length, 'invalid index', { node, index });
  return node.elements[idx];
}

function evalObjectIndexAccess(node: ValueObject, index: ValueInteger | ValueString | ValueBoolean): Value {
  const idx = createHashKey(index);
  const val = node.pairs[idx];
  if (!val) {
    return { type: valueTypes.Null };
  }
  return val.value;
}

function evaluateBangOperatorExpression(right: Value): ValueBoolean {
  switch (right.type) {
    case valueTypes.Boolean:
      return {
        type: valueTypes.Boolean,
        value: !right.value,
      };
    case valueTypes.Null:
      return {
        type: valueTypes.Boolean,
        value: true,
      };
    default:
      return {
        type: valueTypes.Boolean,
        value: false,
      };
  }
}

function evaluateMinusOperatorExpression(argument: Value): ValueInteger {
  assert(argument.type === valueTypes.Integer, 'invalid argument for minus operator', { argument });
  return {
    type: valueTypes.Integer,
    value: -argument.value,
  };
}

function equals(a: Value, b: Value, env: Environment): boolean {
  return (
    (a.type === valueTypes.Null && b.type === valueTypes.Null) ||
    (a.type === valueTypes.Boolean && b.type === valueTypes.Boolean && a.value === b.value) ||
    (a.type === valueTypes.String && b.type === valueTypes.String && a.value === b.value) ||
    (a.type === valueTypes.Integer && b.type === valueTypes.Integer && a.value === b.value) ||
    (a.type === valueTypes.Array &&
      b.type === valueTypes.Array &&
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
  if (a.type === valueTypes.String) {
    const b = evaluateExpression(right, env);
    assert(b.type === valueTypes.String, 'invalid argument for string infix operation', { right: b });
    return a.value + b.value;
  }
  assert(a.type === valueTypes.Integer, 'invalid argument for integer infix operation', { left: a });
  const b = evaluateExpression(right, env);
  assert(b.type === valueTypes.Integer, 'invalid argument for integer infix operation', { right: b });
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
  assert(a.type === valueTypes.Integer, 'invalid argument for integer infix operation', { left: a });
  const b = evaluateExpression(right, env);
  assert(b.type === valueTypes.Integer, 'invalid argument for integer infix operation', { right: b });
  return operation(a.value, b.value);
}

function isTruthy(arg: Value): boolean {
  switch (arg.type) {
    case valueTypes.Null:
      return false;
    case valueTypes.Boolean:
      return arg.value;
    default:
      return true;
  }
}

const builtins: Record<string, ValueBuiltIn> = {
  len: {
    type: valueTypes.BuiltIn,
    fn: (...args: Value[]) => {
      assert(args.length === 1, 'wrong number of arguments', { args });
      const arg = args[0];
      if (arg.type === valueTypes.String) {
        return {
          type: valueTypes.Integer,
          value: arg.value.length,
        };
      }
      assert(arg.type === valueTypes.Array, 'invalid argument', { args });
      return {
        type: valueTypes.Integer,
        value: arg.elements.length,
      };
    },
  },
  first: {
    type: valueTypes.BuiltIn,
    fn: (...args: Value[]) => {
      assert(args.length === 1, 'wrong number of arguments', { args });
      const arg = args[0];
      assert(arg.type === valueTypes.Array, 'invalid argument', { args });
      if (arg.elements.length === 0) {
        return { type: valueTypes.Null };
      }
      return arg.elements[0];
    },
  },
  last: {
    type: valueTypes.BuiltIn,
    fn: (...args: Value[]) => {
      assert(args.length === 1, 'wrong number of arguments', { args });
      const arg = args[0];
      assert(arg.type === valueTypes.Array, 'invalid argument', { args });
      if (arg.elements.length === 0) {
        return { type: valueTypes.Null };
      }
      const last = arg.elements.at(-1);
      assert(last, 'invalid argument', { args });
      return last;
    },
  },
  rest: {
    type: valueTypes.BuiltIn,
    fn: (...args: Value[]) => {
      assert(args.length === 1, 'wrong number of arguments', { args });
      const arg = args[0];
      assert(arg.type === valueTypes.Array, 'invalid argument', { args });
      if (arg.elements.length === 0) {
        return { type: valueTypes.Null };
      }
      return {
        type: valueTypes.Array,
        elements: arg.elements.slice(1),
      };
    },
  },
  push: {
    type: valueTypes.BuiltIn,
    fn: (...args: Value[]) => {
      assert(args.length === 2, 'wrong number of arguments', { args });
      const arg = args[0];
      assert(arg.type === valueTypes.Array, 'invalid argument', { args });
      return {
        type: valueTypes.Array,
        elements: [...arg.elements, args[1]],
      };
    },
  },
  puts: {
    type: valueTypes.BuiltIn,
    fn: (...args: Value[]) => {
      for (const arg of args) {
        const val = valueToString(arg);
        log(val);
      }
      return { type: valueTypes.Null };
    },
  },
};
