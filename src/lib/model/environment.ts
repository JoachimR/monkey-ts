import type { IdentifierExpression } from './ast';
import type { Value } from './value';

export type Environment = {
  store: Record<string, Value | undefined>;
  outer?: Environment;
};

export function getFromEnvironment(env: Environment, name: string): Value | undefined {
  const value = env.store[name];
  if (value) {
    return value;
  }
  if (env.outer) {
    return getFromEnvironment(env.outer, name);
  }
  return undefined;
}

export function storeInEnvironment(env: Environment, name: string, value: Value): void {
  env.store[name] = value;
}

export const createEnvironment = (
  outer?: Environment,
  context?: { parameters: IdentifierExpression[]; values: Value[] }
): Environment => {
  const env: Environment = {
    store: {},
    outer: outer,
  };
  if (context) {
    for (let i = 0; i < context.parameters.length; i++) {
      const value = context.values.length > i ? context.values[i] : undefined;
      if (value) {
        storeInEnvironment(env, context.parameters[i].value, value);
      }
    }
  }
  return env;
};
