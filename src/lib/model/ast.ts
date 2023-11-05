import type { InfixToken, PrefixToken } from './token';

export const statementTypes = {
  Let: 'Let',
  Return: 'Return',
  Expression: 'Expression',
  Block: 'Block',
} as const;

type StatementBase = {
  astType: typeof astNodeTypes.Statement;
};

export type LetStatement = StatementBase & {
  statementType: typeof statementTypes.Let;
  name: IdentifierExpression;
  value: Expression;
};

export type ReturnStatement = StatementBase & {
  statementType: typeof statementTypes.Return;
  value: Expression;
};

export type ExpressionStatement = StatementBase & {
  statementType: typeof statementTypes.Expression;
  expression: Expression;
};

export type BlockStatement = StatementBase & {
  statementType: typeof statementTypes.Block;
  statements: Statement[];
};

export type Statement = LetStatement | ReturnStatement | ExpressionStatement | BlockStatement;

export const expressionTypes = {
  Identifier: 'Identifier',
  IntegerLiteral: 'IntegerLiteral',
  BooleanLiteral: 'BooleanLiteral',
  PrefixExpression: 'PrefixExpression',
  InfixExpression: 'InfixExpression',
  IfExpression: 'IfExpression',
  FunctionLiteral: 'FunctionLiteral',
  CallExpression: 'CallExpression',
  StringLiteral: 'StringLiteral',
  ArrayLiteral: 'ArrayLiteral',
  IndexExpression: 'IndexExpression',
  ObjectLiteral: 'ObjectLiteral',
} as const;

type ExpressionBase = {
  astType: typeof astNodeTypes.Expression;
};

export type IdentifierExpression = ExpressionBase & {
  expressionType: typeof expressionTypes.Identifier;
  value: string;
};

export type IntegerLiteralExpression = ExpressionBase & {
  expressionType: typeof expressionTypes.IntegerLiteral;
  value: number;
};

export type StringLiteralExpression = ExpressionBase & {
  expressionType: typeof expressionTypes.StringLiteral;
  value: string;
};

export type ArrayLiteralExpression = ExpressionBase & {
  expressionType: typeof expressionTypes.ArrayLiteral;
  elements: Expression[];
};

export type ObjectLiteralExpression = ExpressionBase & {
  expressionType: typeof expressionTypes.ObjectLiteral;
  pairs: [Expression, Expression][];
};

export type IndexExpression = ExpressionBase & {
  expressionType: typeof expressionTypes.IndexExpression;
  left: Expression;
  index: Expression;
};

export type BooleanLiteralExpression = ExpressionBase & {
  expressionType: typeof expressionTypes.BooleanLiteral;
  value: boolean;
};

export type FunctionLiteralExpression = ExpressionBase & {
  expressionType: typeof expressionTypes.FunctionLiteral;
  parameters: IdentifierExpression[];
  body: BlockStatement;
};

export type PrefixExpression = ExpressionBase & {
  expressionType: typeof expressionTypes.PrefixExpression;
  operator: PrefixToken['operator'];
  right: Expression;
};

export type InfixExpression = ExpressionBase & {
  expressionType: typeof expressionTypes.InfixExpression;
  operator: InfixToken['operator'];
  left: Expression;
  right: Expression;
};

export type IfExpression = ExpressionBase & {
  expressionType: typeof expressionTypes.IfExpression;
  condition: Expression;
  consequence: BlockStatement;
  alternative?: BlockStatement;
};

export type CallExpression = ExpressionBase & {
  expressionType: typeof expressionTypes.CallExpression;
  func: IdentifierExpression | FunctionLiteralExpression;
  args: Expression[];
};

export type Expression =
  | IdentifierExpression
  | IntegerLiteralExpression
  | StringLiteralExpression
  | ArrayLiteralExpression
  | ObjectLiteralExpression
  | BooleanLiteralExpression
  | FunctionLiteralExpression
  | PrefixExpression
  | InfixExpression
  | IndexExpression
  | IfExpression
  | CallExpression;

export type AstNode = Statement | Expression | Program;

export const astNodeTypes = {
  Statement: 'Statement',
  Expression: 'Expression',
  Program: 'Program',
} as const;

export type Program = {
  astType: typeof astNodeTypes.Program;
  body: Statement[];
};
