'use strict';

const AWS = require('aws-sdk');
const _ = require('lodash');
const {IP} = require('../search/ip');

module.exports.splitJob = async (txId, b) => {
  const lambda = new AWS.Lambda();

  const from = new IP(b.from);
  const to = new IP(b.to);
  const maxRequestsPerInstance = Number(process.env.MAX_IPS_TO_SCAN_PER_INSTANCE);

  let current = from;
  const allJobs = [];
  const allIpsCount = from.diff(to);
  const iterations = Math.ceil((allIpsCount - 1) / maxRequestsPerInstance);
  
  for (let i = 0; i < iterations; i++) {
    const newTo = current.increment(maxRequestsPerInstance);

    allJobs.push({
      txId,
      from: current.toString(),
      to: newTo.gt(to) ? to.toString() : newTo.toString(),
      path: b.path,
      regex: b.regex
    });

    try {
      current = current.increment(maxRequestsPerInstance + 1);//TODO: this shit stilld oesn't work correctly
    } catch (ex) {
      current = to
    }
  }

  return allJobs;
};