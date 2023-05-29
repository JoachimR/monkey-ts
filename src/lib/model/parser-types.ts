import { TokenType } from './token';
import { Expression } from './ast';

type ParsePrefixFn = (...args: unknown[]) => Expression;
type ParseInfixFn = (_: Expression) => Expression;

export type ParsePrefixFnMap = Partial<Record<TokenType, ParsePrefixFn | undefined>>;
export type ParseInfixFnMap = Partial<Record<TokenType, ParseInfixFn | undefined>>;
