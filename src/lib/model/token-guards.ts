import type { IdentifierToken, InfixToken, IntegerToken, PrefixToken, StringToken, Token } from './token';
import { tokenTypes } from './token';

export const isIdentifierToken = (token: Token): token is IdentifierToken => token.type === tokenTypes.Identifier;

export const isIntegerToken = (token: Token): token is IntegerToken => token.type === tokenTypes.Integer;

export const isStringToken = (token: Token): token is StringToken => token.type === tokenTypes.String;

export const isPrefixToken = (token: Token): token is PrefixToken => {
  return token.type === tokenTypes.Bang || token.type === tokenTypes.Minus;
};

export const isInfixToken = (token: Token): token is InfixToken =>
  token.type === tokenTypes.Equals ||
  token.type === tokenTypes.NotEquals ||
  token.type === tokenTypes.LessThan ||
  token.type === tokenTypes.GreaterThan ||
  token.type === tokenTypes.Plus ||
  token.type === tokenTypes.Minus ||
  token.type === tokenTypes.Slash ||
  token.type === tokenTypes.Asterisk;
