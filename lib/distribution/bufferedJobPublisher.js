'use strict';

const AWS = require('aws-sdk');

const MAX_BATCH_SIZE = 10;
const MAX_PROMISE_SIZE = 50;

class BufferedJobPublisher {

    constructor(queueUrl) {
        this.sqs = new AWS.SQS();
        this.queueUrl = queueUrl;
        this.buffer = [];
        this.promises = [];
    }

    async publish(job) {
        this.buffer.push(job);
        if (this.buffer.length === MAX_BATCH_SIZE) {
            this.flush();
        }
        if (this.promises.length === MAX_PROMISE_SIZE) {
            await this.sync();
        }
    }

    flush() {
        const promise = this.sqs.sendMessageBatch({
            QueueUrl: this.queueUrl,
            Entries: this.buffer.map((batchedJob, id) => {
                return {
                    Id: (id + this.promises.length * MAX_BATCH_SIZE) + '',
                    MessageBody: JSON.stringify(batchedJob)
                };
            })
        }).promise();

        this.promises.push(promise);
        this.buffer = [];
    }

    async sync() {
        await Promise.all(this.promises);
        this.promises = [];
    }
}

module.exports.BufferedJobPublisher = BufferedJobPublisher;