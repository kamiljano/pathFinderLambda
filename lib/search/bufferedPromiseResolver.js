'use strict';

module.exports.BufferedPromiseResolver = class {

  constructor(bufferSize) {
    this.bufferSize = bufferSize;
    this.buffer = [];
    this.responses = [];
  }

  push(promise) {
    this.buffer.push(promise);
    if (this.buffer.length === this.bufferSize) {
      return this.flush();
    }
  }

  async flush() {
    const resp = await Promise.all(this.buffer);
    this.responses = this.responses.concat(resp);
    this.buffer = [];
  }

};