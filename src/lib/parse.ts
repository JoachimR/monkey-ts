import { assert } from '../utils';
import type {
  ArrayLiteralExpression,
  BlockStatement,
  BooleanLiteralExpression,
  CallExpression,
  Expression,
  ExpressionStatement,
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
import { astNodeTypes, expressionTypes, statementTypes } from './model/ast';
import type { ParseInfixFnMap, ParsePrefixFnMap } from './model/parser-types';
import type { IdentifierToken, Token, TokenType } from './model/token';
import { tokenTypes } from './model/token';
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

const precedences: Partial<Record<TokenType, PrecedenceType | undefined>> = {
  [tokenTypes.Equals]: Precedence.Equals,
  [tokenTypes.NotEquals]: Precedence.Equals,
  [tokenTypes.LessThan]: Precedence.LessThanGreaterThan,
  [tokenTypes.GreaterThan]: Precedence.LessThanGreaterThan,
  [tokenTypes.Plus]: Precedence.Sum,
  [tokenTypes.Minus]: Precedence.Sum,
  [tokenTypes.Slash]: Precedence.Product,
  [tokenTypes.Asterisk]: Precedence.Product,
  [tokenTypes.LeftParenthesis]: Precedence.Call,
  [tokenTypes.LeftBracket]: Precedence.Index,
};

class Parser {
  private currentToken: Token;
  private peekToken: Token | undefined;

  private prefixParseFns: ParsePrefixFnMap = {
    [tokenTypes.Identifier]: this.parseIdentifier.bind(this),
    [tokenTypes.Integer]: this.parseInteger.bind(this),
    [tokenTypes.String]: this.parseString.bind(this),
    [tokenTypes.Bang]: this.parsePrefixExpression.bind(this),
    [tokenTypes.Minus]: this.parsePrefixExpression.bind(this),
    [tokenTypes.True]: this.parseBoolean.bind(this),
    [tokenTypes.False]: this.parseBoolean.bind(this),
    [tokenTypes.LeftParenthesis]: this.parseGroupedExpression.bind(this),
    [tokenTypes.If]: this.parseIfExpression.bind(this),
    [tokenTypes.Function]: this.parseFunctionLiteral.bind(this),
    [tokenTypes.LeftBracket]: this.parseArrayLiteral.bind(this),
    [tokenTypes.LeftBrace]: this.parseObjectLiteral.bind(this),
  };

  private infixParseFns: ParseInfixFnMap = {
    [tokenTypes.Plus]: this.parseInfixExpression.bind(this),
    [tokenTypes.Minus]: this.parseInfixExpression.bind(this),
    [tokenTypes.Slash]: this.parseInfixExpression.bind(this),
    [tokenTypes.Asterisk]: this.parseInfixExpression.bind(this),
    [tokenTypes.Equals]: this.parseInfixExpression.bind(this),
    [tokenTypes.NotEquals]: this.parseInfixExpression.bind(this),
    [tokenTypes.LessThan]: this.parseInfixExpression.bind(this),
    [tokenTypes.GreaterThan]: this.parseInfixExpression.bind(this),
    [tokenTypes.LeftBracket]: this.parseIndexExpression.bind(this),
    [tokenTypes.LeftParenthesis]: (arg: Expression) => {
      assert(
        arg.expressionType === expressionTypes.Identifier || arg.expressionType === expressionTypes.FunctionLiteral
      );
      return this.parseCallExpression(arg);
    },
  };

  constructor(private readonly lexer: { nextToken: () => Token | undefined }) {
    const token = this.lexer.nextToken();
    assert(token, 'No tokens found');
    this.currentToken = token;
    this.peekToken = this.lexer.nextToken();
  }

  parseProgram(): Program {
    const statements: Statement[] = [];
    while (this.currentToken.type !== tokenTypes.Eof) {
      const statement = this.parseStatement();
      assert(statement, 'statement could not be parsed');
      statements.push(statement);

      this.nextToken();
    }
    return { astType: astNodeTypes.Program, body: statements };
  }

  private parseStatement(): Statement {
    switch (this.currentToken.type) {
      case tokenTypes.Let:
        return this.parseLetStatement();
      case tokenTypes.Return:
        return this.parseReturnStatement();
      case tokenTypes.Identifier: {
        if (this.peekToken?.type === tokenTypes.Assign) {
          return this.parseReassignStatement();
        }
        return this.parseExpressionStatement();
      }
      default:
        return this.parseExpressionStatement();
    }
  }

  private parseLetStatement(): LetStatement {
    this.nextTokenExpecting(tokenTypes.Identifier);
    const literal = (this.currentToken as IdentifierToken).literal;
    this.nextTokenExpecting(tokenTypes.Assign);

    this.nextToken();
    const value = this.parseExpression(Precedence.Lowest);

    if (this.peekToken?.type === tokenTypes.Semicolon) {
      this.nextToken();
    }

    return {
      astType: astNodeTypes.Statement,
      statementType: statementTypes.Let,
      name: {
        astType: astNodeTypes.Expression,
        expressionType: expressionTypes.Identifier,
        value: literal,
      },
      value,
    };
  }

  private parseReturnStatement(): ReturnStatement {
    this.nextToken();
    const value = this.parseExpression(Precedence.Lowest);
    if (this.peekToken?.type === tokenTypes.Semicolon) {
      this.nextToken();
    }
    return {
      astType: astNodeTypes.Statement,
      statementType: statementTypes.Return,
      value,
    };
  }

  private parseExpressionStatement(): ExpressionStatement {
    const expression = this.parseExpression(Precedence.Lowest);

    if (this.peekToken?.type === tokenTypes.Semicolon) {
      this.nextToken();
    }

    return {
      astType: astNodeTypes.Statement,
      statementType: statementTypes.Expression,
      expression,
    };
  }

  private parseReassignStatement(): ReassignStatement {
    const literal = (this.currentToken as IdentifierToken).literal;
    this.nextTokenExpecting(tokenTypes.Assign);

    this.nextToken();
    const value = this.parseExpression(Precedence.Lowest);

    if (this.peekToken?.type === tokenTypes.Semicolon) {
      this.nextToken();
    }

    return {
      astType: astNodeTypes.Statement,
      statementType: statementTypes.Reassign,
      name: {
        astType: astNodeTypes.Expression,
        expressionType: expressionTypes.Identifier,
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
    while (this.peekToken?.type !== tokenTypes.Semicolon && precedence < this.peekPrecedence()) {
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
      astType: astNodeTypes.Expression,
      expressionType: expressionTypes.Identifier,
      value: this.currentToken.literal,
    };
  }

  private parseInteger(): IntegerLiteralExpression {
    assert(isIntegerToken(this.currentToken), 'invalid token', { token: this.currentToken });
    const num = Number(this.currentToken.literal);
    assert(!isNaN(num), 'invalid number', { currentToken: this.currentToken });
    return {
      astType: astNodeTypes.Expression,
      expressionType: expressionTypes.IntegerLiteral,
      value: num,
    };
  }

  private parseString(): StringLiteralExpression {
    assert(isStringToken(this.currentToken), 'invalid token', { token: this.currentToken });
    return {
      astType: astNodeTypes.Expression,
      expressionType: expressionTypes.StringLiteral,
      value: this.currentToken.literal,
    };
  }

  private parsePrefixExpression(): PrefixExpression {
    assert(isPrefixToken(this.currentToken), 'invalid token', { token: this.currentToken });
    const operator = this.currentToken.operator;
    this.nextToken();
    const right = this.parseExpression(Precedence.Prefix);
    return {
      astType: astNodeTypes.Expression,
      expressionType: expressionTypes.PrefixExpression,
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
      astType: astNodeTypes.Expression,
      expressionType: expressionTypes.InfixExpression,
      operator,
      left,
      right,
    };
  }

  private parseBoolean(): BooleanLiteralExpression {
    assert(this.currentToken.type === tokenTypes.True || this.currentToken.type === tokenTypes.False, 'invalid token', {
      token: this.currentToken,
    });
    return {
      astType: astNodeTypes.Expression,
      expressionType: expressionTypes.BooleanLiteral,
      value: this.currentToken.type === tokenTypes.True,
    };
  }

  private parseGroupedExpression(): Expression {
    assert(this.currentToken.type === tokenTypes.LeftParenthesis, 'invalid token', { token: this.currentToken });

    this.nextToken();

    const expression = this.parseExpression(Precedence.Lowest);

    this.nextTokenExpecting(tokenTypes.RightParenthesis);
    return expression;
  }

  private parseIfExpression(): IfExpression {
    assert(this.currentToken.type === tokenTypes.If, 'invalid token', { token: this.currentToken });
    this.nextTokenExpecting(tokenTypes.LeftParenthesis);
    this.nextToken();

    const condition = this.parseExpression(Precedence.Lowest);

    this.nextTokenExpecting(tokenTypes.RightParenthesis);
    this.nextTokenExpecting(tokenTypes.LeftBrace);
    const consequence = this.parseBlockStatement();

    if (this.peekToken?.type !== tokenTypes.Else) {
      return {
        astType: astNodeTypes.Expression,
        expressionType: expressionTypes.IfExpression,
        condition,
        consequence,
      };
    }

    this.nextToken();
    assert(this.nextTokenExpecting(tokenTypes.LeftBrace));
    const alternative = this.parseBlockStatement();
    return {
      astType: astNodeTypes.Expression,
      expressionType: expressionTypes.IfExpression,
      condition,
      consequence,
      alternative,
    };
  }

  private parseFunctionLiteral(): FunctionLiteralExpression {
    assert(this.currentToken.type === tokenTypes.Function, 'invalid token', { token: this.currentToken });
    this.nextTokenExpecting(tokenTypes.LeftParenthesis);
    const parameters = this.parseFunctionParameters();
    this.nextTokenExpecting(tokenTypes.LeftBrace);
    const body = this.parseBlockStatement();
    return {
      astType: astNodeTypes.Expression,
      expressionType: expressionTypes.FunctionLiteral,
      parameters,
      body,
    };
  }

  private parseArrayLiteral(): ArrayLiteralExpression {
    assert(this.currentToken.type === tokenTypes.LeftBracket, 'invalid token', { token: this.currentToken });
    return {
      astType: astNodeTypes.Expression,
      expressionType: expressionTypes.ArrayLiteral,
      elements: this.parseExpressionList(tokenTypes.RightBracket),
    };
  }

  private parseObjectLiteral(): ObjectLiteralExpression {
    assert(this.currentToken.type === tokenTypes.LeftBrace, 'invalid token', { token: this.currentToken });
    const pairs: ObjectLiteralExpression['pairs'] = [];
    while (this.peekToken?.type !== tokenTypes.RightBrace) {
      this.nextToken();
      const key = this.parseExpression(Precedence.Lowest);
      this.nextTokenExpecting(tokenTypes.Colon);
      this.nextToken();
      const value = this.parseExpression(Precedence.Lowest);
      pairs.push([key, value]);
      // @ts-expect-error [TS2367] peekToken can be mutated at this point
      if (this.peekToken?.type !== tokenTypes.RightBrace) {
        this.nextTokenExpecting(tokenTypes.Comma);
      }
    }
    this.nextTokenExpecting(tokenTypes.RightBrace);
    return {
      astType: astNodeTypes.Expression,
      expressionType: expressionTypes.ObjectLiteral,
      pairs,
    };
  }

  private parseIndexExpression(left: Expression): IndexExpression {
    this.nextToken();
    const index = this.parseExpression(Precedence.Lowest);
    this.nextTokenExpecting(tokenTypes.RightBracket);
    return {
      astType: astNodeTypes.Expression,
      expressionType: expressionTypes.IndexExpression,
      left,
      index,
    };
  }

  private parseFunctionParameters() {
    if (this.peekToken?.type === tokenTypes.RightParenthesis) {
      this.nextToken();
      return [];
    }
    this.nextToken();
    assert(this.currentToken.type === tokenTypes.Identifier, 'invalid token', { token: this.currentToken });
    const parameters: IdentifierExpression[] = [];
    parameters.push({
      astType: astNodeTypes.Expression,
      expressionType: expressionTypes.Identifier,
      value: this.currentToken.literal,
    });
    while (this.peekToken?.type === tokenTypes.Comma) {
      this.nextToken();
      this.nextToken();
      assert(this.currentToken.type === tokenTypes.Identifier, 'invalid token', { token: this.currentToken });
      parameters.push({
        astType: astNodeTypes.Expression,
        expressionType: expressionTypes.Identifier,
        value: this.currentToken.literal,
      });
    }
    this.nextTokenExpecting(tokenTypes.RightParenthesis);
    return parameters;
  }

  private parseBlockStatement(): BlockStatement {
    const statements: Statement[] = [];
    this.nextToken();
    while (this.currentToken.type !== tokenTypes.RightBrace && this.currentToken.type !== tokenTypes.Eof) {
      const statement = this.parseStatement();
      if (statement) {
        statements.push(statement);
      }
      this.nextToken();
    }

    return {
      astType: astNodeTypes.Statement,
      statementType: statementTypes.Block,
      statements,
    };
  }

  private parseCallExpression(func: IdentifierExpression | FunctionLiteralExpression): CallExpression {
    assert(this.currentToken.type === tokenTypes.LeftParenthesis, 'invalid token', { token: this.currentToken });
    return {
      astType: astNodeTypes.Expression,
      expressionType: expressionTypes.CallExpression,
      func,
      args: this.parseExpressionList(tokenTypes.RightParenthesis),
    };
  }

  private parseExpressionList(endTokenType: TokenType): Expression[] {
    if (this.peekToken?.type === endTokenType) {
      this.nextToken();
      return [];
    }
    const args: Expression[] = [];

    this.nextToken();
    args.push(this.parseExpression(Precedence.Lowest));
    while (this.peekToken?.type === tokenTypes.Comma) {
      this.nextToken();
      this.nextToken();
      args.push(this.parseExpression(Precedence.Lowest));
    }
    this.nextTokenExpecting(endTokenType);
    return args;
  }

  private nextToken() {
    assert(this.peekToken, 'No more tokens');
    this.currentToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  private nextTokenExpecting(tokenType: TokenType): boolean {
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
