const getNOCSanctionLetter = async (application, t,EmpData,approverComment) => {
  
  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

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
      floorNo: getFloorLabel(idx),
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
      approverComment
      },
    ],
  };
};

export default getNOCSanctionLetter;
