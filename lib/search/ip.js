'use strict';

const ipStringToArr = ip => ip.split('.').map(e => e * 1);
const ipArrToString = ip => ip.join('.');

const increment = (arr, pos = 3) => {
    if (pos === 0 && arr[pos] === 255) {
        throw new Error(`Unable to increment the ip ${ipArrToString(arr)}`);
    }
    const result = arr.slice(0);
    if (result[pos] === 255) {
        result[pos] = 0;
        return increment(result, pos - 1);
    }
    result[pos] ++;
    return result;
};

class IP {

    constructor(ip) {
        if (Array.isArray(ip)) {
            this.arr = ip;
        } else if (typeof ip === 'string') {
            this.arr = ipStringToArr(ip);
        } else {
            throw new Error('Unsupported IP type of ' + ip);
        }
    }

    increment() {
        return new IP(increment(this.arr));
    }

    toString() {
        return ipArrToString(this.arr);
    }
}

module.exports.IP = IP;