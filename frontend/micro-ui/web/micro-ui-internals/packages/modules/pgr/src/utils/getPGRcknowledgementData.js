import { ComplaintDetails } from "../pages/employee/ComplaintDetails";

 const getMohallaLocale = (value = "", tenantId = "") => {
  let convertedValue = convertDotValues(tenantId);
  if (convertedValue == "NA" || !checkForNotNull(value)) {
    return "PGR_NA";
  }
  convertedValue = convertedValue.toUpperCase();
  return convertToLocale(value, `${convertedValue}_REVENUE`);
};
 const convertDotValues = (value = "") => {
  return (
    (checkForNotNull(value) && ((value.replaceAll && value.replaceAll(".", "_")) || (value.replace && stringReplaceAll(value, ".", "_")))) || "NA"
  );
};
 const stringReplaceAll = (str = "", searcher = "", replaceWith = "") => {
  if (searcher == "") return str;
  while (str.includes(searcher)) {
    str = str.replace(searcher, replaceWith);
  }
  return str;
};
 const checkForNotNull = (value = "") => {
  return value && value != null && value != undefined && value != "" ? true : false;
};
 const getCityLocale = (value = "") => {
  let convertedValue = convertDotValues(value);
  if (convertedValue == "NA" || !checkForNotNull(value)) {
    return "PGR_NA";
  }
  convertedValue = convertedValue.toUpperCase();
  return convertToLocale(convertedValue, `TENANT_TENANTS`);
};
 const convertToLocale = (value = "", key = "") => {
  let convertedValue = convertDotValues(value);
  if (convertedValue == "NA") {
    return "PGR_NA";
  }
  return `${key}_${convertedValue}`;
};
const capitalize = (text) => text.substr(0, 1).toUpperCase() + text.substr(1);
const ulbCamel = (ulb) => ulb.toLowerCase().split(" ").map(capitalize).join(" ");
const getPGRcknowledgementData = async ({complaintDetails,tenantInfo, t}) => {
      // Extract the service object from the nested structure
      const service = complaintDetails?.complaints?.response?.ServiceWrappers?.[0]?.service;
      
      if (!service) {
        console.error("Service data not found in complaintDetails");
        return null;
      }

      return {
        t: t,
        tenantId: tenantInfo?.code,
        name: `${t(tenantInfo?.i18nKey)} ${ulbCamel(t(`ULBGRADE_${tenantInfo?.city?.ulbGrade?.toUpperCase().replace(" ", "_").replace(".", "_")}`))}`,
        email: tenantInfo?.emailId,
        phoneNumber: tenantInfo?.contactNumber,
        heading: t("NEW_GRIEVANCE_APPLICATION"),
        applicationNumber: service.serviceRequestId,
        details: [
          {
            title: t("CS_TITLE_APPLICATION_DETAILS"),
            values: [
              {
                title: t("CS_COMPLAINT_FILED_DATE"),
                value: service.auditDetails?.createdTime 
                  ? Digit.DateUtils.ConvertTimestampToDate(service.auditDetails.createdTime, "dd/MM/yyyy")
                  : "NA",
              },
              {
                title: t("CS_COMPLAINT_TYPE"),
                value: service.serviceCode || "NA",
              },
              {
                title: t("CS_COMPLAINT_SUB_TYPE"),
                value: service.serviceDefCode || "NA",
              },
              {
                title: t("CS_COMPLAINT_PRIORITY_LEVEL"),
                value: service.priority || "NA",
              },
              {
                title: t("CS_COMPLAINT_ADDITIONAL_DETAILS"),
                value: service.additionalDetail?.comments || service.description || "NA",
              },
            ],
          },
          {
            title: t("PGR_ADDRESS_SUB_HEADER"),
            values: [
              { 
                title: t("PGR_ADDRESS_PINCODE"), 
                value: service.address?.pincode || "NA" 
              },
              { 
                title: t("PT_ADDRESS_CITY"), 
                value: t(getCityLocale(service.tenantId)) || "NA" 
              },
              {
                title: t("PT_ADDRESS_MOHALLA"),
                value: service.address?.locality?.code 
                  ? t(getMohallaLocale(service.address.locality.code, tenantInfo?.code)) 
                  : "NA",
              },
              { 
                title: t("PGR_ADDRESS_STREET_NAME"), 
                value: service.address?.street || "NA" 
              },
              { 
                title: t("PGR_ADDRESS_HOUSE_NO"), 
                value: service.address?.doorNo || "NA" 
              },
              { 
                title: t("PGR_ADDRESS_LANDMARK"), 
                value: service.address?.landmark || "NA" 
              },
            ],
          },
         
        ],
      };
    

  };
  
  export default getPGRcknowledgementData;