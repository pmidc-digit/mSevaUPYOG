/**
 * Maps a property object from the _search API response to the
 * Redux form data structure used by the NewPTStepper form steps.
 */

const ownershipOptions = [
  { name: "Institutional - Government", code: "INSTITUTIONALGOVERNMENT", value: "INSTITUTIONALGOVERNMENT.OTHERGOVERNMENTINSTITUITION", active: true },
  { name: "Institutional - Private", code: "INSTITUTIONALPRIVATE", value: "INSTITUTIONALPRIVATE.OTHERSPRIVATEINSTITUITION", active: true },
  { name: "Multiple Owners", code: "INDIVIDUAL.MULTIPLEOWNERS", value: "INDIVIDUAL.MULTIPLEOWNERS", active: true },
  { name: "Single Owner", code: "SINGLEOWNER", value: "INDIVIDUAL.SINGLEOWNER", active: true, ownerShipCategory: "INDIVIDUAL" },
];

export const mapPropertyToFormData = (property) => {
  if (!property) return null;

  // --- Step 1: Property Address ---
  const propertyAddress = {
    surveyId: property.additionalDetails?.surveyId || "",
    city: { code: property.tenantId, name: property.address?.city || "" },
    houseNo: property.address?.doorNo || "",
    buildingName: property.address?.buildingName || "",
    streetName: property.address?.street || "",
    locality: property.address?.locality ? { code: property.address.locality.code, area: property.address.locality.area, name: property.address.locality.name } : null,
    pincode: property.address?.pincode || "",
    yearOfCreation: property.additionalDetails?.yearConstruction
      ? { code: property.additionalDetails.yearConstruction }
      : null,
  };

  // --- Step 2: Property Details ---
  const usageCategoryMajor = property.usageCategoryMajor;
  const usageCategoryMinor = property.usageCategoryMinor;
  // If minor exists use it (e.g. "COMMERCIAL"), else use major (e.g. "RESIDENTIAL")
  const usageCode = usageCategoryMinor || usageCategoryMajor || property.usageCategory;

  const unitDetails = (property.units || [])
    .filter((u) => u.active !== false)
    .map((unit) => ({
      unitUsageType: (() => {
        const parts = (unit.usageCategory || "").split(".");
        // Take minor segment (index 1) if present, else major (index 0)
        const minorCode = parts[1] || parts[0] || "";
        return minorCode ? { code: minorCode } : (usageCode ? { code: usageCode } : "");
      })(),


      subUsageType: unit.usageCategory ? { code: unit.usageCategory } : null,
      occupancy: unit.occupancyType ? { code: unit.occupancyType } : null,
      floor: unit.floorNo != null ? { code: String(unit.floorNo) } : null,
      area: unit.constructionDetail?.builtUpArea ? String(unit.constructionDetail.builtUpArea) : "",
      totalRent: unit.arv || "",
      rentMonths: unit.additionalDetails?.rentedformonths
        ? { code: String(unit.additionalDetails.rentedformonths), name: String(unit.additionalDetails.rentedformonths) }
        : null,
      pendingUsageMonths: unit.additionalDetails?.usageForDueMonths
        ? { code: unit.additionalDetails.usageForDueMonths, name: unit.additionalDetails.usageForDueMonths }
        : null,
    }));

  const propertyDetails = {
    propertyUsageType: usageCode ? { code: usageCode } : null,
    propertyType: property.propertyType ? { code: property.propertyType } : null,
    businessName: property.additionalDetails?.businessName || "",
    remarks: property.additionalDetails?.remarks || property.additionalDetails?.remrks || "",
    vasikaNo: property.additionalDetails?.vasikaNo || "",
   vasikaDate: property.additionalDetails?.vasikaDate || "",
   allotmentNo: property.additionalDetails?.allotmentNo || "",
   allotmentDate: property.additionalDetails?.allotmentDate || "",
    flammable: property.additionalDetails?.inflammable || false,
    heightOfProperty: property.additionalDetails?.heightAbove36Feet || false,
    plotSize: property.landArea || "",
    noOfFloors: property.noOfFloors
      ? { code: String(property.noOfFloors), name: String(property.noOfFloors) }
      : null,
    unitDetails: unitDetails.length > 0 ? unitDetails : [{ unitUsageType: "", occupancy: null }],
  };

  // --- Step 3: Owner Details ---
  const ownerShip = ownershipOptions.find((o) => o.value === property.ownershipCategory) || null;

  const ownersList = (property.owners || [])
  .filter((o) => o.status === "ACTIVE")
  .map((owner) => ({
    name: owner.name || "",
    mobileNumber: owner.mobileNumber || "",
    emailId: owner.emailId || "",

    designation:
      owner.designation ||
      property?.institution?.designation ||
      "",
    altContactNumber: owner.altContactNumber || "",
    address:
      owner.permanentAddress ||
      owner.correspondenceAddress ||
      "",

    // Missing fields
    gender: owner.gender
      ? { code: owner.gender, name: owner.gender }
      : "",

    fatherOrHusbandName:
      owner.fatherOrHusbandName || "",

    relationship: owner.relationship
      ? {
          code: owner.relationship.toUpperCase(),
          name: owner.relationship,
        }
      : "",

    ownerType: owner.ownerType
      ? { code: owner.ownerType }
      : "",

    ownershipPercentage:
      owner.ownerShipPercentage || "",

    docIdType: owner.documents?.[0]
      ? {
          code:
            owner.documents[0].documentType,
        }
      : "",

    docIdNo:
      owner.documents?.[0]?.documentUid ||
      "",
  }));



  const ownerDetails = {
    ownerShip: ownerShip,
    owners: ownersList.length > 0 ? ownersList : [{ name: "", mobileNumber: "", emailId: "", address: "" }],
    ...(property.institution && {
      institutionName: property.institution.name || "",
      // institutionType: property.institution.type ? { code: property.institution.type } : null,
      institutionType: property.institution.type || null,
    }),
  };

  // --- Step 4: Documents ---
  const documents = {
    documents: {
      documents: property.documents || [],
    },
  };

  return {
    propertyAddress,
    propertyDetails,
    ownerDetails,
    documents,
    _originalProperty: property,
  };
};

export const mapGISDataToFormData = (gisData) => {
  if (!gisData) return null;

  // Helper function to sanitize values - convert NA, null, undefined to empty string
  const sanitize = (value) => {
    if (value === null || value === undefined || value === "NA") return "";
    return String(value).trim();
  };

  // Helper function to check if value is valid (not NA, null, undefined)
  const isValid = (value) => {
    return value !== null && value !== undefined && value !== "NA" && value !== "";
  };

  const floorToNoFloor = (floor) => {
    if (!isValid(floor)) return "";

    const floorStr = sanitize(floor)

    // Case: "G"
    if (floorStr === "G") return 1;

    // Case: "G+2", "G+3"
    if (floorStr.startsWith("G+")) {
      const num = Number(floorStr.split("+")[1]);
      return isNaN(num) ? 1 : num + 1;
    }

    const num = Number(floorStr);
    if (!isNaN(num)) return num;

    // Default fallback
    return "";
  }

  const propertyAddress = {
    surveyId: sanitize(gisData.surveyId || gisData.uid),
    city: { code: "", name: "" },
    houseNo: sanitize(gisData.flatNo),
    buildingName: sanitize(gisData.buildingName),
    streetName: sanitize(gisData.road),
    locality: null,
    pincode: sanitize(gisData.pincode),
    yearOfCreation: isValid(gisData.constructionYear) 
      ? { code: sanitize(gisData.constructionYear) } 
      : null,
    sector: sanitize(gisData.sector),
    block: sanitize(gisData.block),
    ward: sanitize(gisData.ward),
  };

  const propertyDetails = {
    // propertyUsageType: isValid(gisData.useType) 
    //   ? { code: sanitize(gisData.useType) } 
    //   : null,
    // propertyType: isValid(gisData.constructionType) 
    //   ? { code: sanitize(gisData.constructionType) } 
    //   : null,
    propertyUsageType: null,
    propertyType: null,
    businessName: "",
    remarks: "",
    flammable: false,
    heightOfProperty: false,
    plotSize: sanitize(gisData.area),
    noOfFloors: isValid(gisData.floor)
      ? { code: floorToNoFloor(gisData.floor), name: floorToNoFloor(gisData.floor) }
      : null,
    unitDetails: [
      // {
      //   unitUsageType: sanitize(gisData.useType),
      //   subUsageType: null,
      //   occupancy: isValid(gisData.occupancy) 
      //     ? { code: sanitize(gisData.occupancy) } 
      //     : null,
      //   floor: isValid(gisData.floor) 
      //     ? { code: sanitize(gisData.floor) } 
      //     : null,
      //   area: sanitize(gisData.builtUpArea || gisData.area),
      //   totalRent: "",
      //   rentMonths: null,
      //   pendingUsageMonths: null,
      // },
    ],
  };

  const ownerDetails = {
    ownerShip: null,
    owners: [{ name: "", mobileNumber: "", emailId: "", address: "" }],
  };

  const documents = {
    documents: {
      documents: [],
    },
  };

  return {
    propertyAddress,
    propertyDetails,
    ownerDetails,
    documents,
    _originalGISData: gisData,
  };
};
