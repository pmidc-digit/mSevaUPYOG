// exiting property & year of creation is not in the aplication data field
export const mapApplicationDataToDefaultValuesForCitizen = (applicationData) => {
    console.log("applicationData in mapApplicationDataToDefaultValues: ", applicationData);
    // Extract Location Details
    const address = applicationData?.address || {};
    const locality = applicationData?.address?.locality || {};
    const tenantId = applicationData?.tenantId || "";
    console.log("locality in mapApplicationDataToDefaultValuesForCitizen: ", applicationData?.address?.locality, locality);
    const city = address?.city || {};
    const yearOfCreation = {
      code: applicationData?.additionalDetails?.yearConstruction || "",
      i18nKey: applicationData?.additionalDetails?.yearConstruction || "",
      value: applicationData?.additionalDetails?.yearConstruction || "",
    }
  
    const institution = applicationData?.institution;
    // applicationData?.LocationDetails?.yearOfCreation || {};
  
    // Extract Property Details
    const propertyDetails = applicationData?.PropertyDetails || {};
    const vasikaDetails = propertyDetails?.vasikaDetails || {};
    const allotmentDetails = propertyDetails?.allottmentDetails || {};
    let units = applicationData?.units.map((val) => {return {...val, usageCategoryType: val?.usageCategory, RentedMonths: val?.additionalDetails?.rentedformonths, NonRentedMonthsUsage: val?.additionalDetails?.usageForDueMonths }}) || [];
  
    
  
    console.log("applicationData?.units", applicationData?.units);
  
    // Extract Ownership Details
    const ownershipCategory = applicationData?.ownershipCategory || {};
    const owners = applicationData?.owners || [];
  
    // Extract Document Details
    const documents = applicationData?.documents || [];
  
    return {
      LocationDetails: {
        address: {
          doorNo: applicationData?.address?.doorNo || "",
          buildingName: applicationData?.address?.buildingName || "",
          street: applicationData?.address?.street || "",
          pincode: applicationData?.address?.pincode || "",
          locality: {
            code: locality.code || "",
            name: locality.name || "",
            label: locality.label || "",
            latitude: locality.latitude || null,
            longitude: locality.longitude || null,
            area: locality.area || "",
            // i18nKey: locality.i18nKey || "",
            i18nKey: "Azad Nagar - B1"
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
            code: tenantId || "",
            name: city || "",
            i18nKey: city || "",
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
        businessName:{
          businessName: applicationData?.additionalDetails?.businessName || ""
        },
        remarks: applicationData?.additionalDetails?.remarks || "",
        noOfFloors: applicationData?.noOfFloors || "",
        units: units || [],
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
          ...owner,
          name: owner?.name || "",
          mobileNumber: owner?.mobileNumber || "",
          fatherOrHusbandName: owner?.fatherOrHusbandName || "",
          emailId: owner?.emailId || "",
          permanentAddress: owner?.permanentAddress || "",
          relationship: owner?.relationship,
          institutionName: institution?.name,
          institutionType: institution?.type,
          altContactNumber: owner?.altContactNumber,
          designation: institution?.designation,
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
          ownershipPercentage: owner?.ownerShipPercentage?.toString() || "",
        })),
      },
      DocummentDetails: {
        documents: documents,
        additionalDetails: applicationData?.additionalDetails,
      },
      applicationData: applicationData || {}
    };
  };
  