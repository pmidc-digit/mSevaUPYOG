const kafka = require("kafka-node");
import envVariables from "../envVariables";
import logger from "../config/logger";
import get from "lodash/get";
import set from "lodash/set";
import { searchApiResponse } from "../api/search";
import { updateApiResponse } from "../api/update";
const pLimit = require("p-limit"); // Install via: npm install p-limit
const { initializeProducer } = require("../kafka/producer");

/**
 * INITIALIZATION & CONFIG
 */
const CONCURRENCY_LIMIT = parseInt(envVariables.KAFKA_CONCURRENCY || 3);
const limit = pLimit(CONCURRENCY_LIMIT);

let producer;
initializeProducer().then((p) => {
  producer = p;
  logger.info('Kafka producer connected');
}).catch((error) => {
  logger.error(error.stack || error);
  process.exit(1);
});

var options = {
  kafkaHost: envVariables.KAFKA_BROKER_HOST,
  groupId: "firenoc-consumer-grp",
  autoCommit: true,
  autoCommitIntervalMs: 5000,
  sessionTimeout: 15000,
  fetchMaxBytes: 10 * 1024 * 1024,
  protocol: ["roundrobin"],
  fromOffset: envVariables.KAFKA_OFFSET || "earliest", // Offset from ENV
  outOfRangeOffset: "earliest"
};

var consumerGroup = new kafka.ConsumerGroup(options, [
  envVariables.KAFKA_TOPICS_FIRENOC_CREATE,
  envVariables.KAFKA_TOPICS_FIRENOC_UPDATE,
  envVariables.KAFKA_TOPICS_FIRENOC_WORKFLOW,
  envVariables.KAFKA_TOPICS_RECEIPT_CREATE
]);

/**
 * DEAD LETTER QUEUE (DLQ) HELPER
 */
const pushToDLQ = async (message, error) => {
  const dlqTopic = envVariables.KAFKA_TOPICS_FIRENOC_DLQ || "firenoc.dlq";
  const dlqPayload = [{
    topic: dlqTopic,
    messages: JSON.stringify({
      originalTopic: message.topic,
      value: JSON.parse(message.value),
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }];

  return new Promise((resolve, reject) => {
    producer.send(dlqPayload, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};

/**
 * ORIGINAL BUSINESS LOGIC FUNCTIONS
 */

const sendFireNOCSMSRequest = (FireNOCs, RequestInfo, payloads, events) => {
  for (let i = 0; i < FireNOCs.length; i++) {
    let smsRequest = {};
    smsRequest["mobileNumber"] = get(FireNOCs[i], "fireNOCDetails.applicantDetails.owners.0.mobileNumber");
    let firenocType = get(FireNOCs[i], "fireNOCDetails.fireNOCType") === "NEW" ? "new" : "provision";
    let ownerName = get(FireNOCs[i], "fireNOCDetails.applicantDetails.owners.0.name");
    let uuid = get(FireNOCs[i], "fireNOCDetails.applicantDetails.owners.0.uuid");
    let applicationNumber = get(FireNOCs[i], "fireNOCDetails.applicationNumber");
    let fireNOCNumber = get(FireNOCs[i], "fireNOCNumber");
    let validTo = get(FireNOCs[i], "fireNOCDetails.validTo");
    let tenantId = get(FireNOCs[i], "tenantId");
    let actionType = "forwarded for";
    let action = get(FireNOCs[i], "fireNOCDetails.action");

    if (action == envVariables.SENDBACK) { actionType = "send back to"; }

    let messageForcertificate = firenocType == 'renewal'
      ? 'your renewed Fire NOC Certificate has been generated.'
      : 'your Fire NOC Certificate has been generated.';

    let downLoadLink = `${envVariables.EGOV_HOST_BASE_URL}${envVariables.EGOV_RECEIPT_URL}?applicationNumber=${applicationNumber}&tenantId=${tenantId}`;

    let ownerInfo = get(RequestInfo, "userInfo.roles");
    if (ownerInfo != null && ownerInfo.length > 0) { ownerInfo = ownerInfo[0].name; }

    switch (FireNOCs[i].fireNOCDetails.status) {
      case "PENDINGPAYMENT":
        smsRequest["message"] = `Dear ${ownerName}, Your application for ${firenocType} Fire NOC Certificate has been submitted, the application no. is ${applicationNumber}. You can download your application form by clicking on the below link: ${downLoadLink}. Kindly pay your NOC Fees online or at your applicable fire office.|1301157492438182299|1407161492659630233`;
        break;
      case "FIELDINSPECTION":
        smsRequest["message"] = `Dear ${ownerName}, Your application for ${firenocType} Fire NOC Certificate with application no. ${applicationNumber} has been ${actionType} field inspection.|1301157492438182299|1407161492704744715`;
        break;
      case "DOCUMENTVERIFY":
        smsRequest["message"] = `Dear ${ownerName}, Your application for ${firenocType} Fire NOC Certificate with application no. ${applicationNumber} has been ${actionType} document verifier.|1301157492438182299|1407161407329037630`;
        break;
      case "PENDINGAPPROVAL":
        smsRequest["message"] = `Dear ${ownerName}, Your application for ${firenocType} Fire NOC Certificate with application no. ${applicationNumber} has been ${actionType} approver.|1301157492438182299|1407161407332754584`;
        break;
      case "APPROVED":
        var currentDate = new Date(validTo);
        var dateString = currentDate.getDate() + "-" + (currentDate.getMonth() + 1 > 9 ? currentDate.getMonth() + 1 : `0${currentDate.getMonth() + 1}`) + "-" + currentDate.getFullYear();
        smsRequest["message"] = `Dear ${ownerName}, Your Application for ${firenocType} Fire NOC Certificate with application no. ${applicationNumber} is approved and ${messageForcertificate} Your Fire NOC Certificate No. is ${fireNOCNumber} and it is valid till ${dateString}. You can download your Fire NOC Certificate by clicking on the below link: ${downLoadLink}|1301157492438182299|1407161494277225601`;
        break;
      case "SENDBACKTOCITIZEN":
        smsRequest["message"] = `Dear ${ownerName}, Your application for ${firenocType} Fire NOC Certificate with application no. ${applicationNumber} is send back to you for further actions.Please check the comments and Re-submit application through mSeva App or by ULB counter.|1301157492438182299|1407161407355219072`;
        break;
      case "REJECTED":
        smsRequest["message"] = `Dear ${ownerName}, Your application for ${firenocType} Fire NOC Certificate with application no. ${applicationNumber} has been rejected by ${ownerInfo}. To know more details please contact your respective fire office.|1301157492438182299|1407161407368404178`;
        break;
    }

    if (smsRequest.message) {
      payloads.messages.push({ value: JSON.stringify(smsRequest) });
      events.push({
        tenantId,
        eventType: "SYSTEMGENERATED",
        description: smsRequest.message,
        name: "Firenoc notification",
        source: "webapp",
        recepient: { toUsers: [uuid] }
      });
    }
  }
};

const sendPaymentMessage = (value, payloads) => {
  const { Payment } = value;
  const smsRequest = {};
  smsRequest["mobileNumber"] = get(Payment.paymentDetails[0], "Bill[0].mobileNumber");
  let businessService = get(Payment.paymentDetails[0], "Bill[0].businessService");

  if (businessService === envVariables.BUSINESS_SERVICE) {
    let paymentAmount = get(Payment.paymentDetails[0], "Bill[0].amountPaid");
    let applicantName = get(Payment.paymentDetails[0], "Bill[0].payerName");
    let receiptNumber = get(Payment.paymentDetails[0], "Bill[0].billDetails[0].receiptNumber");
    let applicationNumber = get(Payment.paymentDetails[0], "Bill[0].billDetails[0].consumerCode");
    let tenant = get(Payment, "tenantId");
    let downLoadLink = `${envVariables.EGOV_HOST_BASE_URL}${envVariables.EGOV_RECEIPT_URL}?applicationNumber=${applicationNumber}&tenantId=${tenant}`;

    smsRequest["message"] = `Dear ${applicantName}, A Payment of ${paymentAmount} has been collected successfully for your Fire NOC Certificate. The payment receipt no. is ${receiptNumber} and you can download your receipt by clicking on the below link: ${downLoadLink}|1301157492438182299|1407161407392327147`;

    payloads.messages.push({ value: JSON.stringify(smsRequest) });
  }
};

const FireNOCPaymentStatus = async (value) => {
  const { Payment, RequestInfo } = value;
  let tenantId = get(Payment, "tenantId");
  const { paymentDetails } = Payment;
  if (paymentDetails) {
    for (let detail of paymentDetails) {
      if (get(detail, "businessService") === envVariables.BUSINESS_SERVICE) {
        let applicationNumber = get(detail, "bill.consumerCode");
        const searchResponse = await searchApiResponse({ body: { RequestInfo }, query: { tenantId, applicationNumber } });
        const { FireNOCs } = searchResponse;
        if (!FireNOCs.length) throw new Error("FIRENOC Search error");

        FireNOCs.forEach(f => set(f, "fireNOCDetails.action", envVariables.ACTION_PAY));
        RequestInfo.userInfo.roles.forEach(role => set(role, "tenantId", get(RequestInfo.userInfo, "tenantId")));

        await updateApiResponse({ body: { RequestInfo, FireNOCs } });
      }
    }
  }
};

/**
 * MAIN KAFKA CONSUMER LISTENER
 */
consumerGroup.on("message", function (message) {
  limit(async () => {
    try {
      const value = JSON.parse(message.value);

      // 1. GATEKEEPER: Check Business Service filter
      let businessService = get(value, "FireNOCs[0].fireNOCDetails.businessService") ||
        get(value, "Payment.paymentDetails[0].businessService") ||
        get(value, "Payment.paymentDetails[0].Bill[0].businessService");

      if (businessService !== envVariables.BUSINESS_SERVICE) return;

      let payloads = { topic: envVariables.KAFKA_TOPICS_NOTIFICATION, messages: [] };
      let events = [];
      const { RequestInfo } = value;

      // 2. LOGIC ROUTER (Same as original switch)
      switch (message.topic) {
        case envVariables.KAFKA_TOPICS_FIRENOC_CREATE:
        case envVariables.KAFKA_TOPICS_FIRENOC_UPDATE:
        case envVariables.KAFKA_TOPICS_FIRENOC_WORKFLOW:
          sendFireNOCSMSRequest(value.FireNOCs, RequestInfo, payloads, events);
          break;

        case envVariables.KAFKA_TOPICS_RECEIPT_CREATE:
          sendPaymentMessage(value, payloads);
          await FireNOCPaymentStatus(value);
          break;
      }

      // 3. SEND NOTIFICATIONS
      if (events.length > 0) {
        payloads.messages.push({
          topic: envVariables.KAFKA_TOPICS_EVENT_NOTIFICATION,
          value: JSON.stringify({ events })
        });
      }

      if (payloads.messages.length > 0) {
        await new Promise((resolve, reject) => {
          producer.send([payloads], (err, data) => {
            if (err) reject(err);
            else resolve(data);
          });
        });
        logger.info(`Successfully pushed notification for topic: ${message.topic}`);
      }

    } catch (error) {
      logger.error(`Processing error: ${error.message}`);
      await pushToDLQ(message, error).catch(dlqErr => logger.error("DLQ Failed", dlqErr));
    }
  });
});

consumerGroup.on("error", (err) => logger.error("Consumer Error:", err));
consumerGroup.on("offsetOutOfRange", (err) => logger.warn("Offset Out of Range:", err));

export default consumerGroup;