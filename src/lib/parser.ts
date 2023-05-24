import { assert } from '../utils';
import { lexer } from './lexer';
import { ExpressionType, IdentifierExpression } from './model/ast';
import { LetStatement, StatementType } from './model/ast';
import { AstNodeType, Program, Statement } from './model/ast';
import { Token, TokenType } from './token';

const peekErrorMessage = (expected: TokenType, actual: TokenType | undefined) =>
  `expected next token to be ${expected} but got ${actual} instead`;

class Parser {
  private currentToken: Token;
  private peekToken: Token | undefined;

  private _errors: string[] = [];

  constructor(private readonly lexer: { nextToken: () => Token | undefined }) {
    const token = this.lexer.nextToken();
    assert(token, 'No tokens found');
    this.currentToken = token;
    this.peekToken = this.lexer.nextToken();
  }

  get errors(): string[] {
    return this._errors;
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

  parseStatement(): Statement | null {
    switch (this.currentToken.type) {
      case TokenType.Let:
        return this.parseLetStatement();
      default:
        return null;
    }
  }

  parseLetStatement(): LetStatement | null {
    if (!this.peekToken || this.peekToken.type !== TokenType.Identifier) {
      this.errors.push(
        peekErrorMessage(TokenType.Identifier, this.peekToken?.type)
      );
      return null;
    }
    this.currentToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
    const literal = this.currentToken.literal;

    if (!this.peekToken || this.peekToken.type !== TokenType.Assign) {
      this.errors.push(
        peekErrorMessage(TokenType.Assign, this.peekToken?.type)
      );
      return null;
    }
    this.currentToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();

    const name: IdentifierExpression = {
      astType: AstNodeType.Expression,
      expressionType: ExpressionType.Identifier,
      value: literal,
    };

    while (this.currentToken.type !== TokenType.Semicolon) {
      this.nextToken();
    }

    return {
      statementType: StatementType.Let,
      name,
      // @ts-ignore
      value: null,
    };
  }

  private nextToken() {
    assert(this.peekToken, 'No more tokens');
    this.currentToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }
}

export function parse(input: string) {
  const parser = new Parser(lexer(input));
  return { result: parser.parseProgram(), errors: parser.errors };
}
