import { lex } from './lex';
import type { Token } from './model/token';

describe('lex', () => {
  const actual = (input: string): Token[] => {
    const tokens: Token[] = [];
    const l = lex(input);
    let token = l.nextToken();
    while (token) {
      tokens.push(token);
      token = l.nextToken();
    }
    return tokens;
  };

  it('works for common usages', () => {
    const input = `
    let five = 5;
    let ten = 10;
  
    let add = fn(x, y) {
        x + y;
    };

    let result = add(five, ten);
    !-/*5;
    5 < 10 > 5;

    if (5 < 10) {
        return true;
    } else {
        return false;
    }

    10 == 10;
    10 != 9;
  `;

    expect(actual(input)).toEqual([
      { type: 'Let' },
      { literal: 'five', type: 'Identifier' },
      { type: 'Assign' },
      { literal: '5', type: 'Integer' },
      { type: 'Semicolon' },
      { type: 'Let' },
      { literal: 'ten', type: 'Identifier' },
      { type: 'Assign' },
      { literal: '10', type: 'Integer' },
      { type: 'Semicolon' },
      { type: 'Let' },
      { literal: 'add', type: 'Identifier' },
      { type: 'Assign' },
      { type: 'Function' },
      { type: 'LeftParenthesis' },
      { literal: 'x', type: 'Identifier' },
      { type: 'Comma' },
      { literal: 'y', type: 'Identifier' },
      { type: 'RightParenthesis' },
      { type: 'LeftBrace' },
      { literal: 'x', type: 'Identifier' },
      { operator: '+', type: 'Plus' },
      { literal: 'y', type: 'Identifier' },
      { type: 'Semicolon' },
      { type: 'RightBrace' },
      { type: 'Semicolon' },
      { type: 'Let' },
      { literal: 'result', type: 'Identifier' },
      { type: 'Assign' },
      { literal: 'add', type: 'Identifier' },
      { type: 'LeftParenthesis' },
      { literal: 'five', type: 'Identifier' },
      { type: 'Comma' },
      { literal: 'ten', type: 'Identifier' },
      { type: 'RightParenthesis' },
      { type: 'Semicolon' },
      { operator: '!', type: 'Bang' },
      { operator: '-', type: 'Minus' },
      { operator: '/', type: 'Slash' },
      { operator: '*', type: 'Asterisk' },
      { literal: '5', type: 'Integer' },
      { type: 'Semicolon' },
      { literal: '5', type: 'Integer' },
      { operator: '<', type: 'LessThan' },
      { literal: '10', type: 'Integer' },
      { operator: '>', type: 'GreaterThan' },
      { literal: '5', type: 'Integer' },
      { type: 'Semicolon' },
      { type: 'If' },
      { type: 'LeftParenthesis' },
      { literal: '5', type: 'Integer' },
      { operator: '<', type: 'LessThan' },
      { literal: '10', type: 'Integer' },
      { type: 'RightParenthesis' },
      { type: 'LeftBrace' },
      { type: 'Return' },
      { type: 'True' },
      { type: 'Semicolon' },
      { type: 'RightBrace' },
      { type: 'Else' },
      { type: 'LeftBrace' },
      { type: 'Return' },
      { type: 'False' },
      { type: 'Semicolon' },
      { type: 'RightBrace' },
      { literal: '10', type: 'Integer' },
      { operator: '==', type: 'Equals' },
      { literal: '10', type: 'Integer' },
      { type: 'Semicolon' },
      { literal: '10', type: 'Integer' },
      { operator: '!=', type: 'NotEquals' },
      { literal: '9', type: 'Integer' },
      { type: 'Semicolon' },
      { type: 'Eof' },
    ]);
  });

  it('function call', () => {
    expect(actual('add(5,3)')).toEqual([
      { literal: 'add', type: 'Identifier' },
      { type: 'LeftParenthesis' },
      { literal: '5', type: 'Integer' },
      { type: 'Comma' },
      { literal: '3', type: 'Integer' },
      { type: 'RightParenthesis' },
      { type: 'Eof' },
    ]);
  });

  it('string tokens', () => {
    expect(actual('"foobar" "foo bar"')).toEqual([
      { literal: 'foobar', type: 'String' },
      { literal: 'foo bar', type: 'String' },
      { type: 'Eof' },
    ]);
  });
  it('arrays', () => {
    expect(actual('[]')).toEqual([{ type: 'LeftBracket' }, { type: 'RightBracket' }, { type: 'Eof' }]);
    expect(actual('[1,3+3, 99]')).toEqual([
      { type: 'LeftBracket' },
      { literal: '1', type: 'Integer' },
      { type: 'Comma' },
      { literal: '3', type: 'Integer' },
      { operator: '+', type: 'Plus' },
      { literal: '3', type: 'Integer' },
      { type: 'Comma' },
      { literal: '99', type: 'Integer' },
      { type: 'RightBracket' },
      { type: 'Eof' },
    ]);
  });
  it('array indexing', () => {
    expect(actual('[a,b][1]')).toEqual([
      { type: 'LeftBracket' },
      { literal: 'a', type: 'Identifier' },
      { type: 'Comma' },
      { literal: 'b', type: 'Identifier' },
      { type: 'RightBracket' },
      { type: 'LeftBracket' },
      { literal: '1', type: 'Integer' },
      { type: 'RightBracket' },
      { type: 'Eof' },
    ]);
  });
  it('empty objects', () => {
    expect(actual('{}')).toEqual([{ type: 'LeftBrace' }, { type: 'RightBrace' }, { type: 'Eof' }]);
  });
  it('objects', () => {
    expect(actual('{a:1,b:2}')).toEqual([
      { type: 'LeftBrace' },
      { literal: 'a', type: 'Identifier' },
      { type: 'Colon' },
      { literal: '1', type: 'Integer' },
      { type: 'Comma' },
      { literal: 'b', type: 'Identifier' },
      { type: 'Colon' },
      { literal: '2', type: 'Integer' },
      { type: 'RightBrace' },
      { type: 'Eof' },
    ]);
  });

  it('forEach loop', () => {
    expect(actual('forEach [1, 2, 3] { puts(it); }')).toEqual([
      { type: 'ForEach' },
      { type: 'LeftBracket' },
      { literal: '1', type: 'Integer' },
      { type: 'Comma' },
      { literal: '2', type: 'Integer' },
      { type: 'Comma' },
      { literal: '3', type: 'Integer' },
      { type: 'RightBracket' },
      { type: 'LeftBrace' },
      { literal: 'puts', type: 'Identifier' },
      { type: 'LeftParenthesis' },
      { literal: 'it', type: 'Identifier' },
      { type: 'RightParenthesis' },
      { type: 'Semicolon' },
      { type: 'RightBrace' },
      { type: 'Eof' },
    ]);
  });
});
