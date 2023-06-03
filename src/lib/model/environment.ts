import { IdentifierExpression } from './ast';
import { EvaluatedTo } from './evaluated';

export class Environment {
  private store: Record<string, EvaluatedTo | undefined>;
  private outer?: Environment;

  public constructor(outer?: Environment, context?: { parameters: IdentifierExpression[]; values: EvaluatedTo[] }) {
    this.store = {};
    this.outer = outer;

    if (context) {
      for (let i = 0; i < context.parameters.length; i++) {
        const value = context.values.length > i ? context.values[i] : undefined;
        this.set(context.parameters[i].value, value);
      }
    }
  }

  public get(name: string): EvaluatedTo | undefined {
    const v = this.store[name];
    if (v) {
      return v;
    }
    return this.outer?.get(name);
  }

  public set(name: string, value: EvaluatedTo | undefined) {
    this.store[name] = value;
  }
}
