# Notice

The work on this project is currently ongoing.
The next steps to do:

* update serverless.yml, so that it's AWS account agnostic... at the moment as a shortcut several ARNs are hardcoded
* generate a notification once the search is over
* cover by more tests and publish the test coverage

[![Build Status](https://travis-ci.org/kamiljano/pathFinderLambda.svg?branch=master)](https://travis-ci.org/kamiljano/pathFinderLambda)

# About

An AWS lambda responsible for scanning the entire internet for a specified HTTP path.
It allows you 

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

# Run locally

```commandline
serverless invoke local --function find --path requests/exampleDirectRequest.json
```

# Deployment 

```commandline
serverless deploy -v
```