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

export const amountToWords =(num) =>{
  if (num == null || num === "") return "Zero Rupees";
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
                "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen",
                "Seventeen","Eighteen","Nineteen"],
        tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"],
        units = ["","Thousand","Lakh","Crore"];

  const chunk = n => n < 20 ? ones[n] :
                 n < 100 ? tens[Math.floor(n/10)] + (n%10? " " + ones[n%10]:"") :
                 ones[Math.floor(n/100)] + " Hundred" + (n%100? " " + chunk(n%100):"");

  const toWords = n => {
    if (!n) return "";
    let parts = [n%1000], res = "";
    n = Math.floor(n/1000);
    while(n){ parts.push(n%100); n=Math.floor(n/100); }
    for(let j=parts.length-1;j>=0;j--) if(parts[j]) res += chunk(parts[j])+" "+units[j]+" ";
    return res.trim();
  };

  let [r,p] = num.toString().split(".").map(x=>+x||0);
  return (r? "Rupees "+toWords(r):"") + (p? (r?" and ":"")+toWords(p)+" Paise":"") || "Rupees Zero ";
}

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



export function buildFeeHistoryByTax(calculations = [], { newestFirst = true, limit = null } = {}) {
  const map = {};
  if (!Array.isArray(calculations)) return map;
  const calcs = [...calculations];
  calcs.sort((a, b) => (a.when || 0) - (b.when || 0));
  const prevEstimates = {};
  calcs.forEach((calc) => {
    const estimates = calc?.taxHeadEstimates || [];
    let anyChanged = false;
    estimates.forEach((th) => {
      if (!th?.taxHeadCode) return;
      const prev = prevEstimates[th.taxHeadCode];
      const curr = th?.estimateAmount ?? null;
      if (prev !== curr) anyChanged = true;
    });
    estimates.forEach((th) => {
      if (!th?.taxHeadCode) return;
      prevEstimates[th.taxHeadCode] = th?.estimateAmount ?? null;
    });
    if (!anyChanged) return;
    estimates.forEach((th) => {
      if (!th?.taxHeadCode) return;
      map[th.taxHeadCode] = map[th.taxHeadCode] || [];
      map[th.taxHeadCode].push({
        who: calc?.updatedBy ?? null,
        estimateAmount: th?.estimateAmount ?? null,
        remarks: th?.remarks ?? null,
        isLatest: calc?.isLatest ?? false,
        when: calc?.when ?? null,
      });
    });
  });
  Object.keys(map).forEach((k) => {
    map[k].sort((a, b) => (newestFirst ? (b.when || 0) - (a.when || 0) : (a.when || 0) - (b.when || 0)));
    if (limit && typeof limit === "number") {
      map[k] = map[k].slice(0, limit);
    }
  });
  return map;
}


export function formatDuration(totalTimeMs) {
  const totalSeconds = Math.floor(totalTimeMs / 1000);

  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

export const convertToDDMMYYYY = (dateString) => {
     if (!dateString) return "";

     const parts = dateString.split("-");
     if (parts.length !== 3) return dateString; // fallback

     const [a, b, c] = parts;

     // Case 1: already dd-mm-yyyy
     if (a.length === 2 && c.length === 4) {
       return dateString;
     }

     // Case 2: yyyy-mm-dd → dd-mm-yyyy
     if (a.length === 4) {
       return `${c}-${b}-${a}`;
     }

     // Case 3: mm-dd-yyyy → dd-mm-yyyy
     if (c.length === 4 && a.length === 2 && b.length === 2) {
       return `${b}-${a}-${c}`;
     }

     // Fallback: return original
     return dateString;
   };


export const formatDateForInput = (dateString) => {
  if (!dateString) return "";

  // Already in yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;

  // Handle dd-mm-yyyy
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split("-");
    const date = new Date(`${year}-${month}-${day}`);
    if (isNaN(date)) return "";
    return date.toISOString().split("T")[0];
  }

  // Handle mm/dd/yyyy
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    const [month, day, year] = dateString.split("/");
    const date = new Date(`${year}-${month}-${day}`);
    if (isNaN(date)) return "";
    return date.toISOString().split("T")[0];
  }

  // Fallback for other formats
  const date = new Date(dateString);
  if (isNaN(date)) return "";
  return date.toISOString().split("T")[0];
};

export const downloadPdf = (blob, fileName) => {
    if (window.mSewaApp && window.mSewaApp.isMsewaApp() && window.mSewaApp.downloadBase64File) {
      var reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function () {
        var base64data = reader.result;
        mSewaApp.downloadBase64File(base64data, fileName);
      };
    } else {
      const link = document.createElement("a");
      // create a blobURI pointing to our Blob
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      // some browser needs the anchor to be in the doc
      document.body.append(link);
      link.click();
      link.remove();
      // in case the Blob uses a lot of memory
      setTimeout(() => URL.revokeObjectURL(link.href), 7000);
    }
};

export const downloadPdfFromURL = async (receiptUrl) => {
  const urlObj = new URL(receiptUrl);
  const downloadUrl = `${window.origin}${urlObj.pathname}${urlObj.search}`;
  try {
    const res = await fetch(downloadUrl);
    const blob = await res.blob();

    // Use your helper to force download
    downloadPdf(blob, "Document.pdf");
  } catch (err) {
    console.log(err, "error in receipt download");
    window.open(downloadUrl, "_blank");
  }
};





