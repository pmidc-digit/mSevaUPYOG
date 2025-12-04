const getNOCSanctionLetter = async (application, t,EmpData) => {
  
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

  let floorArea = [];
  let basementArea = site?.basementArea || "NA";
  let totalFloorArea = site?.totalFloorArea || "NA";

  if (site?.buildingStatus === "Built Up") {
    floorArea = (site?.floorArea || [])?.map((f, idx) => ({
      ...f,
      floorNo: `Floor No ${idx + 1}`,
    }));
  } else {
    floorArea = [{ floorNo: "Floor No NA", value: "NA" }];
    
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

export default getNOCSanctionLetter;
