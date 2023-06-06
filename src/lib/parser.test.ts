import { lex } from './lexer';
import { parse } from './parser';

describe('parser', () => {
  test('let statements', () => {
    const input = `
    let x = 5;
    let y = 10;
    let foobar = 123;
  `;

    const result = parse(lex(input));
    expect(result).toEqual({
      astType: 'Program',
      body: [
        {
          astType: 'Statement',
          name: { astType: 'Expression', expressionType: 'Identifier', value: 'x' },
          statementType: 'Let',
          value: { astType: 'Expression', expressionType: 'IntegerLiteral', value: 5 },
        },
        {
          astType: 'Statement',
          name: { astType: 'Expression', expressionType: 'Identifier', value: 'y' },
          statementType: 'Let',
          value: { astType: 'Expression', expressionType: 'IntegerLiteral', value: 10 },
        },
        {
          astType: 'Statement',
          name: { astType: 'Expression', expressionType: 'Identifier', value: 'foobar' },
          statementType: 'Let',
          value: { astType: 'Expression', expressionType: 'IntegerLiteral', value: 123 },
        },
      ],
    });
  });
  it('prefix', () => {
    const input = `
     !5;
     -15;
     !foobar;
     !true;
     !false;
    `;
    expect(parse(lex(input))).toEqual({
      astType: 'Program',
      body: [
        {
          astType: 'Statement',
          expression: {
            astType: 'Expression',
            expressionType: 'PrefixExpression',
            operator: '!',
            right: { astType: 'Expression', expressionType: 'IntegerLiteral', value: 5 },
          },
          statementType: 'Expression',
        },
        {
          astType: 'Statement',
          expression: {
            astType: 'Expression',
            expressionType: 'PrefixExpression',
            operator: '-',
            right: { astType: 'Expression', expressionType: 'IntegerLiteral', value: 15 },
          },
          statementType: 'Expression',
        },
        {
          astType: 'Statement',
          expression: {
            astType: 'Expression',
            expressionType: 'PrefixExpression',
            operator: '!',
            right: { astType: 'Expression', expressionType: 'Identifier', value: 'foobar' },
          },
          statementType: 'Expression',
        },
        {
          astType: 'Statement',
          expression: {
            astType: 'Expression',
            expressionType: 'PrefixExpression',
            operator: '!',
            right: { astType: 'Expression', expressionType: 'BooleanLiteral', value: true },
          },
          statementType: 'Expression',
        },
        {
          astType: 'Statement',
          expression: {
            astType: 'Expression',
            expressionType: 'PrefixExpression',
            operator: '!',
            right: { astType: 'Expression', expressionType: 'BooleanLiteral', value: false },
          },
          statementType: 'Expression',
        },
      ],
    });
  });

  it('function call', () => {
    const input = 'add(5, 3);';
    expect(parse(lex(input))).toEqual({
      astType: 'Program',
      body: [
        {
          astType: 'Statement',
          statementType: 'Expression',
          expression: {
            astType: 'Expression',
            expressionType: 'CallExpression',
            func: { astType: 'Expression', expressionType: 'Identifier', value: 'add' },
            args: [
              { astType: 'Expression', expressionType: 'IntegerLiteral', value: 5 },
              { astType: 'Expression', expressionType: 'IntegerLiteral', value: 3 },
            ],
          },
        },
      ],
    });
  });

  it('infix', () => {
    const input = `if (x < y) { x }`;
    expect(parse(lex(input))).toEqual({
      astType: 'Program',
      body: [
        {
          astType: 'Statement',
          statementType: 'Expression',
          expression: {
            astType: 'Expression',
            expressionType: 'IfExpression',
            condition: {
              astType: 'Expression',
              expressionType: 'InfixExpression',
              left: { astType: 'Expression', expressionType: 'Identifier', value: 'x' },
              operator: '<',
              right: { astType: 'Expression', expressionType: 'Identifier', value: 'y' },
            },
            consequence: {
              astType: 'Statement',
              statementType: 'Block',
              statements: [
                {
                  astType: 'Statement',
                  statementType: 'Expression',
                  expression: { astType: 'Expression', expressionType: 'Identifier', value: 'x' },
                },
              ],
            },
          },
        },
      ],
    });
  });

  it('parses function calls', () => {
    const input = 'let identity = fn(x) { x; }; identity(5);';
    const result = parse(lex(input));
    expect(result).toEqual({
      astType: 'Program',
      body: [
        {
          astType: 'Statement',
          statementType: 'Let',
          name: { astType: 'Expression', expressionType: 'Identifier', value: 'identity' },
          value: {
            astType: 'Expression',
            expressionType: 'FunctionLiteral',
            parameters: [{ astType: 'Expression', expressionType: 'Identifier', value: 'x' }],
            body: {
              astType: 'Statement',
              statementType: 'Block',
              statements: [
                {
                  astType: 'Statement',
                  statementType: 'Expression',
                  expression: { astType: 'Expression', expressionType: 'Identifier', value: 'x' },
                },
              ],
            },
          },
        },
        {
          astType: 'Statement',
          statementType: 'Expression',
          expression: {
            astType: 'Expression',
            expressionType: 'CallExpression',
            args: [{ astType: 'Expression', expressionType: 'IntegerLiteral', value: 5 }],
            func: { astType: 'Expression', expressionType: 'Identifier', value: 'identity' },
          },
        },
      ],
    });
  });
  it('parses strings', () => {
    const input = '"foobar" "foo bar"';
    const result = parse(lex(input));
    expect(result).toEqual({
      astType: 'Program',
      body: [
        {
          astType: 'Statement',
          expression: { astType: 'Expression', expressionType: 'StringLiteral', value: 'foobar' },
          statementType: 'Expression',
        },
        {
          astType: 'Statement',
          expression: { astType: 'Expression', expressionType: 'StringLiteral', value: 'foo bar' },
          statementType: 'Expression',
        },
      ],
    });
  });
  it('parses builtin functions', () => {
    const input = 'len("Hello World");';
    const result = parse(lex(input));
    expect(result).toEqual({
      astType: 'Program',
      body: [
        {
          astType: 'Statement',
          statementType: 'Expression',
          expression: {
            astType: 'Expression',
            expressionType: 'CallExpression',
            func: { astType: 'Expression', expressionType: 'Identifier', value: 'len' },
            args: [{ astType: 'Expression', expressionType: 'StringLiteral', value: 'Hello World' }],
          },
        },
      ],
    });
  });
  it('parses empty arrays', () => {
    const input = '[];';
    const result = parse(lex(input));
    expect(result).toEqual({
      astType: 'Program',
      body: [
        {
          astType: 'Statement',
          expression: {
            astType: 'Expression',
            elements: [],
            expressionType: 'ArrayLiteral',
          },
          statementType: 'Expression',
        },
      ],
    });
  });
  it('parses filled arrays', () => {
    const input = '[1, 2+3, 99];';
    const result = parse(lex(input));
    expect(result).toEqual({
      astType: 'Program',
      body: [
        {
          astType: 'Statement',
          expression: {
            astType: 'Expression',
            elements: [
              { astType: 'Expression', expressionType: 'IntegerLiteral', value: 1 },
              {
                astType: 'Expression',
                expressionType: 'InfixExpression',
                left: { astType: 'Expression', expressionType: 'IntegerLiteral', value: 2 },
                operator: '+',
                right: { astType: 'Expression', expressionType: 'IntegerLiteral', value: 3 },
              },
              { astType: 'Expression', expressionType: 'IntegerLiteral', value: 99 },
            ],
            expressionType: 'ArrayLiteral',
          },
          statementType: 'Expression',
        },
      ],
    });
  });
  it('parses array indexing', () => {
    const input = '[1, 2+3, 99][2];';
    const result = parse(lex(input));
    expect(result).toMatchInlineSnapshot(
      {
        astType: 'Program',
        body: [
          {
            astType: 'Statement',
            statementType: 'Expression',
            expression: {
              astType: 'Expression',
              expressionType: 'IndexExpression',
              left: {
                astType: 'Expression',
                expressionType: 'ArrayLiteral',
                elements: [
                  { astType: 'Expression', expressionType: 'IntegerLiteral', value: 1 },
                  {
                    astType: 'Expression',
                    expressionType: 'InfixExpression',
                    left: { astType: 'Expression', expressionType: 'IntegerLiteral', value: 2 },
                    operator: '+',
                    right: { astType: 'Expression', expressionType: 'IntegerLiteral', value: 3 },
                  },
                  { astType: 'Expression', expressionType: 'IntegerLiteral', value: 99 },
                ],
              },
              index: { astType: 'Expression', expressionType: 'IntegerLiteral', value: 2 },
            },
          },
        ],
      },
      `
      {
        "astType": "Program",
        "body": [
          {
            "astType": "Statement",
            "expression": {
              "astType": "Expression",
              "expressionType": "IndexExpression",
              "index": {
                "astType": "Expression",
                "expressionType": "IntegerLiteral",
                "value": 2,
              },
              "left": {
                "astType": "Expression",
                "elements": [
                  {
                    "astType": "Expression",
                    "expressionType": "IntegerLiteral",
                    "value": 1,
                  },
                  {
                    "astType": "Expression",
                    "expressionType": "InfixExpression",
                    "left": {
                      "astType": "Expression",
                      "expressionType": "IntegerLiteral",
                      "value": 2,
                    },
                    "operator": "+",
                    "right": {
                      "astType": "Expression",
                      "expressionType": "IntegerLiteral",
                      "value": 3,
                    },
                  },
                  {
                    "astType": "Expression",
                    "expressionType": "IntegerLiteral",
                    "value": 99,
                  },
                ],
                "expressionType": "ArrayLiteral",
              },
            },
            "statementType": "Expression",
          },
        ],
      }
    `
    );
  });
});
