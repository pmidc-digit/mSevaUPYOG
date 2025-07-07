import { convertEpochToDate, stringReplaceAll } from "./index"; // Adjust path as needed

const formatFinancialYear = (year) => ({
    code: `${year}`,
    i18nKey: `FY${year}`
  });
  
  const formatStructureType = (structureType = "", t) => {
    if (!structureType) {
      return {
        structureType: { code: "", i18nKey: "" },
        structureSubType: { code: "", i18nKey: "" }
      };
    }
  
    const [type, subType] = structureType.split(".");
    const structureTypeI18nKey = `COMMON_MASTERS_STRUCTURETYPE_${stringReplaceAll((type || "").toUpperCase(), ".", "_")}`;
    const structureSubTypeI18nKey = `COMMON_MASTERS_STRUCTURETYPE_${stringReplaceAll((structureType || "").toUpperCase(), ".", "_")}`;
  
    return {
      structureType: {
        code: type || "",
        i18nKey: t ? t(structureTypeI18nKey) : structureTypeI18nKey
      },
      structureSubType: {
        code: structureType || "",
        i18nKey: t ? t(structureSubTypeI18nKey) : structureSubTypeI18nKey
      }
    };
  };
  
  const formatOwner = (owner, idx) => ({
    name: owner?.name || "",
    mobileNumber: owner?.mobileNumber || "",
    altContactNumber: owner?.altContactNumber || "",
    instituionName: "",
    fatherOrHusbandName: owner?.fatherOrHusbandName || "",
    relationship: {
      code: owner?.relationship || "FATHER",
      i18nKey: owner?.relationship ? `COMMON_RELATION_${owner.relationship}` : "COMMON_RELATION_FATHER"
    },
    emailId: owner?.emailId || "",
    permanentAddress: owner?.permanentAddress || "",
    correspondenceAddress: "",
    ownerType: {
      code: owner?.ownerType || "NONE",
      i18nKey: owner?.ownerType || "NONE",
      name: owner?.ownerType || "Not Applicable"
    },
    gender: {
      code: owner?.gender || "MALE",
      i18nKey: `TL_GENDER_${owner?.gender || "MALE"}`
    },
    key: Date.now() + idx,
    // id: owner?.id
  });
  
  const formatTradeUnit = (unit, idx, t) => {
    if (typeof unit?.tradeType !== "string") return unit;
  
    const tradeTypeOriginal = unit.tradeType;
    const code1 = stringReplaceAll(tradeTypeOriginal, "-", "_");
  
    return {
      tradeCategory: {
        code: tradeTypeOriginal.split(".")[0],
        i18nKey: `TRADELICENSE_TRADETYPE_${tradeTypeOriginal.split(".")[0]}`
      },
      tradeType: {
        code: tradeTypeOriginal.split(".")[1],
        i18nKey: `TRADELICENSE_TRADETYPE_${tradeTypeOriginal.split(".")[1]}`
      },
      tradeSubType: {
        code: tradeTypeOriginal,
        i18nKey: t ? t(`TRADELICENSE_TRADETYPE_${stringReplaceAll(code1, ".", "_")}`) : `TRADELICENSE_TRADETYPE_${stringReplaceAll(code1, ".", "_")}`,
        uom: unit?.uom || ""
      },
      uom: unit?.uom || "",
      uomValue: unit?.uomValue || "",
      key: Date.now() + (idx + 1) * 20,
      ownerType: {
        code: "NONE"
      },
      // id: unit?.id
    };
  };
  
  const formatAccessory = (acc, idx, t) => {
    console.log("acc",acc);
    console.log("acc=======",typeof acc?.accessoryCategory !== "string");
    console.log("coming here");
    
    if (typeof acc?.accessoryCategory !== "string") return acc;
   console.log("coming here not",idx);
    const accessoryI18nKey = `TRADELICENSE_ACCESSORIESCATEGORY_${stringReplaceAll(acc?.accessoryCategory || "", "-", "_")}`;
  
    return {
      accessoryCategory: {
        code: acc?.accessoryCategory || "",
        active: true,
        uom: acc?.uom || "",
        i18nKey: t ? t(accessoryI18nKey) : accessoryI18nKey
      },
      count: acc?.count || "",
      uom: acc?.uom || "",
      uomValue: acc?.uomValue || "",
      key: Date.now() + (idx + 1) * 20,
      // id: acc?.id,
      ownerType: {
        code: "NONE"
      }
    };
  };
  
  export const mapApplicationDataToDefaultValues = (applicationData, t, propertyId = null, propertyDetails = null) => {
    const tradeLicenseDetail = applicationData?.tradeLicenseDetail || {};
    const { structureType, structureSubType } = formatStructureType(tradeLicenseDetail?.structureType || "", t);
  
    const isImmovable = (tradeLicenseDetail?.structureType || "").split(".")[0] === "IMMOVABLE";
    console.log("ApplicationDataForMapFunction: ", applicationData?.licenseType);

  
    return {
      TraidDetails: {
        tradedetils: [
          {
            tradeName: applicationData?.tradeName || "",
            financialYear: formatFinancialYear(applicationData?.financialYear || ""),
            licenseType: {
              code: applicationData?.licenseType || "PERMANENT",
              active: true,
              i18nKey: `TRADELICENSE_LICENSETYPE_${applicationData?.licenseType || "PERMANENT"}`
            },
            structureType,
            structureSubType,
            commencementDate: applicationData?.commencementDate ? convertEpochToDate(applicationData?.commencementDate) : "",
            gstNo: tradeLicenseDetail?.additionalDetail?.gstNo || tradeLicenseDetail?.additionalDetail?.tradeGstNo || "",
            operationalArea: tradeLicenseDetail?.operationalArea || "",
            noOfEmployees: tradeLicenseDetail?.noOfEmployees || "",
            oldReceiptNo: "",
            key: Date.now()
          }
        ],
        tradeUnits: (tradeLicenseDetail?.tradeUnits || []).map((unit, idx) => formatTradeUnit(unit, idx, t)),
        accessories: (tradeLicenseDetail?.accessories || []).map((acc, idx) => formatAccessory(acc, idx, t)),
        validityYears: {
          code: 1,
          i18nKey: 1
        },
        cpt: {
          id: null,
          details: {}
        },
        address: {
          city: {
            code: applicationData?.tenantId || "",
            i18nKey: `TENANT_TENANTS_${(applicationData?.tenantId || "").toUpperCase().replace(".", "_")}`,
            name: applicationData?.tenantId || ""
          },
          locality: tradeLicenseDetail?.address?.locality?.code || "",
          // locality: {
          //   code: applicationData?.tradeLicenseDetail?.address?.locality?.code || "",
          //   i18nKey: applicationData?.tradeLicenseDetail?.address?.locality?.name.slice(0,applicationData?.tradeLicenseDetail?.address?.locality?.name.length - 5),
          //   name: applicationData?.tradeLicenseDetail?.address?.locality?.name || "",
          //   label: "Locality",
          // },
          street: tradeLicenseDetail?.address?.street || "",
          doorNo: tradeLicenseDetail?.address?.doorNo || "",
          electricityNo: tradeLicenseDetail?.address?.electricityNo || "",
          buildingName: tradeLicenseDetail?.address?.buildingName || ""
        }
      },
      OwnerDetails: {
        ownershipCategory: {
          value: tradeLicenseDetail?.subOwnerShipCategory || "",
          code: tradeLicenseDetail?.subOwnerShipCategory || "",
          i18nKey: `COMMON_MASTERS_OWNERSHIPCATEGORY_${(tradeLicenseDetail?.subOwnerShipCategory || "").replace(".", "_")}`
        },
        owners: (tradeLicenseDetail?.owners || []).map((owner, idx) => formatOwner(owner, idx))
      },
      // Documents: {
      //   documents: {
      //     documents: (tradeLicenseDetail?.applicationDocuments || []).map((doc) => ({
      //       id: doc?.id || "",
      //       documentType: doc?.documentType || "",
      //       fileStoreId: doc?.fileStoreId || "",
      //       tenantId: doc?.tenantId || ""
      //     }))
      //   }
      // },
      Documents: {
        documents: {
          documents: tradeLicenseDetail?.applicationDocuments
        }
      },
      cptId: {
        id: isImmovable ? propertyId : ""
      },
      cpt: {
        details: isImmovable ? propertyDetails?.Properties?.[0] || {} : {}
      },
      applicationData: applicationData
    };
  };