'use strict';

const AWS = require('aws-sdk');

const MAX_BATCH_SIZE = 10;

class BufferedJobPublisher {

    constructor(queueUrl) {
        this.sqs = new AWS.SQS();
        this.queueUrl = queueUrl;
        this.buffer = [];
        this.promises = [];
    }

    publish(job) {
        this.buffer.push(job);
        if (this.buffer.length === MAX_BATCH_SIZE) {
            this.flush();
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

    sync() {
        return Promise.all(this.promises);
    }
}

module.exports.BufferedJobPublisher = BufferedJobPublisher;