import { CardLabel, FormStep, RadioOrSelect, TextInput, OpenLinkContainer, BackButton, CheckBox, Dropdown, Loader, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { stringReplaceAll } from "../utils";
import Timeline from "../components/Timeline";
import { CompetencyDescriptions } from "../constants/LicenseTypeConstants";
import { useLocation } from "react-router-dom";
// import useQualificationTypes from "../../../../libraries/src/hooks/obps/QualificationTypesForLicense";

const LicenseType = ({ t, config, onSelect, userType, formData }) => {


  console.log(formData, "MAIN FORM DATA");
  const index = window.location.href?.split("/").pop();
  const tenantId = localStorage.getItem("CITIZEN.CITY");
  const stateId = Digit.ULBService.getStateId();
  const { pathname } = useLocation();
  let currentPath = pathname.split("/").pop();
  let isEditable = !formData?.editableFields || formData?.editableFields?.[currentPath];

  const [qualificationType, setQualificationType] = useState(() => {
    // const saved = localStorage.getItem("licenseForm_qualificationType");
    return formData?.LicneseType?.qualificationType || formData?.formData?.LicneseType?.qualificationType || null;
  });

  const [LicenseType, setLicenseType] = useState(() => {
    // const saved = localStorage.getItem("licenseForm_LicenseType");
    return formData?.LicneseType?.LicenseType || formData?.formData?.LicneseType?.LicenseType || null;
  });

  const [ArchitectNo, setArchitectNo] = useState(() => {
    // const saved = localStorage.getItem("licenseForm_ArchitectNo");
    return formData?.LicneseType?.ArchitectNo || formData?.formData?.LicneseType?.ArchitectNo || null;
  });



// const [validTo, setValidTo] = useState(() => {
//   const epoch =
//     formData?.result?.Licenses?.[0]?.validTo ||
//     formData?.formData?.Licenses?.[0]?.validTo ||
//     null;

//   if (!epoch) return "";

//   const date = new Date(epoch);
//   const day = String(date.getDate()).padStart(2, "0");
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const year = date.getFullYear();
//   return `${day}/${month}/${year}`; // ✅ stays DD/MM/YYYY
// });

const [validTo, setValidTo] = useState(() => {
  // <CHANGE> Check LicneseType path first, then Licenses path
  const epoch =
    formData?.LicneseType?.validTo ||
    formData?.formData?.LicneseType?.validTo ||
    formData?.result?.Licenses?.[0]?.validTo ||
    formData?.formData?.Licenses?.[0]?.validTo ||
    null;

  if (!epoch) return "";

  // <CHANGE> Handle both epoch (number) and DD/MM/YYYY string formats
  if (typeof epoch === "string" && epoch.includes("/")) {
    return epoch; // Already in DD/MM/YYYY format
  }

  const date = new Date(epoch);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});

console.log("validTo",validTo);




  const isMobile = window.Digit.Utils.browser.isMobile();

  const { data: qualificationTypes, isLoading: isQualificationLoading, error: qualificationError } = Digit.Hooks.obps.useQualificationTypes(stateId);
  //console.log("qualificationTypes here", qualificationTypes);
  // let qualificationTypes = [],
  //   isQualificationLoading = false,
  //   qualificationError = {};
  const { data, isLoading } = Digit.Hooks.obps.useMDMS(stateId, "StakeholderRegistraition", "TradeTypetoRoleMapping");

  const { data: EmployeeStatusData } = Digit.Hooks.useCustomMDMS(tenantId, "StakeholderRegistraition", [{ name: "TradeTypetoRoleMapping" }]);

  // console.log("EmployeeStatusData", EmployeeStatusData);

  const formattedData = EmployeeStatusData?.StakeholderRegistraition?.TradeTypetoRoleMapping;

  const isopenlink = window.location.href.includes("/openlink/");
  const isCitizenUrl = Digit.Utils.browser.isMobile() ? true : false;

  const [selfCertification, setSelfCertification] = useState(() => {
    return formData?.LicneseType?.selfCertification || formData?.formData?.LicneseType?.selfCertification || false;
    // JSON.parse(localStorage.getItem("licenseForm_selfCertification")) === null ? formData?.LicneseType?.selfCertification ? formData?.formData?.selfCertification :  false : JSON.parse(localStorage.getItem("licenseForm_selfCertification"));
  });

  const validation = {};

  console.log("OBPS_Formdata", formData, qualificationType);

  const [errorMessage, setErrorMessage] = useState("");
  if (isopenlink)
    window.onunload = () => {
      sessionStorage.removeItem("Digit.BUILDING_PERMIT");
    };
  useEffect(() => {
    if (qualificationType) {
      mapQualificationToLicense(qualificationType);
    }
  }, [qualificationType]);

  console.log("qualificationTypeFinfing", qualificationType);

  useEffect(() => {
    console.log("selectedQualificationType 1", qualificationTypes, formData?.LicneseType?.qualificationType, qualificationTypes);
    if (formData?.LicneseType?.qualificationType && qualificationTypes && !qualificationType) {
      const selectedQualificationType = qualificationTypes.find((val) => {
        return val.name === formData?.LicneseType?.qualificationType;
      });

      setQualificationType(selectedQualificationType);
      console.log("selectedQualificationType", selectedQualificationType, formData?.LicneseType?.qualificationType, qualificationTypes);
    }
  }, []);

  useEffect(() => {
    if(typeof qualificationType === "string" && qualificationTypes?.length > 0){
      const selectedQualificationType = qualificationTypes.find((val) => {
        return val.name === qualificationType;
      });
  
      setQualificationType(selectedQualificationType);
    }
  }, [qualificationTypes, qualificationType]);

    // useEffect(() => {
    //   const epoch =
    //     formData?.result?.Licenses?.[0]?.validTo ||
    //     formData?.formData?.Licenses?.[0]?.validTo ||
    //     null;

    //   console.log(epoch, "EPOCH LOOK");
    //   console.log(formData, "FORM DATA LOOK");

    //   if (epoch) {
    //     const date = new Date(epoch);
    //     const day = String(date.getDate()).padStart(2, "0");
    //     const month = String(date.getMonth() + 1).padStart(2, "0");
    //     const year = date.getFullYear();

    //     const formattedDate = `${day}/${month}/${year}`;
    //     console.log(formattedDate, "DATE LOOK");

    //     setValidTo(formattedDate);
    //   }
    // }, [formData]);


    useEffect(() => {
  // <CHANGE> Check LicneseType path first, then Licenses path
  const epoch =
    formData?.LicneseType?.validTo ||
    formData?.formData?.LicneseType?.validTo ||
    formData?.result?.Licenses?.[0]?.validTo ||
    formData?.formData?.Licenses?.[0]?.validTo ||
    null;

  console.log(epoch, "EPOCH LOOK");
  console.log(formData, "FORM DATA LOOK");

  if (epoch) {
    // <CHANGE> Handle both epoch (number) and DD/MM/YYYY string formats
    if (typeof epoch === "string" && epoch.includes("/")) {
      setValidTo(epoch);
      return;
    }

    const date = new Date(epoch);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const formattedDate = `${day}/${month}/${year}`;
    console.log(formattedDate, "DATE LOOK");

    setValidTo(formattedDate);
  }
}, [formData]);


  useEffect(() => {
    if (qualificationType !== null) {
      localStorage.setItem("licenseForm_qualificationType", JSON.stringify(qualificationType));
    }
  }, [qualificationType]);

  useEffect(() => {
    if (LicenseType !== null) {
      localStorage.setItem("licenseForm_LicenseType", JSON.stringify(LicenseType));
    }
  }, [LicenseType]);

  useEffect(() => {
    if (ArchitectNo !== null) {
      localStorage.setItem("licenseForm_ArchitectNo", ArchitectNo);
    }
  }, [ArchitectNo]);

  useEffect(() => {
    if (selfCertification !== null) {
      localStorage.setItem("licenseForm_selfCertification", JSON.stringify(selfCertification));
    }
  }, [selfCertification]);

  function getLicenseType() {
    const list = [];
    const found = false;

    formattedData?.forEach((item) => {
      if (item?.isActive === "true") {
        console.log("item=====", item);
        const mainType = item?.tradeType?.split(".")[0];
        const i18nKey = `TRADELICENSE_TRADETYPE_${mainType}`;

        const alreadyExists = list.some((el) => el.i18nKey === i18nKey);

        if (!alreadyExists) {
          list.push({
            role: item.role,
            i18nKey,
            tradeType: item.tradeType,
            code: item?.code,
            applicationFee: item?.applicationFee || 0,
            renewalFee: item?.renewalFee || 0,
          });
        }
      }
    });

    console.log("list", list);

    return list;
  }

  console.log("License Type List", getLicenseType());

  function mapQualificationToLicense(qualification) {
    let license = getLicenseType().find((type) => type.i18nKey.includes(qualification?.role));

    // if (qualification.name == "B-Arch") {
    //   license = getLicenseType().find((type) => type.i18nKey.includes("ARCHITECT"));
    // } else if (qualification.name == "BE/B-Tech") {
    //   license = getLicenseType().find((type) => type.i18nKey.includes("ENGINEER"));
    // } else if (qualification.name == "Diploma in Civil Engineering/Architect") {
    //   license = getLicenseType().find((type) => type.i18nKey.includes("SUPERVISOR"));
    // } else if (qualification.name == "Town and Country Planning") {
    //   license = getLicenseType().find((type) => type.i18nKey.includes("TOWNPLANNER"));
    // }

    if (license) {
      setLicenseType(license);
    }
  }

  const onSkip = () => onSelect();

  function selectQualificationType(value) {
    setQualificationType(value);
    mapQualificationToLicense(value);
    setLicenseType(null);
    setArchitectNo(null);
    setErrorMessage("");
  }

  function selectLicenseType(value) {
    setLicenseType(value);
  }

  function isValidCOA(input) {
    let pattern = /^CA\/(\d{4})\/\d{5,6}$/;
    const match = input.match(pattern);
    if (!match) return false;

    const year = Number.parseInt(match[1], 10);
    const currentYear = new Date().getFullYear();

    return year >= 1972 && year <= currentYear;
  }

  function selectArchitectNo(e) {
    const input = e.target.value.trim();
    setArchitectNo(input);
    if (!isValidCOA(input) && input !== "") {
      setErrorMessage(t("BPA_INVALID_MESSAGE_FOR_COA"));
    } else {
      setErrorMessage("");
    }
  }

  function isValidAITPorFITP(input) {
    const pattern = /^(AITP|FITP)\/(\d{4})\/\d{4}$/;
    const match = input.match(pattern);
    if (!match) return false;

    const year = Number.parseInt(match[2], 10);
    return year >= 1972 && year <= new Date().getFullYear();
  }

  function selectAssociateOrFellowNo(e) {
    const input = e.target.value.trim();
    setArchitectNo(input);
    if (!isValidAITPorFITP(input) && input !== "") {
      setErrorMessage(t("BPA_INVALID_MESSAGE_FOR_AITP_OR_FITP"));
    } else {
      setErrorMessage("");
    }
  }

    // function selectValidTo(input) {
    //   const [day, month, year] = input.split("/");
    //   const inputDate = new Date(`${year}-${month}-${day}`);
    //   const today = new Date();

    //   setValidTo(input);

    //   if (inputDate < today) {
    //     setErrorMessage(t("BPA_VALID_TO_DATE_ERROR"));
    //   } else {
    //     setErrorMessage("");
    //   }
    // }


   function selectValidTo(input) {
    const cleaned = input.replace(/[^\d/]/g, "")
    setValidTo(cleaned)

    const parts = cleaned.split("/")
    if (parts.length !== 3) return

    const [day, month, year] = parts
    const dayNum = Number(day)
    const monthNum = Number(month)
    const yearNum = Number(year)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const currentYear = today.getFullYear()
    const maxYear = currentYear + 80

    if (year && year.length > 4) {
      setErrorMessage("Year must be 4 digits (YYYY)")
      return
    }

    if (year.length === 4) {
      if (yearNum < currentYear) {
        setErrorMessage("Expiry date cannot be in the past")
        return
      }
      if (yearNum > maxYear) {
        setErrorMessage(`Year cannot exceed ${maxYear} (80 years from now)`)
        return
      }
    }

    if (month && month.length === 2) {
      if (monthNum < 1 || monthNum > 12) {
        setErrorMessage("Month must be between 01 and 12")
        return
      }
    }

    if (day && day.length === 2 && month && month.length === 2) {
      if (dayNum < 1 || dayNum > 31) {
        setErrorMessage("Invalid day")
        return
      }

      const daysInMonth = new Date(yearNum || currentYear, monthNum, 0).getDate()
      if (dayNum > daysInMonth) {
        setErrorMessage(`Invalid day for the selected month (max ${daysInMonth} days)`)
        return
      }
    }

    if (day && month && year.length === 4) {
      const inputDate = new Date(`${year}-${month}-${day}`)
      inputDate.setHours(0, 0, 0, 0)

      if (
        inputDate.getDate() !== dayNum ||
        inputDate.getMonth() + 1 !== monthNum ||
        inputDate.getFullYear() !== yearNum
      ) {
        setErrorMessage("Invalid date - this day does not exist in the selected month")
        return
      }

      if (inputDate < today) {
        setErrorMessage("Expiry date cannot be in the past")
        return
      }

      const maxDate = new Date(maxYear, 11, 31)
      if (inputDate > maxDate) {
        setErrorMessage(`Date cannot exceed 80 years from current year`)
        return
      }
    }

    setErrorMessage("")
  }




  function goNext() {
    if (errorMessage !== "") return;

    if (LicenseType?.i18nKey.includes("ARCHITECT") && ArchitectNo === null) {
      setErrorMessage(t("BPA_INVALID_MESSAGE_FOR_COA"));
      return;
    }

    if (LicenseType?.i18nKey.includes("TOWNPLANNER") && ArchitectNo === null) {
      setErrorMessage(t("BPA_INVALID_MESSAGE_FOR_AITP_OR_FITP"));
      return;
    }

    if (qualificationType === null) {
      setErrorMessage(t("BPA_SELECT_QUALIFICATION_TYPE"));
      return;
    }

       if (LicenseType?.i18nKey.includes("ARCHITECT")) {
      if (!validTo || validTo.split("/").length !== 3) {
        setErrorMessage("Please enter a valid expiry date")
        return
      }

      const [day, month, year] = validTo.split("/")
      const inputDate = new Date(`${year}-${month}-${day}`)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const maxYear = today.getFullYear() + 80

      if (inputDate < today) {
        setErrorMessage("Expiry date cannot be in the past")
        return
      }

      if (Number(year) > maxYear) {
        setErrorMessage(`Year cannot exceed ${maxYear}`)
        return
      }
    
    }
    // Clear localStorage on successful form submission
    localStorage.removeItem("licenseForm_qualificationType");
    localStorage.removeItem("licenseForm_LicenseType");
    localStorage.removeItem("licenseForm_ArchitectNo");
    localStorage.removeItem("licenseForm_selfCertification");

   if (!(formData?.result && formData?.result?.Licenses[0]?.id)) {
      console.log("onSelect going", { LicenseType, ArchitectNo, selfCertification, qualificationType, validTo })
      const validToEpoch = (() => {
        if (!validTo) return null
        const [day, month, year] = validTo.split("/")
        return new Date(`${year}-${month}-${day}`).getTime()
      })()
      onSelect(config.key, {
        LicenseType,
        ArchitectNo,
        selfCertification,
        validTo: validToEpoch,
        qualificationType: qualificationType,
      })
    } else {
      const data = formData?.formData || formData
      console.log("onSelect going 2", data)
      data.LicneseType.LicenseType = LicenseType
      data.LicneseType.ArchitectNo = ArchitectNo
      data.LicneseType.selfCertification = selfCertification ? selfCertification : false
      data.LicneseType.qualificationType = qualificationType
      data.LicneseType.validTo = validTo
      formData.formData = data
      onSelect("", formData)
    }
  }
  console.log("formData in LicenseType", formData);
  if(isQualificationLoading ) return <Loader /> ;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "60px" }}>
      <div style={{ flex: 1, marginRight: "20px" }}>
        <div className={isopenlink ? "OpenlinkContainer" : ""}>
          {isopenlink && <BackButton >{t("CS_COMMON_BACK")}</BackButton>}
          {isMobile && <Timeline currentStep={1} flow="STAKEHOLDER" />}

          <FormStep
            t={t}
            config={config}
            // onSelect={goNext}
            // onSkip={onSkip}
            // isDisabled={
            //   (LicenseType?.i18nKey.includes("ARCHITECT") && !ArchitectNo) ||
            //   (LicenseType?.i18nKey.includes("TOWNPLANNER") && !ArchitectNo) ||
            //   !qualificationType
            // }
          >
            <CardLabel>{t("BPA_QUALIFICATION_TYPE")}*</CardLabel>
            <div className={"form-pt-dropdown-only"}>
              {/* {data && ( */}
              <Dropdown
                t={t}
                optionKey="name"
                isMandatory={config.isMandatory}
                option={qualificationTypes || []}
                selected={qualificationType}
                select={(value) => {
                  selectQualificationType(value);
                }}
                disable={!isEditable}
              />
            </div>

            <CardLabel>{t("BPA_LICENSE_TYPE")}*</CardLabel>
            <div className={"form-pt-dropdown-only"}>
              {data && (
                <Dropdown
                  t={t}
                  optionKey="code"
                  isMandatory={config.isMandatory}
                  option={getLicenseType(qualificationType) || {}}
                  selected={LicenseType}
                  select={selectLicenseType}
                  disable={true}
                />
              )}
            </div>

            {LicenseType && LicenseType?.i18nKey.includes("ARCHITECT") && (
              <div>
                <CardLabel>{`${t("BPA_COUNCIL_NUMBER")}*`}</CardLabel>
                <TextInput
                  t={t}
                  type={"text"}
                  isMandatory={false}
                  optionKey="i18nKey"
                  name="ArchitectNo"
                  value={ArchitectNo}
                  onChange={selectArchitectNo}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                  }}
                  disabled={!isEditable}
                />
                {errorMessage && (
                  <div
                   
                  >
                    {errorMessage}
                  </div>
                )}
              </div>
            )}


            {LicenseType && LicenseType?.i18nKey.includes("ARCHITECT") && (
              <div>
                <CardLabel>{`${t("BPA_CERTIFICATE_EXPIRY_DATE")}*`}</CardLabel>
                <div className="field">

                  <TextInput
                    t={t}
                    type="date"
                    name="validTo"
                    value={
                      validTo
                        ? (() => {
                            const [day, month, year] = validTo.split("/");
                            return `${year}-${month}-${day}`;
                          })()
                        : ""
                    }
                     onChange={(e) => {
                      const isoValue = e.target.value
                      if (!isoValue) {
                        setValidTo("")
                        setErrorMessage("")
                        return
                      }

                      const [year, month, day] = isoValue.split("-")
                      const inputDate = new Date(isoValue)

                      if (
                        inputDate.getDate() !== Number(day) ||
                        inputDate.getMonth() + 1 !== Number(month) ||
                        inputDate.getFullYear() !== Number(year)
                      ) {
                        setErrorMessage("Invalid date - this day does not exist in the selected month")
                        setValidTo("")
                        return
                      }

                      const formatted = `${day}/${month}/${year}`
                      selectValidTo(formatted)
                    }}
                    min={new Date().toISOString().split("T")[0]}
                    max={(() => {
                      const maxDate = new Date()
                      maxDate.setFullYear(maxDate.getFullYear() + 80)
                      return maxDate.toISOString().split("T")[0]
                    })()}
                    disabled={!isEditable}
                  />

                </div>
              </div>
            )}


            {LicenseType && LicenseType?.i18nKey.includes("TOWNPLANNER") && (
              <div>
                <CardLabel>{t("BPA_ASSOCIATE_OR_FELLOW_NUMBER")}*</CardLabel>
                <TextInput
                  t={t}
                  type={"text"}
                  isMandatory={false}
                  optionKey="i18nKey"
                  name="ArchitectNo"
                  value={ArchitectNo}
                  onChange={selectAssociateOrFellowNo}
                  disabled={!isEditable}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                  }}
                />
                {errorMessage && (
                  <div
                   
                  >
                    {errorMessage}
                  </div>
                )}
              </div>
            )}

            {/* {LicenseType &&
              (LicenseType?.i18nKey.includes("ARCHITECT") ||
                LicenseType?.i18nKey.includes("ENGINEER") ||
                LicenseType?.i18nKey.includes("SUPERVISOR") ||
                LicenseType?.i18nKey.includes("TOWNPLANNER")) && (
                <div>
                  <CheckBox
                    label={
                      LicenseType?.i18nKey.includes("ARCHITECT")
                        ? t("DECLARATION_SELF_CERTIFICATION_RESIDENTIAL_ARCHITECT")
                        : LicenseType?.i18nKey.includes("ENGINEER")
                        ? t("DECLARATION_SELF_CERTIFICATION_RESIDENTIAL_ENGINEER")
                        : LicenseType?.i18nKey.includes("SUPERVISOR")
                        ? t("DECLARATION_SELF_CERTIFICATION_RESIDENTIAL_SUPERVISOR")
                        : t("DECLARATION_SELF_CERTIFICATION_RESIDENTIAL_TOWNPLANNER")
                    }
                    onChange={selectSelfCertification}
                    value={selfCertification}
                    checked={selfCertification || false}
                    style={{ marginBottom: "40px" }}
                  />
                </div>
              )} */}
          </FormStep>
          <div
            style={{
              marginTop: "32px",
              backgroundColor: "#f8f9fa",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            }}
          >
            <h1
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#1f2937",
                marginBottom: "16px",
                marginTop: "0",
              }}
            >
              {t("BPA_COMPETENCIES")}
            </h1>
            <ul
              style={{
                listStyle: "none",
                padding: "0",
                margin: "0",
              }}
            >
              {LicenseType &&
                CompetencyDescriptions[LicenseType?.i18nKey?.split("_").pop()]?.split("\n")?.map((point, index) => (
                  <li 
                    key={index}
                    style={{
                      padding: "12px 0",
                      paddingLeft: "28px",
                   
                      fontSize: "14px",
                      color: "#374151",
                    
                      borderBottom: index < (CompetencyDescriptions[LicenseType?.i18nKey?.split("_").pop()]?.split("\n")?.length - 2) ? "1px solid #e5e7eb" : "none",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: "0",
                        top: "12px",
                        width: "6px",
                        height: "6px",
                        backgroundColor: "#2563eb",
                        borderRadius: "50%",
                      }}
                    />
                    {point.trim()}
                  </li>
                ))}
                <li
                  style={{
                    padding: "0 0",
                    paddingLeft: "28px",
                    position: "relative",
                    fontSize: "13px",
                    color: "#666666",
                    fontStyle: "italic",
                    lineHeight: "1.6",
                    marginTop: "8px",
                    paddingTop: "16px",
                    borderTop: "1px solid #fff",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "0",
                      top: "16px",
                      width: "6px",
                      height: "6px",
                      backgroundColor: "#f59e0b",
                      borderRadius: "50%",
                    }}
                  />
                  {`*NOTE: Registration Fees as per Council norms is ${LicenseType?.applicationFee || 0} INR and Renewal Fees is ${LicenseType?.renewalFee || 0} INR.`}
                </li>
            </ul>
          </div>
        </div>
      </div>
      <ActionBar>
        <SubmitBar
          label={t("CS_COMMON_NEXT")}
          onSubmit={goNext}
          disabled={
              (LicenseType?.i18nKey.includes("ARCHITECT") && !ArchitectNo) ||
              (LicenseType?.i18nKey.includes("TOWNPLANNER") && !ArchitectNo) ||
              !qualificationType
          }
        />
      </ActionBar>
    </div>
  );
};

export default LicenseType;
