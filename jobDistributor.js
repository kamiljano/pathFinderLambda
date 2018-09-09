'use strict';

const AWS = require('aws-sdk');

module.exports.distribute = async event => {
  const start = new Date().getTime();
  try {
    const lambda = new AWS.Lambda();

    const jobs = event.Records.map(record => {
      return lambda.invoke({
        FunctionName: process.env.JOB_EXECUTOR_LAMBDA,
        InvocationType: 'Event',
        Payload: record.body
      }).promise();
    });

    console.log(JSON.stringify({
      txId: event.txId,
      message: `Executed successfully within ${(new Date().getTime() - start)/1000} seconds`,
    }));

    await Promise.all(jobs);
  } catch (ex) {
    console.error(JSON.stringify({
      txId: event.txId,
      message: `Lambda failed after ${(new Date().getTime() - start)/1000} seconds`,
      error: ex.stack
    }));
    throw ex;
  }
};
