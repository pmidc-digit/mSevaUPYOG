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
      unitUsageType: usageCode || "",
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
    remarks: property.additionalDetails?.remrks || "",
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
      address: owner.permanentAddress || owner.correspondenceAddress || "",
    }));

  const ownerDetails = {
    ownerShip: ownerShip,
    owners: ownersList.length > 0 ? ownersList : [{ name: "", mobileNumber: "", emailId: "", address: "" }],
    ...(property.institution && {
      institutionName: property.institution.name || "",
      institutionType: property.institution.type ? { code: property.institution.type } : null,
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
