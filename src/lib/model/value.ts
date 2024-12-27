import type { BlockStatement, IdentifierExpression } from './ast';
import type { Environment } from './environment';

export type ValueInteger = {
  type: 'integer';
  value: number;
};

export type ValueString = {
  type: 'string';
  value: string;
};

export type ValueBoolean = {
  type: 'boolean';
  value: boolean;
};

export type ValueNull = {
  type: 'null';
};

export type ValueReturnValue = {
  type: 'returnValue';
  value: Value;
};

export type ValueFunction = {
  type: 'function';
  parameters: IdentifierExpression[];
  body: BlockStatement;
  environment: Environment;
};

export type BuiltInFn = (...args: Value[]) => Value;

export type ValueBuiltIn = {
  type: 'builtIn';
  fn: BuiltInFn;
};

export type ValueArray = {
  type: 'array';
  elements: Value[];
};

export type HashKey = number;
export type ValueObjectEntry = {
  key: Value;
  value: Value;
};
export type ValueObject = {
  type: 'object';
  pairs: Record<HashKey, ValueObjectEntry>;
};

export type Value =
  | ValueInteger
  | ValueString
  | ValueBoolean
  | ValueNull
  | ValueReturnValue
  | ValueFunction
  | ValueBuiltIn
  | ValueArray
  | ValueObject;
