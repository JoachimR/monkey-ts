import { assert } from '../utils';
import type {
  ArrayLiteralExpression,
  BlockStatement,
  BooleanLiteralExpression,
  CallExpression,
  Expression,
  ExpressionStatement,
  ForEachStatement,
  FunctionLiteralExpression,
  IdentifierExpression,
  IfExpression,
  IndexExpression,
  InfixExpression,
  IntegerLiteralExpression,
  LetStatement,
  ObjectLiteralExpression,
  PrefixExpression,
  Program,
  ReassignStatement,
  ReturnStatement,
  Statement,
  StringLiteralExpression,
} from './model/ast';
import type { ParseInfixFnMap, ParsePrefixFnMap } from './model/parser-types';
import type { IdentifierToken, Token } from './model/token';
import { isIdentifierToken, isInfixToken, isIntegerToken, isPrefixToken, isStringToken } from './model/token-guards';

const Precedence = {
  Lowest: 0,
  Equals: 1,
  LessThanGreaterThan: 2,
  Sum: 3,
  Product: 4,
  Prefix: 5,
  Call: 6,
  Index: 7,
} as const;
export type PrecedenceType = (typeof Precedence)[keyof typeof Precedence];

const precedences: Partial<Record<Token['type'], PrecedenceType | undefined>> = {
  equals: Precedence.Equals,
  notEquals: Precedence.Equals,
  lessThan: Precedence.LessThanGreaterThan,
  greaterThan: Precedence.LessThanGreaterThan,
  plus: Precedence.Sum,
  minus: Precedence.Sum,
  slash: Precedence.Product,
  asterisk: Precedence.Product,
  leftBracket: Precedence.Index,
  leftParenthesis: Precedence.Call,
};

class Parser {
  private currentToken: Token;
  private peekToken: Token | undefined;

  private prefixParseFns: ParsePrefixFnMap = {
    identifier: this.parseIdentifier.bind(this),
    integer: this.parseInteger.bind(this),
    string: this.parseString.bind(this),
    bang: this.parsePrefixExpression.bind(this),
    minus: this.parsePrefixExpression.bind(this),
    true: this.parseBoolean.bind(this),
    false: this.parseBoolean.bind(this),
    leftParenthesis: this.parseGroupedExpression.bind(this),
    if: this.parseIfExpression.bind(this),
    function: this.parseFunctionLiteral.bind(this),
    leftBracket: this.parseArrayLiteral.bind(this),
    leftBrace: this.parseObjectLiteral.bind(this),
  };

  private infixParseFns: ParseInfixFnMap = {
    plus: this.parseInfixExpression.bind(this),
    minus: this.parseInfixExpression.bind(this),
    slash: this.parseInfixExpression.bind(this),
    asterisk: this.parseInfixExpression.bind(this),
    equals: this.parseInfixExpression.bind(this),
    notEquals: this.parseInfixExpression.bind(this),
    lessThan: this.parseInfixExpression.bind(this),
    greaterThan: this.parseInfixExpression.bind(this),
    leftBracket: this.parseIndexExpression.bind(this),
    leftParenthesis: (arg: Expression) => {
      assert(arg.expressionType === 'identifier' || arg.expressionType === 'functionLiteral');
      return this.parseCallExpression(arg);
    },
  };

  constructor(private lexer: { nextToken: () => Token | undefined }) {
    const token = this.lexer.nextToken();
    assert(token, 'No tokens found');
    this.currentToken = token;
    this.peekToken = this.lexer.nextToken();
  }

  parseProgram(): Program {
    const statements: Statement[] = [];
    while (this.currentToken.type !== 'eof') {
      const statement = this.parseStatement();
      assert(statement, 'statement could not be parsed');
      statements.push(statement);

      this.nextToken();
    }
    return { astType: 'program', body: statements };
  }

  private parseStatement(): Statement {
    switch (this.currentToken.type) {
      case 'let':
        return this.parseLetStatement();
      case 'return':
        return this.parseReturnStatement();
      case 'identifier': {
        if (this.peekToken?.type === 'assign') {
          return this.parseReassignStatement();
        }
        return this.parseExpressionStatement();
      }
      case 'forEach':
        return this.parseForEachStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  private parseLetStatement(): LetStatement {
    this.nextTokenExpecting('identifier');
    const literal = (this.currentToken as IdentifierToken).literal;
    this.nextTokenExpecting('assign');

    this.nextToken();
    const value = this.parseExpression(Precedence.Lowest);

    if (this.peekToken?.type === 'semicolon') {
      this.nextToken();
    }

    return {
      astType: 'statement',
      statementType: 'let',
      name: {
        astType: 'expression',
        expressionType: 'identifier',
        value: literal,
      },
      value,
    };
  }

  private parseReturnStatement(): ReturnStatement {
    this.nextToken();
    const value = this.parseExpression(Precedence.Lowest);
    if (this.peekToken?.type === 'semicolon') {
      this.nextToken();
    }
    return {
      astType: 'statement',
      statementType: 'return',
      value,
    };
  }

  private parseExpressionStatement(): ExpressionStatement {
    const expression = this.parseExpression(Precedence.Lowest);

    if (this.peekToken?.type === 'semicolon') {
      this.nextToken();
    }

    return {
      astType: 'statement',
      statementType: 'expression',
      expression,
    };
  }

  private parseReassignStatement(): ReassignStatement {
    const literal = (this.currentToken as IdentifierToken).literal;
    this.nextTokenExpecting('assign');

    this.nextToken();
    const value = this.parseExpression(Precedence.Lowest);

    if (this.peekToken?.type === 'semicolon') {
      this.nextToken();
    }

    return {
      astType: 'statement',
      statementType: 'reassign',
      name: {
        astType: 'expression',
        expressionType: 'identifier',
        value: literal,
      },
      value,
    };
  }

  private parseExpression(precedence: PrecedenceType): Expression {
    const prefixFn = this.prefixParseFns[this.currentToken.type];
    assert(prefixFn, 'no prefix function found to parse expression', {
      token: this.currentToken,
    });

    let leftExp = prefixFn();
    while (this.peekToken?.type !== 'semicolon' && precedence < this.peekPrecedence()) {
      const infixFn = this.peekToken ? this.infixParseFns[this.peekToken?.type] : undefined;
      if (!infixFn) {
        return leftExp;
      }
      this.nextToken();
      leftExp = infixFn(leftExp);
    }
    return leftExp;
  }

  private parseIdentifier(): IdentifierExpression {
    assert(isIdentifierToken(this.currentToken), 'invalid token', { token: this.currentToken });
    return {
      astType: 'expression',
      expressionType: 'identifier',
      value: this.currentToken.literal,
    };
  }

  private parseInteger(): IntegerLiteralExpression {
    assert(isIntegerToken(this.currentToken), 'invalid token', { token: this.currentToken });
    const num = Number(this.currentToken.literal);
    assert(!isNaN(num), 'invalid number', { currentToken: this.currentToken });
    return {
      astType: 'expression',
      expressionType: 'integerLiteral',
      value: num,
    };
  }

  private parseString(): StringLiteralExpression {
    assert(isStringToken(this.currentToken), 'invalid token', { token: this.currentToken });
    return {
      astType: 'expression',
      expressionType: 'stringLiteral',
      value: this.currentToken.literal,
    };
  }

  private parsePrefixExpression(): PrefixExpression {
    assert(isPrefixToken(this.currentToken), 'invalid token', { token: this.currentToken });
    const operator = this.currentToken.operator;
    this.nextToken();
    const right = this.parseExpression(Precedence.Prefix);
    return {
      astType: 'expression',
      expressionType: 'prefixExpression',
      operator,
      right,
    };
  }

  private parseInfixExpression(left: Expression): InfixExpression {
    assert(isInfixToken(this.currentToken), 'invalid token', { token: this.currentToken });
    const operator = this.currentToken.operator;
    const precedence = this.currentPrecedence();
    this.nextToken();
    const right = this.parseExpression(precedence);
    return {
      astType: 'expression',
      expressionType: 'infixExpression',
      operator,
      left,
      right,
    };
  }

  private parseBoolean(): BooleanLiteralExpression {
    assert(this.currentToken.type === 'true' || this.currentToken.type === 'false', 'invalid token', {
      token: this.currentToken,
    });
    return {
      astType: 'expression',
      expressionType: 'booleanLiteral',
      value: this.currentToken.type === 'true',
    };
  }

  private parseGroupedExpression(): Expression {
    assert(this.currentToken.type === 'leftParenthesis', 'invalid token', { token: this.currentToken });

    this.nextToken();

    const expression = this.parseExpression(Precedence.Lowest);

    this.nextTokenExpecting('rightParenthesis');
    return expression;
  }

  private parseIfExpression(): IfExpression {
    assert(this.currentToken.type === 'if', 'invalid token', { token: this.currentToken });
    this.nextTokenExpecting('leftParenthesis');
    this.nextToken();

    const condition = this.parseExpression(Precedence.Lowest);

    this.nextTokenExpecting('rightParenthesis');
    this.nextTokenExpecting('leftBrace');
    const consequence = this.parseBlockStatement();

    if (this.peekToken?.type !== 'else') {
      return {
        astType: 'expression',
        expressionType: 'ifExpression',
        condition,
        consequence,
      };
    }

    this.nextToken();
    assert(this.nextTokenExpecting('leftBrace'));
    const alternative = this.parseBlockStatement();
    return {
      astType: 'expression',
      expressionType: 'ifExpression',
      condition,
      consequence,
      alternative,
    };
  }

  private parseFunctionLiteral(): FunctionLiteralExpression {
    assert(this.currentToken.type === 'function', 'invalid token', { token: this.currentToken });
    this.nextTokenExpecting('leftParenthesis');
    const parameters = this.parseFunctionParameters();
    this.nextTokenExpecting('leftBrace');
    const body = this.parseBlockStatement();
    return {
      astType: 'expression',
      expressionType: 'functionLiteral',
      parameters,
      body,
    };
  }

  private parseArrayLiteral(): ArrayLiteralExpression {
    assert(this.currentToken.type === 'leftBracket', 'invalid token', { token: this.currentToken });
    return {
      astType: 'expression',
      expressionType: 'arrayLiteral',
      elements: this.parseExpressionList('rightBracket'),
    };
  }

  private parseObjectLiteral(): ObjectLiteralExpression {
    assert(this.currentToken.type === 'leftBrace', 'invalid token', { token: this.currentToken });
    const pairs: ObjectLiteralExpression['pairs'] = [];
    while (this.peekToken?.type !== 'rightBrace') {
      this.nextToken();
      const key = this.parseExpression(Precedence.Lowest);
      this.nextTokenExpecting('colon');
      this.nextToken();
      const value = this.parseExpression(Precedence.Lowest);
      pairs.push([key, value]);
      // @ts-expect-error [TS2367] peekToken can be mutated at this point
      if (this.peekToken?.type !== 'rightBrace') {
        this.nextTokenExpecting('comma');
      }
    }
    this.nextTokenExpecting('rightBrace');
    return {
      astType: 'expression',
      expressionType: 'objectLiteral',
      pairs,
    };
  }

  private parseIndexExpression(left: Expression): IndexExpression {
    this.nextToken();
    const index = this.parseExpression(Precedence.Lowest);
    this.nextTokenExpecting('rightBracket');
    return {
      astType: 'expression',
      expressionType: 'indexExpression',
      left,
      index,
    };
  }

  private parseFunctionParameters() {
    if (this.peekToken?.type === 'rightParenthesis') {
      this.nextToken();
      return [];
    }
    this.nextToken();
    assert(this.currentToken.type === 'identifier', 'invalid token', { token: this.currentToken });
    const parameters: IdentifierExpression[] = [];
    parameters.push({
      astType: 'expression',
      expressionType: 'identifier',
      value: this.currentToken.literal,
    });
    while (this.peekToken?.type === 'comma') {
      this.nextToken();
      this.nextToken();
      assert(this.currentToken.type === 'identifier', 'invalid token', { token: this.currentToken });
      parameters.push({
        astType: 'expression',
        expressionType: 'identifier',
        value: this.currentToken.literal,
      });
    }
    this.nextTokenExpecting('rightParenthesis');
    return parameters;
  }

  private parseBlockStatement(): BlockStatement {
    const statements: Statement[] = [];
    this.nextToken();
    while (this.currentToken.type !== 'rightBrace' && this.currentToken.type !== 'eof') {
      const statement = this.parseStatement();
      assert(statement, 'statement could not be parsed');
      statements.push(statement);

      this.nextToken();
    }
    return {
      astType: 'statement',
      statementType: 'block',
      statements,
    };
  }

  private parseCallExpression(func: IdentifierExpression | FunctionLiteralExpression): CallExpression {
    assert(this.currentToken.type === 'leftParenthesis', 'invalid token', { token: this.currentToken });
    return {
      astType: 'expression',
      expressionType: 'callExpression',
      func,
      args: this.parseExpressionList('rightParenthesis'),
    };
  }

  private parseExpressionList(endTokenType: Token['type']): Expression[] {
    if (this.peekToken?.type === endTokenType) {
      this.nextToken();
      return [];
    }
    const args: Expression[] = [];

    this.nextToken();
    args.push(this.parseExpression(Precedence.Lowest));
    while (this.peekToken?.type === 'comma') {
      this.nextToken();
      this.nextToken();
      args.push(this.parseExpression(Precedence.Lowest));
    }
    this.nextTokenExpecting(endTokenType);
    return args;
  }

  private parseForEachStatement(): ForEachStatement {
    this.nextToken();
    const array = this.parseExpression(Precedence.Lowest);

    this.nextTokenExpecting('leftBrace');

    const body = this.parseBlockStatement();

    return {
      astType: 'statement',
      statementType: 'forEach',
      array,
      body,
    };
  }

  private nextToken() {
    assert(this.peekToken, 'No more tokens');
    this.currentToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  private nextTokenExpecting(tokenType: Token['type']): boolean {
    assert(this.peekToken && this.peekToken.type === tokenType, 'invalid next token type', {
      expected: tokenType,
      actual: this.peekToken?.type,
    });
    this.nextToken();
    return true;
  }

  private currentPrecedence(): PrecedenceType {
    if (this.currentToken) {
      return precedences[this.currentToken.type] || Precedence.Lowest;
    }
    return Precedence.Lowest;
  }

  private peekPrecedence(): PrecedenceType {
    if (this.peekToken) {
      return precedences[this.peekToken.type] || Precedence.Lowest;
    }
    return Precedence.Lowest;
  }
}

export function parse(lexer: { nextToken: () => Token | undefined }): Program {
  const parser = new Parser(lexer);
  return parser.parseProgram();
}
