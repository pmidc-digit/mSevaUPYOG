// exiting property & year of creation is not in the aplication data field
export const mapApplicationDataToDefaultValues = (applicationData) => {
  console.log("ApplicationData in mapApplicationDataToDefaultValues: ", applicationData);

  return {
    originalData: applicationData,
    LocationDetails: {
      address: { ...applicationData?.address },
      // address: {
      //   doorNo: applicationData.address.doorNo || "",
      //   buildingName: applicationData.address.buildingName || "",
      //   street: applicationData.address.street || "",
      //   pincode: applicationData.address.pincode || "",
      //   locality: {
      //     code: locality.code || "",
      //     name: locality.name || "",
      //     label: locality.label || "",
      //     latitude: locality.latitude || null,
      //     longitude: locality.longitude || null,
      //     area: locality.area || "",
      //     i18nKey: locality.i18nkey || "",
      //   },
      //   // locality: {
      //   //   code: applicationData.address.locality.code || "",
      //   //   name: applicationData.address.locality.name || "",
      //   //   label: applicationData.address.locality.label||"",
      //   //   latitude: applicationData.address.locality.latitude || null,
      //   //   longitude: applicationData.address.locality.longitude || null,
      //   //   area: applicationData.address.locality.area ||"",
      //   //   i18nKey: applicationData.address.locality.i18nkey || ""
      //   // },
      //   city: {
      //     code: city,
      //     name: "",
      //     i18nKey: "",
      //   },
      // },
      existingPropertyId: applicationData?.oldPropertyId || "", //NA
      surveyId: applicationData?.surveyId || "",
      yearOfCreation: { name: applicationData?.additionalDetails?.yearConstruction, i18nKey: applicationData?.additionalDetails?.yearConstruction, code: applicationData?.additionalDetails?.yearConstruction }
    },
    PropertyDetails: {
      usageCategoryMajor: {
        code: applicationData?.usageCategory || "",
        i18nKey: "PROPERTYTAX_BILLING_SLAB_" + applicationData?.usageCategory || "",
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
      remarks: applicationData?.additionalDetails?.remarks || "",
      noOfFloors: applicationData?.noOfFloors || "",
      units: applicationData?.units?.map((unit) => {
        return {
          ...unit,
          NonRentedMonthsUsage: {
            code: unit?.additionalDetails?.usageForDueMonths,
            i18nKey: unit?.additionalDetails?.usageForDueMonths,
          },
          RentedMonths: {
            code: unit?.additionalDetails?.rentedformonths,
            i18nKey: unit?.additionalDetails?.rentedformonths && "PROPERTYTAX_MONTH" + unit?.additionalDetails?.rentedformonths,
          }
        }
      }) || [],
      propertyCheckboxQuestions: {
        isPropertyHeightMoreThan36Feet: applicationData?.additionalDetails?.heightAbove36Feet,
        hasInflammableMaterial: applicationData?.additionalDetails?.inflammable
      }
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
      owners: applicationData?.owners?.map((owner) => ({
        ...owner,
        name: owner?.name || "",
        mobileNumber: owner?.mobileNumber || "",
        fatherOrHusbandName: owner?.fatherOrHusbandName || "",
        emailId: owner?.emailId || "",
        permanentAddress: owner?.permanentAddress || "",
        relationship: { code: owner?.relationship, i18nKey: owner?.relationship },
        // {
        //   code: owner?.relationship?.code || "",
        //   i18nKey: owner?.relationship?.i18nKey || ""
        // },
        ownerType: { code: owner?.ownerType, i18nKey: owner?.ownerType },
        // {
        //   code: owner?.ownerType?.code || "",
        //   i18nKey: owner?.ownerType?.i18nKey || ""
        // },
        gender: { code: owner?.gender, i18nKey: owner?.gender },
        // {
        //   code: owner?.gender?.code || "",
        //   i18nKey: owner?.gender?.i18nKey || ""
        // },
        correspondenceAddress: owner?.correspondenceAddress || "",
      })),
    },
    DocummentDetails: {
      documents: { documents: applicationData?.documents },
      additionalDetails: applicationData?.additionalDetails,
    },
  };
};
