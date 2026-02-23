import { Router } from "express";
import logger from "../config/logger";
//import producer from "../kafka/producer";
import {
  requestInfoToResponseInfo,
  createWorkFlow,
  getLocationDetails
} from "../utils";
import envVariables from "../envVariables";
import mdmsData from "../utils/mdmsData";
import { addUUIDAndAuditDetails, updateStatus } from "../utils/create";
import { calculate } from "../services/firenocCalculatorService";
import { validateFireNOCModel } from "../utils/modelValidation";
import set from "lodash/set";
import get from "lodash/get";
const asyncHandler = require("express-async-handler");
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
    "/_create",
    asyncHandler(async ({ body }, res, next) => {
      let isPrimaryowner = true 
      body.FireNOCs[0].fireNOCDetails.applicantDetails.owners[0] ={...body.FireNOCs[0].fireNOCDetails.applicantDetails.owners[0], "isPrimaryowner" : true};
      let response = await createApiResponse({ body }, res, next);
      if(response.Errors)
        res.status(400);
      res.json(response);
    })
  );
  return api;
};
export const createApiResponse = async ({ body }, res, next) => {
  //console.log("Create Body :"+JSON.stringify(body));
  let payloads = [];
  //getting mdms data
  let mdms = await mdmsData(body.RequestInfo, body.FireNOCs[0].tenantId);

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
  // console.log(JSON.stringify(locationResponse));
  //model validator
  let errors = validateFireNOCModel(body, mdms);
  if (errors.length > 0) {
    next({
      errorType: "custom",
      errorReponse: {
        ResponseInfo: requestInfoToResponseInfo(body.RequestInfo, true),
        Errors: errors
      }
    });
    return;
  }

  //console.log("Hello Body : "+JSON.stringify(body));
  body = await addUUIDAndAuditDetails(body, "_create");
  //console.log("Created Body:  "+JSON.stringify(body));
  let workflowResponse = await createWorkFlow(body);
  // console.log(JSON.stringify(workflowResponse));

  //need to implement notification
  //calculate call
  let { FireNOCs, RequestInfo } = body;
  //console.log("test body"+ JSON.stringify(body))

  //Comment the Calculate API as per Palam Sir Direction 
  let firenocResponse
  for (var i = 0; i < FireNOCs.length; i++) {
     firenocResponse = await calculate(FireNOCs[i], RequestInfo);
    // console.log("firenocResponse",JSON.stringify(firenocResponse))
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
  body.FireNOCs[0].fireNOCDetails.additionalDetail = {
  ...body.FireNOCs[0].fireNOCDetails.additionalDetail,
  validityYears: validityYears
};

  console.log("Final Requested Body for Create"+ JSON.stringify(body));
  payloads.push({
    topic: envVariables.KAFKA_TOPICS_FIRENOC_CREATE,
    messages: [{ value: JSON.stringify(body) }]
  });
  let response = {
    ResponseInfo: requestInfoToResponseInfo(body.RequestInfo, true),
    FireNOCs: body.FireNOCs
  };

  //  await producer.send(payloads, function(err, data) {
  //    if (err) console.log(err);
  //  });
  await producer.send({
    topic: envVariables.KAFKA_TOPICS_FIRENOC_CREATE,
    messages: [{ value: JSON.stringify(body) }]
});
  return response;
};