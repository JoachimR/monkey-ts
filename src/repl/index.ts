import readline from 'readline';
import { evaluate } from '../lib/evaluate';
import { lex } from '../lib/lexer';
import { parse } from '../lib/parser';
import { evaluatedToString } from '../lib/model/evaluated-to-string';

export const start = (): void => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });

  rl.prompt();

  rl.on('line', (input: string) => {
    const evaluated = evalInput(input);
    console.log(evaluatedToString(evaluated));
    rl.prompt();
  });
};

function evalInput(input: string) {
  return evaluate(parse(lex(input)));
}
