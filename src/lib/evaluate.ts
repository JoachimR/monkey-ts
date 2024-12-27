import { assert, checkExhaustive, log } from '../utils';
import type {
  ArrayLiteralExpression,
  BlockStatement,
  BooleanLiteralExpression,
  CallExpression,
  Expression,
  ForEachStatement,
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
  ReassignStatement,
  ReturnStatement,
  Statement,
  StringLiteralExpression,
} from './model/ast';
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
import { valueToString } from './model/value-to-string';

export function evaluate(node: Program): Value {
  return evaluateProgram(node, createEnvironment());
}

function evaluateProgram(node: Program, env: Environment): Value {
  let result!: Value;
  for (const statement of node.body) {
    result = evaluateStatement(statement, env);
    if (result.type === 'returnValue') {
      return result.value;
    }
  }
  return result;
}

function evaluateStatement(node: Statement, env: Environment): Value {
  switch (node.statementType) {
    case 'let':
      return evaluateLetStatement(node, env);
    case 'expression':
      return evaluateExpression(node.expression, env);
    case 'block':
      return evaluateBlockStatement(node, env);
    case 'return':
      return evaluateReturnStatement(node, env);
    case 'reassign':
      return evaluateReassignStatement(node, env);
    case 'forEach':
      return evaluateForEachStatement(node, env);
    default:
      return checkExhaustive(node);
  }
}

function evaluateExpression(node: Expression, env: Environment): Value {
  switch (node.expressionType) {
    case 'booleanLiteral':
      return evaluateBooleanLiteralExpression(node);
    case 'integerLiteral':
      return evaluateIntegerLiteralExpression(node);
    case 'stringLiteral':
      return evaluateStringLiteral(node);
    case 'identifier':
      return evaluateIdentifierExpression(node, env);
    case 'prefixExpression':
      return evaluatePrefixExpression(node, env);
    case 'infixExpression':
      return evaluateInfixExpression(node, env);
    case 'functionLiteral':
      return evaluateFunctionLiteralExpression(node, env);
    case 'callExpression':
      return evaluateCallExpression(node, env);
    case 'arrayLiteral':
      return evaluateArrayLiteralExpression(node, env);
    case 'ifExpression':
      return evaluateIfExpression(node, env);
    case 'indexExpression':
      return evaluateIndexExpression(node, env);
    case 'objectLiteral':
      return evaluateObjectLiteralExpression(node, env);
    default:
      return checkExhaustive(node);
  }
}

function evaluateBooleanLiteralExpression(node: BooleanLiteralExpression): ValueBoolean {
  return {
    type: 'boolean',
    value: node.value,
  };
}

function evaluateIntegerLiteralExpression(node: IntegerLiteralExpression): ValueInteger {
  return {
    type: 'integer',
    value: node.value,
  };
}

function evaluateStringLiteral(node: StringLiteralExpression): Value {
  return {
    type: 'string',
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
    type: 'function',
    parameters: node.parameters,
    body: node.body,
    environment: env,
  };
}

function evaluateCallExpression(node: CallExpression, env: Environment): Value {
  const createArgs = () => node.args.map((arg) => evaluateExpression(arg, env));

  const expression = evaluateExpression(node.func, env);
  if (expression.type === 'builtIn') {
    return expression.fn(...createArgs());
  }

  assert(expression.type === 'function', 'not a function', { expression });
  const extendedEnv = createEnvironment(expression.environment, {
    parameters: expression.parameters,
    values: createArgs(),
  });
  const result = evaluateStatement(expression.body, extendedEnv);
  if (result.type === 'returnValue') {
    return result.value;
  }
  return result;
}

function evaluateInfixExpression(node: InfixExpression, env: Environment): ValueBoolean | ValueInteger | ValueString {
  switch (node.operator) {
    case '==':
      return {
        type: 'boolean',
        value: equals(evaluateExpression(node.left, env), evaluateExpression(node.right, env), env),
      };
    case '!=':
      return {
        type: 'boolean',
        value: !equals(evaluateExpression(node.left, env), evaluateExpression(node.right, env), env),
      };
    case '<':
      return {
        type: 'boolean',
        value: lessThan(node.left, node.right, env),
      };
    case '>':
      return {
        type: 'boolean',
        value: greaterThan(node.left, node.right, env),
      };
    case '+': {
      const value = plus(node.left, node.right, env);
      return typeof value === 'number' ? { type: 'integer', value } : { type: 'string', value };
    }
    case '-':
      return {
        type: 'integer',
        value: minus(node.left, node.right, env),
      };
    case '*':
      return {
        type: 'integer',
        value: multiply(node.left, node.right, env),
      };
    case '/':
      return {
        type: 'integer',
        value: divide(node.left, node.right, env),
      };
    default:
      return checkExhaustive(node.operator);
  }
}

function evaluatePrefixExpression(node: PrefixExpression, env: Environment): ValueBoolean | ValueInteger {
  switch (node.operator) {
    case '!':
      return evaluateBangOperatorExpression(evaluateExpression(node.right, env));
    case '-':
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
  return { type: 'null' };
}

function evaluateBlockStatement(node: BlockStatement, env: Environment): Value {
  assert(node.statements.length > 0, 'invalid block statement', { node, env });
  let result!: Value;
  for (const statement of node.statements) {
    result = evaluateStatement(statement, env);
    if (result.type === 'returnValue') {
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
    type: 'returnValue',
    value: evaluateExpression(node.value, env),
  };
}

function evaluateReassignStatement(node: ReassignStatement, env: Environment): Value {
  const value = evaluateExpression(node.value, env);
  const existingValue = getFromEnvironment(env, node.name.value);
  assert(existingValue !== undefined, 'cannot reassign undefined variable', { node });
  storeInEnvironment(env, node.name.value, value);
  return value;
}

function evaluateArrayLiteralExpression(node: ArrayLiteralExpression, env: Environment): Value {
  return {
    type: 'array',
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
    type: 'object',
    pairs,
  };
}

function evaluateIndexExpression(node: IndexExpression, env: Environment): Value {
  const left = evaluateExpression(node.left, env);
  const index = evaluateExpression(node.index, env);
  if (left.type === 'array') {
    assert(index.type === 'integer', 'not supported for indexing', { left, index });
    return evalArrayIndexAccess(left, index);
  }
  assert(left.type === 'object', 'not supported for indexing', { left });
  assert(
    index.type === 'integer' || index.type === 'string' || index.type === 'boolean',
    'not supported for indexing',
    { index }
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
    return { type: 'null' };
  }
  return val.value;
}

function evaluateBangOperatorExpression(right: Value): ValueBoolean {
  switch (right.type) {
    case 'boolean':
      return {
        type: 'boolean',
        value: !right.value,
      };
    case 'null':
      return {
        type: 'boolean',
        value: true,
      };
    default:
      return {
        type: 'boolean',
        value: false,
      };
  }
}

function evaluateMinusOperatorExpression(argument: Value): ValueInteger {
  assert(argument.type === 'integer', 'invalid argument for minus operator', { argument });
  return {
    type: 'integer',
    value: -argument.value,
  };
}

function equals(a: Value, b: Value, env: Environment): boolean {
  return (
    (a.type === 'null' && b.type === 'null') ||
    (a.type === 'boolean' && b.type === 'boolean' && a.value === b.value) ||
    (a.type === 'string' && b.type === 'string' && a.value === b.value) ||
    (a.type === 'integer' && b.type === 'integer' && a.value === b.value) ||
    (a.type === 'array' &&
      b.type === 'array' &&
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
  if (a.type === 'string') {
    const b = evaluateExpression(right, env);
    assert(b.type === 'string', 'invalid argument for string infix operation', { right: b });
    return a.value + b.value;
  }
  assert(a.type === 'integer', 'invalid argument for integer infix operation', { left: a });
  const b = evaluateExpression(right, env);
  assert(b.type === 'integer', 'invalid argument for integer infix operation', { right: b });
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
  assert(a.type === 'integer', 'invalid argument for integer infix operation', { left: a });
  const b = evaluateExpression(right, env);
  assert(b.type === 'integer', 'invalid argument for integer infix operation', { right: b });
  return operation(a.value, b.value);
}

function isTruthy(arg: Value): boolean {
  switch (arg.type) {
    case 'null':
      return false;
    case 'boolean':
      return arg.value;
    default:
      return true;
  }
}

function evaluateForEachStatement(node: ForEachStatement, env: Environment): Value {
  const array = evaluateExpression(node.array, env);
  assert(array.type === 'array', 'forEach can only iterate over arrays', { array });
  let result: Value = { type: 'null' };
  for (const element of array.elements) {
    const itEnv = createEnvironment(env);
    storeInEnvironment(itEnv, 'it', element);
    result = evaluateBlockStatement(node.body, itEnv);
  }
  return result;
}

const builtins: Record<string, ValueBuiltIn> = {
  len: {
    type: 'builtIn',
    fn: (...args: Value[]) => {
      assert(args.length === 1, 'wrong number of arguments', { args });
      const arg = args[0];
      if (arg.type === 'string') {
        return {
          type: 'integer',
          value: arg.value.length,
        };
      }
      assert(arg.type === 'array', 'invalid argument', { args });
      return {
        type: 'integer',
        value: arg.elements.length,
      };
    },
  },
  first: {
    type: 'builtIn',
    fn: (...args: Value[]) => {
      assert(args.length === 1, 'wrong number of arguments', { args });
      const arg = args[0];
      assert(arg.type === 'array', 'invalid argument', { args });
      if (arg.elements.length === 0) {
        return { type: 'null' };
      }
      return arg.elements[0];
    },
  },
  last: {
    type: 'builtIn',
    fn: (...args: Value[]) => {
      assert(args.length === 1, 'wrong number of arguments', { args });
      const arg = args[0];
      assert(arg.type === 'array', 'invalid argument', { args });
      if (arg.elements.length === 0) {
        return { type: 'null' };
      }
      const last = arg.elements.at(-1);
      assert(last, 'invalid argument', { args });
      return last;
    },
  },
  rest: {
    type: 'builtIn',
    fn: (...args: Value[]) => {
      assert(args.length === 1, 'wrong number of arguments', { args });
      const arg = args[0];
      assert(arg.type === 'array', 'invalid argument', { args });
      if (arg.elements.length === 0) {
        return { type: 'null' };
      }
      return {
        type: 'array',
        elements: arg.elements.slice(1),
      };
    },
  },
  push: {
    type: 'builtIn',
    fn: (...args: Value[]) => {
      assert(args.length === 2, 'wrong number of arguments', { args });
      const arg = args[0];
      assert(arg.type === 'array', 'invalid argument', { args });
      return {
        type: 'array',
        elements: [...arg.elements, args[1]],
      };
    },
  },
  puts: {
    type: 'builtIn',
    fn: (...args: Value[]) => {
      for (const arg of args) {
        const val = valueToString(arg);
        log(val);
      }
      return { type: 'null' };
    },
  },
};
