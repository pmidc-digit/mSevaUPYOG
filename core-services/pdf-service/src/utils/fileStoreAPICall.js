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
 * @param {*} filename - name of locally stored temporary file
 * @param {*} tenantId - tenantID
 * @param {*} fileData - buffer data
 * @param {*} module - module name
 * @param {*} tag - tag (e.g. consumerCode)
 * @param {*} expiryDate - expiry date in epoch milliseconds
 */
export const fileStoreAPICall = async function(filename, tenantId, fileData, module, tag, expiryDate) {
  var moduleParam = module || "pdfgen";
  var tagParam = tag || "00040-2017-QR";
  var url = `${egovFileHost}/filestore/v1/files?tenantId=${tenantId}&module=${encodeURIComponent(moduleParam)}&tag=${encodeURIComponent(tagParam)}`;
  if (expiryDate) {
    url += `&expiryDate=${expiryDate}`;
  }
  var form = new FormData({ maxDataSize: 80 * 1024 * 1024 });
  form.append("file", fileData, {
    filename: filename,
    contentType: "application/pdf"
  });
  try {
    let response = await axios.post(url, form, {
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      headers: {
        ...form.getHeaders()
      }
    });
    console.log(response.data, "files[0].fileStoreId");
    return get(response.data, "files[0].fileStoreId");
  } catch (error) {
    console.error("File upload failed:", error.response);
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