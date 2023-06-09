import { InfixToken, PrefixToken } from './token';

export enum StatementType {
  Let = 'Let',
  Return = 'Return',
  Expression = 'Expression',
  Block = 'Block',
}

type StatementBase = {
  astType: AstNodeType.Statement;
};

export type LetStatement = StatementBase & {
  statementType: StatementType.Let;
  name: IdentifierExpression;
  value: Expression;
};

export type ReturnStatement = StatementBase & {
  statementType: StatementType.Return;
  value: Expression;
};

export type ExpressionStatement = StatementBase & {
  statementType: StatementType.Expression;
  expression: Expression;
};

export type BlockStatement = StatementBase & {
  statementType: StatementType.Block;
  statements: Statement[];
};

export type Statement = LetStatement | ReturnStatement | ExpressionStatement | BlockStatement;

export enum ExpressionType {
  Identifier = 'Identifier',
  IntegerLiteral = 'IntegerLiteral',
  BooleanLiteral = 'BooleanLiteral',
  PrefixExpression = 'PrefixExpression',
  InfixExpression = 'InfixExpression',
  IfExpression = 'IfExpression',
  FunctionLiteral = 'FunctionLiteral',
  CallExpression = 'CallExpression',
  StringLiteral = 'StringLiteral',
  ArrayLiteral = 'ArrayLiteral',
  IndexExpression = 'IndexExpression',
  ObjectLiteral = 'ObjectLiteral',
}

type ExpressionBase = {
  astType: AstNodeType.Expression;
};

export type IdentifierExpression = ExpressionBase & {
  expressionType: ExpressionType.Identifier;
  value: string;
};

export type IntegerLiteralExpression = ExpressionBase & {
  expressionType: ExpressionType.IntegerLiteral;
  value: number;
};
export type StringLiteralExpression = ExpressionBase & {
  expressionType: ExpressionType.StringLiteral;
  value: string;
};

export type ArrayLiteralExpression = ExpressionBase & {
  expressionType: ExpressionType.ArrayLiteral;
  elements: Expression[];
};

export type ObjectLiteralExpression = ExpressionBase & {
  expressionType: ExpressionType.ObjectLiteral;
  pairs: [Expression, Expression][];
};

export type IndexExpression = ExpressionBase & {
  expressionType: ExpressionType.IndexExpression;
  left: Expression;
  index: Expression;
};

export type BooleanLiteralExpression = ExpressionBase & {
  expressionType: ExpressionType.BooleanLiteral;
  value: boolean;
};

export type FunctionLiteralExpression = ExpressionBase & {
  expressionType: ExpressionType.FunctionLiteral;
  parameters: IdentifierExpression[];
  body: BlockStatement;
};

export type PrefixExpression = ExpressionBase & {
  expressionType: ExpressionType.PrefixExpression;
  operator: PrefixToken['operator'];
  right: Expression;
};

export type InfixExpression = ExpressionBase & {
  expressionType: ExpressionType.InfixExpression;
  operator: InfixToken['operator'];
  left: Expression;
  right: Expression;
};

export type IfExpression = ExpressionBase & {
  expressionType: ExpressionType.IfExpression;
  condition: Expression;
  consequence: BlockStatement;
  alternative?: BlockStatement;
};

export type CallExpression = ExpressionBase & {
  expressionType: ExpressionType.CallExpression;
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

export enum AstNodeType {
  Statement = 'Statement',
  Expression = 'Expression',
  Program = 'Program',
}

export type Program = {
  astType: AstNodeType.Program;
  body: Statement[];
};
