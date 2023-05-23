export type TokenWithLiterals =
  | {
      type: TokenType.Identifier;
      literal: string;
    }
  | {
      type: TokenType.Integer;
      literal: string;
    };

export type Token =
  | {
      type: Exclude<TokenType, TokenWithLiterals['type']>;
    }
  | TokenWithLiterals;

export enum TokenType {
  Identifier = 'Identifier',
  Integer = 'Integer',
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
  Function = 'Function',
  Let = 'Let',
  If = 'If',
  Else = 'Else',
  Return = 'Return',
  True = 'True',
  False = 'False',
  Equals = 'Equals',
  NotEquals = 'NotEquals',
}
