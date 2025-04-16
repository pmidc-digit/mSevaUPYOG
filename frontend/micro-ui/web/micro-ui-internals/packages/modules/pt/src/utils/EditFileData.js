// exiting property & year of creation is not in the aplication data field
export const mapApplicationDataToDefaultValues = (applicationData) => {
  console.log("applicationData in mapApplicationDataToDefaultValues: ", applicationData);
  // Extract Location Details
  const address = applicationData?.LocationDetails?.address || {};
  const locality = {...applicationData?.address?.locality};
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
          label: locality.label||"",
          latitude: locality.latitude || null,
          longitude: locality.longitude || null,
          area: locality.area ||"",
          i18nKey: locality.i18nkey || ""
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
          i18nKey: city.i18nKey || ""
        }
      },
      existingPropertyId: applicationData?.existingPropertyId || "",//NA
      surveyId: applicationData?.surveyId || "",
      yearOfCreation: {//NA
        code: yearOfCreation.code || "",
        i18nKey: yearOfCreation.i18nKey || "",
        value: yearOfCreation.value || ""
      }
    },
    PropertyDetails: {
      usageCategoryMajor: 
      // applicationData?.usageCategory,
      {
        code: applicationData?.usageCategory||"",
        i18nKey: applicationData?.usageCategory?.i18nKey || ""
      },
      PropertyType: 
      {
        code :applicationData?.propertyType || "",
        i18nKey: applicationData?.PropertyType?.i18nKey || ""
      },
      landarea: applicationData?.landArea || "",
      vasikaDetails: {
        vasikaNo: applicationData?.additionalDetails?.vasikaNo || "",
        vasikaDate: applicationData?.additionalDetails?.vasikaDate || ""
      },
      allottmentDetails: {
        allotmentNo: applicationData?.additionalDetails?.allotmentNo || "",
        allotmentDate: applicationData?.additionalDetails?.allotmentDate || ""
      },
      businessName: applicationData?.additionalDetails?.businessName || "",
      remarks: applicationData?.additionalDetails?.remrks || "",
      noOfFloors: applicationData?.noOfFloors || "",
      units: units.map((unit) => ({
        floorNo: unit?.floorNo || "",
        constructionDetail: {
          builtUpArea: unit?.constructionDetail?.builtUpArea || ""
        },
        tenantId: unit?.tenantId || ""
      }))
    },
    ownerShipDetails: {
      ownershipCategory: {
        label: ownershipCategory?.label || "",
        value: ownershipCategory?.value || "",
        code: ownershipCategory?.code || "",
        i18nKey: ownershipCategory?.i18nKey || ""
      },
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
        correspondenceAddress: owner?.correspondenceAddress || ""
      }))
    },
    DocummentDetails: {
      documents: documents.map((doc) => ({
        documentType: doc?.documentType || "",
        fileStoreId: doc?.fileStoreId || "",
        documentUid: doc?.documentUid || ""
      }))
    }
  };
};










// export const mapApplicationDataToDefaultValues = (applicationData) => {
//   // Extract Address Details
//   const address = applicationData?.address || {};
//   const locality = address?.locality || {};
//   const city = address?.city || {};

//   // Extract Property Details
//   const units = applicationData?.units || [];

//   // Extract Ownership Details
//   const ownershipCategory = applicationData?.ownershipCategory || {};
//   const owners = applicationData?.owners || [];

//   // Extract Document Details
//   const documents = applicationData?.documents || [];

//   return {
//     PersonalDetails: {
//       address: {
//         city: {
//           i18nKey: `TENANT_TENANTS_${address.tenantId?.toUpperCase()}`,
//           code: address.tenantId || "",
//           name: address.city || "",
//           description: address.city || "",
//           logoId: null, // Add logoId if available
//           imageId: null,
//           domainUrl: null,
//           type: "CITY",
//           twitterUrl: null,
//           facebookUrl: null,
//           emailId: null,
//           OfficeTimings: {
//             "Mon - Fri": "9.00 AM - 5.00 PM",
//           },
//           city: {
//             name: address.city || "",
//             localName: address.city || "",
//             districtCode: null,
//             districtTenantCode: null,
//             districtName: null,
//             regionName: null,
//             ulbGrade: null,
//             ulbType: null,
//             longitude: address.geoLocation?.longitude || null,
//             latitude: address.geoLocation?.latitude || null,
//             shapeFileLocation: null,
//             captcha: null,
//             code: null,
//             ddrName: null,
//             pwssb: false,
//             pwssbGrade: null,
//           },
//           address: address.street || "",
//           contactNumber: null,
//           PGRMasterContact: null,
//         },
//         locality: {
//           code: locality.code || "",
//           name: locality.name || "",
//           label: locality.label || "",
//           latitude: locality.latitude || null,
//           longitude: locality.longitude || null,
//           area: locality.area || "",
//           pincode: address.pincode || "",
//           boundaryNum: null,
//           children: locality.children || [],
//           i18nkey: locality.i18nKey || "",
//         },
//       },
//       yearOfCreation: {
//         i18nKey: "2013-14", // Replace with dynamic value if available
//         code: "2013-14",
//         value: "2013-14",
//       },
//     },
//     PropertyDetails: {
//       units: units.map((unit) => ({
//         constructionDetail: {
//           builtUpArea: unit?.constructionDetail?.builtUpArea || "",
//         },
//         tenantId: unit?.tenantId || "",
//       })),
//     },
//     // ownerShipDetails: {
//     //   ownershipCategory: {
//     //     label: ownershipCategory?.label || "Individual - SingleOwner",
//     //     value: ownershipCategory || "INDIVIDUAL.SINGLEOWNER",
//     //     code: ownershipCategory || "INDIVIDUAL.SINGLEOWNER",
//     //     i18nKey: "PT_OWNERSHIP_SINGLEOWNER",
//     //   },
//     //   owners: owners.map((owner) => ({
//     //     name: owner?.name || "",
//     //     mobileNumber: owner?.mobileNumber || "",
//     //     fatherOrHusbandName: owner?.fatherOrHusbandName || "",
//     //     emailId: owner?.emailId || "",
//     //     permanentAddress: owner?.permanentAddress || "",
//     //     relationship: {
//     //       i18nKey: "PT_FORM3_HUSBAND", // Replace with dynamic value if available
//     //       code: owner?.relationship || "",
//     //     },
//     //     ownerType: {
//     //       i18nKey: "NONE",
//     //       code: owner?.ownerType || "",
//     //       order: 0,
//     //     },
//     //     gender: {
//     //       i18nKey: "PT_FORM3_MALE", // Replace with dynamic value if available
//     //       code: owner?.gender || "",
//     //       value: owner?.gender || "",
//     //     },
//     //     isCorrespondenceAddress: false,
//     //     key: owner?.id || null,
//     //     institution: {
//     //       type: {
//     //         active: true,
//     //         i18nKey: "COMMON_MASTERS_OWNERSHIPCATEGORY_",
//     //         name: "COMMON_MASTERS_OWNERSHIPCATEGORY_",
//     //       },
//     //     },
//     //   })),
//     // },
//     // DocummentDetails: {
//     //   documents: {
//     //     documents: documents.map((doc) => ({
//     //       documentType: doc?.documentType || "",
//     //       fileStoreId: doc?.fileStoreId || "",
//     //       documentUid: doc?.documentUid || "",
//     //     })),
//     //     propertyTaxDocumentsLength: documents.length,
//     //   },
//     // },
//   };
// };