import type { Token, TokenWithLiterals } from './model/token';

const eof = '\0';

const isNumber = (char: string) => /^[0-9]$/.test(char);
const isLetter = (char: string) => /^[a-zA-Z]$/.test(char);
const isWhitespace = (char: string) => /^\s$/.test(char);
const isQuote = (char: string) => char === '"';
const isEof = (char: string) => char === eof;

const findKeywordToken = (keyword: string): Exclude<Token, TokenWithLiterals> | undefined => {
  switch (keyword) {
    case 'fn':
      return { type: 'function' };
    case 'let':
    case 'if':
    case 'else':
    case 'return':
    case 'true':
    case 'false':
    case 'forEach':
      return { type: keyword };
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
          token = { type: 'equals', operator: '==' };
        } else {
          token = { type: 'assign' };
        }
        break;
      }
      case '!': {
        if (this.peekChar() === '=') {
          this.readChar();
          token = { type: 'notEquals', operator: '!=' };
        } else {
          token = { type: 'bang', operator: '!' };
        }
        break;
      }
      case '"': {
        token = { type: 'string', literal: this.readString() };
        break;
      }
      case ';': {
        token = { type: 'semicolon' };
        break;
      }
      case '(': {
        token = { type: 'leftParenthesis' };
        break;
      }
      case ')': {
        token = { type: 'rightParenthesis' };
        break;
      }
      case ',': {
        token = { type: 'comma' };
        break;
      }
      case '+': {
        token = { type: 'plus', operator: '+' };
        break;
      }
      case '-': {
        token = { type: 'minus', operator: '-' };
        break;
      }
      case '[': {
        token = { type: 'leftBracket' };
        break;
      }
      case ']': {
        token = { type: 'rightBracket' };
        break;
      }
      case '{': {
        token = { type: 'leftBrace' };
        break;
      }
      case '}': {
        token = { type: 'rightBrace' };
        break;
      }
      case '*': {
        token = { type: 'asterisk', operator: '*' };
        break;
      }
      case '/': {
        token = { type: 'slash', operator: '/' };
        break;
      }
      case '<': {
        token = { type: 'lessThan', operator: '<' };
        break;
      }
      case '>': {
        token = { type: 'greaterThan', operator: '>' };
        break;
      }
      case '==': {
        token = { type: 'equals', operator: '==' };
        break;
      }
      case '!=': {
        token = { type: 'notEquals', operator: '!=' };
        break;
      }
      case ':': {
        token = { type: 'colon' };
        break;
      }
      case eof: {
        this.eofReached = true;
        token = { type: 'eof' };
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
            type: 'identifier',
            literal,
          };
        }
        if (isNumber(char)) {
          return {
            type: 'integer',
            literal: this.readNumber(),
          };
        }
        token = { type: 'illegal' };
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
