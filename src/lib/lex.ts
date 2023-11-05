import type { Token, TokenWithLiterals } from './model/token';
import { tokenTypes } from './model/token';

const eof = '\0';

const isNumber = (char: string) => /^[0-9]$/.test(char);
const isLetter = (char: string) => /^[a-zA-Z]$/.test(char);
const isWhitespace = (char: string) => /^\s$/.test(char);
const isQuote = (char: string) => char === '"';
const isEof = (char: string) => char === eof;

const findKeywordToken = (string: string): Exclude<Token, TokenWithLiterals> | undefined => {
  switch (string) {
    case 'fn': {
      return { type: tokenTypes.Function };
    }
    case 'let': {
      return { type: tokenTypes.Let };
    }
    case 'if': {
      return { type: tokenTypes.If };
    }
    case 'else': {
      return { type: tokenTypes.Else };
    }
    case 'return': {
      return { type: tokenTypes.Return };
    }
    case 'true': {
      return { type: tokenTypes.True };
    }
    case 'false': {
      return { type: tokenTypes.False };
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
          token = { type: tokenTypes.Equals, operator: '==' };
        } else {
          token = { type: tokenTypes.Assign };
        }
        break;
      }
      case '!': {
        if (this.peekChar() === '=') {
          this.readChar();
          token = { type: tokenTypes.NotEquals, operator: '!=' };
        } else {
          token = { type: tokenTypes.Bang, operator: '!' };
        }
        break;
      }
      case '"': {
        token = { type: tokenTypes.String, literal: this.readString() };
        break;
      }
      case ';': {
        token = { type: tokenTypes.Semicolon };
        break;
      }
      case '(': {
        token = { type: tokenTypes.LeftParenthesis };
        break;
      }
      case ')': {
        token = { type: tokenTypes.RightParenthesis };
        break;
      }
      case ',': {
        token = { type: tokenTypes.Comma };
        break;
      }
      case '+': {
        token = { type: tokenTypes.Plus, operator: '+' };
        break;
      }
      case '-': {
        token = { type: tokenTypes.Minus, operator: '-' };
        break;
      }
      case '[': {
        token = { type: tokenTypes.LeftBracket };
        break;
      }
      case ']': {
        token = { type: tokenTypes.RightBracket };
        break;
      }
      case '{': {
        token = { type: tokenTypes.LeftBrace };
        break;
      }
      case '}': {
        token = { type: tokenTypes.RightBrace };
        break;
      }
      case '*': {
        token = { type: tokenTypes.Asterisk, operator: '*' };
        break;
      }
      case '/': {
        token = { type: tokenTypes.Slash, operator: '/' };
        break;
      }
      case '<': {
        token = { type: tokenTypes.LessThan, operator: '<' };
        break;
      }
      case '>': {
        token = { type: tokenTypes.GreaterThan, operator: '>' };
        break;
      }
      case '==': {
        token = { type: tokenTypes.Equals, operator: '==' };
        break;
      }
      case '!=': {
        token = { type: tokenTypes.NotEquals, operator: '!=' };
        break;
      }
      case ':': {
        token = { type: tokenTypes.Colon };
        break;
      }
      case eof: {
        this.eofReached = true;
        token = { type: tokenTypes.Eof };
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
            type: tokenTypes.Identifier,
            literal,
          };
        }
        if (isNumber(char)) {
          return {
            type: tokenTypes.Integer,
            literal: this.readNumber(),
          };
        }
        token = { type: tokenTypes.Illegal };
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
