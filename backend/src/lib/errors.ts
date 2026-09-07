// Small typed HTTP error used throughout the routes. Thrown errors of this
// shape are turned into `{ error: message }` responses with the given status
// by the centralized error handler in src/index.ts; anything else becomes a
// generic 500 with no leaked internals.
export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'HttpError';
  }
}

export function badRequest(message: string): HttpError {
  return new HttpError(400, message);
}

export function unauthorized(message = 'Unauthorized'): HttpError {
  return new HttpError(401, message);
}

export function forbidden(message = 'Forbidden'): HttpError {
  return new HttpError(403, message);
}

export function notFound(message = 'Not found'): HttpError {
  return new HttpError(404, message);
}

export function conflict(message: string): HttpError {
  return new HttpError(409, message);
}

export function serviceUnavailable(message: string): HttpError {
  return new HttpError(503, message);
}
