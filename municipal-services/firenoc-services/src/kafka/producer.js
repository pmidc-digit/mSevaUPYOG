import logger from "../config/logger";
var kafka = require("kafka-node");
import envVariables from "../envVariables";
const { Kafka, logLevel } = require('kafkajs')
const Producer = kafka.Producer;
let client;

// if (process.env.NODE_ENV === "development") {
//   client = new kafka.KafkaClient();
//   console.log("local Producer- ");
// } else {
//   client = new kafka.KafkaClient({ kafkaHost: envVariables.KAFKA_BROKER_HOST });
//   console.log("cloud Producer- ");
// }
// let kafkaClient = new Kafka({ 
//   clientId: 'firenoc-services',
//   logLevel: logLevel.INFO,
//   brokers: [envVariables.KAFKA_BROKER_HOST], 
//   retry: { retries: 1 },
//   ssl: false
// });

//const producer = new Producer(client);

let producer;

const initializeProducer = async () => {
  if (producer) return producer;

  const kafka = new Kafka({
    clientId: 'firenoc-services',
    logLevel: logLevel.INFO,
    brokers: [envVariables.KAFKA_BROKER_HOST], 
    retry: { retries: 1 },
    ssl: false
  });

  producer = kafka.producer();
  await producer.connect();

  return producer;
};

module.exports = { initializeProducer };

// producer.on("ready", function() {
//   console.log("Producer is ready");
// });

// producer.on("error", function(err) {
//   console.log("Producer is in error state");
//   console.log(err);
// });

//export default producer;
