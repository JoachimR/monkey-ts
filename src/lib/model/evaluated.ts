import { BlockStatement, IdentifierExpression } from './ast';
import { astNodeToString } from './ast-node-to-string';
import { Environment } from './environment';

export enum EvaluatedType {
  Null = 'Null',
  ReturnValue = 'ReturnValue',
  Integer = 'Integer',
  Function = 'Function',
  Boolean = 'Boolean',
  String = 'String',
  Array = 'Array',
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

export type EvaluatedToArray = {
  type: EvaluatedType.Array;
  elements: EvaluatedTo[];
};

export type EvaluatedTo =
  | EvaluatedToInteger
  | EvaluatedToString
  | EvaluatedToBoolean
  | EvaluatedToNull
  | EvaluatedToReturnValue
  | EvaluatedToFunction
  | EvaluatedToArray;
