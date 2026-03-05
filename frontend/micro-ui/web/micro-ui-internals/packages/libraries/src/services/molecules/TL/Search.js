import cloneDeep from "lodash/cloneDeep";
import { TLService } from "../../elements/TL";

const stringReplaceAll = (str = "", searcher = "", replaceWith = "") => {
  if (searcher == "") return str;
  while (str.includes(searcher)) {
    str = str.replace(searcher, replaceWith);
  }
  return str;
};

/* methid to get date from epoch */
const convertEpochToDate = (dateEpoch) => {
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
const getAddress = (address, t) => {
  return `${address?.doorNo ? `${address?.doorNo}, ` : ""} ${address?.street ? `${address?.street}, ` : ""}${
    address?.landmark ? `${address?.landmark}, ` : ""
  }${t(Digit.Utils.pt.getMohallaLocale(address?.locality.code, address?.tenantId))}, ${t(Digit.Utils.pt.getCityLocale(address?.tenantId))}${
    address?.pincode && t(address?.pincode) ? `, ${address.pincode}` : " "
  }`;
};
export const TLSearch = {
  all: async (tenantId, filters = {}) => {
    const response = await TLService.TLsearch({ tenantId, filters });
    return response;
  },
  application: async (tenantId, filters = {}) => {
    const response = await TLService.TLsearch({ tenantId, filters });
    return response.Licenses[0];
  },

  numberOfApplications: async (tenantId, filters = {}) => {
    const response = await TLService.TLsearch({ tenantId, filters });
    return response.Licenses;
  },

  applicationDetails: async (t, tenantId, applicationNumber, userType) => {
    const filter = { applicationNumber };
    const response = await TLSearch.application(tenantId, filter);
    const propertyDetails =
      response?.tradeLicenseDetail?.additionalDetail?.propertyId &&
      (await Digit.PTService.search({ tenantId, filters: { propertyIds: response?.tradeLicenseDetail?.additionalDetail?.propertyId } }));
    let numOfApplications = [];
    if (response?.licenseNumber) {
      const licenseNumbers = response?.licenseNumber;
      const filters = { licenseNumbers, offset: 0 };
      numOfApplications = await TLSearch.numberOfApplications(tenantId, filters);
    }
    let propertyAddress = "";
    if (propertyDetails && propertyDetails?.Properties.length) {
      propertyAddress = getAddress(propertyDetails?.Properties[0]?.address, t);
    }
    let employeeResponse = [];
    console.log("response in TL: ", response);

    let applicationNoAndChannel = {
      title: " ",
      asSectionHeader: false,
      values: [
        { title: "TL_LOCALIZATION_APPLICATION_NO", value: response?.applicationNumber ? `${response?.applicationNumber}` : "NA" },
        // { title: "TL_APPLICATION_CHALLAN_LABEL", value: response?.tradeLicenseDetail?.channel ? `TL_CHANNEL_${response?.tradeLicenseDetail?.channel}` : "NA" },
      ],
    };

    if (response?.licenseNumber && applicationNoAndChannel?.values.filter((ob) => ob?.title === "TL_LOCALIZATION_LICENSE_NO")?.length <= 0) {
      applicationNoAndChannel?.values.push({
        title: "TL_COMMON_TABLE_COL_LIC_NO",
        value: response?.licenseNumber ? `${response?.licenseNumber}` : "NA",
      });
    }

    const tradedetails = {
      title: "TL_COMMON_TR_DETAILS",
      asSectionHeader: true,
      values: [
        { title: "TL_APPLICATION_TYPE", value: response?.applicationType ? `TRADELICENSE_APPLICATIONTYPE_${response?.applicationType}` : "NA" },
        { title: "TL_FINANCIAL_YEAR_LABEL", value: response?.financialYear ? `FY${response?.financialYear}` : "NA" },
        { title: "TL_NEW_TRADE_DETAILS_LIC_TYPE_LABEL", value: response?.licenseType ? `TRADELICENSE_LICENSETYPE_${response?.licenseType}` : "NA" },
        { title: "TL_COMMON_TABLE_COL_TRD_NAME", value: response?.tradeName },
        { title: "TL_OLD_RECEIPT_NO", value: response?.tradeLicenseDetail?.additionalDetail?.oldReceiptNo || "NA" },
        {
          title: "TL_NEW_TRADE_DETAILS_STRUCT_TYPE_LABEL",
          value: response?.tradeLicenseDetail?.structureType
            ? `COMMON_MASTERS_STRUCTURETYPE_${response?.tradeLicenseDetail?.structureType?.split(".")[0]}`
            : "NA",
        },
        {
          title: "TL_NEW_TRADE_DETAILS_STRUCT_SUB_TYPE_LABEL",
          value: response?.tradeLicenseDetail?.structureType
            ? `COMMON_MASTERS_STRUCTURETYPE_${stringReplaceAll(response?.tradeLicenseDetail?.structureType, ".", "_")}`
            : "NA",
        },
        {
          title: "TL_NEW_TRADE_DETAILS_TRADE_COMM_DATE_LABEL",
          value: response?.commencementDate ? convertEpochToDate(response?.commencementDate) : "NA",
        },
        {
          title: "TL_NEW_TRADE_DETAILS_TRADE_GST_NO_LABEL",
          value: response?.tradeLicenseDetail?.additionalDetail?.gstNo || response?.tradeLicenseDetail?.additionalDetail?.tradeGstNo || "NA",
        },
        { title: "TL_NEW_TRADE_DETAILS_OPR_AREA_LABEL", value: response?.tradeLicenseDetail?.operationalArea || "NA" },
        { title: "TL_NEW_TRADE_DETAILS_NO_EMPLOYEES_LABEL", value: response?.tradeLicenseDetail?.noOfEmployees || "NA" },
        { title: "TL_VALIDITY_YEARS", value: response?.tradeLicenseDetail?.additionalDetail?.validityYears || "NA" },
      ],
    };

    const tradeUnits = {
      title: "TL_NEW_TRADE_DETAILS_TRADE_UNIT_HEADER",
      additionalDetails: {
        units: response?.tradeLicenseDetail?.tradeUnits?.map((unit, index) => {
          let tradeSubType = stringReplaceAll(unit?.tradeType, ".", "_");
          tradeSubType = stringReplaceAll(tradeSubType, "-", "_");
          return {
            title: "TL_NEW_TRADE_DETAILS_TRADE_UNIT_HEADER",
            values: [
              {
                title: "TRADELICENSE_TRADECATEGORY_LABEL",
                value: unit?.tradeType ? `TRADELICENSE_TRADETYPE_${unit?.tradeType?.split(".")[0]}` : "NA",
              },
              { title: "TRADELICENSE_TRADETYPE_LABEL", value: unit?.tradeType ? `TRADELICENSE_TRADETYPE_${unit?.tradeType?.split(".")[1]}` : "NA" },
              { title: "TL_NEW_TRADE_DETAILS_TRADE_SUBTYPE_LABEL", value: tradeSubType ? `TRADELICENSE_TRADETYPE_${tradeSubType}` : "NA" },
              { title: "TL_NEW_TRADE_DETAILS_UOM_UOM_PLACEHOLDER", value: unit?.uom || "NA" },
              { title: "TL_NEW_TRADE_DETAILS_UOM_VALUE_LABEL", value: unit?.uomValue || "NA" },
            ],
          };
        }),
      },
    };

    const accessories = {
      title: "TL_NEW_TRADE_DETAILS_HEADER_ACC",
      // asSectionHeader: true,
      additionalDetails: {
        accessories: response?.tradeLicenseDetail?.accessories?.map((unit, index) => {
          let accessoryCategory = "NA";
          if (unit?.accessoryCategory) {
            accessoryCategory = stringReplaceAll(unit?.accessoryCategory, ".", "_");
            accessoryCategory = `TRADELICENSE_ACCESSORIESCATEGORY_${stringReplaceAll(accessoryCategory, "-", "_")}`;
          }
          return {
            title: "TL_ACCESSORY_LABEL",
            values: [
              { title: "TL_NEW_TRADE_DETAILS_ACC_LABEL", value: accessoryCategory },
              { title: "TL_NEW_TRADE_DETAILS_UOM_UOM_PLACEHOLDER", value: unit?.uom || "NA" },
              { title: "TL_NEW_TRADE_DETAILS_UOM_VALUE_LABEL", value: unit?.uomValue || "NA" },
              { title: "TL_ACCESSORY_COUNT_LABEL", value: unit?.count || "NA" },
            ],
          };
        }),
      },
    };
    const reversedOwners = Array.isArray(propertyDetails?.Properties?.[0]?.owners) ? propertyDetails?.Properties?.[0]?.owners.slice().reverse() : [];
    const PropertyDetail = {
      title: "PT_DETAILS",
      values: [
        { title: "TL_PROPERTY_ID", value: propertyDetails?.Properties?.[0]?.propertyId || "NA" },
        { title: "PT_OWNER_NAME", value: reversedOwners[0]?.name || "NA" },
        { title: "PROPERTY_ADDRESS", value: propertyAddress || "NA" },
        {
          title: "TL_VIEW_PROPERTY_DETAIL",
          to: `/digit-ui/employee/commonpt/view-property?propertyId=${propertyDetails?.Properties?.[0]?.propertyId}&tenantId=${propertyDetails?.Properties?.[0]?.tenantId}&from=TL_APPLICATION_DETAILS_LABEL`,
          value: "",
          isLink: true,
        },
      ],
    };

    const cityOfApp = cloneDeep(response?.tradeLicenseDetail?.address?.city);
    const localityCode = cloneDeep(response?.tradeLicenseDetail?.address?.locality?.code);
    const tradeAddress = {
      title: "TL_NEW_TRADE_DETAILS_HEADER_TRADE_LOC_DETAILS",
      values: [
        { title: "TL_PROPERTY_ASSESSMENT_ID", value: response?.tradeLicenseDetail?.additionalDetail?.propertyId || "NA" },
        { title: "CORE_COMMON_PINCODE", value: response?.tradeLicenseDetail?.address?.pincode || "NA" },
        { title: "MYCITY_CODE_LABEL", value: response?.tradeLicenseDetail?.address?.city || "NA" },
        { title: "TL_LOCALIZATION_LOCALITY", value: `${stringReplaceAll(cityOfApp?.toUpperCase(), ".", "_")}_REVENUE_${localityCode}` },
        { title: "TL_DOOR_HOUSE_NO", value: response?.tradeLicenseDetail?.address?.doorNo || "NA" },
        { title: "TL_NEW_TRADE_DETAILS_BLDG_NAME_LABEL", value: response?.tradeLicenseDetail?.address?.buildingName || "NA" },
        { title: "TL_LOCALIZATION_STREET_NAME", value: response?.tradeLicenseDetail?.address?.street || "NA" },
        { title: "TL_ELECTRICITY_CONNECTION_NO", value: response?.tradeLicenseDetail?.address?.electricityNo || "NA" },
      ],
    };

    const checkOwnerLength = response?.tradeLicenseDetail?.owners?.length || 1;
    const owners = response?.tradeLicenseDetail?.subOwnerShipCategory.includes("INSTITUTIONAL")
      ? {
          title: "ES_NEW_APPLICATION_OWNERSHIP_DETAILS",
          additionalDetails: {
            owners: response?.tradeLicenseDetail?.owners?.map((owner, index) => {
              let subOwnerShipCategory = response?.tradeLicenseDetail?.subOwnerShipCategory
                ? `COMMON_MASTERS_OWNERSHIPCATEGORY_${stringReplaceAll(response?.tradeLicenseDetail?.subOwnerShipCategory, ".", "_")}`
                : "NA";
              return {
                title: Number(checkOwnerLength) > 1 ? "TL_PAYMENT_PAID_BY_PLACEHOLDER" : "",
                values: [
                  { title: "TL_NEW_OWNER_DETAILS_OWNERSHIP_TYPE_LABEL", value: subOwnerShipCategory },
                  { title: "TL_INSTITUTION_NAME_LABEL", value: response?.tradeLicenseDetail?.institution?.instituionName || "NA" },
                  { title: "TL_NEW_OWNER_DESIG_LABEL", value: response?.tradeLicenseDetail?.institution?.designation || "NA" },
                  {
                    title: "TL_TELEPHONE_NUMBER_LABEL",
                    value:
                      response?.tradeLicenseDetail?.institution?.contactNo || response?.tradeLicenseDetail?.institution?.contactNo !== ""
                        ? response?.tradeLicenseDetail?.institution?.contactNo
                        : "NA",
                  },
                  { title: "TL_OWNER_S_MOBILE_NUM_LABEL", value: owner?.mobileNumber || "NA" },
                  { title: "TL_NEW_OWNER_DETAILS_NAME_LABEL", value: response?.tradeLicenseDetail?.institution?.name || "NA" },
                  { title: "TL_NEW_OWNER_DETAILS_EMAIL_LABEL", value: owner?.emailId || owner?.emailId !== "" ? owner?.emailId : "NA" },
                ],
              };
            }),
            documents: [
              {
                title: "PT_COMMON_DOCS",
                values: response?.tradeLicenseDetail?.applicationDocuments?.map((document) => {
                  return {
                    title: `TL_NEW_${document?.documentType.replace(".", "_")}`,
                    documentType: document?.documentType,
                    documentUid: document?.documentUid,
                    fileStoreId: document?.fileStoreId,
                  };
                }),
              },
            ],
          },
        }
      : {
          title: "ES_NEW_APPLICATION_OWNERSHIP_DETAILS",
          additionalDetails: {
            owners: response?.tradeLicenseDetail?.owners
              .sort((a, b) => a?.additionalDetails?.ownerSequence - b?.additionalDetails?.ownerSequence)
              .map((owner, index) => {
                let subOwnerShipCategory = response?.tradeLicenseDetail?.subOwnerShipCategory
                  ? `COMMON_MASTERS_OWNERSHIPCATEGORY_${stringReplaceAll(response?.tradeLicenseDetail?.subOwnerShipCategory, ".", "_")}`
                  : "NA";
                return {
                  title: Number(checkOwnerLength) > 1 ? "TL_PAYMENT_PAID_BY_PLACEHOLDER" : "",
                  values: [
                    { title: "TL_NEW_OWNER_DETAILS_OWNERSHIP_TYPE_LABEL", value: subOwnerShipCategory },
                    { title: "TL_TYPE_OF_SUB_OWNERSHIP", value: response?.tradeLicenseDetail?.subOwnerShipCategory ? `COMMON_MASTERS_OWNERSHIPCATEGORY_${response?.tradeLicenseDetail?.subOwnerShipCategory?.split(".")[0]}` : "NA" },
                    { title: "TL_NEW_OWNER_DETAILS_NAME_LABEL", value: owner?.name || "NA" },
                    { title: "TL_NEW_OWNER_DETAILS_MOB_NO_LABEL", value: owner?.mobileNumber || "NA" },
                    { title: "TL_NEW_OWNER_DETAILS_FATHER_NAME_LABEL", value: owner?.fatherOrHusbandName || "NA" },
                    { title: "TL_COMMON_RELATIONSHIP_LABEL", value: owner?.relationship || "NA" },
                    { title: "TL_NEW_OWNER_DETAILS_GENDER_LABEL", value: owner?.gender || "NA" },
                    { title: "TL_NEW_OWNER_DETAILS_EMAIL_LABEL", value: owner?.emailId || "NA" },
                    {
                      title: "TL_NEW_OWNER_DETAILS_SPL_OWN_CAT_LABEL",
                      value: owner?.ownerType ? `COMMON_MASTERS_OWNERTYPE_${owner?.ownerType}` : "NA",
                    },
                    { title: "TL_NEW_OWNER_DETAILS_ADDR_LABEL", value: owner?.permanentAddress || "NA" },
                  ],
                };
              }),
            documents: [
              {
                title: "PT_COMMON_DOCS",
                values: response?.tradeLicenseDetail?.applicationDocuments?.map((document) => {
                  return {
                    title: `TL_NEW_${document?.documentType.replace(".", "_")}`,
                    documentType: document?.documentType,
                    documentUid: document?.documentUid,
                    fileStoreId: document?.fileStoreId,
                  };
                }),
              },
            ],
          },
        };

    if (response?.workflowCode == "NewTL" && response?.status !== "APPROVED") {
      const details = {
        title: "",
        values: [
          { title: "TL_COMMON_TABLE_COL_APP_NO", value: response?.applicationNumber || "NA" },
          {
            title: "TL_APPLICATION_CHALLAN_LABEL",
            value: (response?.tradeLicenseDetail?.channel && `TL_CHANNEL_${response?.tradeLicenseDetail?.channel}`) || "NA",
          },
        ],
      };
      response && employeeResponse.push(details);
    }

    response && employeeResponse.push(applicationNoAndChannel);
    response && employeeResponse.push(tradedetails);
    response?.tradeLicenseDetail?.tradeUnits && employeeResponse.push(tradeUnits);
    response?.tradeLicenseDetail?.accessories && employeeResponse.push(accessories);
    propertyDetails?.Properties?.length > 0 && employeeResponse.push(PropertyDetail);
    response && !(propertyDetails?.Properties?.length > 0) && employeeResponse.push(tradeAddress);
    response?.tradeLicenseDetail?.owners && employeeResponse.push(owners);

    return {
      tenantId: response.tenantId,
      applicationDetails: employeeResponse,
      additionalDetails: response?.additionalDetails,
      applicationData: response,
      numOfApplications: numOfApplications,
    };
  },
};
