'use strict';

const chai = require('chai');
chai.should();
const rewire = require('rewire');
chai.use(require('sinon-chai'));
const sinon = require('sinon');

describe('GIVEN the notificationService', () => {

  let service;
  let sns;
  let snsPromise;
  const txId = 'txId';
  const from = '0.0.0.0';
  const to = '0.0.0.1';
  const path = '/';
  const regex = 'regex';
  const url = 'http://url.com/';
  const meta = Object.freeze([{key: 'testKey', value: 'testValue'}]);

  beforeEach(() => {
    process.env.NOTIFICATION_SNS_TOPIC = 'snsTopic';
    snsPromise = sinon.stub().returns(Promise.resolve());
    sns = {
      publish: sinon.stub().returns({promise: snsPromise})
    };
    service = rewire('../../../lib/notification/notificationService');
    service.__set__({
      AWS: {
        SNS: function() {
          this.publish = sns.publish;
        }
      }
    });
  });

  it('WHEN the match is found, THEN the event is correctly published', async () => {
    await service.notifyAboutMatchingPath(txId, from, to, path, regex, url);

    sns.publish.should.have.been.calledOnceWith(sinon.match(event => {
      return event.TopicArn ===  process.env.NOTIFICATION_SNS_TOPIC
        && !event.MessageAttributes
        && event.Subject
        && event.Message;
    }));
    snsPromise.should.have.been.calledOnce;
  });

  it('WHEN the match is found and meta data was provided, THEN the event is correctly published along with the MessageAttributes', async () => {
    await service.notifyAboutMatchingPath(txId, from, to, path, regex, url, meta);

    sns.publish.should.have.been.calledOnceWith(sinon.match(event => {
      return event.TopicArn ===  process.env.NOTIFICATION_SNS_TOPIC
          && event.MessageAttributes
          && event.MessageAttributes.testKey.DataType === 'String'
          && event.MessageAttributes.testKey.StringValue === 'testValue'
          && event.Subject
          && event.Message;
    }));
    snsPromise.should.have.been.calledOnce;
  });

});