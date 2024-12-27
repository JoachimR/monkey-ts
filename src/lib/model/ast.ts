import type { InfixToken, PrefixToken } from './token';

export type LetStatement = {
  astType: 'statement';
  statementType: 'let';
  name: IdentifierExpression;
  value: Expression;
};

export type ReturnStatement = {
  astType: 'statement';
  statementType: 'return';
  value: Expression;
};

export type ExpressionStatement = {
  astType: 'statement';
  statementType: 'expression';
  expression: Expression;
};

export type BlockStatement = {
  astType: 'statement';
  statementType: 'block';
  statements: Statement[];
};

export type ReassignStatement = {
  astType: 'statement';
  statementType: 'reassign';
  name: IdentifierExpression;
  value: Expression;
};

export type ForEachStatement = {
  astType: 'statement';
  statementType: 'forEach';
  array: Expression;
  body: BlockStatement;
};

export type Statement =
  | LetStatement
  | ReturnStatement
  | ExpressionStatement
  | BlockStatement
  | ReassignStatement
  | ForEachStatement;

export type IdentifierExpression = {
  astType: 'expression';
  expressionType: 'identifier';
  value: string;
};

export type IntegerLiteralExpression = {
  astType: 'expression';
  expressionType: 'integerLiteral';
  value: number;
};

export type StringLiteralExpression = {
  astType: 'expression';
  expressionType: 'stringLiteral';
  value: string;
};

export type ArrayLiteralExpression = {
  astType: 'expression';
  expressionType: 'arrayLiteral';
  elements: Expression[];
};

export type ObjectLiteralExpression = {
  astType: 'expression';
  expressionType: 'objectLiteral';
  pairs: [Expression, Expression][];
};

export type IndexExpression = {
  astType: 'expression';
  expressionType: 'indexExpression';
  left: Expression;
  index: Expression;
};

export type BooleanLiteralExpression = {
  astType: 'expression';
  expressionType: 'booleanLiteral';
  value: boolean;
};

export type FunctionLiteralExpression = {
  astType: 'expression';
  expressionType: 'functionLiteral';
  parameters: IdentifierExpression[];
  body: BlockStatement;
};

export type PrefixExpression = {
  astType: 'expression';
  expressionType: 'prefixExpression';
  operator: PrefixToken['operator'];
  right: Expression;
};

export type InfixExpression = {
  astType: 'expression';
  expressionType: 'infixExpression';
  operator: InfixToken['operator'];
  left: Expression;
  right: Expression;
};

export type IfExpression = {
  astType: 'expression';
  expressionType: 'ifExpression';
  condition: Expression;
  consequence: BlockStatement;
  alternative?: BlockStatement;
};

export type CallExpression = {
  astType: 'expression';
  expressionType: 'callExpression';
  func: IdentifierExpression | FunctionLiteralExpression;
  args: Expression[];
};

export type Expression =
  | IdentifierExpression
  | IntegerLiteralExpression
  | StringLiteralExpression
  | ArrayLiteralExpression
  | ObjectLiteralExpression
  | IndexExpression
  | BooleanLiteralExpression
  | FunctionLiteralExpression
  | PrefixExpression
  | InfixExpression
  | IfExpression
  | CallExpression;

export type AstNode = Statement | Expression | Program;

export type Program = {
  astType: 'program';
  body: Statement[];
};
