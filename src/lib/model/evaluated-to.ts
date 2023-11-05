import type { BlockStatement, IdentifierExpression } from './ast';
import type { Environment } from './environment';

export const evaluatedTypes = {
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

export type EvaluatedToInteger = {
  type: typeof evaluatedTypes.Integer;
  value: number;
};

export type EvaluatedToString = {
  type: typeof evaluatedTypes.String;
  value: string;
};

export type EvaluatedToBoolean = {
  type: typeof evaluatedTypes.Boolean;
  value: boolean;
};

export type EvaluatedToNull = {
  type: typeof evaluatedTypes.Null;
};

export type EvaluatedToReturnValue = {
  type: typeof evaluatedTypes.ReturnValue;
  value: EvaluatedTo;
};

export type EvaluatedToFunction = {
  type: typeof evaluatedTypes.Function;
  parameters: IdentifierExpression[];
  body: BlockStatement;
  environment: Environment;
};

export type BuiltInFn = (...args: EvaluatedTo[]) => EvaluatedTo;

export type EvaluatedToBuiltIn = {
  type: typeof evaluatedTypes.BuiltIn;
  fn: BuiltInFn;
};

export type EvaluatedToArray = {
  type: typeof evaluatedTypes.Array;
  elements: EvaluatedTo[];
};

export type HashKey = number;
export type EvaluatedToObjectEntry = {
  key: EvaluatedTo;
  value: EvaluatedTo;
};
export type EvaluatedToObject = {
  type: typeof evaluatedTypes.Object;
  pairs: Record<HashKey, EvaluatedToObjectEntry>;
};

export type EvaluatedTo =
  | EvaluatedToInteger
  | EvaluatedToString
  | EvaluatedToBoolean
  | EvaluatedToNull
  | EvaluatedToReturnValue
  | EvaluatedToFunction
  | EvaluatedToBuiltIn
  | EvaluatedToArray
  | EvaluatedToObject;
