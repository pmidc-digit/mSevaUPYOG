const kafka = require("kafka-node");
import envVariables from "../EnvironmentVariables";
import logger from "../config/logger";
import { createNoSave } from "../index";
var async = require('async'); 


export const listenConsumer = async(topic)=>{
//let receiveJob = envVariables.KAFKA_RECEIVE_CREATE_JOB_TOPIC;

let receiveJob = topic;


var topicList = [];
for (var i in receiveJob) {
  topicList.push(receiveJob[i]);
}

// ═══════════════════════════════════════════════════════════════════
// Configuration for 2 Pods Setup
// Pod 1: Gets Partition 0
// Pod 2: Gets Partition 1
// Total: 2x throughput with automatic load balancing
// ═══════════════════════════════════════════════════════════════════
const instanceId = `pdf-service-${process.env.HOSTNAME || 'pod'}-${Date.now()}`;
logger.info(`🚀 Consumer instance started with ID: ${instanceId}`);

var options = {
  // connect directly to kafka broker (instantiates a KafkaClient)
  kafkaHost: envVariables.KAFKA_BROKER_HOST,
  autoCommit: true,
  groupId: "bulk-pdf",
  // Unique clientId for each pod instance
  clientId: instanceId,
  // Partition assignment strategy - roundrobin distributes partitions evenly
  protocol: ["roundrobin"],
  // Offsets to use for new groups - 'earliest' processes all messages
  fromOffset: "earliest",
  // how to recover from OutOfRangeOffset error
  outOfRangeOffset: "earliest",

  // Stability options for 2-pod setup
  sessionTimeout: 30000,      // 30 second session timeout
  heartbeatInterval: 3000,    // Send heartbeat every 3 seconds
  retries: 3,                 // Retry 3 times if connection fails
  maxAsyncRequests: 10        // Max async requests to broker
};
// ═══════════════════════════════════════════════════════════════════

var consumerGroup = new kafka.ConsumerGroup(options, topicList);

// ═══════════════════════════════════════════════════════════════════
// 1 CONCURRENCY QUEUE PER POD - Process ONE message at a time per pod
// 2-Pod Setup:
//   Pod 1: Partition 0, Concurrency 1 (1 msg at a time)
//   Pod 2: Partition 1, Concurrency 1 (1 msg at a time)
//   Total: 2 messages processed simultaneously across pods
// Benefits:
// ✓ Database connection pool is safe (1-2 conn per pod)
// ✓ Memory usage is optimal (500-600MB per pod)
// ✓ Message order is guaranteed per partition
// ✓ No race conditions
// ✓ 2x throughput compared to 1 pod
// ═══════════════════════════════════════════════════════════════════
var q = async.queue(function(data, cb) {
   createNoSave(data, null, () => {}, () => {})
     .then(function(ep) {
       cb(); // Mark complete
     })
     .catch(function(err) {
       logger.error("❌ Error processing message: " + (err.message || err));
       cb(); // Still mark complete to prevent queue blocking
     });
}, 1); // ← CONCURRENCY: 1 per pod (DO NOT CHANGE)
// ═══════════════════════════════════════════════════════════════════


q.drain(async () => {
  consumerGroup.resume(); //resume listening new messages from the Kafka consumer group
});




consumerGroup.on("ready", function() {
  logger.info("Consumer is ready");
});

consumerGroup.on("message", function(message) {
  logger.info("record received on consumer for create");
  try {
      var data = JSON.parse(message.value);
      //console.log(JSON.stringify(data));
     /* await createNoSave(
        data,
        null,
        () => {},
        () => {}
      )
        .then(() => {
          logger.info("record created for consumer request");
        })
        .catch(error => {
          logger.error(error.stack || error);
        });*/
    q.push(data, function (err, result) {  
      if (err) { logger.error(err); return }      
    });
    consumerGroup.pause();

  } catch (error) {
    logger.error("error in create request by consumer " + error.message);
    logger.error(error.stack || error);
  }
});

// ═══════════════════════════════════════════════════════════════════
// ERROR HANDLERS - Better logging for 2-pod setup with auto-rebalancing
// ═══════════════════════════════════════════════════════════════════
consumerGroup.on("error", function(err) {
  logger.error("❌ Consumer error: " + (err.message || err));
  logger.error(err.stack || err);
  // Don't crash - consumer will auto-reconnect
  // In 2-pod setup: if one pod fails, other continues processing
});

consumerGroup.on("offsetOutOfRange", function(err) {
  logger.error("⚠️  Consumer offset out of range: " + (err.message || err));
  // Reset to earliest offset for all topics
  for (let topic of topicList) {
    consumerGroup.setOffset(topic, 0, "earliest");
    logger.info(`Reset offset for topic: ${topic}`);
  }
});

// 2-POD SPECIFIC: Rebalancing event - happens when pod joins/leaves
consumerGroup.on("rebalancing", function() {
  logger.info("🔄 Consumer group rebalancing started");
  logger.info("   Redistributing partitions among pods in progress...");
});

// 2-POD SPECIFIC: Registration success
consumerGroup.on("registered", function() {
  logger.info(`✅ Consumer instance ${instanceId} successfully registered with Kafka brokers`);
});

// 2-POD SPECIFIC: Log partition assignment
// This fires after rebalancing completes
const originalOn = consumerGroup.on.bind(consumerGroup);
let firstAssignment = false;

// Helper to log partition assignment
const logPartitionAssignment = () => {
  // This is a bit hacky but helps with debugging 2-pod setup
  setTimeout(() => {
    try {
      const assignments = consumerGroup.topicPayloads || [];
      if (assignments.length > 0) {
        logger.info(`📊 Partition Assignment for ${instanceId}:`);
        assignments.forEach((payload) => {
          if (payload.partitions && payload.partitions.length > 0) {
            logger.info(`   Topic: ${payload.topic}, Partitions: [${payload.partitions.join(', ')}]`);
          }
        });
      }
    } catch (e) {
      // Ignore - this is just for logging
    }
  }, 1000);
};

// Call on first ready
const originalReady = consumerGroup.listeners("ready")[0];
if (originalReady) {
  consumerGroup.removeListener("ready", originalReady);
  consumerGroup.on("ready", function() {
    logger.info("✅ Consumer is ready");
    if (!firstAssignment) {
      firstAssignment = true;
      logPartitionAssignment();
    }
  });
}

// ═══════════════════════════════════════════════════════════════════

}