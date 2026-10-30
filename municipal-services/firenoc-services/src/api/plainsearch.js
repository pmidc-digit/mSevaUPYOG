import { Router } from "express";
import { requestInfoToResponseInfo } from "../utils";
import isEmpty from "lodash/isEmpty";
import get from "lodash/get";
const asyncHandler = require("express-async-handler");
import db from "../db";

export default ({ config }) => {
  let api = Router();
  api.post(
    "/_plainsearch",
    asyncHandler(async (request, res, next) => {
      let response = await plainSearchApiResponse(request, next);
      if (response) {
        res.json(response);
      }
    })
  );
  return api;
};

export const plainSearchApiResponse = async (request, next = {}) => {
  let response = {
    ResponseInfo: requestInfoToResponseInfo(request.body.RequestInfo, true),
    FireNOCs: []
  };

  const queryObj = JSON.parse(JSON.stringify(request.query));
  console.log("PlainSearch Query Object: " + JSON.stringify(queryObj));

  // Build basic SQL query with ROW_NUMBER for pagination
  let sqlQuery = `
    SELECT * FROM (
      SELECT
        ROW_NUMBER() OVER (ORDER BY FN.createdtime DESC) as rn,
        FN.uuid as FID,
        FN.tenantid,
        FN.fireNOCNumber,
        FN.islegacy,
        FN.provisionfirenocnumber,
        FN.oldfirenocnumber,
        FN.dateofapplied,
        FN.createdBy,
        FN.createdTime,
        FN.lastModifiedBy,
        FN.lastModifiedTime,
        FD.uuid as firenocdetailsid,
        FD.action,
        FD.applicationnumber,
        FD.fireNOCType,
        FD.applicationdate,
        FD.financialYear,
        FD.firestationid,
        FD.issuedDate,
        FD.validFrom,
        FD.validTo,
        FD.status,
        FD.channel,
        FD.propertyid,
        FD.noofbuildings,
        FD.additionaldetail,
        FBA.uuid as puuid,
        FBA.doorno as pdoorno,
        FBA.latitude as platitude,
        FBA.longitude as plongitude,
        FBA.buildingName as pbuildingname,
        FBA.addressnumber as paddressnumber,
        FBA.pincode as ppincode,
        FBA.locality as plocality,
        FBA.landmark as landmark,
        FBA.addressline2,
        FBA.city as pcity,
        FBA.areatype as pareatype,
        FBA.subdistrict as psubdistrict,
        FBA.street as pstreet,
        FB.uuid as buildingid,
        FB.name as buildingname,
        FB.usagetype,
        FB.usagesubtype,
        FB.leftsurrounding,
        FB.rightsurrounding,
        FB.frontsurrounding,
        FB.backsurrounding,
        FB.landarea,
        FB.totalcoveredarea,
        FB.parkingarea,
        FO.uuid as ownerid,
        FO.ownertype,
        FO.useruuid,
        FO.relationship,
        FUOM.uuid as uomuuid,
        FUOM.code,
        FUOM.value,
        FUOM.activeuom,
        FUOM.active,
        FBD.uuid as documentuuid,
        FBD.documentType,
        FBD.filestoreid,
        FBD.documentuid,
        FBD.createdby as documentCreatedBy,
        FBD.lastmodifiedby as documentLastModifiedBy,
        FBD.createdtime as documentCreatedTime,
        FBD.lastmodifiedtime as documentLastModifiedTime
      FROM eg_fn_firenoc FN
      JOIN eg_fn_firenocdetail FD ON (FN.uuid = FD.firenocuuid)
      JOIN eg_fn_address FBA ON (FD.uuid = FBA.firenocdetailsuuid)
      JOIN eg_fn_owner FO ON (FD.uuid = FO.firenocdetailsuuid)
      JOIN eg_fn_buidlings FB ON (FD.uuid = FB.firenocdetailsuuid)
      JOIN eg_fn_buildinguoms FUOM ON (FB.uuid = FUOM.buildinguuid)
      LEFT OUTER JOIN eg_fn_buildingdocuments FBD ON (FB.uuid = FBD.buildinguuid)
  `;

  let whereClause = "";
  let conditions = [];

  // Add tenantId filter
  if (queryObj.tenantId) {
    conditions.push(`FN.tenantid = '${queryObj.tenantId}'`);
  }

  // Add applicationNumber filter
  if (queryObj.applicationNumber) {
    conditions.push(`FD.applicationnumber = '${queryObj.applicationNumber}'`);
  }

  // Add fireNOCNumber filter
  if (queryObj.fireNOCNumber) {
    conditions.push(`FN.fireNOCNumber = '${queryObj.fireNOCNumber}'`);
  }

  // Add status filter
  if (queryObj.status) {
    conditions.push(`FD.status = '${queryObj.status}'`);
  }

  // Add fireNOCType filter
  if (queryObj.fireNOCType) {
    conditions.push(`FD.firenoctype = '${queryObj.fireNOCType}'`);
  }

  // Add city filter
  if (queryObj.city) {
    conditions.push(`FBA.city = '${queryObj.city}'`);
  }

  // Add areaType filter
  if (queryObj.areaType) {
    conditions.push(`FBA.areatype = '${queryObj.areaType}'`);
  }

  // Add subDistrict filter
  if (queryObj.subDistrict) {
    conditions.push(`FBA.subdistrict = '${queryObj.subDistrict}'`);
  }

  // Add date range filters
  if (queryObj.fromDate && queryObj.toDate) {
    conditions.push(`FN.createdtime >= ${queryObj.fromDate} AND FN.createdtime <= ${queryObj.toDate}`);
  } else if (queryObj.fromDate) {
    conditions.push(`FN.createdtime >= ${queryObj.fromDate}`);
  }

  // Build WHERE clause
  if (conditions.length > 0) {
    whereClause = " WHERE " + conditions.join(" AND ");
  }

  // Add WHERE clause to query
  sqlQuery = sqlQuery + whereClause;

  // Close the subquery
  sqlQuery = sqlQuery + " ) s";

  // Add pagination
  const offset = queryObj.offset ? parseInt(queryObj.offset) : 0;
  const limit = queryObj.limit ? parseInt(queryObj.limit) : 10;
  const startRow = offset + 1;
  const endRow = offset + limit;

  sqlQuery = sqlQuery + ` WHERE s.rn BETWEEN ${startRow} AND ${endRow}`;

  console.log("PlainSearch SQL Query: " + sqlQuery);

  try {
    const dbResponse = await db.query(sqlQuery);

    if (dbResponse.rows && !isEmpty(dbResponse.rows)) {
      // Import merge function from search utils
      const { mergeSearchResults } = require("../utils/search");
      response.FireNOCs = await mergeSearchResults(
        dbResponse.rows,
        request.query,
        request.body.RequestInfo
      );
    } else {
      response.FireNOCs = [];
    }
  } catch (err) {
    console.error("PlainSearch Error: ", err);
    next({
      errorType: "custom",
      errorReponse: {
        ResponseInfo: requestInfoToResponseInfo(request.body.RequestInfo, false),
        Errors: [
          {
            code: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while searching FireNOCs",
            description: err.message
          }
        ]
      }
    });
    return null;
  }

  return response;
};
