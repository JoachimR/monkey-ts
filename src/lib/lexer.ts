import { TokenWithLiterals, TokenType } from './model/token';
import { Token } from './model/token';

const eof = '\0';

const isNumber = (char: string) => /^[0-9]$/.test(char);
const isLetter = (char: string) => /^[a-zA-Z]$/.test(char);
const isWhitespace = (char: string) => /^\s$/.test(char);
const isQuote = (char: string) => char === '"';
const isEof = (char: string) => char === eof;

const findKeywordToken = (string: string): Exclude<Token, TokenWithLiterals> | undefined => {
  switch (string) {
    case 'fn': {
      return { type: TokenType.Function };
    }
    case 'let': {
      return { type: TokenType.Let };
    }
    case 'if': {
      return { type: TokenType.If };
    }
    case 'else': {
      return { type: TokenType.Else };
    }
    case 'return': {
      return { type: TokenType.Return };
    }
    case 'true': {
      return { type: TokenType.True };
    }
    case 'false': {
      return { type: TokenType.False };
    }
    default:
      return undefined;
  }
};

class Lexer {
  private position: number;
  private readPosition: number;
  private currentChar = '';
  private eofReached = false;

  constructor(private readonly input: string) {
    this.position = 0;
    this.readPosition = 0;
    this.readChar();
  }

  nextToken(): Token | undefined {
    if (this.eofReached) {
      return undefined;
    }
    this.skipWhitespace();

    let token: Token;
    const char = this.currentChar;
    switch (char) {
      case '=': {
        if (this.peekChar() === '=') {
          this.readChar();
          token = { type: TokenType.Equals, operator: '==' };
        } else {
          token = { type: TokenType.Assign };
        }
        break;
      }
      case '!': {
        if (this.peekChar() === '=') {
          this.readChar();
          token = { type: TokenType.NotEquals, operator: '!=' };
        } else {
          token = { type: TokenType.Bang, operator: '!' };
        }
        break;
      }
      case '"': {
        token = { type: TokenType.String, literal: this.readString() };
        break;
      }
      case ';': {
        token = { type: TokenType.Semicolon };
        break;
      }
      case '(': {
        token = { type: TokenType.LeftParenthesis };
        break;
      }
      case ')': {
        token = { type: TokenType.RightParenthesis };
        break;
      }
      case ',': {
        token = { type: TokenType.Comma };
        break;
      }
      case '+': {
        token = { type: TokenType.Plus, operator: '+' };
        break;
      }
      case '-': {
        token = { type: TokenType.Minus, operator: '-' };
        break;
      }
      case '[': {
        token = { type: TokenType.LeftBracket };
        break;
      }
      case ']': {
        token = { type: TokenType.RightBracket };
        break;
      }
      case '{': {
        token = { type: TokenType.LeftBrace };
        break;
      }
      case '}': {
        token = { type: TokenType.RightBrace };
        break;
      }
      case '*': {
        token = { type: TokenType.Asterisk, operator: '*' };
        break;
      }
      case '/': {
        token = { type: TokenType.Slash, operator: '/' };
        break;
      }
      case '<': {
        token = { type: TokenType.LessThan, operator: '<' };
        break;
      }
      case '>': {
        token = { type: TokenType.GreaterThan, operator: '>' };
        break;
      }
      case '==': {
        token = { type: TokenType.Equals, operator: '==' };
        break;
      }
      case '!=': {
        token = { type: TokenType.NotEquals, operator: '!=' };
        break;
      }
      case eof: {
        this.eofReached = true;
        token = { type: TokenType.Eof };
        break;
      }
      default: {
        if (isLetter(char)) {
          const literal = this.readLiteral();
          const keywordToken = findKeywordToken(literal);
          if (keywordToken) {
            return keywordToken;
          }
          return {
            type: TokenType.Identifier,
            literal,
          };
        }
        if (isNumber(char)) {
          return {
            type: TokenType.Integer,
            literal: this.readNumber(),
          };
        }
        token = { type: TokenType.Illegal };
      }
    }

    this.readChar();
    return token;
  }

  private readChar() {
    if (this.readPosition >= this.input.length) {
      this.currentChar = eof;
    } else {
      this.currentChar = this.input[this.readPosition];
    }
    this.position = this.readPosition;
    this.readPosition += 1;
  }

  private peekChar(): string {
    if (this.readPosition >= this.input.length) {
      return eof;
    }
    return this.input[this.readPosition];
  }

  private readLiteral(): string {
    return this.read(isLetter);
  }

  private readNumber(): string {
    return this.read(isNumber);
  }

  private read(predicate: (char: string) => boolean): string {
    const position = this.position;
    while (predicate(this.currentChar)) {
      this.readChar();
    }
    return this.input.slice(position, this.position);
  }

  private skipWhitespace() {
    while (isWhitespace(this.currentChar)) {
      this.readChar();
    }
  }

  private readString(): string {
    const position = this.position + 1;
    this.readChar();
    while (!isQuote(this.currentChar) && !isEof(this.currentChar)) {
      this.readChar();
    }
    return this.input.slice(position, this.position);
  }
}

export const lex: (input: string) => {
  nextToken: () => Token | undefined;
} = (input) => {
  const instance = new Lexer(input);
  return { nextToken: () => instance.nextToken() };
};
