import { BlockStatement, IdentifierExpression } from './ast';
import { Environment } from './environment';

export enum EvaluatedType {
  Null = 'Null',
  ReturnValue = 'ReturnValue',
  Integer = 'Integer',
  Boolean = 'Boolean',
  String = 'String',
  Function = 'Function',
  BuiltIn = 'BuiltIn',
  Array = 'Array',
  Object = 'Object',
}

export type EvaluatedToInteger = {
  type: EvaluatedType.Integer;
  value: number;
};

export type EvaluatedToString = {
  type: EvaluatedType.String;
  value: string;
};

export type EvaluatedToBoolean = {
  type: EvaluatedType.Boolean;
  value: boolean;
};

export type EvaluatedToNull = {
  type: EvaluatedType.Null;
};

export type EvaluatedToReturnValue = {
  type: EvaluatedType.ReturnValue;
  value: EvaluatedTo;
};

export type EvaluatedToFunction = {
  type: EvaluatedType.Function;
  parameters: IdentifierExpression[];
  body: BlockStatement;
  environment: Environment;
};

export type BuiltInFn = (...args: EvaluatedTo[]) => EvaluatedTo;

export type EvaluatedToBuiltIn = {
  type: EvaluatedType.BuiltIn;
  fn: BuiltInFn;
};

export type EvaluatedToArray = {
  type: EvaluatedType.Array;
  elements: EvaluatedTo[];
};

export type HashKey = number;
export type EvaluatedToObjectEntry = {
  key: EvaluatedTo;
  value: EvaluatedTo;
};
export type EvaluatedToObject = {
  type: EvaluatedType.Object;
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
