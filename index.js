#!/usr/bin/env node

const yargs = require("yargs");
const sqs = require("sqs");
const ora = require("ora");

const args = yargs
    .usage("Usage: --from <from SQS name> --to <to SQS name> --access <AWS account access> --secret <AWS account secret>")
    .option("f", { alias: "from", describe: "From SQS name", type: "string", demandOption: true })
    .option("t", { alias: "to", describe: "To SQS name", type: "string", demandOption: true })
    .option("a", { alias: "access", describe: "Access key ID", type: "string", demandOption: true })
    .option("s", { alias: "secret", describe: "Secret access key", type: "string", demandOption: true })
    .option("w", { alias: "workers", describe: "Workers count", default: 1, type: "number", demandOption: false })
    .option("r", { alias: "region", describe: "AWS region", default: "us-east-1", type: "string", demandOption: false })
    .argv;
const { access, secret, region, workers, from, to } = args;
const queue = sqs({
    access, secret, region
});
const spinner = ora().succeed("Message moving started");
let count = 0;

queue.pull(from, workers, (event, cb) => {
    spinner.start("Receiving message");
    queue.push(to, event, (err) => {
        if (!err) {
            spinner.succeed(`Message #${++count}`);
            cb();
        }
    })
});
