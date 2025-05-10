export const OwnertransferMapData = (applicationData) => {
  const owners = applicationData?.owners || [];
  const mappedData = {
    ownershipCategory: {
      owners: owners.map((owner) => ({
        name: owner?.name || "",
        mobileNumber: owner?.mobileNumber || "",
        fatherOrHusbandName: owner?.fatherOrHusbandName || "",
        emailId: owner?.emailId || "",
        correspondenceAddress: owner?.correspondenceAddress || "",
      })),
    },
  };

  // Store the mapped data in session storage
  sessionStorage.setItem("ownerTransferData", JSON.stringify(mappedData));

  return mappedData;
};

// export const OwnertransferMapData = (applicationData) => {
//   console.log("applicationData in mapApplicationDataToDefaultValues: ", applicationData);
//   const owners = applicationData?.owners || [];
//   return {
//     ownershipCategory: {
//       //   owners: applicationData?.owners,
//       owners: owners.map((owner) => ({
//         name: owner?.name || "",
//         mobileNumber: owner?.mobileNumber || "",
//         fatherOrHusbandName: owner?.fatherOrHusbandName || "",
//         emailId: owner?.emailId || "",
//         correspondenceAddress: owner?.correspondenceAddress || "",
//         // permanentAddress: owner?.permanentAddress || "",
//         // relationship: owner?.relationship,
//         // {
//         //   code: owner?.relationship?.code || "",
//         //   i18nKey: owner?.relationship?.i18nKey || ""
//         // },
//         // ownerType: owner?.ownerType,
//         // {
//         //   code: owner?.ownerType?.code || "",
//         //   i18nKey: owner?.ownerType?.i18nKey || ""
//         // },
//         // gender: owner?.gender,
//         // {
//         //   code: owner?.gender?.code || "",
//         //   i18nKey: owner?.gender?.i18nKey || ""
//         // },
//       })),
//     },
//   };
// };
