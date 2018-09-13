'use strict';

const chai = require('chai');
chai.should();

const searchService = require('../../../lib/search/searchService');

describe('GIVEN the searchService WHEN the search is requested', () => {

  it('for just one IP pointing to google.com AND no regex is provided, THEN the successful response is returned', async () => {
    const result = await searchService.findPath('216.58.211.14', '216.58.211.14', '/');
    result.should.be.deep.equal(['http://216.58.211.14/']);
  });

  it('for just one IP pointing to google.com AND a matching regex is provided, THEN the successful response is returned', async () => {
    const result = await searchService.findPath('216.58.211.14', '216.58.211.14', '/', 'html');
    result.should.be.deep.equal(['http://216.58.211.14/']);
  });

  it('for just one IP pointing to google.com AND a non-matching regex is provided, THEN the successful response is returned', async () => {
    const result = await searchService.findPath('216.58.211.14', '216.58.211.14', '/', 'asfasfasdfasfdasfdasfdasfdasdf');
    result.should.be.deep.equal([]);
  });

  it('for just one IP pointing to a page with no content, THEN the successful response is returned', async () => {
    const result = await searchService.findPath('0.0.0.0', '0.0.0.0', '/');
    result.should.be.deep.equal([]);
  });

  it('for multiple IPs, none of which is matching, THEN an empty response is returned', async () => {
    const result = await searchService.findPath('0.0.0.0', '0.0.0.5', '/', 'asdfasdfasdf');
    result.should.be.deep.equal([]);
  });

});