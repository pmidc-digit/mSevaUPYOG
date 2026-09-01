const config = require('../../env-variables');

const kafka = require('kafka-node'),
    HighLevelProducer = kafka.HighLevelProducer;

const client = new kafka.KafkaClient({kafkaHost: config.kafka.kafkaBootstrapServer});
const producer = new HighLevelProducer(client);

producer.on('error', function (err) {
    console.error('Kafka producer error:', err.message);
    console.error(err.stack || err);
});

client.on('error', function (err) {
    console.error('Kafka client error:', err.message);
    console.error(err.stack || err);
});

module.exports = producer;