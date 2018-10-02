'use strict';

const {LambdaError} = require('./lib/errors/errors');
const {BufferedJobPublisher} = require('./lib/distribution/bufferedJobPublisher');
const Joi = require('joi');

const IP_REGEX = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
const BODY_SCHEMA = Joi.object().keys({
  from: Joi.string().regex(IP_REGEX).required(),
  to: Joi.string().regex(IP_REGEX).required(),
  regex: Joi.string().max(100),
  path: Joi.string().regex(/^[\w\-!@#\$\%\^\&\*\.?=\|\,<>\/]+$/).required()
});

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

const processValidationError = (b, txId, error) => {
  console.info(JSON.stringify({
    txId,
    message: 'The request is not valid',
    originalRequest: b,
    error
  }));
  return {
    statusCode: 400,
    body: JSON.stringify({
      message: 'The request has been accepted for processing'
    }),
  }
};

module.exports.find = async event => {
  const start = new Date().getTime();
  const b = JSON.parse(event.body);
  const validationResult = Joi.validate(b, BODY_SCHEMA);
  if (validationResult.error) {
    return processValidationError(b, event.requestContext.requestId, validationResult.error);
  }

  try {
    console.info(JSON.stringify({
      txId: event.requestContext.requestId,
      message: `Received a new request for search from ${b.from} to ${b.to} with path ${b.path} and regex ${b.regex}`
    }));

    const publisher = new BufferedJobPublisher(process.env.JOB_QUEUE);

    await publisher.publish({
      txId: event.requestContext.requestId,
      from: b.from,
      to: b.to,
      path: b.path,
      regex: b.regex
    });
    await publisher.flush();
    await publisher.sync();

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
