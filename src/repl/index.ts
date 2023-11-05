import readline from 'readline';
import { evaluate } from '../lib/evaluate';
import { lex } from '../lib/lex';
import { parse } from '../lib/parse';
import { valueToString } from '../lib/model/value-to-string';
import { log } from '../utils';

export const start = (): void => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });

  rl.prompt();

  rl.on('line', (input: string) => {
    const value = evalInput(input);
    log(valueToString(value));
    rl.prompt();
  });
};

function evalInput(input: string) {
  return evaluate(parse(lex(input)));
}
