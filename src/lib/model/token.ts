export const BangOperator = '!';
export const MinusOperator = '-';
export const EqualsOperator = '==';
export const NotEqualsOperator = '!=';
export const LessThanOperator = '<';
export const GreaterThanOperator = '>';
export const PlusOperator = '+';
export const AsteriskOperator = '*';
export const SlashOperator = '/';

export enum TokenType {
  Identifier = 'Identifier',
  Integer = 'Integer',
  String = 'String',
  Illegal = 'Illegal',
  Eof = 'Eof',
  Assign = 'Assign',
  Plus = 'Plus',
  Minus = 'Minus',
  Bang = 'Bang',
  Asterisk = 'Asterisk',
  Slash = 'Slash',
  LessThan = 'LessThan',
  GreaterThan = 'GreaterThan',
  Comma = 'Comma',
  Semicolon = 'Semicolon',
  LeftParenthesis = 'LeftParenthesis',
  RightParenthesis = 'RightParenthesis',
  LeftBrace = 'LeftBrace',
  RightBrace = 'RightBrace',
  LeftBracket = 'LeftBracket',
  RightBracket = 'RightBracket',
  Function = 'Function',
  Let = 'Let',
  If = 'If',
  Else = 'Else',
  Return = 'Return',
  True = 'True',
  False = 'False',
  Equals = 'Equals',
  NotEquals = 'NotEquals',
  Colon = 'Colon',
}
export type IdentifierToken = {
  type: TokenType.Identifier;
  literal: string;
};
export type IntegerToken = {
  type: TokenType.Integer;
  literal: string;
};
export type StringToken = {
  type: TokenType.String;
  literal: string;
};
export type IllegalToken = {
  type: TokenType.Illegal;
};
export type EofToken = {
  type: TokenType.Eof;
};
export type AssignToken = {
  type: TokenType.Assign;
};
export type PlusToken = {
  type: TokenType.Plus;
  operator: typeof PlusOperator;
};
export type MinusToken = {
  type: TokenType.Minus;
  operator: typeof MinusOperator;
};
export type BangToken = {
  type: TokenType.Bang;
  operator: typeof BangOperator;
};
export type AsteriskToken = {
  type: TokenType.Asterisk;
  operator: typeof AsteriskOperator;
};
export type SlashToken = {
  type: TokenType.Slash;
  operator: typeof SlashOperator;
};
export type LessThanToken = {
  type: TokenType.LessThan;
  operator: typeof LessThanOperator;
};
export type GreaterThanToken = {
  type: TokenType.GreaterThan;
  operator: typeof GreaterThanOperator;
};
export type CommaToken = {
  type: TokenType.Comma;
};
export type SemicolonToken = {
  type: TokenType.Semicolon;
};
export type LeftParenthesisToken = {
  type: TokenType.LeftParenthesis;
};
export type RightParenthesisToken = {
  type: TokenType.RightParenthesis;
};
export type LeftBraceToken = {
  type: TokenType.LeftBrace;
};
export type RightBraceToken = {
  type: TokenType.RightBrace;
};
export type LeftBracket = {
  type: TokenType.LeftBracket;
};
export type RightBracket = {
  type: TokenType.RightBracket;
};
export type FunctionToken = {
  type: TokenType.Function;
};
export type LetToken = {
  type: TokenType.Let;
};
export type IfToken = {
  type: TokenType.If;
};
export type ElseToken = {
  type: TokenType.Else;
};
export type ReturnToken = {
  type: TokenType.Return;
};
export type TrueToken = {
  type: TokenType.True;
};
export type FalseToken = {
  type: TokenType.False;
};
export type ColonToken = {
  type: TokenType.Colon;
};
export type EqualsToken = {
  type: TokenType.Equals;
  operator: typeof EqualsOperator;
};
export type NotEqualsToken = {
  type: TokenType.NotEquals;
  operator: typeof NotEqualsOperator;
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
  | ColonToken;

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
