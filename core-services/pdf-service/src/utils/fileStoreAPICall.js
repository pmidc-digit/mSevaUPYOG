import request from "request";
import fs from "fs";
import get from "lodash/get";
import axios, { post } from "axios";
var FormData = require("form-data");
import envVariables from "../EnvironmentVariables";
import logger from "../config/logger";

let egovFileHost = envVariables.EGOV_FILESTORE_SERVICE_HOST;
let externalHost = envVariables.EGOV_EXTERNAL_HOST;
let urlShorteningHost = envVariables.EGOV_URL_SHORTENING_HOST || "http://egov-url-shortening:8080";

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
  try {
    var moduleParam = module || "pdfgen";
    var tagParam = tag || "00040-2017-QR";
    var url = `${egovFileHost}/filestore/v1/files?tenantId=${tenantId}&module=${encodeURIComponent(moduleParam)}&tag=${encodeURIComponent(tagParam)}`;
    let response = await new Promise((resolve, reject) => {
      var form = new FormData({ maxDataSize: 80 * 1024 * 1024 });
      form.on("error", reject);
      if (fileData && typeof fileData.once === "function") {
        fileData.once("error", reject);
      }
      form.append("file", fileData, {
        filename: filename,
        contentType: "application/pdf"
      });
      axios.post(url, form, {
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: { ...form.getHeaders() }
      }).then(resolve, reject);
    });
    const fileStoreId = get(response.data, "files[0].fileStoreId");
    if (!fileStoreId) {
      throw new Error("File upload response did not contain a fileStoreId");
    }
    return fileStoreId;
  } catch (error) {
    logger.error("File upload failed: " + (error.stack || error));
    throw error;
  }
};

export async function getFilestoreUrl(filestoreid, tenantId){
  try {
    var url = `${egovFileHost}/filestore/v1/files/url?tenantId=${tenantId}&fileStoreIds=${filestoreid}`;
    let response = await axios.get(url);
    let data = response.data;
    if (data && data['fileStoreIds'] && data['fileStoreIds'][0] && data['fileStoreIds'][0]['url']) {
      var fileURL = data['fileStoreIds'][0]['url'].split(",");
      var shorteningUrl = await getShortneningUrl(fileURL[0]);
      return shorteningUrl;
    }
    return "";
  } catch (err) {
    logger.error(`Error in getFilestoreUrl for fileStoreId ${filestoreid}: ${err.message || err}`);
    return "";
  }
}

export async function getShortneningUrl(actualUrl){
  try {
    var url = `${urlShorteningHost.replace(/\/+$/, '')}/egov-url-shortening/shortener`;
    var request = {
      "url": actualUrl
    };

    let response = await axios.post(url, request, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (err) {
    logger.warn(`Could not shorten URL (${err.message || err}). Falling back to actual URL.`);
    return actualUrl;
  }
}

export const deleteFileStoreFile = async function(fileStoreId, tenantId) {
  if (!fileStoreId || typeof fileStoreId !== 'string' || fileStoreId.trim() === '') {
    logger.warn(`[deleteFileStoreFile] Skipping delete call because fileStoreId is empty or invalid: '${fileStoreId}'`);
    return null;
  }
  var url = `${egovFileHost}/filestore/v1/files/_delete`;
  var payload = {
    RequestInfo: {
      apiId: "Rainmaker",
      ver: ".01",
      action: "_delete",
      did: "1",
      key: "",
      msgId: `${Date.now()}|en_IN`,
      authToken: "",
      userInfo: {
        id: envVariables.DELETE_AUTHORIZED_USER_ID,
        uuid: envVariables.DELETE_AUTHORIZED_USER_UUID,
        roles: [
          {
            code: envVariables.DELETE_AUTHORIZED_ROLE_CODE,
            name: "System"
          }
        ]
      }
    },
    tenantId: tenantId,
    fileStoreIds: [fileStoreId]
  };
  try {
    let response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json"
      }
    });
    logger.info(`Successfully deleted fileStoreId: ${fileStoreId} from filestore: ${JSON.stringify(response.data)}`);
    return response.data;
  } catch (error) {
    logger.error(`Failed to delete fileStoreId: ${fileStoreId} from filestore: ${error && error.response ? JSON.stringify(error.response.data) : error}`);
    throw error;
  }
};
