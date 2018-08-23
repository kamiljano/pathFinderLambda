'use strict';

const distributionService = require('./lib/distribution/distributionService');
const {LambdaError} = require('./lib/errors/errors');

const processErrorResponse = ex => {
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

    const numberOfInstances = await distributionService.splitJob(event.requestContext.requestId, b);

    console.info(JSON.stringify({
      txId: event.requestContext.requestId,
      message: `Request processed successfully within ${(new Date().getTime() - start)/1000} missiceconds`
    }));
    return {
      statusCode: 202,
      body: JSON.stringify({
        message: `The request has been split into ${numberOfInstances} jobs for optimization. Listen for the result on the SNS topic`
      }),
    };

  } catch (ex) {
    console.error(JSON.stringify({
      txId: event.requestContext.requestId,
      message: `Lambda failed after ${(new Date().getTime() - start)/1000} seconds`,
      error: ex.stack
    }));
    return processErrorResponse(start, event, ex);
  }
};
