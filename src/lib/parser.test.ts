import { parse } from './parser';

describe('parser', () => {
  test('let statements', () => {
    const input = `
    let x = 5;
    let y = 10;
    let foobar = 123;
  `;

    const result = parse(input);
    expect(result).toEqual({
      astType: 'Program',
      body: [
        {
          astType: 'Statement',
          name: {
            astType: 'Expression',
            expressionType: 'Identifier',
            value: 'x',
          },
          statementType: 'Let',
          value: {
            astType: 'Expression',
            expressionType: 'IntegerLiteral',
            value: 5,
          },
        },
        {
          astType: 'Statement',
          name: {
            astType: 'Expression',
            expressionType: 'Identifier',
            value: 'y',
          },
          statementType: 'Let',
          value: {
            astType: 'Expression',
            expressionType: 'IntegerLiteral',
            value: 10,
          },
        },
        {
          astType: 'Statement',
          name: {
            astType: 'Expression',
            expressionType: 'Identifier',
            value: 'foobar',
          },
          statementType: 'Let',
          value: {
            astType: 'Expression',
            expressionType: 'IntegerLiteral',
            value: 123,
          },
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
    expect(parse(input)).toEqual({
      astType: 'Program',
      body: [
        {
          astType: 'Statement',
          expression: {
            astType: 'Expression',
            expressionType: 'PrefixExpression',
            operator: '!',
            right: {
              astType: 'Expression',
              expressionType: 'IntegerLiteral',
              value: 5,
            },
          },
          statementType: 'Expression',
        },
        {
          astType: 'Statement',
          expression: {
            astType: 'Expression',
            expressionType: 'PrefixExpression',
            operator: '-',
            right: {
              astType: 'Expression',
              expressionType: 'IntegerLiteral',
              value: 15,
            },
          },
          statementType: 'Expression',
        },
        {
          astType: 'Statement',
          expression: {
            astType: 'Expression',
            expressionType: 'PrefixExpression',
            operator: '!',
            right: {
              astType: 'Expression',
              expressionType: 'Identifier',
              value: 'foobar',
            },
          },
          statementType: 'Expression',
        },
        {
          astType: 'Statement',
          expression: {
            astType: 'Expression',
            expressionType: 'PrefixExpression',
            operator: '!',
            right: {
              astType: 'Expression',
              expressionType: 'BooleanLiteral',
              value: true,
            },
          },
          statementType: 'Expression',
        },
        {
          astType: 'Statement',
          expression: {
            astType: 'Expression',
            expressionType: 'PrefixExpression',
            operator: '!',
            right: {
              astType: 'Expression',
              expressionType: 'BooleanLiteral',
              value: false,
            },
          },
          statementType: 'Expression',
        },
      ],
    });
  });
});
