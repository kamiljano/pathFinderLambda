'use strict';

const chai = require('chai');
chai.should();
const {IP} = require('../../../lib/search/ip');

describe('GIVEN an IP address', () => {

  it('WHEN calling increment() method, THEN the IP address is incremented by 1', () => {
    const ip = new IP('0.0.0.0');
    ip.increment().toString().should.equal('0.0.0.1');
  });

  it('WHEN calling increment(257) method, THEN the IP address is incremented by 257', () => {
    const ip = new IP('0.0.0.0');
    ip.increment(257).toString().should.equal('0.0.1.1');
  });

  it('WHEN calling increment(2^32)-1 method, THEN the IP address is incremented by 2^32 - 1', () => {
    const ip = new IP('0.0.0.0');
    ip.increment(Math.pow(2, 32) - 1).toString().should.equal('255.255.255.255');
  });

  it('WHEN calling toString() method, THEN the IP address is correctly represented as a string', () => {
    new IP('1.2.3.4').toString().should.equal('1.2.3.4')
  });

  it('WHEN calling diff() method where the difference is only in the last part, THEN the correct difference between 2 IPs should be returned', () => {
    new IP('0.0.0.123').diff(new IP('0.0.0.1')).should.equal(122);
  });

  it('WHEN calling diff() method where the difference is large, THEN the correct difference between 2 IPs should be returned', () => {
    new IP('0.0.1.123').diff(new IP('0.0.0.1')).should.equal(378);
  });

  it('WHEN calling diff() method where the difference is at maximum, THEN the correct difference between 2 IPs should be returned', () => {
    new IP('0.0.0.0').diff(new IP('255.255.255.255')).should.equal(Math.pow(2, 32) - 1);
  });

  it('WHEN calling diff() method and both IPs are the same, THEN the correct difference between 2 IPs should be returned', () => {
    new IP('0.0.0.0').diff(new IP('0.0.0.0')).should.equal(0);
  });

});