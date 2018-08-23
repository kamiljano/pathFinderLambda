'use strict';

const chai = require('chai');
chai.use(require('sinon-chai'));
chai.should();
const sinon = require('sinon');
const rewire = require('rewire');

describe('GIVEN BufferedJobPublisher', () => {

    let sendMessageBatch;
    let publisher;
    let BufferedJobPublisher;
    const sqsArn = 'sqsArn';

    beforeEach(() => {
        sendMessageBatch = sinon.stub().returns({promise: () => Promise.resolve()});
        const AWS = {
            SQS: function() {
                this.sendMessageBatch = sendMessageBatch;
            }
        };
        publisher = rewire('../../../lib/distribution/bufferedJobPublisher');
        publisher.__set__({AWS});
        BufferedJobPublisher = publisher.BufferedJobPublisher;
    });

    it('WHEN 9 messages are published, the buffer is not flushed', () => {
        const pub = new BufferedJobPublisher(sqsArn);
        for (let i = 0; i < 9; i++) {
            pub.publish({});
        }
        sendMessageBatch.should.not.have.been.called;
    });

    it('WHEN 10 messages are published, the buffer is flushed', () => {
        const pub = new BufferedJobPublisher(sqsArn);
        for (let i = 0; i < 10; i++) {
            pub.publish({test: 'test'});
        }
        pub.promises.length.should.equal(1);
        pub.buffer.length.should.equal(0);
        sendMessageBatch.should.have.been.calledOnceWith({
            QueueUrl: sqsArn,
            Entries: [
                {Id: '0', MessageBody: JSON.stringify({test: 'test'})},
                {Id: '1', MessageBody: JSON.stringify({test: 'test'})},
                {Id: '2', MessageBody: JSON.stringify({test: 'test'})},
                {Id: '3', MessageBody: JSON.stringify({test: 'test'})},
                {Id: '4', MessageBody: JSON.stringify({test: 'test'})},
                {Id: '5', MessageBody: JSON.stringify({test: 'test'})},
                {Id: '6', MessageBody: JSON.stringify({test: 'test'})},
                {Id: '7', MessageBody: JSON.stringify({test: 'test'})},
                {Id: '8', MessageBody: JSON.stringify({test: 'test'})},
                {Id: '9', MessageBody: JSON.stringify({test: 'test'})}
            ]
        });
    });

});