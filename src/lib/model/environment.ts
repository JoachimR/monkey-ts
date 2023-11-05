import type { IdentifierExpression } from './ast';
import type { EvaluatedTo } from './evaluated-to';

export type Environment = {
  store: Record<string, EvaluatedTo | undefined>;
  outer?: Environment;
};

export function getFromEnvironment(env: Environment, name: string): EvaluatedTo | undefined {
  const evaluatedTo = env.store[name];
  if (evaluatedTo) {
    return evaluatedTo;
  }
  if (env.outer) {
    return getFromEnvironment(env.outer, name);
  }
  return undefined;
}

export function storeInEnvironment(env: Environment, name: string, value: EvaluatedTo): void {
  env.store[name] = value;
}

export const createEnvironment = (
  outer?: Environment,
  context?: { parameters: IdentifierExpression[]; values: EvaluatedTo[] }
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
