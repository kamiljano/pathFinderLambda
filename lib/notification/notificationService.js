'use strict';

const AWS = require('aws-sdk');

const buildMessageAttributes = meta => {
  if (!meta) {
    return undefined;
  }
  const result = {};
  for (let m of meta) {
    result[m.key] = {
      DataType: 'String',
      StringValue: m.value
    }
  }
  return result;
};

module.exports.notifyAboutMatchingPath = (txId, from, to, path, regex, url, meta) => {
  const sns = new AWS.SNS();

  const event = {
    Message: JSON.stringify({
      txId, from, to, path, regex, url
    }),
    MessageAttributes: buildMessageAttributes(meta),
    Subject: `Found a match for the search from ${from} to ${to} for path ${path} using regex ${regex}`,
    TopicArn: process.env.NOTIFICATION_SNS_TOPIC
  };

  console.info(`Publishing the following event: ${JSON.stringify(event)}`);

  return sns.publish(event).promise();

};