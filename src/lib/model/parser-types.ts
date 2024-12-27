import type { Expression } from './ast';
import type { Token } from './token';

type ParsePrefixFn = (...args: unknown[]) => Expression;
type ParseInfixFn = (_: Expression) => Expression;

export type ParsePrefixFnMap = Partial<Record<Token['type'], ParsePrefixFn | undefined>>;
export type ParseInfixFnMap = Partial<Record<Token['type'], ParseInfixFn | undefined>>;
