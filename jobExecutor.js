'use strict';

const searchService = require('./lib/search/searchService');
const notificationService = require('./lib/notification/notificationService');

const notify = (result, q) => {
  const arr = [];
  for (let url of result) {
    arr.push(notificationService.notifyAboutMatchingPath(q.from, q.to, q.path, q.regex, url));
  }
  return Promise.all(arr);
};

module.exports.execute = async event => {

  const request = JSON.parse(event.Records[0].body);

  const start = new Date().getTime();

  console.log(JSON.stringify({
    txId: request.txId,
    message: `Starting the search from ${request.from} to ${request.to}`
  }));

  try {
    const result = await searchService.findPath(request.from, request.to, request.path, request.regex);

    for (let url in result) {
      console.log(JSON.stringify({
        txId: request.txId,
        message: `Found a match for URL ${url}`
      }));
    }

    await notify(result, request);

    console.log(JSON.stringify({
      txId: request.txId,
      message: `Lambda finished execution successfully within ${(new Date().getTime() - start)/1000} seconds`
    }));
  } catch (ex) {
    console.error(JSON.stringify({
      txId: request.txId,
      message: `Lambda execution failed within ${(new Date().getTime() - start)/1000} seconds. Reason: ${ex.stack}`
    }));
    throw ex;
  }

};
