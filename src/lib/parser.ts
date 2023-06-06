import { assert } from '../utils';
import {
  ArrayLiteralExpression,
  AstNodeType,
  BlockStatement,
  BooleanLiteralExpression,
  CallExpression,
  Expression,
  ExpressionStatement,
  ExpressionType,
  FunctionLiteralExpression,
  IdentifierExpression,
  IfExpression,
  IndexExpression,
  InfixExpression,
  IntegerLiteralExpression,
  LetStatement,
  PrefixExpression,
  Program,
  ReturnStatement,
  Statement,
  StatementType,
  StringLiteralExpression,
} from './model/ast';
import { ParseInfixFnMap, ParsePrefixFnMap } from './model/parser-types';
import { IdentifierToken, Token, TokenType } from './model/token';
import { isIdentifierToken, isInfixToken, isIntegerToken, isPrefixToken, isStringToken } from './model/token-guards';

enum Precedence {
  Lowest = 0,
  Equals = 1,
  LessThanGreaterThan = 2,
  Sum = 3,
  Product = 4,
  Prefix = 5,
  Call = 6,
  Index = 7,
}

const precedences: Partial<Record<TokenType, Precedence | undefined>> = {
  [TokenType.Equals]: Precedence.Equals,
  [TokenType.NotEquals]: Precedence.Equals,
  [TokenType.LessThan]: Precedence.LessThanGreaterThan,
  [TokenType.GreaterThan]: Precedence.LessThanGreaterThan,
  [TokenType.Plus]: Precedence.Sum,
  [TokenType.Minus]: Precedence.Sum,
  [TokenType.Slash]: Precedence.Product,
  [TokenType.Asterisk]: Precedence.Product,
  [TokenType.LeftParenthesis]: Precedence.Call,
  [TokenType.LeftBracket]: Precedence.Index,
};

class Parser {
  private currentToken: Token;
  private peekToken: Token | undefined;

  private prefixParseFns: ParsePrefixFnMap = {
    [TokenType.Identifier]: this.parseIdentifier.bind(this),
    [TokenType.Integer]: this.parseInteger.bind(this),
    [TokenType.String]: this.parseString.bind(this),
    [TokenType.Bang]: this.parsePrefixExpression.bind(this),
    [TokenType.Minus]: this.parsePrefixExpression.bind(this),
    [TokenType.True]: this.parseBoolean.bind(this),
    [TokenType.False]: this.parseBoolean.bind(this),
    [TokenType.LeftParenthesis]: this.parseGroupedExpression.bind(this),
    [TokenType.If]: this.parseIfExpression.bind(this),
    [TokenType.Function]: this.parseFunctionLiteral.bind(this),
    [TokenType.LeftBracket]: this.parseArrayLiteral.bind(this),
  };

  private infixParseFns: ParseInfixFnMap = {
    [TokenType.Plus]: this.parseInfixExpression.bind(this),
    [TokenType.Minus]: this.parseInfixExpression.bind(this),
    [TokenType.Slash]: this.parseInfixExpression.bind(this),
    [TokenType.Asterisk]: this.parseInfixExpression.bind(this),
    [TokenType.Equals]: this.parseInfixExpression.bind(this),
    [TokenType.NotEquals]: this.parseInfixExpression.bind(this),
    [TokenType.LessThan]: this.parseInfixExpression.bind(this),
    [TokenType.GreaterThan]: this.parseInfixExpression.bind(this),
    [TokenType.LeftBracket]: this.parseIndexExpression.bind(this),
    [TokenType.LeftParenthesis]: (arg: Expression) => {
      assert(arg.expressionType === ExpressionType.Identifier || arg.expressionType === ExpressionType.FunctionLiteral);
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
    while (this.currentToken.type !== TokenType.Eof) {
      const statement = this.parseStatement();
      assert(statement, 'statement could not be parsed');
      statements.push(statement);

      this.nextToken();
    }
    return { astType: AstNodeType.Program, body: statements };
  }

  private parseStatement(): Statement {
    switch (this.currentToken.type) {
      case TokenType.Let:
        return this.parseLetStatement();
      case TokenType.Return:
        return this.parseReturnStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  private parseLetStatement(): LetStatement {
    this.nextTokenExpecting(TokenType.Identifier);
    const literal = (this.currentToken as IdentifierToken).literal;
    this.nextTokenExpecting(TokenType.Assign);

    this.nextToken();
    const value = this.parseExpression(Precedence.Lowest);

    if (this.peekToken?.type === TokenType.Semicolon) {
      this.nextToken();
    }

    return {
      astType: AstNodeType.Statement,
      statementType: StatementType.Let,
      name: {
        astType: AstNodeType.Expression,
        expressionType: ExpressionType.Identifier,
        value: literal,
      },
      value,
    };
  }

  private parseReturnStatement(): ReturnStatement {
    this.nextToken();
    const value = this.parseExpression(Precedence.Lowest);
    if (this.peekToken?.type === TokenType.Semicolon) {
      this.nextToken();
    }
    return {
      astType: AstNodeType.Statement,
      statementType: StatementType.Return,
      value,
    };
  }

  private parseExpressionStatement(): ExpressionStatement {
    const expression = this.parseExpression(Precedence.Lowest);

    if (this.peekToken?.type === TokenType.Semicolon) {
      this.nextToken();
    }

    return {
      astType: AstNodeType.Statement,
      statementType: StatementType.Expression,
      expression,
    };
  }

  private parseExpression(precedence: Precedence): Expression {
    const prefixFn = this.prefixParseFns[this.currentToken.type];
    assert(prefixFn, 'no prefix function found to parse expression', {
      token: this.currentToken,
    });

    let leftExp = prefixFn();
    while (this.peekToken?.type !== TokenType.Semicolon && precedence < this.peekPrecedence()) {
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
      astType: AstNodeType.Expression,
      expressionType: ExpressionType.Identifier,
      value: this.currentToken.literal,
    };
  }

  private parseInteger(): IntegerLiteralExpression {
    assert(isIntegerToken(this.currentToken), 'invalid token', { token: this.currentToken });
    const num = Number(this.currentToken.literal);
    assert(!isNaN(num), 'invalid number', { currentToken: this.currentToken });
    return {
      astType: AstNodeType.Expression,
      expressionType: ExpressionType.IntegerLiteral,
      value: num,
    };
  }

  private parseString(): StringLiteralExpression {
    assert(isStringToken(this.currentToken), 'invalid token', { token: this.currentToken });
    return {
      astType: AstNodeType.Expression,
      expressionType: ExpressionType.StringLiteral,
      value: this.currentToken.literal,
    };
  }

  private parsePrefixExpression(): PrefixExpression {
    assert(isPrefixToken(this.currentToken), 'invalid token', { token: this.currentToken });
    const operator = this.currentToken.operator;
    this.nextToken();
    const right = this.parseExpression(Precedence.Prefix);
    return {
      astType: AstNodeType.Expression,
      expressionType: ExpressionType.PrefixExpression,
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
      astType: AstNodeType.Expression,
      expressionType: ExpressionType.InfixExpression,
      operator,
      left,
      right,
    };
  }

  private parseBoolean(): BooleanLiteralExpression {
    assert(this.currentToken.type === TokenType.True || this.currentToken.type === TokenType.False, 'invalid token', {
      token: this.currentToken,
    });
    return {
      astType: AstNodeType.Expression,
      expressionType: ExpressionType.BooleanLiteral,
      value: this.currentToken.type === TokenType.True,
    };
  }

  private parseGroupedExpression(): Expression {
    assert(this.currentToken.type === TokenType.LeftParenthesis, 'invalid token', { token: this.currentToken });

    this.nextToken();

    const expression = this.parseExpression(Precedence.Lowest);

    this.nextTokenExpecting(TokenType.RightParenthesis);
    return expression;
  }

  private parseIfExpression(): IfExpression {
    assert(this.currentToken.type === TokenType.If, 'invalid token', { token: this.currentToken });
    this.nextTokenExpecting(TokenType.LeftParenthesis);
    this.nextToken();

    const condition = this.parseExpression(Precedence.Lowest);

    this.nextTokenExpecting(TokenType.RightParenthesis);
    this.nextTokenExpecting(TokenType.LeftBrace);
    const consequence = this.parseBlockStatement();

    if (this.peekToken?.type !== TokenType.Else) {
      return {
        astType: AstNodeType.Expression,
        expressionType: ExpressionType.IfExpression,
        condition,
        consequence,
      };
    }

    this.nextToken();
    assert(this.nextTokenExpecting(TokenType.LeftBrace));
    const alternative = this.parseBlockStatement();
    return {
      astType: AstNodeType.Expression,
      expressionType: ExpressionType.IfExpression,
      condition,
      consequence,
      alternative,
    };
  }

  private parseFunctionLiteral(): FunctionLiteralExpression {
    assert(this.currentToken.type === TokenType.Function, 'invalid token', { token: this.currentToken });
    this.nextTokenExpecting(TokenType.LeftParenthesis);
    const parameters = this.parseFunctionParameters();
    this.nextTokenExpecting(TokenType.LeftBrace);
    const body = this.parseBlockStatement();
    return {
      astType: AstNodeType.Expression,
      expressionType: ExpressionType.FunctionLiteral,
      parameters,
      body,
    };
  }

  private parseArrayLiteral(): ArrayLiteralExpression {
    assert(this.currentToken.type === TokenType.LeftBracket, 'invalid token', { token: this.currentToken });
    return {
      astType: AstNodeType.Expression,
      expressionType: ExpressionType.ArrayLiteral,
      elements: this.parseExpressionList(TokenType.RightBracket),
    };
  }

  private parseIndexExpression(left: Expression): IndexExpression {
    this.nextToken();
    const index = this.parseExpression(Precedence.Lowest);
    this.nextTokenExpecting(TokenType.RightBracket);
    return {
      astType: AstNodeType.Expression,
      expressionType: ExpressionType.IndexExpression,
      left,
      index,
    };
  }

  private parseFunctionParameters() {
    if (this.peekToken?.type === TokenType.RightParenthesis) {
      this.nextToken();
      return [];
    }
    this.nextToken();
    assert(this.currentToken.type === TokenType.Identifier, 'invalid token', { token: this.currentToken });
    const parameters: IdentifierExpression[] = [];
    parameters.push({
      astType: AstNodeType.Expression,
      expressionType: ExpressionType.Identifier,
      value: this.currentToken.literal,
    });
    while (this.peekToken?.type === TokenType.Comma) {
      this.nextToken();
      this.nextToken();
      assert(this.currentToken.type === TokenType.Identifier, 'invalid token', { token: this.currentToken });
      parameters.push({
        astType: AstNodeType.Expression,
        expressionType: ExpressionType.Identifier,
        value: this.currentToken.literal,
      });
    }
    this.nextTokenExpecting(TokenType.RightParenthesis);
    return parameters;
  }

  private parseBlockStatement(): BlockStatement {
    const statements: Statement[] = [];
    this.nextToken();
    while (this.currentToken.type !== TokenType.RightBrace && this.currentToken.type !== TokenType.Eof) {
      const statement = this.parseStatement();
      if (statement) {
        statements.push(statement);
      }
      this.nextToken();
    }

    return {
      astType: AstNodeType.Statement,
      statementType: StatementType.Block,
      statements,
    };
  }

  private parseCallExpression(func: IdentifierExpression | FunctionLiteralExpression): CallExpression {
    assert(this.currentToken.type === TokenType.LeftParenthesis, 'invalid token', { token: this.currentToken });
    return {
      astType: AstNodeType.Expression,
      expressionType: ExpressionType.CallExpression,
      func,
      args: this.parseExpressionList(TokenType.RightParenthesis),
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
    while (this.peekToken?.type === TokenType.Comma) {
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

  private currentPrecedence(): Precedence {
    if (this.currentToken) {
      return precedences[this.currentToken.type] || Precedence.Lowest;
    }
    return Precedence.Lowest;
  }

  private peekPrecedence(): Precedence {
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
