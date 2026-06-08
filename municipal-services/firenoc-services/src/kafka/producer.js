import logger from "../config/logger";
import envVariables from "../envVariables";
const { Kafka, logLevel } = require("kafkajs");

let producer;
let producerPromise;

const isFlagEnabled = value =>
  String(value).toLowerCase() === "true" || String(value) === "1";

const initializeProducer = async () => {
  if (!isFlagEnabled(envVariables.KAFKA_ENABLED)) {
    logger.warn("Kafka producer disabled via KAFKA_ENABLED=false");
    return null;
  }

  if (producer) return producer;
  if (producerPromise) return producerPromise;

  producerPromise = (async () => {
    const kafka = new Kafka({
      clientId: "firenoc-services",
      logLevel: logLevel.INFO,
      brokers: [envVariables.KAFKA_BROKER_HOST],
      retry: { retries: 1 },
      ssl: false
    });

    producer = kafka.producer();
    await producer.connect();
    logger.info("Kafka producer connected");

    return producer;
  })();

  try {
    return await producerPromise;
  } catch (error) {
    producerPromise = null;
    producer = null;
    throw error;
  }
};

const sendMessage = async payload => {
  const kafkaProducer = await initializeProducer();
  if (!kafkaProducer) {
    logger.warn("Skipping Kafka publish because producer is disabled");
    return null;
  }

  return kafkaProducer.send(payload);
};

module.exports = { initializeProducer, sendMessage };

// producer.on("ready", function() {
//   console.log("Producer is ready");
// });

// producer.on("error", function(err) {
//   console.log("Producer is in error state");
//   console.log(err);
// });

//export default producer;
