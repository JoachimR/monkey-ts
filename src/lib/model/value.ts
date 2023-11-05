import type { BlockStatement, IdentifierExpression } from './ast';
import type { Environment } from './environment';

export const valueTypes = {
  Null: 'Null',
  ReturnValue: 'ReturnValue',
  Integer: 'Integer',
  Boolean: 'Boolean',
  String: 'String',
  Function: 'Function',
  BuiltIn: 'BuiltIn',
  Array: 'Array',
  Object: 'Object',
} as const;

export type ValueInteger = {
  type: typeof valueTypes.Integer;
  value: number;
};

export type ValueString = {
  type: typeof valueTypes.String;
  value: string;
};

export type ValueBoolean = {
  type: typeof valueTypes.Boolean;
  value: boolean;
};

export type ValueNull = {
  type: typeof valueTypes.Null;
};

export type ValueReturnValue = {
  type: typeof valueTypes.ReturnValue;
  value: Value;
};

export type ValueFunction = {
  type: typeof valueTypes.Function;
  parameters: IdentifierExpression[];
  body: BlockStatement;
  environment: Environment;
};

export type BuiltInFn = (...args: Value[]) => Value;

export type ValueBuiltIn = {
  type: typeof valueTypes.BuiltIn;
  fn: BuiltInFn;
};

export type ValueArray = {
  type: typeof valueTypes.Array;
  elements: Value[];
};

export type HashKey = number;
export type ValueObjectEntry = {
  key: Value;
  value: Value;
};
export type ValueObject = {
  type: typeof valueTypes.Object;
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
