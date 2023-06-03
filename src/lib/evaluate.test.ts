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
});
