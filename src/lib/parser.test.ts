import { parse } from './parser';

describe('parser', () => {
  test('testLetStatement', () => {
    const input = `
    let x = 5;
    let y = 10;
    let foobar = 838383;
  `;

    const result = parse(input);
    expect(result.errors).toEqual([]);
    expect(result.result).toMatchInlineSnapshot(
      {
        astType: 'Program',
        body: [
          {
            name: {
              astType: 'Expression',
              expressionType: 'Identifier',
              value: 'x',
            },
            statementType: 'Let',
            value: null,
          },
          {
            name: {
              astType: 'Expression',
              expressionType: 'Identifier',
              value: 'y',
            },
            statementType: 'Let',
            value: null,
          },
          {
            name: {
              astType: 'Expression',
              expressionType: 'Identifier',
              value: 'foobar',
            },
            statementType: 'Let',
            value: null,
          },
        ],
      },
      `
      {
        "astType": "Program",
        "body": [
          {
            "name": {
              "astType": "Expression",
              "expressionType": "Identifier",
              "value": "x",
            },
            "statementType": "Let",
            "value": null,
          },
          {
            "name": {
              "astType": "Expression",
              "expressionType": "Identifier",
              "value": "y",
            },
            "statementType": "Let",
            "value": null,
          },
          {
            "name": {
              "astType": "Expression",
              "expressionType": "Identifier",
              "value": "foobar",
            },
            "statementType": "Let",
            "value": null,
          },
        ],
      }
    `
    );
  });
});
