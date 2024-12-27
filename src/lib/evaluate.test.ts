import * as Utils from '../utils';
import { evaluate } from './evaluate';
import { lex } from './lex';
import { parse } from './parse';

describe('evaluate', () => {
  const actual = (input: string) => {
    const node = parse(lex(input));
    return evaluate(node);
  };

  it('returns last let statement', () => {
    const input = `
    let x = 5;
    let y = 10;
    let foobar = 123;
  `;

    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "type": "integer",
        "value": 123,
      }
    `);
  });

  it('returns reverted boolean', () => {
    const input = `let hello = !false; return hello`;
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "type": "boolean",
        "value": true,
      }
    `);
  });

  it('evaluates function definition', () => {
    const input = 'let identity = fn(x) { x; };';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
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
        "environment": {
          "outer": undefined,
          "store": {
            "identity": [Circular],
          },
        },
        "parameters": [
          {
            "astType": "expression",
            "expressionType": "identifier",
            "value": "x",
          },
        ],
        "type": "function",
      }
    `);
  });

  it('returns function call result', () => {
    const input = 'let identity = fn(x) { x; }; identity(5);';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "type": "integer",
        "value": 5,
      }
    `);
  });

  it('evaluates more advanced function call', () => {
    const input = 'let makeSum = fn(x,y) { return x+y; }; makeSum(5, 2);';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "type": "integer",
        "value": 7,
      }
    `);
  });
  it('evaluates string', () => {
    const input = '"Hello";';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "type": "string",
        "value": "Hello",
      }
    `);
  });
  it('evaluates string concat', () => {
    const input = '"Hello " + "World";';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "type": "string",
        "value": "Hello World",
      }
    `);
  });
  it('evaluates builtin function ', () => {
    const input = 'len("Hello World");';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "type": "integer",
        "value": 11,
      }
    `);
  });
  it('evaluates array indexing', () => {
    const input = 'let arr = [1, 2 + 5, 3]; arr[1];';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "type": "integer",
        "value": 7,
      }
    `);
  });
  it('evaluates array.len on empty array', () => {
    const input = 'let arr = []; len(arr);';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "type": "integer",
        "value": 0,
      }
    `);
  });
  it('evaluates array.len', () => {
    const input = 'let arr = [1, 2 + 5, 0]; len(arr);';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "type": "integer",
        "value": 3,
      }
    `);
  });
  it('evaluates array.first when array empty', () => {
    const input = 'let arr = []; first(arr);';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "type": "null",
      }
    `);
  });
  it('evaluates array.first', () => {
    const input = 'let arr = [9, 2 + 5, 0]; first(arr);';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "type": "integer",
        "value": 9,
      }
    `);
  });
  it('evaluates array.last when array empty', () => {
    const input = 'let arr = []; last(arr);';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "type": "null",
      }
    `);
  });
  it('evaluates array.last', () => {
    const input = 'let arr = [9, 2 + 5, 4]; last(arr);';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "type": "integer",
        "value": 4,
      }
    `);
  });
  it('evaluates array.rest when array empty', () => {
    const input = 'let arr = []; rest(arr);';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "type": "null",
      }
    `);
  });
  it('evaluates array.rest', () => {
    const input = 'let arr = [9, 2 + 5, 4]; rest(arr);';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "elements": [
          {
            "type": "integer",
            "value": 7,
          },
          {
            "type": "integer",
            "value": 4,
          },
        ],
        "type": "array",
      }
    `);
  });
  it('evaluates array.push when array empty', () => {
    const input = 'let arr = []; push(arr, 9);';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "elements": [
          {
            "type": "integer",
            "value": 9,
          },
        ],
        "type": "array",
      }
    `);
  });
  it('evaluates array.push', () => {
    const input = 'let arr = [9, 2 + 5, 4]; push(arr, 4);';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "elements": [
          {
            "type": "integer",
            "value": 9,
          },
          {
            "type": "integer",
            "value": 7,
          },
          {
            "type": "integer",
            "value": 4,
          },
          {
            "type": "integer",
            "value": 4,
          },
        ],
        "type": "array",
      }
    `);
  });
  it('evaluates empty objects', () => {
    const input = 'let x = {}; return x';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "pairs": {},
        "type": "object",
      }
    `);
  });
  it('evaluates objects', () => {
    const input = 'let x = { "a": 1, "b": 2 }; return x';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "pairs": {
          "97": {
            "key": {
              "type": "string",
              "value": "a",
            },
            "value": {
              "type": "integer",
              "value": 1,
            },
          },
          "98": {
            "key": {
              "type": "string",
              "value": "b",
            },
            "value": {
              "type": "integer",
              "value": 2,
            },
          },
        },
        "type": "object",
      }
    `);
  });
  describe('complex objects', () => {
    const declaration =
      'let a = "crazy"; let b = 1+2; let x = { a: true, b: 2, false: 3, 4: "first value" , "hello": 12, 4: "overwritten value" };';

    it('evaluates correctly', () => {
      const input = declaration + ' ' + 'return x';
      expect(actual(input)).toMatchInlineSnapshot(`
        {
          "pairs": {
            "0": {
              "key": {
                "type": "boolean",
                "value": false,
              },
              "value": {
                "type": "integer",
                "value": 3,
              },
            },
            "3": {
              "key": {
                "type": "integer",
                "value": 3,
              },
              "value": {
                "type": "integer",
                "value": 2,
              },
            },
            "4": {
              "key": {
                "type": "integer",
                "value": 4,
              },
              "value": {
                "type": "string",
                "value": "overwritten value",
              },
            },
            "94921873": {
              "key": {
                "type": "string",
                "value": "crazy",
              },
              "value": {
                "type": "boolean",
                "value": true,
              },
            },
            "99162322": {
              "key": {
                "type": "string",
                "value": "hello",
              },
              "value": {
                "type": "integer",
                "value": 12,
              },
            },
          },
          "type": "object",
        }
      `);
    });
    it('evaluates string variable access correctly', () => {
      const input = declaration + ' ' + 'return x[a]';
      expect(actual(input)).toMatchInlineSnapshot(`
        {
          "type": "boolean",
          "value": true,
        }
      `);
    });
    it('evaluates integer variable access correctly', () => {
      const input = declaration + ' ' + 'return x[b]';
      expect(actual(input)).toMatchInlineSnapshot(`
        {
          "type": "integer",
          "value": 2,
        }
      `);
    });
    it('evaluates boolean access correctly', () => {
      const input = declaration + ' ' + 'return x[false]';
      expect(actual(input)).toMatchInlineSnapshot(`
        {
          "type": "integer",
          "value": 3,
        }
      `);
    });
    it('evaluates string access correctly', () => {
      const input = declaration + ' ' + 'return x[4]';
      expect(actual(input)).toMatchInlineSnapshot(`
        {
          "type": "string",
          "value": "overwritten value",
        }
      `);
    });
    it('evaluates integer key access correctly', () => {
      const input = declaration + ' ' + 'return x["hello"]';
      expect(actual(input)).toMatchInlineSnapshot(`
        {
          "type": "integer",
          "value": 12,
        }
      `);
    });

    it('evaluates object with array child', () => {
      const input = `let x = { "a": [{"f": 4, "g": 5}, {"f": 6, "g": 7}], "b": 11 }; return x["a"];`;
      expect(actual(input)).toMatchInlineSnapshot(`
        {
          "elements": [
            {
              "pairs": {
                "102": {
                  "key": {
                    "type": "string",
                    "value": "f",
                  },
                  "value": {
                    "type": "integer",
                    "value": 4,
                  },
                },
                "103": {
                  "key": {
                    "type": "string",
                    "value": "g",
                  },
                  "value": {
                    "type": "integer",
                    "value": 5,
                  },
                },
              },
              "type": "object",
            },
            {
              "pairs": {
                "102": {
                  "key": {
                    "type": "string",
                    "value": "f",
                  },
                  "value": {
                    "type": "integer",
                    "value": 6,
                  },
                },
                "103": {
                  "key": {
                    "type": "string",
                    "value": "g",
                  },
                  "value": {
                    "type": "integer",
                    "value": 7,
                  },
                },
              },
              "type": "object",
            },
          ],
          "type": "array",
        }
      `);
    });
  });
  it('evaluates puts', () => {
    const spy = jest.spyOn(Utils, 'log').mockImplementation(() => {
      // do not log in test
    });
    const input = 'puts("hello", "world", 1+4);';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "type": "null",
      }
    `);
    expect(spy).toHaveBeenNthCalledWith(1, '"hello"');
    expect(spy).toHaveBeenNthCalledWith(2, '"world"');
    expect(spy).toHaveBeenNthCalledWith(3, '5');
  });

  it('evaluates if expression', () => {
    const input = 'let x = 123; if (x == 123) { return x; }';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "type": "integer",
        "value": 123,
      }
    `);
  });
  it('evaluates complex if expression', () => {
    const input = 'let x = { "a": 1, "b": 2 }; if (x["a"] == 1) { return x; }';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "pairs": {
          "97": {
            "key": {
              "type": "string",
              "value": "a",
            },
            "value": {
              "type": "integer",
              "value": 1,
            },
          },
          "98": {
            "key": {
              "type": "string",
              "value": "b",
            },
            "value": {
              "type": "integer",
              "value": 2,
            },
          },
        },
        "type": "object",
      }
    `);
  });

  it('evaluates return statement correctly', () => {
    const input = `if (10 > 1) {
     if (10 > 1) {
       return 10;
     }
     return 1; 
    }`;
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "type": "integer",
        "value": 10,
      }
    `);
  });

  it('evaluates variable reassignment', () => {
    const input = 'let x = 12; x = 13;';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "type": "integer",
        "value": 13,
      }
    `);
  });

  it('evaluates variable reassignment with expression on the right side', () => {
    const input = 'let x = 12; x = 2 + 3;';
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "type": "integer",
        "value": 5,
      }
    `);
  });

  it('throws error when reassigning undefined variable', () => {
    const input = 'x = 13;';
    expect(() => actual(input)).toThrow('cannot reassign undefined variable');
  });

  it('evaluates forEach loop', () => {
    const input = `
      let sum = 0;
      let arr = [1, 2, 3, 4, 5];
      forEach arr {
        sum = sum + it;
      }
      sum
    `;

    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "type": "integer",
        "value": 15,
      }
    `);
  });

  it('evaluates forEach with array functions', () => {
    const input = `
      let arr = [1, 2, 3];
      let result = [];
      forEach arr {
        result = push(result, it * 2);
      }
      result
    `;
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "elements": [
          {
            "type": "integer",
            "value": 2,
          },
          {
            "type": "integer",
            "value": 4,
          },
          {
            "type": "integer",
            "value": 6,
          },
        ],
        "type": "array",
      }
    `);
  });

  it('evaluates nested forEach loops', () => {
    const input = `
      let matrix = [[1, 2], [3, 4]];
      let result = 0;
      forEach matrix {
        let row = it;
        forEach row {
          result = result + it;
        }
      }
      result
    `;
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "type": "integer",
        "value": 10,
      }
    `);
  });

  it('evaluates forEach with early return', () => {
    const input = `
      let find = fn(arr, target) {
        let result = false;
        forEach arr {
          if (it == target) {
            result = true;
          }
        }
        return result;
      };
      [find([1,2,3], 2), find([1,2,3], 4)]
    `;
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "elements": [
          {
            "type": "boolean",
            "value": true,
          },
          {
            "type": "boolean",
            "value": false,
          },
        ],
        "type": "array",
      }
    `);
  });

  it('evaluates forEach with string concatenation', () => {
    const input = `
      let arr = ["hello", "world"];
      let result = "";
      forEach arr {
        result = result + it;
      }
      result
    `;
    expect(actual(input)).toMatchInlineSnapshot(`
      {
        "type": "string",
        "value": "helloworld",
      }
    `);
  });
});
