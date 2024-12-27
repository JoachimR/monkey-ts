import type { IdentifierExpression } from './ast';
import type { Value } from './value';

export type Environment = {
  store: Record<string, Value | undefined>;
  outer?: Environment;
};

function findEnvironmentForKey(env: Environment, key: string): Environment | undefined {
  if (env.store[key]) {
    return env;
  }
  if (env.outer) {
    return findEnvironmentForKey(env.outer, key);
  }
  return undefined;
}

export function getFromEnvironment(env: Environment, key: string): Value | undefined {
  return findEnvironmentForKey(env, key)?.store[key];
}

export function storeInEnvironment(env: Environment, key: string, value: Value): void {
  const envToStore = findEnvironmentForKey(env, key) ?? env;
  if (envToStore) {
    // update value in current or some outer store
    envToStore.store[key] = value;
  } else {
    // new entry in current store
    env.store[key] = value;
  }
}

export const createEnvironment = (
  outer?: Environment,
  context?: { parameters: IdentifierExpression[]; values: Value[] }
): Environment => {
  const env: Environment = {
    store: {},
    outer,
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
