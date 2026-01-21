import cloneDeep from "lodash/cloneDeep";
import { useParams } from "react-router-dom";

export const getPattern = (type) => {
  switch (type) {
    case "Name":
      return /^[^{0-9}^\$\"<>?\\\\~!@#$%^()+={}\[\]*,/_:;“”‘’]{1,50}$/i;
    case "MobileNo":
      return /^[6-9]{1}[0-9]{9}$/i;
  }
};

export const stringReplaceAll = (str = "", searcher = "", replaceWith = "") => {
  if (searcher == "") return str;
  while (str.includes(searcher)) {
    str = str.replace(searcher, replaceWith);
  }
  return str;
};

export const sortDropdownNames = (options, optionkey, locilizationkey) => {
  return options.sort((a, b) => locilizationkey(a[optionkey]).localeCompare(locilizationkey(b[optionkey])));
};

export const uuidv4 = () => {
  return require("uuid/v4")();
};

export const EmployeeData = async (tenantId, consumerCode) => {
  const wfData = await Digit.WorkflowService.getDetailsById({
    tenantId,
    id: consumerCode,
    moduleCode: "obpas_noc",
    role: "EMPLOYEE",
    getTripData: false,
  });
  console.log("Workflow Data", wfData);

  const officerInstance = wfData?.processInstances?.find((pi) => pi?.action === "APPROVE");

  const codes = officerInstance?.assigner?.userName;
  const employeeData = await Digit.UserService.employeeSearch(tenantId, { codes: codes, isActive: true }, { enabled: !!codes && !wfData?.isLoading });
  console.log("employeeData", employeeData);
  const officerRaw = employeeData?.Employees?.[0];
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

export const getNOCSanctionLetter = async (application, t,EmpData) => {
  
  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const nocDetails = application?.nocDetails?.additionalDetails || {};
  const site = nocDetails?.siteDetails || {};

  const submittedOnDate = nocDetails?.SubmittedOn
    ? new Date(Number(nocDetails?.SubmittedOn))?.toLocaleDateString("en-GB")
    : "";

  const getFloorLabel = (index) => {
    if (index === 0) return t("NOC_GROUND_FLOOR_AREA_LABEL");

    const floorNumber = index;
    const lastDigit = floorNumber % 10;
    const lastTwoDigits = floorNumber % 100;

    let suffix = "th";
    if (lastTwoDigits < 11 || lastTwoDigits > 13) {
      if (lastDigit === 1) suffix = "st";
      else if (lastDigit === 2) suffix = "nd";
      else if (lastDigit === 3) suffix = "rd";
    }

    return `${floorNumber}${suffix} ${t("NOC_FLOOR_AREA_LABEL")}`;
  };
  let floorArea = [];
  let basementArea = site?.basementArea || " ";
  let totalFloorArea = site?.totalFloorArea || " ";

  if (site?.buildingStatus === "Built Up") {
    floorArea = (site?.floorArea || [])?.map((f, idx) => ({
      ...f,
      floorNo: getFloorLabel(idx),
    }));
  } else {
    floorArea = (site?.floorArea && site?.floorArea?.length > 0)
    ? site?.floorArea?.map(() => ({ floorNo: "", value: "" }))
    : [{ floorNo: "", value: "" }];
    basementArea = " ";
    totalFloorArea = " ";
  }

  const sanctionKeys = [
    "NOC_SANCTION_THREE",
    "NOC_SANCTION_FOUR",
    "NOC_SANCTION_FIVE",
    "NOC_SANCTION_SIX",
    "NOC_SANCTION_SEVEN",
    "NOC_SANCTION_EIGHT",
  ];

  const isProvisional = site?.specificationNocType === "Provisional";
  const activeKeys = isProvisional ? sanctionKeys : sanctionKeys.slice(1);

  const sanctionTerms = activeKeys?.map((key, idx) => ({
    number: 3 + idx,
    text: t(key),
  }));
  return {
    Noc: [
      {
       ...application, 
      nocDetails: {
        ...application.nocDetails,
        additionalDetails: {
          ...application.nocDetails?.additionalDetails,
          SubmittedOn: submittedOnDate,
          siteDetails: {
            ...site,
            floorArea,
            basementArea,
            totalFloorArea,
          },
        },
      },
      currentDate,
      sanctionTerms,
      ...EmpData,
      },
    ],
  };
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



export async function getBase64FromUrl(url) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = (err) => {
        console.error("FileReader error:", err);
        reject(err);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error in getBase64FromUrl:", error);
    return null; // safe fallback
  }
}


export async function getBase64Img(fileStoreId, state) {
  if (!fileStoreId || fileStoreId.length === 0) { return null; }
  try {
    let signUrl = null;

    if (fileStoreId?.length > 0) {
      const signUrlObj = await Digit.UploadServices.Filefetch([fileStoreId], state);
      signUrl = signUrlObj?.data[fileStoreId];
    }

    const baseUrl = window.location.origin;
    console.log('baseUrl', baseUrl);

    let finalUrl;
    if (signUrl?.includes("filestore")) {
      const splitURL = signUrl.split("filestore")?.[1];
      finalUrl = `${baseUrl}/filestore${splitURL}`;
    } else {
      // external URL, just use it directly
      finalUrl = signUrl;
    }
    console.log('finalUrl', finalUrl);

    const base64Image = signUrl
      ? await getBase64FromUrl(finalUrl)
      : baseUrl;

    return base64Image;
  } catch (error) {
    console.error("Error in getBase64Img:", error);
    return null; // return a safe fallback
  }
};


export const convertToNocObject = (data, datafromflow) => {
  let formData = { Noc: data };
  let doc =
    datafromflow?.nocDocuments?.nocDocuments.length > 0
      ? datafromflow?.nocDocuments?.nocDocuments
          .filter((n) => n.documentType.includes(data?.nocType?.split("_")[0]))
          .map((noc) => {
            return {
              fileName: noc?.fileName || "",
              name: noc?.name || "",
              fileStoreId: noc?.fileStoreId,
              fileUrl: "",
              isClickable: true,
              link: "",
              title: noc?.documentType,
              documentType: noc?.documentType,
              id: noc?.id,
              additionalDetails: {},
            };
          }) || []
      : [];
  doc = [
    ...doc,
    ...(datafromflow?.PrevStateNocDocuments
      ? datafromflow?.PrevStateNocDocuments.filter((n) => n.documentType.includes(data?.nocType?.split("_")[0]))
      : []),
  ];
  formData.Noc.documents = doc;
  return formData;
};

export const getBPAFormDataNewEDCR = async (data, edcrNumber, history, t) => {
  console.log(data, "PPPP");
  const edcrResponse = await Digit.OBPSService.scrutinyDetails(data?.tenantId, { edcrNumber: edcrNumber });
  const APIScrutinyDetails = edcrResponse?.edcrDetail[0];


  data.data = {
    scrutinyNumber: { edcrNumber: APIScrutinyDetails?.edcrNumber },
    applicationNo: data?.applicationNo,
  };
  data.uiFlow = {
    flow: data?.businessService.includes("OC") ? "OCBPA" : data?.businessService?.split(".")[0],
    applicationType: data?.additionalDetails?.applicationType || APIScrutinyDetails?.appliactionType,
    serviceType: data?.additionalDetails?.serviceType || APIScrutinyDetails?.applicationSubType,
  };

  if (data?.businessService.includes("OC")) {
    sessionStorage.setItem("BPAintermediateValue", JSON.stringify({ ...data }));
    history.push(
      `/digit-ui/citizen/obps/ocbpa/${data?.additionalDetails?.applicationType.toLowerCase()}/${data?.additionalDetails?.serviceType.toLowerCase()}`
    );
  } else {
    sessionStorage.setItem("BPAintermediateValue", JSON.stringify({ ...data }));
    history.push(`/digit-ui/citizen/obps/bpa/building_plan_scrutiny/new_construction/docs-required`);
  }
};

export const getBPAFormData = async (data, mdmsData, history, t, path) => {
  console.log(data, "PPPP");
  const edcrResponse = await Digit.OBPSService.scrutinyDetails(data?.tenantId, { edcrNumber: data?.edcrNumber });
  const APIScrutinyDetails = edcrResponse?.edcrDetail[0];
  const getBlockIds = (unit) => {
    let blocks = {};
    unit &&
      unit.map((ob, index) => {
        blocks[`Block_${index + 1}`] = ob.id;
      });
    return blocks;
  };

  const getBlocksforFlow = (unit) => {
    let arr = [];
    let subBlocks = [];
    let subOcc = {};
    unit &&
      unit.map((un, index) => {
        arr = un?.usageCategory?.split(",");
        subBlocks = [];
        arr &&
          arr?.length > 0 &&
          arr != "" &&
          arr.map((ob, ind) => {
            subBlocks.push({
              code: ob,
              i18nKey: `BPA_SUBOCCUPANCYTYPE_${ob.replaceAll(".", "_")}`,
              name: t(`BPA_SUBOCCUPANCYTYPE_${ob.replaceAll(".", "_")}`),
            });
          });
        subOcc[`Block_${index + 1}`] = subBlocks;
      });

    return subOcc;
  };

  // data.BlockIds = getBlockIds(data?.landInfo?.unit);
  // data.address = data?.landInfo?.address;
  // data.address.locality["i18nkey"] = `${t(
  //   `${stringReplaceAll(data?.landInfo?.address?.tenantId, ".", "_").toUpperCase()}_REVENUE_${data?.landInfo?.address?.locality?.code}`
  // )}`;
  // data.placeName = data?.additionalDetails?.GISPlaceName || "";
  data.data = {
    scrutinyNumber: { edcrNumber: APIScrutinyDetails?.edcrNumber },
    applicationNo: data?.applicationNo,
    // applicantName: APIScrutinyDetails?.planDetail?.planInformation?.applicantName,
    // applicationDate: data?.auditDetails?.createdTime,
    // applicationType: APIScrutinyDetails?.appliactionType,
    // holdingNumber: data?.additionalDetails?.holdingNo,
    // boundaryWallLength: data?.additionalDetails?.boundaryWallLength,
    // occupancyType: APIScrutinyDetails?.planDetail?.planInformation?.occupancy,
    // registrationDetails: data?.additionalDetails?.registrationDetails,
    // riskType: Digit.Utils.obps.calculateRiskType(
    //   mdmsData?.BPA?.RiskTypeComputation,
    //   APIScrutinyDetails?.planDetail?.plot?.area,
    //   APIScrutinyDetails?.planDetail?.blocks
    // ),
    // serviceType: data?.additionalDetails?.serviceType || APIScrutinyDetails?.applicationSubType,
  };

  // data?.landInfo.owners.map((owner, ind) => {
  //   owner.gender = {
  //     active: true,
  //     code: owner.gender,
  //     i18nKey: `COMMON_GENDER_${owner.gender}`,
  //   };
  // });

  // data.owners = {
  //   owners: data?.landInfo?.owners,
  //   ownershipCategory: data?.ownershipCategory?.code,
  // };

  // data.riskType = Digit.Utils.obps.calculateRiskType(
  //   mdmsData?.BPA?.RiskTypeComputation,
  //   APIScrutinyDetails?.planDetail?.plot?.area,
  //   APIScrutinyDetails?.planDetail?.blocks
  // );
  // data.subOccupancy = getBlocksforFlow(data?.landInfo?.unit);
  data.uiFlow = {
    flow: data?.businessService.includes("OC") ? "OCBPA" : data?.businessService?.split(".")[0],
    applicationType: data?.additionalDetails?.applicationType || APIScrutinyDetails?.appliactionType,
    serviceType: data?.additionalDetails?.serviceType || APIScrutinyDetails?.applicationSubType,
  };

  if (data?.businessService.includes("OC")) {
    sessionStorage.setItem("BPAintermediateValue", JSON.stringify({ ...data }));
    // history.push(
    //   `/digit-ui/citizen/obps/ocbpa/${data?.additionalDetails?.applicationType.toLowerCase()}/${data?.additionalDetails?.serviceType.toLowerCase()}`
    // );
    history.push(`/digit-ui/citizen/obps/ocbpa/building_plan_scrutiny/new_construction/docs-required`);
  } else {
    sessionStorage.setItem("BPAintermediateValue", JSON.stringify({ ...data }));
    history.push(`/digit-ui/citizen/obps/bpa/building_plan_scrutiny/new_construction/docs-required`);
  }
};

// export const getDocumentforBPA = (docs, PrevStateDocs) => {
//   let document = [];
//   docs &&
//   docs.map((ob) => {
//     console.log("ob",ob);
//     if (ob.id) {
//       let docObject = {
//         documentType: ob.documentType,
//         fileStoreId: ob.fileStoreId,
//         fileStore: ob.fileStoreId,
//         fileName: "",
//         fileUrl: "",
//         additionalDetails: {},
//         id: ob.id,
//       };

//       if (ob.documentType === "SITEPHOTOGRAPH.ONE") {
//         docObject.additionalDetails = {
//           latitude: ob?.additionalDetails?.latitude,
//           longitude: ob?.additionalDetails?.longitude,
//         };
//       }

//       document.push(docObject);
//     } else {
//       let docObject = {
//         documentType: ob.documentType,
//         fileStoreId: ob.fileStoreId,
//         fileStore: ob.fileStoreId,
//         fileName: "",
//         fileUrl: "",
//         additionalDetails: {},
//       };

//       if (ob.documentType === "SITEPHOTOGRAPH.ONE") {
//         docObject.additionalDetails = {
//           latitude: ob?.additionalDetails?.latitude,
//           longitude: ob?.additionalDetails?.longitude,
//         };
//       }

//       document.push(docObject);
//     }
//   });
//   document = [...document, ...(PrevStateDocs ? PrevStateDocs : [])];
//   return document;
// };
export const getDocumentforBPA = (docs, PrevStateDocs) => {
  let document = [];

  const architectConsentForm = {
    documentType: "ARCHITECT.UNDERTAKING",
    fileStoreId: sessionStorage.getItem("ArchitectConsentdocFilestoreid"),
    fileStore: sessionStorage.getItem("ArchitectConsentdocFilestoreid"),
  };

  console.log(architectConsentForm);

  docs &&
    docs.map((ob) => {
      console.log("ob", ob);
      let docObject;

      if (ob.id) {
        docObject = {
          documentType: ob.documentType,
          fileStoreId: ob.fileStoreId,
          fileStore: ob.fileStoreId,
          fileName: "",
          fileUrl: "",
          additionalDetails: {},
          id: ob.id,
        };

        if (ob.documentType === "SITEPHOTOGRAPH.ONE") {
          docObject.additionalDetails = {
            latitude: ob?.additionalDetails?.latitude,
            longitude: ob?.additionalDetails?.longitude,
          };
        }
      } else {
        docObject = {
          documentType: ob.documentType,
          fileStoreId: ob.fileStoreId,
          fileStore: ob.fileStoreId,
          fileName: "",
          fileUrl: "",
          additionalDetails: {},
        };

        if (ob.documentType === "SITEPHOTOGRAPH.ONE") {
          docObject.additionalDetails = {
            latitude: ob?.additionalDetails?.latitude,
            longitude: ob?.additionalDetails?.longitude,
          };
        }
      }

      document.push(docObject);
    });

  document.push(architectConsentForm);

  document = [...document, ...(PrevStateDocs ? PrevStateDocs : [])];
  return document;
};

function getusageCategoryAPI(arr) {
  let usageCat = "";
  arr.map((ob, i) => {
    usageCat = usageCat + (i !== 0 ? "," : "") + ob.code;
  });
  return usageCat;
}

export const getBPAUnit = (data) => {
  let units = [];
  let ob = data?.subOccupancy;
  if (ob) {
    let result = Object.entries(ob);
    data?.landInfo?.unit.map((oldUnit, ind) => {
      result.map((newunit, index) => {
        if (oldUnit.id && oldUnit.floorNo === newunit[0]?.split("_")[1]) {
          units.push({ ...oldUnit, usageCategory: getusageCategoryAPI(newunit[1]) });
        }
        // else{
        //   units.push({
        //       blockIndex:index,
        //       floorNo:newunit[0]?.split("_")[1],
        //       unitType:"Block",
        //       usageCategory:getusageCategoryAPI(newunit[1]),
        //   });
        // }
      });
    });
    result &&
      result.map((newunit, index) => {
        let found = units.length > 0 ? units?.some((el) => el?.floorNo === newunit[0]?.split("_")[1]) : false;
        if (!found) {
          units.push({
            blockIndex: index,
            floorNo: newunit[0]?.split("_")[1],
            unitType: "Block",
            usageCategory: getusageCategoryAPI(newunit[1]),
          });
        }
      });
  }
  return units.length > 0 ? units : data?.landInfo?.unit;
};

export const getBPAusageCategoryAPI = (arr) => {
  let usageCat = "";
  arr.map((ob, i) => {
    usageCat = usageCat + (i !== 0 ? "," : "") + ob.code;
  });
  return usageCat;
};

export const getBPAUnitsForAPI = (ob) => {
  let units = [];
  if (ob) {
    let result = Object.entries(ob);
    result.map((unit, index) => {
      units.push({
        blockIndex: index,
        floorNo: unit[0]?.split("_")[1],
        unitType: "Block",
        usageCategory: getusageCategoryAPI(unit[1]),
      });
    });
  }
  return units;
};

export const getunitforBPA = (units) => {
  let unit = [];
  units &&
    units.map((ob, index) => {
      unit.push({
        blockIndex: index,
        usageCategory: ob.usageCategory,
        occupancyType: ob.occupancyType,
        floorNo: ob.floorNo,
        unitType: ob.unitType,
        id: ob.id,
      });
    });
  return unit;
};

// export const getBPAOwners = (data) => {
//   let bpaownerarray = [];
//   data.landInfo.owners.map((oldowner) => {
//     data?.owners?.owners.map((newowner) => {
//       oldowner.gender = oldowner.gender.code?oldowner.gender.code:oldowner.gender;
//       newowner.gender = newowner.gender.code ?newowner.gender.code:newowner.gender;
//       if(oldowner.id === newowner.id)
//       {
//         if((oldowner.name !== newowner.name) || (oldowner.gender !== newowner.gender.code) || (oldowner.mobileNumber !== newowner.mobilenumber))
//         {
//         if (oldowner.name !== newowner.name)
//         {
//           oldowner.name = newowner.name;
//         }
//         if(oldowner.gender !== newowner.gender)
//         {
//           oldowner.gender = newowner.gender;
//         }
//         if(oldowner.mobileNumber !== newowner.mobilenumber)
//         {
//           oldowner.mobileNumber = newowner.mobileNumber;
//         }
//         let found = bpaownerarray.length > 0 ?bpaownerarray.some(el => el.id === oldowner.id):false;
//           if(!found)bpaownerarray.push(oldowner);
//       }
//         else
//         {
//           let found = bpaownerarray.length > 0 ? bpaownerarray.some(el => el.id === oldowner.id):false;
//           if(!found)bpaownerarray.push(oldowner);
//         }
//       }
//     })
//   })
//   data.landInfo.owners.map((oldowner) => {
//     let found = bpaownerarray.length > 0 ? bpaownerarray.some(el => el.id === oldowner.id):false;
//     if(!found)bpaownerarray.push({...oldowner,active:false});
//   })
//   data?.owners?.owners.map((ob) => {
//     if(!ob.id)
//     {
//       bpaownerarray.push({
//               mobileNumber: ob.mobileNumber,
//               name: ob.name,
//               fatherOrHusbandName: "",
//               relationship: "",
//               dob: null,
//               gender: ob.gender.code? ob.gender.code : ob.gender,
//             });
//     }
//   })
//   return bpaownerarray;
// }

export const getBPAOwners = (data, isOCBPA) => {
  if (isOCBPA) return data.landInfo.owners;
  let bpaownerarray = cloneDeep(data?.owners?.owners);
  bpaownerarray &&
    bpaownerarray?.forEach((newOwner) => {
      if (newOwner?.gender?.code) newOwner.gender = newOwner.gender?.code;
      if (!newOwner?.fatherOrHusbandName) newOwner.fatherOrHusbandName = "NAME";
      newOwner.active = true;
    });

  data?.landInfo?.owners?.map((oldowner) => {
    let found = bpaownerarray?.length > 0 ? bpaownerarray?.some((el) => el.id === oldowner.id) : false;
    if (!found) bpaownerarray?.push({ ...oldowner, active: false });
  });

  return bpaownerarray;
};

export const getOwnerShipCategory = (data, isOCBPA) => {
  if (isOCBPA) return data?.landInfo?.ownershipCategory;
  return data.owners.ownershipCategory || data?.landInfo?.ownershipCategory;
};

export const convertToBPAObject = (data, isOCBPA = false, isSendBackTOCitizen = false) => {
  if (isOCBPA) {
    data.landInfo = data.landInfo;
    data.landInfo.owners.forEach((owner, index) => {
      if (owner?.gender?.code) data.landInfo.owners[index].gender = owner?.gender?.code;
    });
  } else {
    data.landInfo.owners.map((owner, index) => {
      data.landInfo.owners[index].gender = owner?.gender?.code;
    });

    data.landInfo.address.pincode = data?.address?.pincode;
    data.landInfo.address.city = data?.address?.city?.code;
    data.landInfo.address.locality = data?.address?.locality;
    data.landInfo.address.landmark = data?.address?.landmark;
    data.landInfo.address.street = data?.address?.street ? data?.address?.street : null;
    data.landInfo.address.city = data?.landInfo?.address?.city?.code || data?.landInfo?.address?.tenantId;

    data.landInfo.unit =
      data?.landInfo?.unit && data?.landInfo?.unit.length > 0
        ? getunitforBPA(data?.landInfo?.unit)
        : data?.subOccupancy
        ? getBPAUnitsForAPI(data?.subOccupancy)
        : [];
  }

  let formData = {
    BPA: {
      id: data?.id,
      applicationNo: data?.applicationNo,
      approvalNo: data?.approvalNo,
      accountId: data?.accountId,
      edcrNumber: data?.edcrNumber,
      riskType: data?.riskType,
      businessService: data?.businessService,
      landId: data?.landId,
      tenantId: data?.tenantId || data?.address?.tenantId,
      approvalDate: data?.approvalDate,
      applicationDate: data?.applicationDate,
      status: isSendBackTOCitizen ? data.status : data.status ? data.status : "INITIATED",
      documents: getDocumentforBPA(data?.documents?.documents, data?.PrevStateDocuments),
      // landInfo: isOCBPA
      //   ? data?.landInfo
      //   : { ...data?.landInfo, ownershipCategory: getOwnerShipCategory(data, isOCBPA), owners: getBPAOwners(data, isOCBPA), unit: getBPAUnit(data) },

      landInfo: isOCBPA
        ? data?.landInfo
        : {
            ...data?.landInfo,
            ownershipCategory: getOwnerShipCategory(data, isOCBPA)?.code ?? getOwnerShipCategory(data, isOCBPA),
            owners: getBPAOwners(data, isOCBPA),
            unit: getBPAUnit(data),
          },

      assignee: isSendBackTOCitizen ? data.assignee : [],
      workflow: {
        action: "SEND_TO_CITIZEN",
        assignes: null,
        comments: null,
        varificationDocuments: null,
      },
      auditDetails: data?.auditDetails,
      additionalDetails: {
        ...data?.additionalDetails,
        OTPverfiedTimeSamp: sessionStorage.getItem("otpVerifiedTimestamp"),
        otherFeesDiscription: sessionStorage.getItem("otherChargesDisc"),
        lessAdjustmentFeeFiles: JSON.parse(sessionStorage.getItem("uploadedFileLess")),
        selfCertificationCharges: {
          BPA_MALBA_CHARGES: sessionStorage.getItem("Malbafees"),
          BPA_LABOUR_CESS: sessionStorage.getItem("LabourCess"),
          BPA_WATER_CHARGES: sessionStorage.getItem("WaterCharges"),
          BPA_GAUSHALA_CHARGES_CESS: sessionStorage.getItem("GaushalaFees"),
          BPA_LESS_ADJUSMENT_PLOT: sessionStorage.getItem("lessAdjusment"),
          BPA_DEVELOPMENT_CHARGES: sessionStorage.getItem("development"),
          BPA_OTHER_CHARGES: sessionStorage.getItem("otherCharges"),
        },

        GISPlaceName: data?.address?.placeName,
        holdingNo: data?.data?.holdingNumber ? data?.data?.holdingNumber : data?.additionalDetails?.holdingNo,
        boundaryWallLength: data?.data?.boundaryWallLength ? data?.data?.boundaryWallLength : data?.additionalDetails?.boundaryWallLength,
        registrationDetails: data?.data?.registrationDetails ? data?.data?.registrationDetails : data?.additionalDetails?.registrationDetails,
        architectconsentdocument: {
          documentType: "Architect Consent Form",
          fileStoreId: sessionStorage.getItem("ArchitectConsentform"),
          fileStore: sessionStorage.getItem("ArchitectConsentform"),
        },
      },
      applicationType: "BUILDING_PLAN_SCRUTINY",
      serviceType: "NEW_CONSTRUCTION",
      occupancyType: "A",
    },
  };

  return formData;
};

export const getapplicationdocstakeholder = (initial) => {
  let convertedDoc = [];
  initial.documents?.documents.map((ob) => {
    convertedDoc.push({
      fileStoreId: ob.fileStoreId,
      fileStore: ob.fileStoreId,
      fileName: ob.fileName,
      fileUrl: "",
      documentType: ob.documentType,
      tenantId: initial?.result?.Licenses[0]?.tenantId,
    });
  });
  return convertedDoc;
};

export const convertToStakeholderObject = (data) => {
  console.log("dataconvertToStakeholderObject", data);
  const { action } = useParams();
  let formData = {
    Licenses: [
      {
        ...data?.result?.Licenses[0],
        action: action || "APPLY",
        tradeLicenseDetail: {
          ...data?.result?.Licenses[0]?.tradeLicenseDetail,
          additionalDetail: {
            qualificationType:
              typeof data?.formData?.LicneseType?.qualificationType === "string"
                ? data?.formData?.LicneseType?.qualificationType
                : data?.formData?.LicneseType?.qualificationType?.name,
            counsilForArchNo: data?.formData?.LicneseType?.ArchitectNo,
            isSelfCertificationRequired: data?.formData?.LicneseType?.selfCertification,
            Ulb: data?.formData?.LicneseDetails?.Ulb,
          },
          tradeUnits: [
            {
              ...data?.result?.Licenses[0]?.tradeLicenseDetail?.tradeUnits?.[0],
              tradeType: data?.formData?.LicneseType?.LicenseType?.tradeType,
              id: data?.result?.Licenses[0]?.tradeLicenseDetail?.tradeUnits?.[0]?.id,
            },
          ],
          owners: [
            {
              ...data?.result?.Licenses[0]?.tradeLicenseDetail?.owners?.[0],
              gender: data?.formData?.LicneseDetails?.gender?.code,
              mobileNumber: data?.formData?.LicneseDetails?.mobileNumber,
              name: [
                data?.formData?.LicneseDetails?.name?.trim(),
                data?.formData?.LicneseDetails?.middleName?.trim(),
                data?.formData?.LicneseDetails?.lastName?.trim(),
              ]
                .filter(Boolean)
                .join(" "),
              dob: null,
              emailId: data?.formData?.LicneseDetails?.email,
              permanentAddress:
                data?.formData?.LicneseDetails?.PermanentAddress +
                " , " +
                data?.formData?.LicneseDetails?.SelectedDistrict?.name +
                " , " +
                data?.formData?.LicneseDetails?.SelectedState?.name,
              correspondenceAddress: data?.Correspondenceaddress,
              pan: data?.formData?.LicneseDetails?.PanNumber,
              uuid: data?.result?.Licenses[0]?.tradeLicenseDetail?.owners?.[0]?.uuid,
              // "permanentPinCode": "143001"
            },
          ],
          applicationDocuments: getapplicationdocstakeholder(data),
        },
      },
    ],
  };
  return formData;
};

export const getUniqueItemsFromArray = (data, identifier) => {
  const uniqueArray = [];
  const map = new Map();
  for (const item of data) {
    if (!map.has(item[identifier])) {
      map.set(item[identifier], true); // set any value to Map
      uniqueArray.push(item);
    }
  }
  return uniqueArray;
};

export const convertDateToEpoch = (dateString, dayStartOrEnd = "dayend") => {
  //example input format : "2018-10-02"
  console.log("dateString", dateString);
  try {
    const parts = dateString.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    const DateObj = new Date(Date.UTC(parts[1], parts[2] - 1, parts[3]));
    DateObj.setMinutes(DateObj.getMinutes() + DateObj.getTimezoneOffset());
    console.log("DateObj", DateObj);
    if (dayStartOrEnd === "dayend") {
      DateObj.setHours(DateObj.getHours() + 24);
      DateObj.setSeconds(DateObj.getSeconds() - 1);
    }
    console.log("DateObj.getTime()", DateObj.getTime());
    return DateObj.getTime();
  } catch (e) {
    return dateString;
  }
};

export const convertEpochToDateDMY = (dateEpoch) => {
  if (dateEpoch == null || dateEpoch == undefined || dateEpoch == "") {
    return "NA";
  }
  const dateFromApi = new Date(dateEpoch);
  let month = dateFromApi.getMonth() + 1;
  let day = dateFromApi.getDate();
  let year = dateFromApi.getFullYear();
  month = (month > 9 ? "" : "0") + month;
  day = (day > 9 ? "" : "0") + day;
  return `${day}/${month}/${year}`;
};

export const pdfDocumentName = (documentLink = "", index = 0) => {
  let documentName = decodeURIComponent(documentLink.split("?")[0].split("/").pop().slice(13)) || `Document - ${index + 1}`;
  return documentName;
};

export const getBPAEditDetails = async (data, APIScrutinyDetails, mdmsData, nocdata, t) => {
  const getBlockIds = (unit) => {
    let blocks = {};
    unit &&
      unit.map((ob, index) => {
        blocks[`Block_${index + 1}`] = ob.id;
      });
    return blocks;
  };

  console.log("DATA", data);

  const getBlocksforFlow = (unit) => {
    let arr = [];
    let subBlocks = [];
    let subOcc = {};
    unit &&
      unit.map((un, index) => {
        arr = un?.usageCategory?.split(",");
        subBlocks = [];
        arr &&
          arr.map((ob, ind) => {
            subBlocks.push({
              code: ob,
              i18nKey: `BPA_SUBOCCUPANCYTYPE_${ob.replaceAll(".", "_")}`,
              name: t(`BPA_SUBOCCUPANCYTYPE_${ob.replaceAll(".", "_")}`),
            });
          });
        subOcc[`Block_${index + 1}`] = subBlocks;
      });

    return subOcc;
  };

  data.BlockIds = getBlockIds(data?.landInfo?.unit);
  data.address = data?.landInfo?.address;
  data.data = {
    applicantName: APIScrutinyDetails?.planDetail?.planInformation?.applicantName,
    applicationDate: data?.auditDetails?.createdTime,
    applicationType: APIScrutinyDetails?.appliactionType,
    holdingNumber: data?.additionalDetails?.holdingNo,
    boundaryWallLength: data?.additionalDetails?.boundaryWallLength,
    occupancyType: APIScrutinyDetails?.planDetail?.planInformation?.occupancy,
    registrationDetails: data?.additionalDetails?.registrationDetails,
    riskType: Digit.Utils.obps.calculateRiskType(
      mdmsData?.BPA?.RiskTypeComputation,
      APIScrutinyDetails?.planDetail?.plot?.area,
      APIScrutinyDetails?.planDetail?.blocks
    ),
    serviceType: data?.additionalDetails?.serviceType || APIScrutinyDetails?.applicationSubType,
    edcrDetails: APIScrutinyDetails,
    scrutinyNumber: { edcrNumber: APIScrutinyDetails?.edcrNumber },
  };

  let PrevStateDocuments = [];
  data?.documents.map((doc) => PrevStateDocuments.push(doc));
  data["PrevStateDocuments"] = cloneDeep(PrevStateDocuments);
  data.documents = {
    documents: [],
  };

  let nocDocs = [];
  nocdata &&
    nocdata.map((a, index) => {
      a.documents &&
        a.documents.map((b, index) => {
          nocDocs.push(b);
        });
    });

  data["PrevStateNocDocuments"] = nocDocs;

  data.nocDocuments = {
    NocDetails: nocdata,
    nocDocuments: [],
  };

  data?.landInfo.owners.map((owner, ind) => {
    owner.gender = {
      active: true,
      code: owner.gender,
      i18nKey: `COMMON_GENDER_${owner.gender}`,
    };
  });

  data.owners = {
    owners: data?.landInfo?.owners,
    ownershipCategory: data?.ownershipCategory?.code,
  };

  data.riskType = Digit.Utils.obps.calculateRiskType(
    mdmsData?.BPA?.RiskTypeComputation,
    APIScrutinyDetails?.planDetail?.plot?.area,
    APIScrutinyDetails?.planDetail?.blocks
  );
  data.subOccupancy = getBlocksforFlow(data?.landInfo?.unit);

  let bpaFlow = "BPA";
  mdmsData?.BPA?.homePageUrlLinks?.map((linkData) => {
    if (APIScrutinyDetails?.appliactionType === linkData?.applicationType && APIScrutinyDetails?.applicationSubType === linkData?.serviceType) {
      bpaFlow = linkData?.flow;
    }
  });

  data.uiFlow = {
    flow: data?.businessService.includes("OC") ? "OCBPA" : data?.businessService?.split(".")[0],
    applicationType: data?.additionalDetails?.applicationType || APIScrutinyDetails?.appliactionType,
    serviceType: data?.additionalDetails?.serviceType || APIScrutinyDetails?.applicationSubType,
  };

  sessionStorage.setItem("BPA_IS_ALREADY_WENT_OFF_DETAILS", JSON.stringify(true));
  return data;
};

export const getPath = (path, params) => {
  params &&
    Object.keys(params).map((key) => {
      path = path.replace(`:${key}`, params[key]);
    });
  return path;
};

export const convertDateTimeToEpoch = (dateTimeString) => {
  //example input format : "26-07-2018 17:43:21"
  try {
    const parts = dateTimeString.match(/(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/);
    return Date.UTC(+parts[3], parts[2] - 1, +parts[1], +parts[4], +parts[5]);
  } catch (e) {
    return dateTimeString;
  }
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
    return `${year}-${month}-${day}`; //`${day}/${month}/${year}`;
  } else {
    return null;
  }
};

// export const getBusinessServices = (businessService, status) => {
//   let billBusinessService = "BPA.NC_APP_FEE";
//   if (businessService === "BPA_LOW") {
//     billBusinessService = "BPA.LOW_RISK_PERMIT_FEE";
//   } else if (businessService === "BPA") {
//     billBusinessService = status == "PENDING_APPL_FEE" ? "BPA.NC_APP_FEE" : "BPA.NC_SAN_FEE";
//   } else if (businessService === "BPA_OC") {
//     billBusinessService = status == "PENDING_APPL_FEE" ? "BPA.NC_OC_APP_FEE" : "BPA.NC_OC_SAN_FEE";
//   }
//   return billBusinessService;
// };

// export const getBusinessServices = (businessService, status) => {
//   // let billBusinessService = "BPA.NC_APP_FEE";

//   return "BPA.NC_APP_FEE";
// };

export const getBusinessServices = (businessService, status) => {
  console.log("businessServiceIngetBusinessServices", businessService, status);
  let billBusinessService = "BPA.NC_APP_FEE";
  if (businessService === "BPA_LOW" && status === "PENDING_SANC_FEE_PAYMENT") {
    billBusinessService = "BPA.NC_SAN_FEE";
  } else if (businessService === "BPA") {
    billBusinessService = status == "PENDING_APPL_FEE" ? "BPA.NC_APP_FEE" : "BPA.NC_SAN_FEE";
  } else if (businessService === "BPA_OC") {
    billBusinessService = status == "PENDING_APPL_FEE" ? "BPA.NC_OC_APP_FEE" : "BPA.NC_OC_SAN_FEE";
  } else {
    billBusinessService = status == "PENDING_APPL_FEE" ? "BPA.NC_APP_FEE" : "BPA.NC_SAN_FEE";
  }
  return billBusinessService;
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

export const printPdf = (blob) => {
  const fileURL = URL.createObjectURL(blob);
  var myWindow = window.open(fileURL);
  if (myWindow != undefined) {
    myWindow.addEventListener("load", (event) => {
      myWindow.focus();
      myWindow.print();
    });
  }
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
  return (r? toWords(r)+" Rupees":"") + (p? (r?" and ":"")+toWords(p)+" Paise":"") || "Zero Rupees";
}

export const downloadAndPrintReciept = async (bussinessService, consumerCode, tenantId, payments, licenseType, ulbType, mode = "download", pdfKey = "bpa-receipt") => {
  console.log('license needed', licenseType)
  const fee = payments?.[0]?.totalAmountPaid;

  const amountinwords = amountToWords(fee)
  const updatedPayments = payments.map(p => ({ ...p, licenseType,amountinwords,ulbType }));
  let response = null;
  console.log("payments", payments);
  if (payments[0]?.fileStoreId) {
    response = { filestoreIds: [payments[0]?.fileStoreId] };
  } else {
    response = await Digit.PaymentService.generatePdf(tenantId, { Payments: updatedPayments }, "bpa-receipt");
    //response = await Digit.OBPSService.receipt_download(bussinessService, consumerCode, tenantId, { pdfKey: pdfKey });
  }
  const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: response.filestoreIds[0] });
  window.open(fileStore[response?.filestoreIds[0]], "_blank");
  const responseStatus = parseInt(response.status, 10);
  if (responseStatus === 201 || responseStatus === 200) {
    let fileName =
      mode == "print"
        ? printPdf(new Blob([response.data], { type: "application/pdf" }))
        : downloadPdf(new Blob([response.data], { type: "application/pdf" }), `RECEIPT-${consumerCode}.pdf`);
  }
};

export const getOrderedDocs = (docs) => {
  //let uniqueDocs = [...new Map(docs.map(item => [item["documentType"], item])).values()];
  let uniqueDocs = docs.filter((elem, index) => docs.findIndex((obj) => obj.documentType === elem.documentType) === index);
  uniqueDocs.map((ob) => {
    ob["filestoreIdArray"] = [];
    docs
      .filter((doc) => doc.documentType === ob.documentType)
      .map((obb) => {
        ob["filestoreIdArray"] = [...ob.filestoreIdArray, obb.fileStoreId];
      });
  });
  return uniqueDocs;
};

export const showHidingLinksForStakeholder = (roles = []) => {
  let userInfos = sessionStorage.getItem("Digit.citizen.userRequestObject");
  const userInfo = userInfos ? JSON.parse(userInfos) : {};
  let checkedRoles = [];
  const rolearray = roles?.map((role) => {
    userInfo?.value?.info?.roles?.map((item) => {
      if (item.code === role.code && item.tenantId === role.tenantId) {
        checkedRoles.push(item);
      }
    });
  });
  return checkedRoles?.length;
};

export const showHidingLinksForBPA = (roles = []) => {
  const userInfo = Digit.UserService.getUser();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  let checkedRoles = [];
  const rolearray = roles?.map((role) => {
    userInfo?.info?.roles?.map((item) => {
      if (item.code == role && item.tenantId === tenantId) {
        checkedRoles.push(item);
      }
    });
  });
  return checkedRoles?.length;
};

export const getCheckBoxLabelData = (t, appData) => {
  if (appData?.status == "CITIZEN_APPROVAL_INPROCESS") {
    return `${t(`BPA_CITIZEN_1_DECLARAION_LABEL`)}${t(`BPA_CITIZEN_2_DECLARAION_LABEL`)}`;
  } else if (appData?.status == "INPROGRESS") {
    return `${t(`BPA_STAKEHOLDER_1_DECLARAION_LABEL`)}${t(`BPA_STAKEHOLDER_2_DECLARAION_LABEL`)}`;
  }
};

export const scrutinyDetailsData = async (edcrNumber, tenantId) => {
  const scrutinyDetails = await Digit.OBPSService.scrutinyDetails(tenantId, { edcrNumber: edcrNumber });
  const bpaDetails = await Digit.OBPSService.BPASearch(tenantId, { edcrNumber: edcrNumber });
  if (bpaDetails?.BPA?.length == 0) {
    return scrutinyDetails?.edcrDetail?.[0] ? scrutinyDetails?.edcrDetail?.[0] : { type: "ERROR", message: "BPA_NO_RECORD_FOUND" };
  } else if (
    bpaDetails?.BPA?.length > 0 &&
    (bpaDetails?.BPA?.[0]?.status == "INITIATED" ||
      bpaDetails?.BPA?.[0]?.status == "REJECTED" ||
      bpaDetails?.BPA?.[0]?.status == "PERMIT REVOCATION" ||
      bpaDetails?.BPA?.[0]?.status == "BLOCKED")
  ) {
    return scrutinyDetails?.edcrDetail?.[0] ? scrutinyDetails?.edcrDetail?.[0] : { type: "ERROR", message: "BPA_NO_RECORD_FOUND" };
  } else {
    return { type: "ERROR", message: "APPLICATION_NUMBER_ALREADY_EXISTS" };
  }
};

export const oldscrutinyDetailsData = async (edcrNumber, tenantId) => {
  const scrutinyDetails = await Digit.OBPSService.scrutinyDetails(tenantId, { edcrNumber: edcrNumber });  
  return scrutinyDetails?.edcrDetail?.[0] ? scrutinyDetails?.edcrDetail?.[0] : { type: "ERROR", message: "BPA_NO_RECORD_FOUND" };
};

export const getOCEDCRDetails = async (edcrNumber, tenantId) => {
  try {
    const valueToStore = await Digit.OBPSService.scrutinyDetails(tenantId, { edcrNumber: edcrNumber });
    return valueToStore;
  } catch (err) {
    return err?.response?.statusText ? err?.response?.statusText : "BPA_INTERNAL_SERVER_ERROR";
  }
};

export const ocScrutinyDetailsData = async (edcrNumber, tenantId) => {
  const scrutinyDetails = await getOCEDCRDetails(edcrNumber, tenantId);
  console.log(scrutinyDetails, "OOOO*****");
  if (!scrutinyDetails?.edcrDetail?.[0]?.edcrNumber) {
    return { type: "ERROR", message: scrutinyDetails ? scrutinyDetails : "BPA_NO_RECORD_FOUND" };
  }
  const bpaDetails = await Digit.OBPSService.BPASearch(tenantId, { approvalNo: scrutinyDetails?.edcrDetail?.[0]?.permitNumber });
  const bpaEdcrNumber = bpaDetails?.BPA?.[0]?.edcrNumber;
  tenantId = bpaDetails?.BPA?.[0]?.tenantId;
  const edcrDetails = await Digit.OBPSService.scrutinyDetails(tenantId, { edcrNumber: bpaEdcrNumber });
  const bpaResponse = await Digit.OBPSService.BPASearch(tenantId, { edcrNumber: edcrNumber });

  if (!scrutinyDetails?.edcrDetail?.[0]?.edcrNumber) {
    return { type: "ERROR", message: scrutinyDetails ? scrutinyDetails : "BPA_NO_RECORD_FOUND" };
  }

  if (scrutinyDetails?.edcrDetail?.[0]?.edcrNumber) {
    return {
      ocEdcrDetails: scrutinyDetails?.edcrDetail?.[0],
      otherDetails: {
        bpaApprovalResponse: bpaDetails?.BPA,
        edcrDetails: edcrDetails?.edcrDetail,
        bpaResponse: bpaResponse?.BPA,
      },
    };
  } else {
    return { type: "ERROR", message: "BPA_NO_RECORD_FOUND" };
  }
};

export const getOrderDocuments = (appUploadedDocumnets, isNoc = false) => {
  let finalDocs = [];
  if (appUploadedDocumnets?.length > 0) {
    let uniqueDocmnts = appUploadedDocumnets.filter(
      (elem, index) =>
        appUploadedDocumnets.findIndex(
          (obj) => obj?.documentType?.split(".")?.slice(0, 2)?.join("_") === elem?.documentType?.split(".")?.slice(0, 2)?.join("_")
        ) === index
    );
    uniqueDocmnts?.map((uniDoc) => {
      const resultsDocs = appUploadedDocumnets?.filter(
        (appDoc) => uniDoc?.documentType?.split(".")?.slice(0, 2)?.join("_") == appDoc?.documentType?.split(".")?.slice(0, 2)?.join("_")
      );
      resultsDocs?.forEach((resDoc) => (resDoc.title = resDoc.documentType));
      finalDocs.push({
        title: !isNoc ? resultsDocs?.[0]?.documentType?.split(".")?.slice(0, 2)?.join("_") : "",
        values: resultsDocs,
      });
    });
  }
  console.log("DOCUMENTS===", finalDocs);
  return finalDocs;
};

export const getDocsFromFileUrls = (fileUrls = {}) => {
  if (!fileUrls || typeof fileUrls !== "object") return [];

  return Object.entries(fileUrls)
    .filter(([_, url]) => url && url !== "NA") // skip null/undefined/empty/NA
    .map(([key, url]) => ({
      id: key, // use key as id
      documentType: key.toUpperCase(), // e.g. ECBCCERTIFICATEFILE
      fileStoreId: null, // not available here
      documentUid: null, // not available
      additionalDetails: null,
      auditDetails: null,
      module: "OBPS", // or make this dynamic
      fileURL: url,
      url: url,
      fileResponse: url,
      title: key.toUpperCase(),
    }));
};

export const businessServiceListLayout = (isCode= false) => {
    let isSearchScreen = window.location.href.includes("/search");
    const availableBusinessServices = [{
        code: isSearchScreen ? "FIRE_NOC" : "FIRE_NOC_SRV",
        active: true,
        roles: ["FIRE_NOC_APPROVER"],
        i18nKey: "WF_FIRE_NOC_FIRE_NOC_SRV",
    }, {
        code: isSearchScreen ? "AIRPORT_AUTHORITY" : "AIRPORT_NOC_SRV",
        active: true,
        roles: ["AIRPORT_AUTHORITY_APPROVER"],
        i18nKey: "WF_FIRE_NOC_AIRPORT_NOC_SRV"
    }];

    const newAvailableBusinessServices = [];
    const loggedInUserRoles = Digit.UserService.getUser().info.roles;
    availableBusinessServices.map(({ roles }, index) => {
        roles.map((role) => {
            loggedInUserRoles.map((el) => {
                if (el.code === role) {
                    isCode ? newAvailableBusinessServices.push(availableBusinessServices?.[index]?.code) : newAvailableBusinessServices.push(availableBusinessServices?.[index])
                }
            })
        })
    });

    return newAvailableBusinessServices;
}
