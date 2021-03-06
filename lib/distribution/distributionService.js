'use strict';

const {IP} = require('../search/ip');
const {BufferedJobPublisher} = require('./bufferedJobPublisher');

module.exports.splitJob = async (txId, b) => {
  const jobPublisher = new BufferedJobPublisher(process.env.JOB_QUEUE);

  const from = new IP(b.from);
  const to = new IP(b.to);
  const maxRequestsPerInstance = Number(process.env.MAX_JOBS_TO_CREATE);

  let current = from;
  const allIpsCount = from.diff(to);
  const iterations = allIpsCount === 0 ? 1 : Math.ceil((allIpsCount - 1) / maxRequestsPerInstance);

  console.log(JSON.stringify({
    txId,
    message: `Splitting the search request from ${b.from} to ${b.to} into ${iterations} lambda instances`
  }));
  
  for (let i = 0; i < iterations; i++) {
    const newTo = current.increment(maxRequestsPerInstance);
    console.log(JSON.stringify({
      txId,
      message: `Creating job for search from ${current.toString()} to ${newTo.toString()}`
    }));

    await jobPublisher.publish({
      txId,
      from: current.toString(),
      to: newTo.gt(to) ? to.toString() : newTo.toString(),
      path: b.path,
      regex: b.regex,
      meta: b.meta
    });

    try {
      current = current.increment(maxRequestsPerInstance + 1);
    } catch (ex) {
      current = to
    }
  }

  jobPublisher.flush();
  await jobPublisher.sync();

  return iterations;
};