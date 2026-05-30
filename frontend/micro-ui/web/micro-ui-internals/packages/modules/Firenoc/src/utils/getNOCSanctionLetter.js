const getNOCSanctionLetter = async (application, t,EmpData,approverComment) => {
  
  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  console.log('application', application)
  const firmName = application?.nocDetails?.additionalDetails?.applicationDetails?.owners?.[0]?.firmName
  const owners = application?.owners || [];
  let ownersString = "NA";

  if (!approverComment) {
    approverComment = {
      ConditionLine: " ",
      ConditionText: " ",
    };
  }

  if (!firmName) {
    if (owners?.length > 1) {
      ownersString = owners?.map((o, idx) => (o?.name ? o.name : `owner ${idx + 1}`)).join(", ");
    } else if (owners?.length === 1) {
      ownersString = owners[0]?.name || "owner 1";
    }
  } else {
    ownersString = firmName;
  }


  let regularized_label ="";
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
    regularized_label= t("REGULARIZATION_UNAUTHORIZED")
  } else {
    floorArea = [{ floorNo: "Floor No NA", value: "NA" }];
    regularized_label= "NA"
  }

  let areaSummary;
  if (site?.buildingStatus === "Built Up") {
    areaSummary = ` ${floorArea.map(f => `${f.floorNo}: ${f.value} sq.mtrs\n`).join(" ")}Basement Area: ${basementArea} sq.mtrs\nTotal Buildup Area (sq.mtrs): ${totalFloorArea} sq.mtrs `;
  }else{
    areaSummary = "NA"
  }


  const sanctionKeys = [
    "FIRENOC_OWNER_INSTALL_FIRE_SAFETY_AS_PER_LAYOUT_PLAN",
    "FIRENOC_OWNER_INSTALL_FIRE_SAFETY_AS_PER_LAYOUT_PLAN_PB",
    "FIRENOC_OWNER_OBTAIN_FINAL_NOC_BEFORE_OCCUPANCY",
    "FIRENOC_OWNER_OBTAIN_FINAL_NOC_BEFORE_OCCUPANCY_PB",
    "FIRENOC_DEPARTMENT_MAY_REQUIRE_ADDITIONAL_FIRE_SAFETY",
    "FIRENOC_DEPARTMENT_MAY_REQUIRE_ADDITIONAL_FIRE_SAFETY_PB",
    "FIRENOC_CONSTRUCTION_FIRE_SAFETY_AS_PER_NBC",
    "FIRENOC_CONSTRUCTION_FIRE_SAFETY_AS_PER_NBC_PB",
    "FIRENOC_REAPPLY_PROVISIONAL_CERTIFICATE_ON_PLAN_CHANGE",
    "FIRENOC_REAPPLY_PROVISIONAL_CERTIFICATE_ON_PLAN_CHANGE_PB",
    "FIRENOC_DEPARTMENT_RIGHT_TO_WITHDRAW_CERTIFICATE",
    "FIRENOC_DEPARTMENT_RIGHT_TO_WITHDRAW_CERTIFICATE_PB",
    "FIRENOC_DETAILS_NOT_VALID_AS_OWNERSHIP_PROOF",
    "FIRENOC_DETAILS_NOT_VALID_AS_OWNERSHIP_PROOF_PB",
    "FIRENOC_DIGITAL_CERTIFICATE_NO_SIGNATURE_REQUIRED",
    "FIRENOC_DIGITAL_CERTIFICATE_NO_SIGNATURE_REQUIRED_PB",
  ];

  const sanctionTerms = sanctionKeys?.map((key, idx) => ({
    number: idx % 2 === 0 ? idx / 2 + 1 : "",
    text: t(key),
  }));

  const fireNOCDetails = application?.fireNOCDetails || {};
  const buildings = fireNOCDetails?.buildings || [];

  const getActiveUomValue = (buildings, code) => {
    for (const b of buildings) {
      const match = b?.uoms?.find(
        (u) => u.code === code && u.active === true
      );
      if (match) return match.value;
    }
    return "NA";
  };

  const noOfFloors = getActiveUomValue(buildings, "NO_OF_FLOORS");
  const noOfBasements = getActiveUomValue(buildings, "NO_OF_BASEMENTS");

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
      noOfFloors,
      noOfBasements,
      currentDate,
      sanctionTerms,
      ...EmpData,
      approverComment,
      regularized_label,
      ownersString,
      areaSummary
      },
    ],
  };
};

export default getNOCSanctionLetter;
