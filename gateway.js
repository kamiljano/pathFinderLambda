'use strict';

const AWS = require('aws-sdk');
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

module.exports.find = async event => {
  // TODO: validate request parameters (body schema validation, making sure that 'from' is lower or equal to 'to')
  const start = new Date().getTime();
  const b = JSON.parse(event.body);
  try {
    console.info(JSON.stringify({
      txId: event.requestContext.requestId,
      message: `Received a new request for search from ${b.from} to ${b.to} with path ${b.path} and regex ${b.regex}`
    }));

    await new AWS.Lambda().invoke({
      FunctionName: process.env.JOB_CREATION_LAMBDA,
      InvocationType: 'Event',
      Payload: JSON.stringify({
        from: b.from,
        to: b.to,
        path: b.path,
        regex: b.regex,
        context: {
          txId: event.requestContext.requestId
        }
      })
    }).promise();

    console.info(JSON.stringify({
      txId: event.requestContext.requestId,
      message: `Request processed successfully within ${(new Date().getTime() - start)/1000} milliseconds`
    }));
    return {
      statusCode: 202,
      body: JSON.stringify({
        message: 'The request has been accepted for processing'
      }),
    };

  } catch (ex) {
    console.error(JSON.stringify({
      txId: event.requestContext.requestId,
      message: `Lambda failed after ${(new Date().getTime() - start)/1000} seconds`,
      error: ex.stack
    }));
    return processErrorResponse(ex);
  }
};
