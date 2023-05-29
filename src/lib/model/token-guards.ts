import { IdentifierToken, InfixToken, IntegerToken, PrefixToken, Token, TokenType } from './token';

export const isIdentifierToken = (token: Token): token is IdentifierToken => token.type === TokenType.Identifier;

export const isIntegerToken = (token: Token): token is IntegerToken => token.type === TokenType.Integer;

export const isPrefixToken = (token: Token): token is PrefixToken => {
  return token.type === TokenType.Bang || token.type === TokenType.Minus;
};

export const isInfixToken = (token: Token): token is InfixToken =>
  token.type === TokenType.Equals ||
  token.type === TokenType.NotEquals ||
  token.type === TokenType.LessThan ||
  token.type === TokenType.GreaterThan ||
  token.type === TokenType.Plus ||
  token.type === TokenType.Minus ||
  token.type === TokenType.Slash ||
  token.type === TokenType.Asterisk;
