import request from "request";
import fs from "fs";
import get from "lodash/get";
import axios, { post } from "axios";
var FormData = require("form-data");
import envVariables from "../EnvironmentVariables";

let egovFileHost = envVariables.EGOV_FILESTORE_SERVICE_HOST;
let externalHost = envVariables.EGOV_EXTERNAL_HOST;

/**
 *
 * @param {*} filename -name of localy stored temporary file
 * @param {*} tenantId - tenantID
 */
export const fileStoreAPICall = async function(filePath, tenantId) {

  try {
    // 🔍 Validate file exists
    if (!fs.existsSync(filePath)) {
      throw new Error("File does not exist: " + filePath);
    }

    const url = `${egovFileHost.replace(/\/$/, "")}/filestore/v1/files?tenantId=${tenantId}&module=pdfgen&tag=00040-2017-QR`;

    // 🔍 Debug file size
    const stats = fs.statSync(filePath);
    console.log("Uploading file:", filePath, "Size (MB):", stats.size / (1024 * 1024));

    if (stats.size === 0) {
      throw new Error("File is empty: " + filePath);
    }

    const form = new FormData();

    // ✅ ALWAYS create stream here (never pass from outside)
    const fileStream = fs.createReadStream(filePath);

    form.append("file", fileStream, {
      filename: filePath.split("/").pop(),
      contentType: "application/pdf"
    });

    const response = await axios.post(url, form, {
      headers: {
        ...form.getHeaders()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log(response.data, "files[0].fileStoreId");

    return get(response.data, "files[0].fileStoreId");

  } catch (error) {
    //console.error("UPLOAD STATUS:", error.response.status);
    console.error("UPLOAD ERROR:", error.response.data || error.message);
    throw error;
  }
};
export async function getFilestoreUrl(filestoreid, tenantId){
  var url = `${egovFileHost}/filestore/v1/files/url?tenantId=${tenantId}&fileStoreIds=${filestoreid}`;
  let response = await axios.get(url);
  let data = response.data;
  var fileURL = data['fileStoreIds'][0]['url'].split(",");
  var shorteningUrl = getShortneningUrl(fileURL[0]);
  return shorteningUrl;
}

export async function getShortneningUrl(actualUrl){
  var url = `${externalHost}egov-url-shortening/shortener`;
  var request = {
    "url": actualUrl
  };

  let headers = {
    headers:{
      'Content-Type': 'application/json'
    }
  };

  let response = await axios.post(url,request, headers);
  let shortUrl = response.data;
  return shortUrl;
}
