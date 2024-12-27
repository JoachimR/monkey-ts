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

    expect(actual(input)).toMatchInlineSnapshot(`
      [
        {
          "type": "let",
        },
        {
          "literal": "five",
          "type": "identifier",
        },
        {
          "type": "assign",
        },
        {
          "literal": "5",
          "type": "integer",
        },
        {
          "type": "semicolon",
        },
        {
          "type": "let",
        },
        {
          "literal": "ten",
          "type": "identifier",
        },
        {
          "type": "assign",
        },
        {
          "literal": "10",
          "type": "integer",
        },
        {
          "type": "semicolon",
        },
        {
          "type": "let",
        },
        {
          "literal": "add",
          "type": "identifier",
        },
        {
          "type": "assign",
        },
        {
          "type": "function",
        },
        {
          "type": "leftParenthesis",
        },
        {
          "literal": "x",
          "type": "identifier",
        },
        {
          "type": "comma",
        },
        {
          "literal": "y",
          "type": "identifier",
        },
        {
          "type": "rightParenthesis",
        },
        {
          "type": "leftBrace",
        },
        {
          "literal": "x",
          "type": "identifier",
        },
        {
          "operator": "+",
          "type": "plus",
        },
        {
          "literal": "y",
          "type": "identifier",
        },
        {
          "type": "semicolon",
        },
        {
          "type": "rightBrace",
        },
        {
          "type": "semicolon",
        },
        {
          "type": "let",
        },
        {
          "literal": "result",
          "type": "identifier",
        },
        {
          "type": "assign",
        },
        {
          "literal": "add",
          "type": "identifier",
        },
        {
          "type": "leftParenthesis",
        },
        {
          "literal": "five",
          "type": "identifier",
        },
        {
          "type": "comma",
        },
        {
          "literal": "ten",
          "type": "identifier",
        },
        {
          "type": "rightParenthesis",
        },
        {
          "type": "semicolon",
        },
        {
          "operator": "!",
          "type": "bang",
        },
        {
          "operator": "-",
          "type": "minus",
        },
        {
          "operator": "/",
          "type": "slash",
        },
        {
          "operator": "*",
          "type": "asterisk",
        },
        {
          "literal": "5",
          "type": "integer",
        },
        {
          "type": "semicolon",
        },
        {
          "literal": "5",
          "type": "integer",
        },
        {
          "operator": "<",
          "type": "lessThan",
        },
        {
          "literal": "10",
          "type": "integer",
        },
        {
          "operator": ">",
          "type": "greaterThan",
        },
        {
          "literal": "5",
          "type": "integer",
        },
        {
          "type": "semicolon",
        },
        {
          "type": "if",
        },
        {
          "type": "leftParenthesis",
        },
        {
          "literal": "5",
          "type": "integer",
        },
        {
          "operator": "<",
          "type": "lessThan",
        },
        {
          "literal": "10",
          "type": "integer",
        },
        {
          "type": "rightParenthesis",
        },
        {
          "type": "leftBrace",
        },
        {
          "type": "return",
        },
        {
          "type": "true",
        },
        {
          "type": "semicolon",
        },
        {
          "type": "rightBrace",
        },
        {
          "type": "else",
        },
        {
          "type": "leftBrace",
        },
        {
          "type": "return",
        },
        {
          "type": "false",
        },
        {
          "type": "semicolon",
        },
        {
          "type": "rightBrace",
        },
        {
          "literal": "10",
          "type": "integer",
        },
        {
          "operator": "==",
          "type": "equals",
        },
        {
          "literal": "10",
          "type": "integer",
        },
        {
          "type": "semicolon",
        },
        {
          "literal": "10",
          "type": "integer",
        },
        {
          "operator": "!=",
          "type": "notEquals",
        },
        {
          "literal": "9",
          "type": "integer",
        },
        {
          "type": "semicolon",
        },
        {
          "type": "eof",
        },
      ]
    `);
  });

  it('function call', () => {
    expect(actual('add(5,3)')).toMatchInlineSnapshot(`
      [
        {
          "literal": "add",
          "type": "identifier",
        },
        {
          "type": "leftParenthesis",
        },
        {
          "literal": "5",
          "type": "integer",
        },
        {
          "type": "comma",
        },
        {
          "literal": "3",
          "type": "integer",
        },
        {
          "type": "rightParenthesis",
        },
        {
          "type": "eof",
        },
      ]
    `);
  });

  it('string tokens', () => {
    expect(actual('"foobar" "foo bar"')).toMatchInlineSnapshot(`
      [
        {
          "literal": "foobar",
          "type": "string",
        },
        {
          "literal": "foo bar",
          "type": "string",
        },
        {
          "type": "eof",
        },
      ]
    `);
  });
  it('arrays', () => {
    expect(actual('[]')).toMatchInlineSnapshot(`
      [
        {
          "type": "leftBracket",
        },
        {
          "type": "rightBracket",
        },
        {
          "type": "eof",
        },
      ]
    `);
    expect(actual('[1,3+3, 99]')).toMatchInlineSnapshot(`
      [
        {
          "type": "leftBracket",
        },
        {
          "literal": "1",
          "type": "integer",
        },
        {
          "type": "comma",
        },
        {
          "literal": "3",
          "type": "integer",
        },
        {
          "operator": "+",
          "type": "plus",
        },
        {
          "literal": "3",
          "type": "integer",
        },
        {
          "type": "comma",
        },
        {
          "literal": "99",
          "type": "integer",
        },
        {
          "type": "rightBracket",
        },
        {
          "type": "eof",
        },
      ]
    `);
  });
  it('array indexing', () => {
    expect(actual('[a,b][1]')).toMatchInlineSnapshot(`
      [
        {
          "type": "leftBracket",
        },
        {
          "literal": "a",
          "type": "identifier",
        },
        {
          "type": "comma",
        },
        {
          "literal": "b",
          "type": "identifier",
        },
        {
          "type": "rightBracket",
        },
        {
          "type": "leftBracket",
        },
        {
          "literal": "1",
          "type": "integer",
        },
        {
          "type": "rightBracket",
        },
        {
          "type": "eof",
        },
      ]
    `);
  });
  it('empty objects', () => {
    expect(actual('{}')).toMatchInlineSnapshot(`
      [
        {
          "type": "leftBrace",
        },
        {
          "type": "rightBrace",
        },
        {
          "type": "eof",
        },
      ]
    `);
  });
  it('objects', () => {
    expect(actual('{a:1,b:2}')).toMatchInlineSnapshot(`
      [
        {
          "type": "leftBrace",
        },
        {
          "literal": "a",
          "type": "identifier",
        },
        {
          "type": "colon",
        },
        {
          "literal": "1",
          "type": "integer",
        },
        {
          "type": "comma",
        },
        {
          "literal": "b",
          "type": "identifier",
        },
        {
          "type": "colon",
        },
        {
          "literal": "2",
          "type": "integer",
        },
        {
          "type": "rightBrace",
        },
        {
          "type": "eof",
        },
      ]
    `);
  });

  it('forEach loop', () => {
    expect(actual('forEach [1, 2, 3] { puts(it); }')).toMatchInlineSnapshot(`
      [
        {
          "type": "forEach",
        },
        {
          "type": "leftBracket",
        },
        {
          "literal": "1",
          "type": "integer",
        },
        {
          "type": "comma",
        },
        {
          "literal": "2",
          "type": "integer",
        },
        {
          "type": "comma",
        },
        {
          "literal": "3",
          "type": "integer",
        },
        {
          "type": "rightBracket",
        },
        {
          "type": "leftBrace",
        },
        {
          "literal": "puts",
          "type": "identifier",
        },
        {
          "type": "leftParenthesis",
        },
        {
          "literal": "it",
          "type": "identifier",
        },
        {
          "type": "rightParenthesis",
        },
        {
          "type": "semicolon",
        },
        {
          "type": "rightBrace",
        },
        {
          "type": "eof",
        },
      ]
    `);
  });
});
