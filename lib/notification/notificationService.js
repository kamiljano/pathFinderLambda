'use strict';

const AWS = require('aws-sdk');

module.exports.notifyAboutMatchingPath = (from, to, path, regex, url) => {
  const sns = new AWS.SNS();
  return sns.publish({
    Message: JSON.stringify({
      from, to, path, regex, url
    }),
    Subject: `Found a match for the search from ${from} to ${to} for path ${path} using regex ${regex}`,
    TopicArn: process.env.NOTIFICATION_SNS_TOPIC
  }).promise();

};