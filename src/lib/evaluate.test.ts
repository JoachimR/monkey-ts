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
});
