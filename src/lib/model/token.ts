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
  Identifier: 'Identifier',
  Integer: 'Integer',
  String: 'String',
  Illegal: 'Illegal',
  Eof: 'Eof',
  Assign: 'Assign',
  Plus: 'Plus',
  Minus: 'Minus',
  Bang: 'Bang',
  Asterisk: 'Asterisk',
  Slash: 'Slash',
  LessThan: 'LessThan',
  GreaterThan: 'GreaterThan',
  Comma: 'Comma',
  Semicolon: 'Semicolon',
  LeftParenthesis: 'LeftParenthesis',
  RightParenthesis: 'RightParenthesis',
  LeftBrace: 'LeftBrace',
  RightBrace: 'RightBrace',
  LeftBracket: 'LeftBracket',
  RightBracket: 'RightBracket',
  Function: 'Function',
  Let: 'Let',
  If: 'If',
  Else: 'Else',
  Return: 'Return',
  True: 'True',
  False: 'False',
  Equals: 'Equals',
  NotEquals: 'NotEquals',
  Colon: 'Colon',
  ForEach: 'ForEach',
} as const;

export type TokenType = (typeof tokenTypes)[keyof typeof tokenTypes];

export type IdentifierToken = {
  type: typeof tokenTypes.Identifier;
  literal: string;
};
export type IntegerToken = {
  type: typeof tokenTypes.Integer;
  literal: string;
};
export type StringToken = {
  type: typeof tokenTypes.String;
  literal: string;
};
export type IllegalToken = {
  type: typeof tokenTypes.Illegal;
};
export type EofToken = {
  type: typeof tokenTypes.Eof;
};
export type AssignToken = {
  type: typeof tokenTypes.Assign;
};
export type PlusToken = {
  type: typeof tokenTypes.Plus;
  operator: typeof PlusOperator;
};
export type MinusToken = {
  type: typeof tokenTypes.Minus;
  operator: typeof MinusOperator;
};
export type BangToken = {
  type: typeof tokenTypes.Bang;
  operator: typeof BangOperator;
};
export type AsteriskToken = {
  type: typeof tokenTypes.Asterisk;
  operator: typeof AsteriskOperator;
};
export type SlashToken = {
  type: typeof tokenTypes.Slash;
  operator: typeof SlashOperator;
};
export type LessThanToken = {
  type: typeof tokenTypes.LessThan;
  operator: typeof LessThanOperator;
};
export type GreaterThanToken = {
  type: typeof tokenTypes.GreaterThan;
  operator: typeof GreaterThanOperator;
};
export type CommaToken = {
  type: typeof tokenTypes.Comma;
};
export type SemicolonToken = {
  type: typeof tokenTypes.Semicolon;
};
export type LeftParenthesisToken = {
  type: typeof tokenTypes.LeftParenthesis;
};
export type RightParenthesisToken = {
  type: typeof tokenTypes.RightParenthesis;
};
export type LeftBraceToken = {
  type: typeof tokenTypes.LeftBrace;
};
export type RightBraceToken = {
  type: typeof tokenTypes.RightBrace;
};
export type LeftBracket = {
  type: typeof tokenTypes.LeftBracket;
};
export type RightBracket = {
  type: typeof tokenTypes.RightBracket;
};
export type FunctionToken = {
  type: typeof tokenTypes.Function;
};
export type LetToken = {
  type: typeof tokenTypes.Let;
};
export type IfToken = {
  type: typeof tokenTypes.If;
};
export type ElseToken = {
  type: typeof tokenTypes.Else;
};
export type ReturnToken = {
  type: typeof tokenTypes.Return;
};
export type TrueToken = {
  type: typeof tokenTypes.True;
};
export type FalseToken = {
  type: typeof tokenTypes.False;
};
export type ColonToken = {
  type: typeof tokenTypes.Colon;
};
export type EqualsToken = {
  type: typeof tokenTypes.Equals;
  operator: typeof EqualsOperator;
};
export type NotEqualsToken = {
  type: typeof tokenTypes.NotEquals;
  operator: typeof NotEqualsOperator;
};
export type ForEachToken = {
  type: typeof tokenTypes.ForEach;
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
