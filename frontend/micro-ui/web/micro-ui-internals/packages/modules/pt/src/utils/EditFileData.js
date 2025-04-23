// exiting property & year of creation is not in the aplication data field
export const mapApplicationDataToDefaultValues = (applicationData) => {
  // Extract Location Details
  const address = applicationData?.LocationDetails?.address || {};
  const locality = { ...applicationData?.address?.locality };
  const city = address?.city || {};
  const yearOfCreation = applicationData?.LocationDetails?.yearOfCreation || {};

  // Extract Property Details
  const propertyDetails = applicationData?.PropertyDetails || {};
  const vasikaDetails = propertyDetails?.vasikaDetails || {};
  const allotmentDetails = propertyDetails?.allottmentDetails || {};
  const units = applicationData?.units || [];


  // Extract Ownership Details
  const ownershipCategory = applicationData?.ownershipCategory || {};
  const owners = applicationData?.owners || [];

  // Extract Document Details
  const documents = applicationData?.documents || [];

  return {
    LocationDetails: {
      address: {
        doorNo: applicationData.address.doorNo || "",
        buildingName: applicationData.address.buildingName || "",
        street: applicationData.address.street || "",
        pincode: applicationData.address.pincode || "",
        locality: {
          code: locality.code || "",
          name: locality.name || "",
          label: locality.label || "",
          latitude: locality.latitude || null,
          longitude: locality.longitude || null,
          area: locality.area || "",
          i18nKey: locality.i18nkey || "",
        },
        // locality: {
        //   code: applicationData.address.locality.code || "",
        //   name: applicationData.address.locality.name || "",
        //   label: applicationData.address.locality.label||"",
        //   latitude: applicationData.address.locality.latitude || null,
        //   longitude: applicationData.address.locality.longitude || null,
        //   area: applicationData.address.locality.area ||"",
        //   i18nKey: applicationData.address.locality.i18nkey || ""
        // },
        city: {
          code: city.code || "",
          name: city.name || "",
          i18nKey: city.i18nKey || "",
        },
      },
      existingPropertyId: applicationData?.existingPropertyId || "", //NA
      surveyId: applicationData?.surveyId || "",
      yearOfCreation: {
        //NA
        code: yearOfCreation.code || "",
        i18nKey: yearOfCreation.i18nKey || "",
        value: yearOfCreation.value || "",
      },
    },
    PropertyDetails: {
      usageCategoryMajor:
        // applicationData?.usageCategory,
        {
          code: applicationData?.usageCategory || "",
          // code: "Test usageCategoryMajor",
          i18nKey: applicationData?.usageCategory?.i18nKey || "",
        },
      PropertyType: {
        code: applicationData?.propertyType || "",
      },
      landarea: applicationData?.landArea || 500,
      vasikaDetails: {
        vasikaNo: applicationData?.additionalDetails?.vasikaNo || "",
        vasikaDate: applicationData?.additionalDetails?.vasikaDate || "",
      },
      allottmentDetails: {
        allotmentNo: applicationData?.additionalDetails?.allotmentNo || "",
        allotmentDate: applicationData?.additionalDetails?.allotmentDate || "",
      },
      businessName: applicationData?.additionalDetails?.businessName || "",
      remarks: applicationData?.additionalDetails?.remrks || "",
      noOfFloors: applicationData?.noOfFloors || "",
      units: applicationData?.units || [],
      // units: applicationData?.owners,
      // checkData: applicationData?.units,
    },
    ownerShipDetails: {
      ownershipCategory: { code: applicationData?.ownershipCategory },
      // {
      //   label: applicationData?.ownershipCategory?.label || "",
      //   value: ownershipCategory?.value || "",
      //   code: ownershipCategory?.code || "",
      //   i18nKey: ownershipCategory?.i18nKey || "",
      // },
      owners: owners.map((owner) => ({
        name: owner?.name || "",
        mobileNumber: owner?.mobileNumber || "",
        fatherOrHusbandName: owner?.fatherOrHusbandName || "",
        emailId: owner?.emailId || "",
        permanentAddress: owner?.permanentAddress || "",
        relationship: owner?.relationship,
        // {
        //   code: owner?.relationship?.code || "",
        //   i18nKey: owner?.relationship?.i18nKey || ""
        // },
        ownerType: owner?.ownerType,
        // {
        //   code: owner?.ownerType?.code || "",
        //   i18nKey: owner?.ownerType?.i18nKey || ""
        // },
        gender: owner?.gender,
        // {
        //   code: owner?.gender?.code || "",
        //   i18nKey: owner?.gender?.i18nKey || ""
        // },
        correspondenceAddress: owner?.correspondenceAddress || "",
      })),
    },
    DocummentDetails: {
      documents: documents,
      additionalDetails: applicationData?.additionalDetails,
    },
  };
};
