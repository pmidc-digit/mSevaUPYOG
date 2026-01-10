import React from "react";

export const shouldHideBackButton = (config = []) => {
  return config.filter((key) => window.location.href.includes(key.screenPath)).length > 0 ? true : false;
};

/* methid to get date from epoch */
export const convertEpochToDate = (dateEpoch) => {
  // Returning null in else case because new Date(null) returns initial date from calender
  if (dateEpoch) {
    const dateFromApi = new Date(dateEpoch);
    let month = dateFromApi.getMonth() + 1;
    let day = dateFromApi.getDate();
    let year = dateFromApi.getFullYear();
    month = (month > 9 ? "" : "0") + month;
    day = (day > 9 ? "" : "0") + day;
    return `${day}/${month}/${year}`;
  } else {
    return null;
  }
};

export const EmployeeData = (tenantId, consumerCode) => {
  const wfData = Digit.Hooks.useWorkflowDetails({
    tenantId,
    id: consumerCode,
    moduleCode: "obpas_noc",
    role: "EMPLOYEE",
  });

  const officerInstance = wfData?.data?.processInstances?.find((pi) => pi?.action === "APPROVE");

  const codes = officerInstance?.assigner?.userName;
  const employeeData = Digit.Hooks.useEmployeeSearch(tenantId, { codes: codes, isActive: true }, { enabled: !!codes && !wfData?.isLoading });
  console.log("employeeData", employeeData);
  const officerRaw = employeeData?.data?.Employees?.[0];
  const officerAssignment = officerRaw?.assignments?.[0];

  const officer = officerRaw
    ? {
        code: officerRaw?.code,
        id: officerRaw?.id,
        name: officerRaw?.user?.name,
        department: officerAssignment?.department,
        designation: officerAssignment?.designation,
      }
    : null;

  return { officer };
};
export const stringReplaceAll = (str = "", searcher = "", replaceWith = "") => {
  if (searcher == "") return str;
  while (str.includes(searcher)) {
    str = str.replace(searcher, replaceWith);
  }
  return str;
};

export const businessServiceList = (isCode = false) => {
  let isSearchScreen = window.location.href.includes("/search");
  const availableBusinessServices = [
    {
      code: isSearchScreen ? "FIRE_NOC" : "FIRE_NOC_SRV",
      active: true,
      roles: ["FIRE_NOC_APPROVER"],
      i18nKey: "WF_FIRE_NOC_FIRE_NOC_SRV",
    },
    {
      code: isSearchScreen ? "AIRPORT_AUTHORITY" : "AIRPORT_NOC_SRV",
      active: true,
      roles: ["AIRPORT_AUTHORITY_APPROVER"],
      i18nKey: "WF_FIRE_NOC_AIRPORT_NOC_SRV",
    },
  ];

  const newAvailableBusinessServices = [];
  const loggedInUserRoles = Digit.UserService.getUser().info.roles;
  availableBusinessServices.map(({ roles }, index) => {
    roles.map((role) => {
      loggedInUserRoles.map((el) => {
        if (el.code === role) {
          isCode
            ? newAvailableBusinessServices.push(availableBusinessServices?.[index]?.code)
            : newAvailableBusinessServices.push(availableBusinessServices?.[index]);
        }
      });
    });
  });

  return newAvailableBusinessServices;
};

export const pdfDocumentName = (documentLink = "", index = 0) => {
  let documentName = decodeURIComponent(documentLink.split("?")[0].split("/").pop().slice(13)) || `Document - ${index + 1}`;
  return documentName;
};

export const pdfDownloadLink = (documents = {}, fileStoreId = "", format = "") => {
  let downloadLink = documents[fileStoreId] || "";
  let differentFormats = downloadLink?.split(",") || [];
  let fileURL = "";
  differentFormats.length > 0 &&
    differentFormats.map((link) => {
      if (!link.includes("large") && !link.includes("medium") && !link.includes("small")) {
        fileURL = link;
      }
    });
  return fileURL;
};

export const getPattern = (type) => {
  switch (type) {
    case "Name":
      return /^[^{0-9}^\$\"<>?\\\\~!@#$%^()+={}\[\]*,/_:;“”‘’]{1,50}$/i;
    case "MobileNo":
      return /^[6789][0-9]{9}$/i;
    case "Amount":
      return /^[0-9]{0,8}$/i;
    case "NonZeroAmount":
      return /^[1-9][0-9]{0,7}$/i;
    case "DecimalNumber":
      return /^\d{0,8}(\.\d{1,2})?$/i;
    //return /(([0-9]+)((\.\d{1,2})?))$/i;
    case "Email":
      return /^(?=^.{1,64}$)((([^<>()\[\]\\.,;:\s$*@'"]+(\.[^<>()\[\]\\.,;:\s@'"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})))$/i;
    case "Address":
      return /^[^\$\"<>?\\\\~`!@$%^()+={}\[\]*:;“”‘’]{1,500}$/i;
    case "PAN":
      return /^[A-Za-z]{5}\d{4}[A-Za-z]{1}$/i;
    case "TradeName":
      return /^[-@.\/#&+\w\s]*$/;
    //return /^[^\$\"'<>?\\\\~`!@#$%^()+={}\[\]*,.:;“”‘’]{1,100}$/i;
    case "Date":
      return /^[12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/i;
    case "UOMValue":
      return /^(0)*[1-9][0-9]{0,5}$/i;
    case "OperationalArea":
      return /^(0)*[1-9][0-9]{0,6}$/i;
    case "NoOfEmp":
      return /^(0)*[1-9][0-9]{0,6}$/i;
    case "GSTNo":
      return /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/i;
    case "DoorHouseNo":
      return /^[^\$\"'<>?\\\\~`!@$%^()+={}\[\]*:;“”‘’]{1,50}$/i;
    case "BuildingStreet":
      return /^[^\$\"'<>?\\\\~`!@$%^()+={}\[\]*.:;“”‘’]{1,64}$/i;
    case "Pincode":
      return /^[1-9][0-9]{5}$/i;
    case "Landline":
      return /^[0-9]{11}$/i;
    case "PropertyID":
      return /^[a-zA-z0-9\s\\/\-]$/i;
    case "ElectricityConnNo":
      return /^.{1,15}$/i;
    case "DocumentNo":
      return /^[0-9]{1,15}$/i;
    case "eventName":
      return /^[^\$\"<>?\\\\~`!@#$%^()+={}\[\]*,.:;“”]{1,65}$/i;
    case "eventDescription":
      return /^[^\$\"'<>?\\\\~`!@$%^()+={}\[\]*.:;“”‘’]{1,500}$/i;
    case "cancelChallan":
      return /^[^\$\"'<>?\\\\~`!@$%^()+={}\[\]*.:;“”‘’]{1,100}$/i;
    case "FireNOCNo":
      return /^[a-zA-Z0-9-]*$/i;
    case "consumerNo":
      return /^[a-zA-Z0-9/-]*$/i;
    case "AadharNo":
      //return /^\d{4}\s\d{4}\s\d{4}$/;
      return /^([0-9]){12}$/;
    case "ChequeNo":
      return /^(?!0{6})[0-9]{6}$/;
    case "Comments":
      return /^[^\$"'<>?\\~`!@$%^()+={}\[\]*.:;“”‘’]{1,}$/i;
    case "OldLicenceNo":
      return /^[a-zA-Z0-9-/]{0,64}$/;
  }
};

export const pdfDownloadLinkUpdated = (documents = {}, fileStoreId = "") => {
  return documents[fileStoreId] || "";
};
