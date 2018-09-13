# Notice

The work on this project is currently ongoing.
The next steps to do:

* validate the HTTP request
* job creator does not finish within the time limit for all IPs and currently
requires sending several requests to cover the whole thing -> run several in parallel
* cover by more tests and publish the test coverage

[![Build Status](https://travis-ci.org/kamiljano/pathFinderLambda.svg?branch=master)](https://travis-ci.org/kamiljano/pathFinderLambda)

# About

An AWS lambda responsible for scanning the entire internet for a specified HTTP path.
It can call itself recursively to split the job into smaller chunks that can be executed simultaneously,
minimizing the total time required to perform such search.

# Why?

Because HACKING. Imagine that you want to quickly list all wordpress applications on the internet
(what can be done by searching for <allIPs>/wp-admin) or that you want to find all git repositories
that have been accidentally updated to the HTTP server and are now available for downloading. These and many
others can be easily achieved simply by requesting a specific http path. 

# Why lambda?

Lambda is an amazing tool in terms of cost saving and scalability. Pay Amazon only what the resources you use
and don't worry about deploying your application and using it only once a year.
Lambda also allows you to drastically scale the application, providing your with up to 4000 instances,
all of which can scan different parts of the internet

# Currently TODO:

* Request body validation (validate body schema and that the the 'from' parameter is actually before 'to')
* Connect with Travis CI
* Recursive scaling
* Progress monitoring

# Run locally

```commandline
serverless invoke local --function find --path requests/exampleDirectRequest.json
```

# Deployment 

```commandline
serverless deploy -v
```