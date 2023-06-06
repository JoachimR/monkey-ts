import { assert } from '../utils';
import { EvaluatedTo, EvaluatedToBuiltIn, EvaluatedType } from './model/evaluated';
import { evaluatedToString } from './model/evaluated-to-string';

export const builtins: Record<string, EvaluatedToBuiltIn> = {
  len: {
    type: EvaluatedType.BuiltIn,
    fn: (...args: EvaluatedTo[]) => {
      assert(args.length === 1, 'wrong number of arguments', { args });
      const arg = args[0];
      if (arg.type === EvaluatedType.String) {
        return {
          type: EvaluatedType.Integer,
          value: arg.value.length,
        };
      }
      assert(arg.type === EvaluatedType.Array, 'invalid argument', { args });
      return {
        type: EvaluatedType.Integer,
        value: arg.elements.length,
      };
    },
  },
  first: {
    type: EvaluatedType.BuiltIn,
    fn: (...args: EvaluatedTo[]) => {
      assert(args.length === 1, 'wrong number of arguments', { args });
      const arg = args[0];
      assert(arg.type === EvaluatedType.Array, 'invalid argument', { args });
      if (arg.elements.length === 0) {
        return { type: EvaluatedType.Null };
      }
      return arg.elements[0];
    },
  },
  last: {
    type: EvaluatedType.BuiltIn,
    fn: (...args: EvaluatedTo[]) => {
      assert(args.length === 1, 'wrong number of arguments', { args });
      const arg = args[0];
      assert(arg.type === EvaluatedType.Array, 'invalid argument', { args });
      if (arg.elements.length === 0) {
        return { type: EvaluatedType.Null };
      }
      const last = arg.elements.at(-1);
      assert(last, 'invalid argument', { args });
      return last;
    },
  },
  rest: {
    type: EvaluatedType.BuiltIn,
    fn: (...args: EvaluatedTo[]) => {
      assert(args.length === 1, 'wrong number of arguments', { args });
      const arg = args[0];
      assert(arg.type === EvaluatedType.Array, 'invalid argument', { args });
      if (arg.elements.length === 0) {
        return { type: EvaluatedType.Null };
      }
      return {
        type: EvaluatedType.Array,
        elements: arg.elements.slice(1),
      };
    },
  },
  push: {
    type: EvaluatedType.BuiltIn,
    fn: (...args: EvaluatedTo[]) => {
      assert(args.length === 2, 'wrong number of arguments', { args });
      const arg = args[0];
      assert(arg.type === EvaluatedType.Array, 'invalid argument', { args });
      return {
        type: EvaluatedType.Array,
        elements: [...arg.elements, args[1]],
      };
    },
  },
  puts: {
    type: EvaluatedType.BuiltIn,
    fn: (...args: EvaluatedTo[]) => {
      for (const arg of args) {
        console.log(evaluatedToString(arg));
      }
      return { type: EvaluatedType.Null };
    },
  },
};
