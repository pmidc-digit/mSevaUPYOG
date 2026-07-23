const getNOCSanctionLetter = async ({application, t,EmpData,approverComment,matchedCity = {}}) => {
  
  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  console.log(matchedCity ,"matchedCity in here");
  
  console.log('application', application)
  const firmName = application?.nocDetails?.additionalDetails?.applicationDetails?.owners?.[0]?.firmName
  const owners = application?.fireNOCDetails?.applicantDetails?.owners || [];
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

  console.log(EmpData , "emp");
  

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

  const fireNOCDetails = application?.fireNOCDetails || {}
  const nocTypeUpper = (fireNOCDetails?.fireNOCType || "").toUpperCase();

  const baseSanctionKeys = [
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

  const sanctionKeys =
  nocTypeUpper === "NEW"
    ? [
        ...baseSanctionKeys.slice(0, 10).map(key => `NEW_${key}`),
        ...baseSanctionKeys.slice(-2),
      ]
    : baseSanctionKeys;

  const sanctionTerms = sanctionKeys?.map((key, idx) => ({
    number: idx % 2 === 0 ? idx / 2 + 1 : "",
    text: t(key),
  }));

  const sanctionHeading =
    nocTypeUpper === "PROVISIONAL"
      ? `${fireNOCDetails?.fireNOCType} NOC is issued subject to following conditions:`
      : " ";
  const buildings = fireNOCDetails?.buildings || [];
  const nocDocuments = (fireNOCDetails?.additionalDetails?.documents || fireNOCDetails?.applicantDetails?.additionalDetail?.ownerAuditionalDetail?.documents || [])

  const updatedDocs = (nocDocuments || []).map((doc, idx) =>({
    ...doc,
    index : idx +1,
    dropdown : {
      ...doc?.dropdown || {},
      value : typeof doc?.dropdown?.value === "string"
          ? doc?.dropdown?.value?.replace(/\./g, "_")
          : doc?.dropdown?.value || "-",
    },
    documentType: doc?.documentType?.replace(/\./g, "_")
  }));

  const getActiveUomValue = (buildings, code) => {
    for (const b of buildings) {
      const match = b?.uoms?.find(
        (u) => u.code === code && u.active === true
      );
      if (match) return match.value;
    }
    return "NA";
  };

  const noOfFloors = getActiveUomValue(buildings, "NO_OF_FLOORS") || " ";
  const noOfBasements = getActiveUomValue(buildings, "NO_OF_BASEMENTS") || " ";
  const buildingNamesStr = (buildings || [])?.map(b => b?.name).filter(Boolean).join(", ");

const addr = fireNOCDetails?.propertyDetails?.address || {};
const ulbName = matchedCity?.city?.name;
const ulbType = matchedCity?.city?.ulbType;
console.log(ulbName, ulbType ,  "ULBBB");

const zoneLabel = fireNOCDetails?.zone || " ";
const validityPeriod = `${fireNOCDetails?.validityPeriod || fireNOCDetails?.additionalDetail?.validityYears || 1} Year(s)`;


const locality = addr?.locality?.code;
const doorNo = addr?.doorNo;
const street = addr?.street;
const landmark = addr?.landmark;
const pincode = addr?.pincode;

const ulb = ulbName;
const ulbCategory = ulbType;

const floors = noOfFloors || " ";
const basements = noOfBasements !== "NA" ?`${noOfBasements} basements and,` : " " ;

const submittedDate =  new Date(Number(fireNOCDetails?.issuedDate))?.toLocaleDateString("en-GB") || " "

const zone = zoneLabel || " ";
const validity = validityPeriod || " ";

const joinAddress = (...parts) => parts?.filter(Boolean).join(", ");

const certificateTextEn =
  nocTypeUpper === "PROVISIONAL"
    ? `Certified that the ${buildingNamesStr}, at ${joinAddress(doorNo, street, locality, landmark && `${landmark} landmark`, ulb, pincode)}, has been inspected by the fire officer. This site is vacant/under-construction and is accessible to fire brigade. As per proposed drawing, building is to be constructed with ${basements} ${floors} (Upper floor). Fire department has examined the fire safety layout plan/drawing and found it fit for occupancy of ${zone} (as per NBC). Issued on ${submittedDate} at ${joinAddress(ulb, ulbCategory)}.`
    : `Certified that the ${buildingNamesStr} at ${joinAddress(locality, ulbCategory, ulb)} comprised of ${basements} ${floors} (Upper floor) owned/occupied by ${ownersString} have complied with the fire prevention and fire safety requirements of National Building Code and verified by the officer concerned of fire service on ${submittedDate} in the presence of ${ownersString} and that the building/premises is fit for occupancy ${zone} (As per NBC) for period of ${validity} from issue date. Subject to the following conditions. Issued on ${submittedDate} at ${joinAddress(ulb, ulbCategory)}.`;

    const certificateTextPb =
  nocTypeUpper === "PROVISIONAL"
    ? `ਤਸਦੀਕ ਕੀਤਾ ਜਾਂਦਾ ਹੈ ਕਿ ${buildingNamesStr}, ${joinAddress(doorNo, street, locality, landmark, ulb, pincode)}, ਦੀ ਫਾਇਰ ਅਫਸਰ ਵੱਲੋਂ ਪੜਤਾਲ ਕੀਤੀ ਗਈ। ਇਸ ਸਮੇਂ ਇਹ ਜਗ੍ਹਾ ਖਾਲੀ/ਉਸਾਰੀ ਅਧੀਨ ਹੈ ਅਤੇ ਫਾਇਰ ਬ੍ਰਿਗੇਡ ਦੀ ਪਹੁੰਚ ਦੇ ਅੰਦਰ ਹੈ। ਲੇਆਊਟ ਪਲਾਨ/ਡਰਾਇੰਗ ਮੁਤਾਬਕ ${basements} ਬੇਸਮਟ ਅਤੇ ${floors} ਮੰਜ਼ਿਲ ਹਨ। ਫਾਇਰ ਵਿਭਾਗ ਵੱਲੋਂ ਜਮ੍ਹਾਂ ਕਰਵਾਏ ਗਏ ਫਾਇਰ ਸੇਫਟੀ ਲੇਆਊਟ ਪਲਾਨ/ਡਰਾਇੰਗ ਨੂੰ ਘੌਖਿਆ ਗਿਆ ਅਤੇ ਬਿਲਡਿੰਗ ਕੋਡ ਅਨੁਸਾਰ ਇਮਾਰਤ/ਬਿਲਡਿੰਗ ਨੂੰ ${zone} (ਐਨ.ਬੀ.ਸੀ. ਦੇ ਅਨੁਸਾਰ) ਦੀ ਆਬਾਦੀ ਲਈ ਯੋਗ ਪਾਇਆ ਗਿਆ। ${joinAddress(ulb, ulbCategory)} ਵਿਖੇ ਜਾਰੀ ਕਰਨ ਦੀ ਮਿਤੀ ${submittedDate}.`
    : `ਤਸਦੀਕ ਕੀਤਾ ਜਾਂਦਾ ਹੈ ਕਿ ${buildingNamesStr}, ${joinAddress(locality, ulbCategory, ulb)}, ਸਮੇਤ ${basements} ਬੇਸਮਟ ਅਤੇ ${floors} (ਉਪਰਲੀ ਮੰਜ਼ਿਲ) ਮਲਕੀਅਤ/ਕਬਜ਼ਾਦਾਰ ${ownersString} ਰਾਸ਼ਟਰੀ ਬਿਲਡਿੰਗ ਕੋਡ ਅਨੁਸਾਰ ਅੱਗ ਬੁਝਾਉਣ ਦੇ ਪ੍ਰਭਾਵ ਅਤੇ ਬਚਾਅ ਦੀਆਂ ਲੋੜਾਂ ਨੂੰ ਪੂਰਾ ਕਰਦੀ ਹੈ ਜਿਸ ਨੂੰ ਸਬੰਧਤ ਫਾਇਰ ਅਧਿਕਾਰੀ ਵੱਲੋਂ ${ownersString} (ਮਾਲਕ ਜਾਂ ਉਸ ਦੇ ਪ੍ਰਤਿਨਿਧੀ ਦਾ ਨਾਮ) ਦੀ ਮੌਜੂਦਗੀ ਵਿੱਚ ${submittedDate} ਨੂੰ ਪ੍ਰਮਾਣਿਤ ਕੀਤਾ ਗਿਆ ਅਤੇ ਇਮਾਰਤ/ਬਿਲਡਿੰਗ ${zone} (ਐਨ.ਬੀ.ਸੀ. ਦੇ ਅਨੁਸਾਰ) ਦੀ ਆਬਾਦੀ ਲਈ Issue date ਤੋਂ ${validity} ਤੱਕ ਯੋਗ ਹੈ ਜਿਸ ਲਈ ਨਿਮਨ ਅਨੁਸਾਰ ਹਦਾਇਤਾਂ ਹਨ।`;  return {
    Noc: [
      {
       ...application, 
      nocDetails: {
        ...application?.nocDetails,
        additionalDetails: {
          ...application?.nocDetails?.additionalDetails,
          SubmittedOn: submittedDate,
          siteDetails: {
            ...site,
            floorArea,
            basementArea,
            totalFloorArea,
          },
        },
      },
        fireNOCDetails: {
          ...application?.fireNOCDetails,
          additionalDetail: {
            ...application?.fireNOCDetails?.additionalDetail || {},
            documents: updatedDocs
          }
        },
      noOfFloors,
      noOfBasements,
      certificateTextEn,
      certificateTextPb,
      currentDate,
      sanctionTerms,
      sanctionHeading,
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
