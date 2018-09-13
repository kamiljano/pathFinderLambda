'use strict';

class LambdaError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.message = message;
  }
}

class BadRequestError extends LambdaError {
  constructor(message) {
    super(400, message);
  }
}

module.exports = {
  LambdaError,
  BadRequestError
};