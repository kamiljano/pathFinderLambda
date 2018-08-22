'use strict';

const distributionService = require('./lib/distribution/distributionService');
const {LambdaError} = require('./lib/errors/errors');

const splitJob = (event, b) => {
  console.log({
    txId: event.requestContext.requestId,
    message: `Splitting the search request from ${b.from} to ${b.to} into multiple lambda instances`
  });

  return distributionService.splitJob(event.requestContext.requestId, b);
};

const processErrorResponse = ex => {
  console.error(JSON.stringify({
    txId: event.requestContext.requestId,
    message: `Lambda failed after ${(new Date().getTime() - start)/1000} seconds`,
    error: ex.stack
  }));

  if (ex instanceof LambdaError) {
    return {
      statusCode: ex.code,
      body: JSON.stringify({
        message: ex.message
      }),
    };
  }

  return {
    statusCode: 500,
    body: JSON.stringify({
      message: 'An unexpected error occurred'
    }),
  };
};

module.exports.createJob = async event => {
  // TODO: validate request parameters (body schema validation, making sure that 'from' is lower or equal to 'to')
  const start = new Date().getTime();
  const b = JSON.parse(event.body);
  try {
    console.info(JSON.stringify({
      txId: event.requestContext.requestId,
      message: `Received a new request for search from ${b.from} to ${b.to} with path ${b.path} and regex ${b.regex}`
    }));

    await splitJob(event, b);

    return {
      statusCode: 202,
      body: JSON.stringify({
        message: `The request has been split into multiple lambda instances for optimization. Listen for the result on the SNS topic`
      }),
    };

  } catch (ex) {
    return processErrorResponse(ex);
  }
};
