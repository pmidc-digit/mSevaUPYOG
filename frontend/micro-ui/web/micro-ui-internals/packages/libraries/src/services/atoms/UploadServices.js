import Axios from "axios";
import Urls from "./urls";
const BLOCKED_EXTENSIONS = [
  "js", "mjs", "cjs", "jsx", "ts", "tsx", "html", "htm", "exe", "bat", "cmd",
  "sh", "vbs", "ps1", "jar", "php", "py", "jsp", "asp", "aspx", "cgi", "msi", "dll", "com", "scr"
];

const checkFileSafety = (file) => {
  if (!file) return;
  if (file.size === 0) {
    throw new Error("File is empty or corrupted (0 bytes).");
  }
  const fileName = (file.name || "").toLowerCase();
  const dotCount = (fileName.match(/\./g) || []).length;
  if (dotCount > 1) {
    throw new Error("Files with double extension (e.g. .pdf.pdf) are not allowed.");
  }
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot === -1) {
    throw new Error("File must have a valid extension.");
  }
  const ext = fileName.substring(lastDot + 1);
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    throw new Error(`Files of type .${ext} are not allowed.`);
  }
};

export const UploadServices = {
  Filestorage: async (module, filedata, tenantId) => {
    checkFileSafety(filedata);
    const formData = new FormData();

    formData.append("file", filedata, filedata.name);
    formData.append("tenantId", tenantId);
    formData.append("module", module);
    let tenantInfo=window?.globalConfigs?.getConfig("ENABLE_SINGLEINSTANCE")?`?tenantId=${tenantId}`:"";
    var config = {
      method: "post",
      url:`${Urls.FileStore}${tenantInfo}`,   
      data: formData,
      //headers: { "auth-token": Digit.UserService.getUser() ? Digit.UserService.getUser()?.access_token : null},
    };

    return Axios(config);
  },

  MultipleFilesStorage: async (module, filesData, tenantId) => {
    const filesArray = Array.from(filesData || []);
    filesArray?.forEach((fileData) => fileData ? checkFileSafety(fileData) : null);
    const formData = new FormData();
    filesArray?.forEach((fileData, index) => fileData ? formData.append("file", fileData, fileData.name) : null);
    formData.append("tenantId", tenantId);
    formData.append("module", module);
    let tenantInfo=window?.globalConfigs?.getConfig("ENABLE_SINGLEINSTANCE")?`?tenantId=${tenantId}`:"";
    var config = {
      method: "post",
      url:`${Urls.FileStore}${tenantInfo}`, 
      data: formData,
     // headers: { 'Content-Type': 'multipart/form-data',"auth-token": Digit.UserService.getUser().access_token },
      headers: { 'Content-Type': 'multipart/form-data'},
    };

    return Axios(config);
  },

  Filefetch: async (filesArray, tenantId) => {
    let tenantInfo=window?.globalConfigs?.getConfig("ENABLE_SINGLEINSTANCE")?`?tenantId=${tenantId}`:"";
    var config = {
      method: "get",
      url:`${Urls.FileFetch}${tenantInfo}`, 
      params: {
        tenantId: tenantId,
        fileStoreIds: filesArray?.join(","),
      },
    };
    const res = await Axios(config);
    return res;
  },
};
