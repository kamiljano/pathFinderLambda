'use strict';

const {BadRequestError} = require('../errors/errors');

class BadIpError extends BadRequestError {
  constructor(badIp) {
    super(`${badIp} is not a valid IP address`);
  }
}

const ipStringToArr = ip => ip.split('.').map(e => e * 1);
const ipArrToString = ip => ip.join('.');

const arrToNumber = arr => (arr[0] * 256 * 256 * 256) + (arr[1] * 256 * 256) + (arr[2] * 256) + arr[3];

const increment = (arr, by) => {
    const num = arrToNumber(arr);
    const r = num + by;

    if (r > Math.pow(2, 32)) {
        throw new Error('Unable to increment the IP over 2^32');
    }

    const a = Math.floor(r / Math.pow(256, 3));
    const b = Math.floor((r - a * Math.pow(256, 3)) / Math.pow(256, 2));
    const c = Math.floor((r - a * Math.pow(256, 3) - b * Math.pow(256, 2)) / 256);

    return [a, b, c, r % 256];
};

class IP {

    constructor(ip) {
        if (!ip) {
            throw new BadIpError(ip);
        }
        if (Array.isArray(ip)) {
            this.arr = ip;
        } else if (typeof ip === 'string') {
            this.arr = ipStringToArr(ip);
        } else {
            throw new Error('Unsupported IP type of ' + ip);
        }
        if (this.arr.length !== 4 || this.arr.some(e => e > 255 || e < 0)) {
            throw new BadRequestError(this.toString());
        }
    }

    increment(by = 1) {
        return new IP(increment(this.arr, by));
    }

    diff(ip) {
        const num1 = arrToNumber(this.arr);
        const num2 = arrToNumber(ip.arr);

        return Math.abs(num1 - num2);
    }

    ge(ip) {
        return arrToNumber(this.arr) >= arrToNumber(ip.arr);
    }

    gt(ip) {
      return arrToNumber(this.arr) > arrToNumber(ip.arr);
    }

    eq(ip) {
        return arrToNumber(this.arr) === arrToNumber(ip.arr);
    }

    toString() {
        return ipArrToString(this.arr);
    }
}

module.exports.IP = IP;