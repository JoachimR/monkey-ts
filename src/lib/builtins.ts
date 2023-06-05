import { assert } from '../utils';
import { EvaluatedTo, EvaluatedToBuiltIn, EvaluatedType } from './model/evaluated';

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
};
