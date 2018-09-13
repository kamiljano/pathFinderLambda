'use strict';

const {IP} = require('./ip');
const request = require('request-promise-native');
const url = require('url');
const {BufferedPromiseResolver} = require('./bufferedPromiseResolver');

const get = async (addr, regex) => {
  try {
    const result = await request.get(addr, {
      timeout: 1000
    });
    if (regex && result) {
      return {
        addr,
        match: !!result.match(new RegExp(regex))
      }
    }
    return {
      addr,
      match: !!result
    };
  } catch (ex) {
    return {
      addr,
      match: false
    };
  }
};

const testIp = (ip, path, regex) => {
  return Promise.all([
    get(url.resolve(`http://${ip}`, path), regex),
    get(url.resolve(`https://${ip}`, path), regex)
  ]);
};

module.exports.findPath = async (from, to, path, regex) => {
  const promiseResolver = new BufferedPromiseResolver(100);
  if (from === to) {
    await promiseResolver.push(testIp(from, path, regex));
  } else {
    for (let current = new IP(from); current.toString() !== to; current = current.increment()) {
      await promiseResolver.push(testIp(current.toString(), path, regex));
    }
  }

  await promiseResolver.flush();

  const responses = promiseResolver.responses;
  const result = [];
  for (let arr of responses) {
    for (let e of arr) {
      if (e.match) {
        result.push(e.addr);
      }
    }
  }
  return result;
};