import { lex } from './lexer';
import { Token, TokenType } from './model/token';

describe('lexer', () => {
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

  it('testNextToken', () => {
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

    const expected: Token[] = [
      { type: TokenType.Let },
      { type: TokenType.Identifier, literal: 'five' },
      { type: TokenType.Assign },
      { type: TokenType.Integer, literal: '5' },
      { type: TokenType.Semicolon },

      { type: TokenType.Let },
      { type: TokenType.Identifier, literal: 'ten' },
      { type: TokenType.Assign },
      { type: TokenType.Integer, literal: '10' },
      { type: TokenType.Semicolon },

      { type: TokenType.Let },
      { type: TokenType.Identifier, literal: 'add' },
      { type: TokenType.Assign },
      { type: TokenType.Function },
      { type: TokenType.LeftParenthesis },
      { type: TokenType.Identifier, literal: 'x' },
      { type: TokenType.Comma },
      { type: TokenType.Identifier, literal: 'y' },
      { type: TokenType.RightParenthesis },
      { type: TokenType.LeftBrace },
      { type: TokenType.Identifier, literal: 'x' },
      { type: TokenType.Plus, operator: '+' },
      { type: TokenType.Identifier, literal: 'y' },
      { type: TokenType.Semicolon },
      { type: TokenType.RightBrace },
      { type: TokenType.Semicolon },

      { type: TokenType.Let },
      { type: TokenType.Identifier, literal: 'result' },
      { type: TokenType.Assign },
      { type: TokenType.Identifier, literal: 'add' },
      { type: TokenType.LeftParenthesis },
      { type: TokenType.Identifier, literal: 'five' },
      { type: TokenType.Comma },
      { type: TokenType.Identifier, literal: 'ten' },
      { type: TokenType.RightParenthesis },
      { type: TokenType.Semicolon },

      { type: TokenType.Bang, operator: '!' },
      { type: TokenType.Minus, operator: '-' },
      { type: TokenType.Slash, operator: '/' },
      { type: TokenType.Asterisk, operator: '*' },
      { type: TokenType.Integer, literal: '5' },
      { type: TokenType.Semicolon },

      { type: TokenType.Integer, literal: '5' },
      { type: TokenType.LessThan, operator: '<' },
      { type: TokenType.Integer, literal: '10' },
      { type: TokenType.GreaterThan, operator: '>' },
      { type: TokenType.Integer, literal: '5' },
      { type: TokenType.Semicolon },

      { type: TokenType.If },
      { type: TokenType.LeftParenthesis },
      { type: TokenType.Integer, literal: '5' },
      { type: TokenType.LessThan, operator: '<' },
      { type: TokenType.Integer, literal: '10' },
      { type: TokenType.RightParenthesis },
      { type: TokenType.LeftBrace },
      { type: TokenType.Return },
      { type: TokenType.True },
      { type: TokenType.Semicolon },
      { type: TokenType.RightBrace },
      { type: TokenType.Else },
      { type: TokenType.LeftBrace },
      { type: TokenType.Return },
      { type: TokenType.False },
      { type: TokenType.Semicolon },
      { type: TokenType.RightBrace },

      { type: TokenType.Integer, literal: '10' },
      { type: TokenType.Equals, operator: '==' },
      { type: TokenType.Integer, literal: '10' },
      { type: TokenType.Semicolon },

      { type: TokenType.Integer, literal: '10' },
      { type: TokenType.NotEquals, operator: '!=' },
      { type: TokenType.Integer, literal: '9' },
      { type: TokenType.Semicolon },

      { type: TokenType.Eof },
    ];

    expect(actual(input)).toEqual(expected);
  });

  it('function call', () => {
    expect(actual('add(5,3)')).toEqual([
      {
        literal: 'add',
        type: 'Identifier',
      },
      {
        type: 'LeftParenthesis',
      },
      {
        literal: '5',
        type: 'Integer',
      },
      {
        type: 'Comma',
      },
      {
        literal: '3',
        type: 'Integer',
      },
      {
        type: 'RightParenthesis',
      },
      {
        type: 'Eof',
      },
    ]);
  });

  it('string tokens', () => {
    expect(actual('"foobar" "foo bar"')).toEqual([
      {
        literal: 'foobar',
        type: 'String',
      },
      {
        literal: 'foo bar',
        type: 'String',
      },
      {
        type: 'Eof',
      },
    ]);
  });
});
