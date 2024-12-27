import { parse } from './parse';
import { lex } from './lex';

describe('parse', () => {
  const actual = (input: string) => parse(lex(input));

  test('let statements', () => {
    const input = `
    let x = 5;
    let y = 10;
    let foobar = 123;
  `;

    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "astType": "program",
        "body": [
          {
            "astType": "statement",
            "name": {
              "astType": "expression",
              "expressionType": "identifier",
              "value": "x",
            },
            "statementType": "let",
            "value": {
              "astType": "expression",
              "expressionType": "integerLiteral",
              "value": 5,
            },
          },
          {
            "astType": "statement",
            "name": {
              "astType": "expression",
              "expressionType": "identifier",
              "value": "y",
            },
            "statementType": "let",
            "value": {
              "astType": "expression",
              "expressionType": "integerLiteral",
              "value": 10,
            },
          },
          {
            "astType": "statement",
            "name": {
              "astType": "expression",
              "expressionType": "identifier",
              "value": "foobar",
            },
            "statementType": "let",
            "value": {
              "astType": "expression",
              "expressionType": "integerLiteral",
              "value": 123,
            },
          },
        ],
      }
    `);
  });
  it('prefix', () => {
    const input = `
     !5;
     -15;
     !foobar;
     !true;
     !false;
    `;
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "astType": "program",
        "body": [
          {
            "astType": "statement",
            "expression": {
              "astType": "expression",
              "expressionType": "prefixExpression",
              "operator": "!",
              "right": {
                "astType": "expression",
                "expressionType": "integerLiteral",
                "value": 5,
              },
            },
            "statementType": "expression",
          },
          {
            "astType": "statement",
            "expression": {
              "astType": "expression",
              "expressionType": "prefixExpression",
              "operator": "-",
              "right": {
                "astType": "expression",
                "expressionType": "integerLiteral",
                "value": 15,
              },
            },
            "statementType": "expression",
          },
          {
            "astType": "statement",
            "expression": {
              "astType": "expression",
              "expressionType": "prefixExpression",
              "operator": "!",
              "right": {
                "astType": "expression",
                "expressionType": "identifier",
                "value": "foobar",
              },
            },
            "statementType": "expression",
          },
          {
            "astType": "statement",
            "expression": {
              "astType": "expression",
              "expressionType": "prefixExpression",
              "operator": "!",
              "right": {
                "astType": "expression",
                "expressionType": "booleanLiteral",
                "value": true,
              },
            },
            "statementType": "expression",
          },
          {
            "astType": "statement",
            "expression": {
              "astType": "expression",
              "expressionType": "prefixExpression",
              "operator": "!",
              "right": {
                "astType": "expression",
                "expressionType": "booleanLiteral",
                "value": false,
              },
            },
            "statementType": "expression",
          },
        ],
      }
    `);
  });

  it('function call', () => {
    const input = 'add(5, 3);';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "astType": "program",
        "body": [
          {
            "astType": "statement",
            "expression": {
              "args": [
                {
                  "astType": "expression",
                  "expressionType": "integerLiteral",
                  "value": 5,
                },
                {
                  "astType": "expression",
                  "expressionType": "integerLiteral",
                  "value": 3,
                },
              ],
              "astType": "expression",
              "expressionType": "callExpression",
              "func": {
                "astType": "expression",
                "expressionType": "identifier",
                "value": "add",
              },
            },
            "statementType": "expression",
          },
        ],
      }
    `);
  });

  it('infix', () => {
    const input = `if (x < y) { x }`;
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "astType": "program",
        "body": [
          {
            "astType": "statement",
            "expression": {
              "astType": "expression",
              "condition": {
                "astType": "expression",
                "expressionType": "infixExpression",
                "left": {
                  "astType": "expression",
                  "expressionType": "identifier",
                  "value": "x",
                },
                "operator": "<",
                "right": {
                  "astType": "expression",
                  "expressionType": "identifier",
                  "value": "y",
                },
              },
              "consequence": {
                "astType": "statement",
                "statementType": "block",
                "statements": [
                  {
                    "astType": "statement",
                    "expression": {
                      "astType": "expression",
                      "expressionType": "identifier",
                      "value": "x",
                    },
                    "statementType": "expression",
                  },
                ],
              },
              "expressionType": "ifExpression",
            },
            "statementType": "expression",
          },
        ],
      }
    `);
  });

  it('parses function calls', () => {
    const input = 'let identity = fn(x) { x; }; identity(5);';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "astType": "program",
        "body": [
          {
            "astType": "statement",
            "name": {
              "astType": "expression",
              "expressionType": "identifier",
              "value": "identity",
            },
            "statementType": "let",
            "value": {
              "astType": "expression",
              "body": {
                "astType": "statement",
                "statementType": "block",
                "statements": [
                  {
                    "astType": "statement",
                    "expression": {
                      "astType": "expression",
                      "expressionType": "identifier",
                      "value": "x",
                    },
                    "statementType": "expression",
                  },
                ],
              },
              "expressionType": "functionLiteral",
              "parameters": [
                {
                  "astType": "expression",
                  "expressionType": "identifier",
                  "value": "x",
                },
              ],
            },
          },
          {
            "astType": "statement",
            "expression": {
              "args": [
                {
                  "astType": "expression",
                  "expressionType": "integerLiteral",
                  "value": 5,
                },
              ],
              "astType": "expression",
              "expressionType": "callExpression",
              "func": {
                "astType": "expression",
                "expressionType": "identifier",
                "value": "identity",
              },
            },
            "statementType": "expression",
          },
        ],
      }
    `);
  });
  it('parses strings', () => {
    const input = '"foobar" "foo bar"';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "astType": "program",
        "body": [
          {
            "astType": "statement",
            "expression": {
              "astType": "expression",
              "expressionType": "stringLiteral",
              "value": "foobar",
            },
            "statementType": "expression",
          },
          {
            "astType": "statement",
            "expression": {
              "astType": "expression",
              "expressionType": "stringLiteral",
              "value": "foo bar",
            },
            "statementType": "expression",
          },
        ],
      }
    `);
  });
  it('parses builtin functions', () => {
    const input = 'len("Hello World");';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "astType": "program",
        "body": [
          {
            "astType": "statement",
            "expression": {
              "args": [
                {
                  "astType": "expression",
                  "expressionType": "stringLiteral",
                  "value": "Hello World",
                },
              ],
              "astType": "expression",
              "expressionType": "callExpression",
              "func": {
                "astType": "expression",
                "expressionType": "identifier",
                "value": "len",
              },
            },
            "statementType": "expression",
          },
        ],
      }
    `);
  });
  it('parses empty arrays', () => {
    const input = '[];';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "astType": "program",
        "body": [
          {
            "astType": "statement",
            "expression": {
              "astType": "expression",
              "elements": [],
              "expressionType": "arrayLiteral",
            },
            "statementType": "expression",
          },
        ],
      }
    `);
  });
  it('parses filled arrays', () => {
    const input = '[1, 2+3, 99];';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "astType": "program",
        "body": [
          {
            "astType": "statement",
            "expression": {
              "astType": "expression",
              "elements": [
                {
                  "astType": "expression",
                  "expressionType": "integerLiteral",
                  "value": 1,
                },
                {
                  "astType": "expression",
                  "expressionType": "infixExpression",
                  "left": {
                    "astType": "expression",
                    "expressionType": "integerLiteral",
                    "value": 2,
                  },
                  "operator": "+",
                  "right": {
                    "astType": "expression",
                    "expressionType": "integerLiteral",
                    "value": 3,
                  },
                },
                {
                  "astType": "expression",
                  "expressionType": "integerLiteral",
                  "value": 99,
                },
              ],
              "expressionType": "arrayLiteral",
            },
            "statementType": "expression",
          },
        ],
      }
    `);
  });
  it('parses array indexing', () => {
    const input = '[1, 2+3, 99][2];';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "astType": "program",
        "body": [
          {
            "astType": "statement",
            "expression": {
              "astType": "expression",
              "expressionType": "indexExpression",
              "index": {
                "astType": "expression",
                "expressionType": "integerLiteral",
                "value": 2,
              },
              "left": {
                "astType": "expression",
                "elements": [
                  {
                    "astType": "expression",
                    "expressionType": "integerLiteral",
                    "value": 1,
                  },
                  {
                    "astType": "expression",
                    "expressionType": "infixExpression",
                    "left": {
                      "astType": "expression",
                      "expressionType": "integerLiteral",
                      "value": 2,
                    },
                    "operator": "+",
                    "right": {
                      "astType": "expression",
                      "expressionType": "integerLiteral",
                      "value": 3,
                    },
                  },
                  {
                    "astType": "expression",
                    "expressionType": "integerLiteral",
                    "value": 99,
                  },
                ],
                "expressionType": "arrayLiteral",
              },
            },
            "statementType": "expression",
          },
        ],
      }
    `);
  });
  it('parses empty objects', () => {
    const input = '{}';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "astType": "program",
        "body": [
          {
            "astType": "statement",
            "expression": {
              "astType": "expression",
              "expressionType": "objectLiteral",
              "pairs": [],
            },
            "statementType": "expression",
          },
        ],
      }
    `);
  });
  it('parses objects', () => {
    const input = '{1: 2, "foo": "bar"}';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "astType": "program",
        "body": [
          {
            "astType": "statement",
            "expression": {
              "astType": "expression",
              "expressionType": "objectLiteral",
              "pairs": [
                [
                  {
                    "astType": "expression",
                    "expressionType": "integerLiteral",
                    "value": 1,
                  },
                  {
                    "astType": "expression",
                    "expressionType": "integerLiteral",
                    "value": 2,
                  },
                ],
                [
                  {
                    "astType": "expression",
                    "expressionType": "stringLiteral",
                    "value": "foo",
                  },
                  {
                    "astType": "expression",
                    "expressionType": "stringLiteral",
                    "value": "bar",
                  },
                ],
              ],
            },
            "statementType": "expression",
          },
        ],
      }
    `);
  });

  it('parses a forEach loop correctly', () => {
    const input = 'forEach [1, 2, 3] { puts(it); }';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "astType": "program",
        "body": [
          {
            "array": {
              "astType": "expression",
              "elements": [
                {
                  "astType": "expression",
                  "expressionType": "integerLiteral",
                  "value": 1,
                },
                {
                  "astType": "expression",
                  "expressionType": "integerLiteral",
                  "value": 2,
                },
                {
                  "astType": "expression",
                  "expressionType": "integerLiteral",
                  "value": 3,
                },
              ],
              "expressionType": "arrayLiteral",
            },
            "astType": "statement",
            "body": {
              "astType": "statement",
              "statementType": "block",
              "statements": [
                {
                  "astType": "statement",
                  "expression": {
                    "args": [
                      {
                        "astType": "expression",
                        "expressionType": "identifier",
                        "value": "it",
                      },
                    ],
                    "astType": "expression",
                    "expressionType": "callExpression",
                    "func": {
                      "astType": "expression",
                      "expressionType": "identifier",
                      "value": "puts",
                    },
                  },
                  "statementType": "expression",
                },
              ],
            },
            "statementType": "forEach",
          },
        ],
      }
    `);
  });
});
