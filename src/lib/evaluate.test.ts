import { evaluate } from './evaluate';
import { lex } from './lexer';
import { parse } from './parser';

describe('evaluate', () => {
  it('returns last let statement', () => {
    const input = `
    let x = 5;
    let y = 10;
    let foobar = 123;
  `;

    const actual = evaluate(parse(lex(input)));
    expect(actual).toEqual({
      type: 'Integer',
      value: 123,
    });
  });

  it('returns reverted boolean', () => {
    const input = `let hello = !false; return hello`;
    const actual = evaluate(parse(lex(input)));
    expect(actual).toEqual({
      type: 'Boolean',
      value: true,
    });
  });

  it('returns function call result', () => {
    const input = 'let identity = fn(x) { x; }; identity(5);';
    const actual = evaluate(parse(lex(input)));
    expect(actual).toEqual({
      type: 'Integer',
      value: 5,
    });
  });

  it('evaluates more advanced function call', () => {
    const input = 'let makeSum = fn(x,y) { return x+y; }; makeSum(5, 2);';
    const actual = evaluate(parse(lex(input)));
    expect(actual).toEqual({
      type: 'Integer',
      value: 7,
    });
  });
  it('evaluates string', () => {
    const input = '"Hello";';
    const actual = evaluate(parse(lex(input)));
    expect(actual).toEqual({
      type: 'String',
      value: 'Hello',
    });
  });
  it('evaluates string concat', () => {
    const input = '"Hello " + "World";';
    const actual = evaluate(parse(lex(input)));
    expect(actual).toEqual({
      type: 'String',
      value: 'Hello World',
    });
  });
  it('evaluates builtin function ', () => {
    const input = 'len("Hello World");';
    const actual = evaluate(parse(lex(input)));
    expect(actual).toEqual({
      type: 'Integer',
      value: 11,
    });
  });
  it('evaluates array indexing', () => {
    const input = 'let arr = [1, 2 + 5, 3]; arr[1];';
    const actual = evaluate(parse(lex(input)));
    expect(actual).toEqual({
      type: 'Integer',
      value: 7,
    });
  });
  it('evaluates array.len on empty array', () => {
    const input = 'let arr = []; len(arr);';
    const actual = evaluate(parse(lex(input)));
    expect(actual).toEqual({
      type: 'Integer',
      value: 0,
    });
  });
  it('evaluates array.len', () => {
    const input = 'let arr = [1, 2 + 5, 0]; len(arr);';
    const actual = evaluate(parse(lex(input)));
    expect(actual).toEqual({
      type: 'Integer',
      value: 3,
    });
  });
  it('evaluates array.first when array empty', () => {
    const input = 'let arr = []; first(arr);';
    const actual = evaluate(parse(lex(input)));
    expect(actual).toEqual({ type: 'Null' });
  });
  it('evaluates array.first', () => {
    const input = 'let arr = [9, 2 + 5, 0]; first(arr);';
    const actual = evaluate(parse(lex(input)));
    expect(actual).toEqual({
      type: 'Integer',
      value: 9,
    });
  });
  it('evaluates array.last when array empty', () => {
    const input = 'let arr = []; last(arr);';
    const actual = evaluate(parse(lex(input)));
    expect(actual).toEqual({ type: 'Null' });
  });
  it('evaluates array.last', () => {
    const input = 'let arr = [9, 2 + 5, 4]; last(arr);';
    const actual = evaluate(parse(lex(input)));
    expect(actual).toEqual({
      type: 'Integer',
      value: 4,
    });
  });
  it('evaluates array.rest when array empty', () => {
    const input = 'let arr = []; rest(arr);';
    const actual = evaluate(parse(lex(input)));
    expect(actual).toEqual({ type: 'Null' });
  });
  it('evaluates array.rest', () => {
    const input = 'let arr = [9, 2 + 5, 4]; rest(arr);';
    const actual = evaluate(parse(lex(input)));
    expect(actual).toEqual({
      type: 'Array',
      elements: [
        { type: 'Integer', value: 7 },
        { type: 'Integer', value: 4 },
      ],
    });
  });
  it('evaluates array.push when array empty', () => {
    const input = 'let arr = []; push(arr, 9);';
    const actual = evaluate(parse(lex(input)));
    expect(actual).toEqual({
      type: 'Array',
      elements: [{ type: 'Integer', value: 9 }],
    });
  });
  it('evaluates array.push', () => {
    const input = 'let arr = [9, 2 + 5, 4]; push(arr, 4);';
    const actual = evaluate(parse(lex(input)));
    expect(actual).toEqual({
      type: 'Array',
      elements: [
        { type: 'Integer', value: 9 },
        { type: 'Integer', value: 7 },
        { type: 'Integer', value: 4 },
        { type: 'Integer', value: 4 },
      ],
    });
  });
  it('evaluates empty objects', () => {
    const input = 'let x = {}; return x';
    const actual = evaluate(parse(lex(input)));
    expect(actual).toEqual({
      type: 'Object',
      pairs: {},
    });
  });
  it('evaluates objects', () => {
    const input = 'let x = { "a": 1, "b": 2 }; return x';
    const actual = evaluate(parse(lex(input)));
    expect(actual).toEqual({
      type: 'Object',
      pairs: {
        '97': { key: { type: 'String', value: 'a' }, value: { type: 'Integer', value: 1 } },
        '98': { key: { type: 'String', value: 'b' }, value: { type: 'Integer', value: 2 } },
      },
    });
  });
  describe('complex objects', () => {
    const declaration =
      'let a = "hmmm"; let b = 1+2; let x = { a: true, b: 2, false: 3, 4: "first value" , "hello": 12, 4: "overwritten value" };';

    it('evaluates correctly', () => {
      const input = declaration + ' ' + 'return x';
      const actual = evaluate(parse(lex(input)));
      expect(actual).toEqual({
        type: 'Object',
        pairs: {
          '3206501': { key: { type: 'String', value: 'hmmm' }, value: { type: 'Boolean', value: true } },
          '3': { key: { type: 'Integer', value: 3 }, value: { type: 'Integer', value: 2 } },
          '0': { key: { type: 'Boolean', value: false }, value: { type: 'Integer', value: 3 } },
          '4': { key: { type: 'Integer', value: 4 }, value: { type: 'String', value: 'overwritten value' } },
          '99162322': { key: { type: 'String', value: 'hello' }, value: { type: 'Integer', value: 12 } },
        },
      });
    });
    it('evaluates string variable access correctly', () => {
      const input = declaration + ' ' + 'return x[a]';
      const actual = evaluate(parse(lex(input)));
      expect(actual).toEqual({
        type: 'Boolean',
        value: true,
      });
    });
    it('evaluates integer variable access correctly', () => {
      const input = declaration + ' ' + 'return x[b]';
      const actual = evaluate(parse(lex(input)));
      expect(actual).toEqual({
        type: 'Integer',
        value: 2,
      });
    });
    it('evaluates boolean access correctly', () => {
      const input = declaration + ' ' + 'return x[false]';
      const actual = evaluate(parse(lex(input)));
      expect(actual).toEqual({
        type: 'Integer',
        value: 3,
      });
    });
    it('evaluates string access correctly', () => {
      const input = declaration + ' ' + 'return x[4]';
      const actual = evaluate(parse(lex(input)));
      expect(actual).toEqual({
        type: 'String',
        value: 'overwritten value',
      });
    });
    it('evaluates integer key access correctly', () => {
      const input = declaration + ' ' + 'return x["hello"]';
      const actual = evaluate(parse(lex(input)));
      expect(actual).toEqual({
        type: 'Integer',
        value: 12,
      });
    });
  });
});
