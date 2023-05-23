import readline from "readline";

export const start = (): void => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  rl.prompt();

  rl.on("line", (input) => {
    console.log(input)
    rl.prompt();
  });
};
