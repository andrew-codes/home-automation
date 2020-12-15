export class QueryParseError extends Error {
  constructor(message, query) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.data = { query };
  }
}
