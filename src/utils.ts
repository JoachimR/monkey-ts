export const checkExhaustive = (x: never): never => {
  throw new Error(`Unexpected object '${x}'`);
};

export function assert<T>(condition: T, msg?: string, context?: Readonly<Record<string, unknown>>): asserts condition {
  if (!condition) {
    throw new Error(`${msg || 'assertion failed '}, context: ${JSON.stringify(context || {})}`);
  }
}

export function log(...args: unknown[]): void {
  console.log(...args);
}
