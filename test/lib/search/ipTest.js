'use strict';

const chai = require('chai');
chai.should();
const {IP} = require('../../../lib/search/ip');

describe('GIVEN an IP address', () => {

  it('WHEN calling increment() method, THEN the IP address is incremented by 1', () => {
    const ip = new IP('0.0.0.0');
    ip.increment().toString().should.equal('0.0.0.1');
  });

});