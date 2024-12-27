export const BangOperator = '!';
export const MinusOperator = '-';
export const EqualsOperator = '==';
export const NotEqualsOperator = '!=';
export const LessThanOperator = '<';
export const GreaterThanOperator = '>';
export const PlusOperator = '+';
export const AsteriskOperator = '*';
export const SlashOperator = '/';

export const tokenTypes = {
  Identifier: 'identifier',
  Integer: 'integer',
  String: 'string',
  Illegal: 'illegal',
  Eof: 'eof',
  Assign: 'assign',
  Plus: 'plus',
  Minus: 'minus',
  Bang: 'bang',
  Asterisk: 'asterisk',
  Slash: 'slash',
  LessThan: 'lessThan',
  GreaterThan: 'greaterThan',
  Comma: 'comma',
  Semicolon: 'semicolon',
  LeftParenthesis: 'leftParenthesis',
  RightParenthesis: 'rightParenthesis',
  LeftBrace: 'leftBrace',
  RightBrace: 'rightBrace',
  LeftBracket: 'leftBracket',
  RightBracket: 'rightBracket',
  Function: 'function',
  Let: 'let',
  If: 'if',
  Else: 'else',
  Return: 'return',
  True: 'true',
  False: 'false',
  Equals: 'equals',
  NotEquals: 'notEquals',
  Colon: 'colon',
  ForEach: 'forEach',
} as const;

export type IdentifierToken = {
  type: 'identifier';
  literal: string;
};
export type IntegerToken = {
  type: 'integer';
  literal: string;
};
export type StringToken = {
  type: 'string';
  literal: string;
};
export type IllegalToken = {
  type: 'illegal';
};
export type EofToken = {
  type: 'eof';
};
export type AssignToken = {
  type: 'assign';
};
export type PlusToken = {
  type: 'plus';
  operator: typeof PlusOperator;
};
export type MinusToken = {
  type: 'minus';
  operator: typeof MinusOperator;
};
export type BangToken = {
  type: 'bang';
  operator: typeof BangOperator;
};
export type AsteriskToken = {
  type: 'asterisk';
  operator: typeof AsteriskOperator;
};
export type SlashToken = {
  type: 'slash';
  operator: typeof SlashOperator;
};
export type LessThanToken = {
  type: 'lessThan';
  operator: typeof LessThanOperator;
};
export type GreaterThanToken = {
  type: 'greaterThan';
  operator: typeof GreaterThanOperator;
};
export type CommaToken = {
  type: 'comma';
};
export type SemicolonToken = {
  type: 'semicolon';
};
export type LeftParenthesisToken = {
  type: 'leftParenthesis';
};
export type RightParenthesisToken = {
  type: 'rightParenthesis';
};
export type LeftBraceToken = {
  type: 'leftBrace';
};
export type RightBraceToken = {
  type: 'rightBrace';
};
export type LeftBracket = {
  type: 'leftBracket';
};
export type RightBracket = {
  type: 'rightBracket';
};
export type FunctionToken = {
  type: 'function';
};
export type LetToken = {
  type: 'let';
};
export type IfToken = {
  type: 'if';
};
export type ElseToken = {
  type: 'else';
};
export type ReturnToken = {
  type: 'return';
};
export type TrueToken = {
  type: 'true';
};
export type FalseToken = {
  type: 'false';
};
export type ColonToken = {
  type: 'colon';
};
export type EqualsToken = {
  type: 'equals';
  operator: typeof EqualsOperator;
};
export type NotEqualsToken = {
  type: 'notEquals';
  operator: typeof NotEqualsOperator;
};
export type ForEachToken = {
  type: 'forEach';
};

export type TokenWithLiterals = IdentifierToken | IntegerToken | StringToken;
export type TokenWithoutLiterals =
  | IllegalToken
  | EofToken
  | AssignToken
  | PlusToken
  | MinusToken
  | BangToken
  | AsteriskToken
  | SlashToken
  | LessThanToken
  | GreaterThanToken
  | CommaToken
  | SemicolonToken
  | LeftParenthesisToken
  | RightParenthesisToken
  | LeftBraceToken
  | RightBraceToken
  | LeftBracket
  | RightBracket
  | FunctionToken
  | LetToken
  | IfToken
  | ElseToken
  | ReturnToken
  | TrueToken
  | FalseToken
  | EqualsToken
  | NotEqualsToken
  | ColonToken
  | ForEachToken;

export type Token = TokenWithLiterals | TokenWithoutLiterals;

export type PrefixToken = BangToken | MinusToken;
export type InfixToken =
  | EqualsToken
  | NotEqualsToken
  | LessThanToken
  | GreaterThanToken
  | PlusToken
  | MinusToken
  | SlashToken
  | AsteriskToken;
