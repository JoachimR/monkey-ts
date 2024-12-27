import type { IdentifierToken, InfixToken, IntegerToken, PrefixToken, StringToken, Token } from './token';

export const isIdentifierToken = (token: Token): token is IdentifierToken => token.type === 'identifier';

export const isIntegerToken = (token: Token): token is IntegerToken => token.type === 'integer';

export const isStringToken = (token: Token): token is StringToken => token.type === 'string';

export const isPrefixToken = (token: Token): token is PrefixToken => {
  return token.type === 'bang' || token.type === 'minus';
};

export const isInfixToken = (token: Token): token is InfixToken =>
  token.type === 'equals' ||
  token.type === 'notEquals' ||
  token.type === 'lessThan' ||
  token.type === 'greaterThan' ||
  token.type === 'plus' ||
  token.type === 'minus' ||
  token.type === 'slash' ||
  token.type === 'asterisk';
