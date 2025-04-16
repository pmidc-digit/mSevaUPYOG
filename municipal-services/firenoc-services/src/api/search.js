import { Router } from "express";
import { requestInfoToResponseInfo } from "../utils";
import { mergeSearchResults, searchByMobileNumber, mapIDsToList } from "../utils/search";
import isEmpty from "lodash/isEmpty";
import get from "lodash/get";
import some from "lodash/some";
import keys from "lodash/keys";
import { actions } from "../utils/search";
import { validateFireNOCSearchModel } from "../utils/modelValidation";
import envVariables from "../envVariables";
const asyncHandler = require("express-async-handler");
import db from "../db";

export default ({ config }) => {
  let api = Router();
  api.post(
    "/_search",
    asyncHandler(async (request, res, next) => {
      let response = await searchApiResponse(request, next);
      res.json(response);
    })
  );
  return api;
};
export const searchApiResponse = async (request, next = {}) => {
  let response = {
    ResponseInfo: requestInfoToResponseInfo(request.body.RequestInfo, true),
    FireNOCs: []
  };
  const queryObj = JSON.parse(JSON.stringify(request.query));
  //console.log("request", request.query);
  //console.log("Query object:"+JSON.stringify(queryObj));
  let errors = validateFireNOCSearchModel(queryObj);
  if (errors.length > 0) {
    next({
      errorType: "custom",
      errorReponse: {
        ResponseInfo: requestInfoToResponseInfo(request.body.RequestInfo, true),
        Errors: errors
      }
    });
    return;
  }
  console.log("QUERY OBJECT Test--> "+JSON.stringify(queryObj));
  let text =
    " SELECT * FROM (SELECT FN.uuid as FID,FN.tenantid,FN.fireNOCNumber,FN.islegacy,FN.provisionfirenocnumber,FN.oldfirenocnumber,FN.dateofapplied,FN.createdBy,FN.createdTime,FN.lastModifiedBy,FN.lastModifiedTime,FD.uuid as firenocdetailsid,FD.action,FD.applicationnumber,FD.fireNOCType,FD.applicationdate,FD.financialYear,FD.firestationid,FD.issuedDate,FD.validFrom,FD.validTo,FD.action,FD.status,FD.channel,FD.propertyid,FD.noofbuildings,FD.additionaldetail,FBA.uuid as puuid,FBA.doorno as pdoorno,FBA.latitude as platitude,FBA.longitude as plongitude,FBA.buildingName as pbuildingname,FBA.addressnumber as paddressnumber,FBA.pincode as ppincode,FBA.locality as plocality,FBA.landmark as landmark, FBA.addressline2,FBA.city as pcity, FBA.areatype as pareatype, FBA.subdistrict as psubdistrict, FBA.street as pstreet,FB.uuid as buildingid ,FB.name as buildingname,FB.usagetype,FB.usagesubtype,FB.leftsurrounding,FB.rightsurrounding,FB.frontsurrounding,FB.backsurrounding,FB.landarea,FB.totalcoveredarea,FB.parkingarea,FO.uuid as ownerid,FO.ownertype,FO.useruuid,FO.relationship,FUOM.uuid as uomuuid,FUOM.code,FUOM.value,FUOM.activeuom,FBD.uuid as documentuuid,FUOM.active,FBD.documentType,FBD.filestoreid,FBD.documentuid,FBD.createdby as documentCreatedBy,FBD.lastmodifiedby as documentLastModifiedBy,FBD.createdtime as documentCreatedTime,FBD.lastmodifiedtime as documentLastModifiedTime FROM eg_fn_firenoc FN JOIN eg_fn_firenocdetail FD ON (FN.uuid = FD.firenocuuid) JOIN eg_fn_address FBA ON (FD.uuid = FBA.firenocdetailsuuid) JOIN eg_fn_owner FO ON (FD.uuid = FO.firenocdetailsuuid) JOIN eg_fn_buidlings FB ON (FD.uuid = FB.firenocdetailsuuid) JOIN eg_fn_buildinguoms FUOM ON (FB.uuid = FUOM.buildinguuid) LEFT OUTER JOIN eg_fn_buildingdocuments FBD on(FB.uuid = FBD.buildinguuid)";
  // FBD.active=true AND FO.active=true AND FUOM.active=true AND";
  //if citizen
  const roles = get(request.body, "RequestInfo.userInfo.roles");
  const userUUID = get(request.body, "RequestInfo.userInfo.uuid");
  const isUser = some(roles, { code: "CITIZEN" }) && userUUID;
  console.log("isUser"+isUser)
  if (isUser) {
    const mobileNumber = get(request.body, "RequestInfo.userInfo.mobileNumber");
    const tenantId = get(request.body, "RequestInfo.userInfo.tenantId");
    
    const noFieldsPresent = null == queryObj.applicationNumber 
      && null == queryObj.createdby;

    if(noFieldsPresent) {
      queryObj.mobileNumber = queryObj.mobileNumber
      ? queryObj.mobileNumber
      : mobileNumber;
      }
    queryObj.tenantId = queryObj.tenantId ? queryObj.tenantId : tenantId;

    if(queryObj.tenantId == envVariables.EGOV_DEFAULT_STATE_ID)
      text = `${text} where FN.tenantid LIKE '${queryObj.tenantId}%' AND`;
    else
      text = `${text} where FN.tenantid = '${queryObj.tenantId}' AND`;
  } else {
    if (!isEmpty(queryObj) && !(keys(queryObj).length==2 && 
    queryObj.hasOwnProperty("offset") && queryObj.hasOwnProperty("limit"))) {
      text = text + " where ";
    }
    if (queryObj.tenantId) {
      if(queryObj.tenantId == envVariables.EGOV_DEFAULT_STATE_ID)
        text = `${text} FN.tenantid LIKE '${queryObj.tenantId}%' AND`;
      else
        text = `${text} FN.tenantid = '${queryObj.tenantId}' AND`;
    }
  }
  // if (queryObj.status) {
  //   queryObj.action = actions[queryObj.status];
  // }
  const queryKeys = Object.keys(queryObj);
  let sqlQuery = text;
  if (queryObj.hasOwnProperty("mobileNumber")) {
    // console.log("mobile number");
    let userSearchResponse = await searchByMobileNumber(
      queryObj.mobileNumber,
      envVariables.EGOV_DEFAULT_STATE_ID
    );

    //console.log("User Search Response-> " + userSearchResponse);
    //let searchUserUUID = get(userSearchResponse, "user.0.uuid");
    // if (searchUserUUID) {
    //   // console.log(searchUserUUID);
    var userSearchResponseJson = JSON.parse(JSON.stringify(userSearchResponse));
    var userUUIDArray = [];
    for (var i = 0; i < userSearchResponseJson.user.length; i++) {
      userUUIDArray.push(userSearchResponseJson.user[i].uuid);
    }
   console.log("User Search Response uuid-> " + userUUIDArray.length);

    let firenocIdQuery = `SELECT FN.uuid as FID FROM eg_fn_firenoc FN JOIN eg_fn_firenocdetail FD ON (FN.uuid = FD.firenocuuid) JOIN eg_fn_owner FO ON (FD.uuid = FO.firenocdetailsuuid) where `;

    console.log("roles.code"+roles[0].code)

    if (queryObj.tenantId) {
     // if (queryObj.tenantId == envVariables.EGOV_DEFAULT_STATE_ID) {
     if(roles[0].code=='CITIZEN'){
        //Remove Tenant Id in case of citizen
        //firenocIdQuery = `${firenocIdQuery} FN.tenantid LIKE '${queryObj.tenantId}%' AND`;
      } else {
        firenocIdQuery = `${firenocIdQuery} FN.tenantid = '${queryObj.tenantId}' AND`;
      }
    }

    /*
    if (isUser) {
      sqlQuery = `${sqlQuery} FO.useruuid='${searchUserUUID ||
        queryObj.mobileNumber}') AND`;
    } else {
        sqlQuery = `${sqlQuery} FO.useruuid in (`;
        if(userUUIDArray.length > 0){
          for(var j =0;j<userUUIDArray.length;j++){
            if(j==0)
              sqlQuery = `${sqlQuery}'${userUUIDArray[j]}'`;

            sqlQuery = `${sqlQuery}, '${userUUIDArray[j]}'`;
          }      
        }
        else
          sqlQuery = `${sqlQuery}'${queryObj.mobileNumber}'`;

        sqlQuery = `${sqlQuery}) AND`;  
    }*/

    if (userUUIDArray.length > 0) {
      firenocIdQuery = `${firenocIdQuery} FO.useruuid in (`;
      let firenocIdQuerydata
      for (var j = 0; j < userUUIDArray.length; j++) {
        if (j == 0) {
          firenocIdQuerydata = `'${userUUIDArray[j]}'`;
          //firenocIdQuery = `${firenocIdQuery}'${userUUIDArray[j]}'`;
        } else {
          //firenocIdQuery = `${firenocIdQuery}, '${userUUIDArray[j]}'`;
          firenocIdQuerydata = `${firenocIdQuerydata}, '${userUUIDArray[j]}'`;
        }
      }

      firenocIdQuery =`${firenocIdQuery} ${firenocIdQuerydata} ) or FN.createdby in (${firenocIdQuerydata})`
     // firenocIdQuery = `${firenocIdQuery} )`;

    } else firenocIdQuery = `${firenocIdQuery}'${queryObj.mobileNumber}'`;

    //firenocIdQuery = `${firenocIdQuery} )`;
    console.log("Firenoc ID Query -> " + firenocIdQuery);
    const dbResponse = await db.query(firenocIdQuery);
   // const dbResponse={"command":"SELECT","rowCount":1,"oid":null,"rows":[{"fid":"5ef0340c-38d2-4f7b-be36-0df89c80d98a"}],"fields":[{"name":"fid","tableID":1465020,"columnID":1,"dataTypeID":1043,"dataTypeSize":-1,"dataTypeModifier":68,"format":"text"}],"_parsers":[null],"_types":{"_types":{"arrayParser":{},"builtins":{"BOOL":16,"BYTEA":17,"CHAR":18,"INT8":20,"INT2":21,"INT4":23,"REGPROC":24,"TEXT":25,"OID":26,"TID":27,"XID":28,"CID":29,"JSON":114,"XML":142,"PG_NODE_TREE":194,"SMGR":210,"PATH":602,"POLYGON":604,"CIDR":650,"FLOAT4":700,"FLOAT8":701,"ABSTIME":702,"RELTIME":703,"TINTERVAL":704,"CIRCLE":718,"MACADDR8":774,"MONEY":790,"MACADDR":829,"INET":869,"ACLITEM":1033,"BPCHAR":1042,"VARCHAR":1043,"DATE":1082,"TIME":1083,"TIMESTAMP":1114,"TIMESTAMPTZ":1184,"INTERVAL":1186,"TIMETZ":1266,"BIT":1560,"VARBIT":1562,"NUMERIC":1700,"REFCURSOR":1790,"REGPROCEDURE":2202,"REGOPER":2203,"REGOPERATOR":2204,"REGCLASS":2205,"REGTYPE":2206,"UUID":2950,"TXID_SNAPSHOT":2970,"PG_LSN":3220,"PG_NDISTINCT":3361,"PG_DEPENDENCIES":3402,"TSVECTOR":3614,"TSQUERY":3615,"GTSVECTOR":3642,"REGCONFIG":3734,"REGDICTIONARY":3769,"JSONB":3802,"REGNAMESPACE":4089,"REGROLE":4096}},"text":{},"binary":{}},"RowCtor":null,"rowAsArray":false,"_prebuiltEmptyResultObject":{"fid":null}};

    let firenocIds = [];
    console.log("dbResponse" + JSON.stringify(dbResponse));
    if (dbResponse.err) {
      console.log(err.stack);
    } else {
      firenocIds =
        dbResponse.rows && !isEmpty(dbResponse.rows)
          ? mapIDsToList(dbResponse.rows)
          : [];
    }

    if (queryObj.hasOwnProperty("ids")) {
      queryObj.ids.push(...firenocIds);
    } else {
      queryObj.ids = firenocIds.toString();
    }
  }
  if (queryObj.hasOwnProperty("ids")) {
    // console.log(queryObj.ids.split(","));
    let ids = queryObj.ids.split(",");
    if(ids!=null && (ids.length>0 && ids[0]!=''))
    {
      sqlQuery = `${sqlQuery} FN.uuid IN ( `;
      for (var i = 0; i < ids.length; i++) {
        sqlQuery = `${sqlQuery} '${ids[i]}' `;
        if (i != ids.length - 1) sqlQuery = `${sqlQuery} ,`;
      }
        sqlQuery = `${sqlQuery} ) AND`;
    }
    if (ids.length > 1) sqlQuery = `${sqlQuery} ) AND`;
    else 
    {
      return response;
    }
  }

  if (queryKeys) {
    queryKeys.forEach(item => {
     if (queryObj[item]) {
      if (
      item != "fromDate" &&
          item != "toDate" &&
          item != "tenantId" &&
            item != "status" &&
          item != "ids" &&
          item != "mobileNumber" &&
             item != "offset" &&
             item !="limit"
        ) {
      sqlQuery = `${sqlQuery} ${item}= '${queryObj[item]}' AND`;
     // console.log("jghghghg")
     }
    }
 });
 }

 
 const offset= queryObj.offset ? queryObj["offset"] : "";
 const limit = queryObj["limit"] ? queryObj["limit"]: "";


 if(queryObj.hasOwnProperty("city"))
{     

 sqlQuery=`${sqlQuery}  FBA.city='${queryObj.city}' AND`;

}


if(queryObj.hasOwnProperty("fireNOCType"))
{     
  console.log("shdgsfdshdshfdv")
 sqlQuery=`${sqlQuery}  FD.firenoctype='${queryObj.fireNOCType}' AND`;

}
if(queryObj.hasOwnProperty("status"))
  {     
  
   sqlQuery=`${sqlQuery}  FD.status='${queryObj.status}' AND`;
  
  }

if(queryObj.hasOwnProperty("areaType"))
{     

 sqlQuery=`${sqlQuery}  FBA.areatype='${queryObj.areaType}' AND`;

}

if(queryObj.hasOwnProperty("subDistrict"))
{     

 sqlQuery=`${sqlQuery}  FBA.subdistrict='${queryObj.subDistrict}' AND`;

}

  if (
    queryObj.hasOwnProperty("fromDate") &&
    queryObj.hasOwnProperty("toDate")
  ) {
    sqlQuery = `${sqlQuery} FN.createdtime >= ${queryObj.fromDate} AND FN.createdtime <= ${queryObj.toDate} AND`;
  } else if (
    queryObj.hasOwnProperty("fromDate") &&
    !queryObj.hasOwnProperty("toDate")
  ) {
    sqlQuery = `${sqlQuery} FN.createdtime >= ${queryObj.fromDate} AND`;
  }

  
  

  if (!isEmpty(queryObj) && ( queryObj.hasOwnProperty("limit" || queryObj.hasOwnProperty("offset")))) {
    let offset =0;
    let limit =10;
    if( queryObj.hasOwnProperty("offset") ){
      offset = queryObj.offset*1;
      
   }
  if( queryObj.hasOwnProperty("limit") ){
    limit = (queryObj.limit*1)+offset;
 }
 if( offset !=0){
  offset = offset+1;
}
 if(keys(queryObj).length!=2){
  sqlQuery = `${sqlQuery.substring(0, sqlQuery.length - 3)} ) s WHERE s.rn  BETWEEN ${offset} AND ${limit+offset}   `;
 }else{
  sqlQuery = `${sqlQuery}  ) s WHERE s.rn  BETWEEN ${offset} AND ${limit} ORDER BY fid `;
 }
  
}else if(isEmpty(queryObj)){
  sqlQuery = `${sqlQuery}  ) s`;
}else if(!isEmpty(queryObj)){
  sqlQuery = `${sqlQuery.substring(0, sqlQuery.length - 3)}  ) s ORDER BY fid `;
}

  console.log("SQL QUery:" +sqlQuery);
  const dbResponse = await db.query(sqlQuery);
  //console.log("dbResponse"+JSON.stringify(dbResponse));
  if (dbResponse.err) {
    console.log(err.stack);
  } else {
   // console.log(JSON.stringify(dbResponse.rows));
    response.FireNOCs =
      dbResponse.rows && !isEmpty(dbResponse.rows)
        ? await mergeSearchResults(
            dbResponse.rows,
            request.query,
            request.body.RequestInfo
          )
        : [];
  }
  return response;

  // , async (err, dbRes) => {
  //   if (err) {
  //     console.log(err.stack);
  //   } else {
  //     // console.log(JSON.stringify(res.rows));
  //     response.FireNOCs =
  //       dbRes.rows && !isEmpty(dbRes.rows)
  //         ? await mergeSearchResults(
  //             dbRes.rows,
  //             request.query,
  //             request.body.RequestInfo
  //           )
  //         : [];
  //    return (response);
  //   }
  // });
};
