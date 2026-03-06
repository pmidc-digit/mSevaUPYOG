import { Router } from "express";
//import producer from "../kafka/producer";
import logger from "../config/logger";
import envVariables from "../envVariables";
const asyncHandler = require("express-async-handler");
import mdmsData from "../utils/mdmsData";
import { addUUIDAndAuditDetails, updateStatus,  enrichAssignees} from "../utils/create";
import { getApprovedList } from "../utils/update";

import {
  requestInfoToResponseInfo,
  createWorkFlow,
  getLocationDetails
} from "../utils";
import { calculate } from "../services/firenocCalculatorService";
// import cloneDeep from "lodash/cloneDeep";
import filter from "lodash/filter";
import { validateFireNOCModel } from "../utils/modelValidation";
import set from "lodash/set";
import get from "lodash/get";
const { initializeProducer } = require("../kafka/producer");
let producer;
initializeProducer().then((p) => {
   producer = p;

  logger.info('Kafka producer connected');
}).catch((error) => {
  logger.error(error.stack || error);
  process.exit(1);
});
export default ({ config }) => {
  let api = Router();
  api.post(
    "/_update",
    asyncHandler(async ({ body }, res, next) => {
      let isPrimaryowner = true 
      body.FireNOCs[0].fireNOCDetails.applicantDetails.owners[0] ={...body.FireNOCs[0].fireNOCDetails.applicantDetails.owners[0], "isPrimaryowner" : true};
      let response = await updateApiResponse({ body }, true, next);
      if(response.Errors)
        res.status(400);
      res.json(response);
    })
  );
  return api;
};
export const updateApiResponse = async ({ body }, next = {}) => {
  console.log("Update Body: "+JSON.stringify(body));
  let payloads = {};
  payloads.messages =[];
  let mdms = await mdmsData(body.RequestInfo, body.FireNOCs[0].tenantId);
  //model validator
  //location data
  let locationResponse = await getLocationDetails(
    body.RequestInfo,
    body.FireNOCs[0].tenantId
  );

  set(
    mdms,
    "MdmsRes.firenoc.boundary",
    get(locationResponse, "TenantBoundary.0.boundary")
  );

  let errors = await validateFireNOCModel(body, mdms);
  console.log("Error Check:"+JSON.stringify(errors));
  if (errors.length > 0) {
    return next({
      errorType: "custom",
      errorReponse: {
        ResponseInfo: requestInfoToResponseInfo(body.RequestInfo, true),
        Errors: errors
      }
    });
    return;
  }

  body = await addUUIDAndAuditDetails(body, "_update");

  //Check records for approved
  // let approvedList=await getApprovedList(cloneDeep(body));

  //applay workflow
  let workflowResponse = await createWorkFlow(body);
  //console.log("workflowResponse"+JSON.stringify(workflowResponse));

  //calculate call
  let firenocResponse
  let { FireNOCs = [], RequestInfo = {} } = body;
  for (var i = 0; i < FireNOCs.length; i++) {
      firenocResponse = await calculate(FireNOCs[i], RequestInfo);
  }

var validityYears =
    (firenocResponse &&
      firenocResponse.Calculation &&
      firenocResponse.Calculation[0] &&
      firenocResponse.Calculation[0].taxHeadEstimates &&
      firenocResponse.Calculation[0].taxHeadEstimates[0] &&
      firenocResponse.Calculation[0].taxHeadEstimates[0].validityYears) != null
      ? firenocResponse.Calculation[0].taxHeadEstimates[0].validityYears
      : 1;

  body.FireNOCs = updateStatus(FireNOCs, workflowResponse);

  //if (body.FireNOCs[0].fireNOCDetails.applicationDate <= '1756252740000' || body.FireNOCs[0].dateOfApplied <= '1756252740000') {
  if(body.FireNOCs[0].fireNOCDetails.auditDetails.lastModifiedTime <= '1756252740000'){
  //if (body.FireNOCs[0].dateOfApplied <= '1756252740000') {
    body.FireNOCs[0].fireNOCDetails.additionalDetail = {
      ...body.FireNOCs[0].fireNOCDetails.additionalDetail,
      validityYears: 1
    };
  } else {
    body.FireNOCs[0].fireNOCDetails.additionalDetail = {
      ...body.FireNOCs[0].fireNOCDetails.additionalDetail,
      validityYears: validityYears
    };
  }

 // console.log("FireNoc Request Body for Update"+JSON.stringify(body.FireNOCs));

  // payloads.push({
  //   topic: envVariables.KAFKA_TOPICS_FIRENOC_UPDATE,
  //   messages: JSON.stringify(body),
  //   key : body.FireNOCs[0].fireNOCDetails.id
  // });
    payloads.topic = envVariables.KAFKA_TOPICS_FIRENOC_UPDATE;
    payloads.messages.push({ value: JSON.stringify(body)});

  //check approved list
  const approvedList = filter(body.FireNOCs, function(fireNoc) {
    return fireNoc.fireNOCNumber;
  });

  // console.log("list length",approvedList.length);
  if (approvedList.length > 0) {
    // payloads.push({
    //   topic: envVariables.KAFKA_TOPICS_FIRENOC_WORKFLOW,
    //   messages: JSON.stringify({ RequestInfo, FireNOCs: approvedList }),
    //    key : body.FireNOCs[0].fireNOCDetails.id
    // });
    payloads.topic = envVariables.KAFKA_TOPICS_FIRENOC_WORKFLOW;
    payloads.messages.push({ value: JSON.stringify({ RequestInfo, FireNOCs: approvedList })})
  }
  console.log(JSON.stringify(body));
  let response = {
    ResponseInfo: requestInfoToResponseInfo(body.RequestInfo, true),
    FireNOCs: body.FireNOCs
  };
  // initializeProducer.send(payloads, function(err, data) {
  //   if (err) console.log(err);
  // });
  producer.send(payloads).then((data) => {
    logger.info('Message sent to Kafka:', data);
    //logger.info("jobid: " + jobid + ": published to kafka successfully");
    //  successCallback({
    //      message: "Success"
    //     //jobid: jobid,
    //  })
  }).catch(err => {
    logger.error(err.stack || err);
    // errorCallback({
    //   message: `error while publishing to kafka: ${err.message}`
    // });
  })
  return response;
};