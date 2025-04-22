import { CardLabel, FormStep, RadioOrSelect, TextInput, OpenLinkContainer, BackButton, CheckBox } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { stringReplaceAll } from "../utils";
import Timeline from "../components/Timeline";
import { CompetencyDescriptions } from "../constants/LicenseTypeConstants";
import useQualificationTypes from "../../../../libraries/src/hooks/obps/QualificationTypesForLicense";

const LicenseType = ({ t, config, onSelect, userType, formData }) => {
  if (JSON.parse(sessionStorage.getItem("BPAREGintermediateValue")) !== null) {
    formData = JSON.parse(sessionStorage.getItem("BPAREGintermediateValue"));
    sessionStorage.setItem("BPAREGintermediateValue", null);
  } else formData = formData;

  let index = window.location.href.split("/").pop();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const [qualificationType, setQualificationType] = useState(() => {
    return formData?.qualificationType || "B-Arch"; // Initialize with the value from formData if it exists
  });
  const [LicenseType, setLicenseType] = useState(formData?.LicneseType?.LicenseType || formData?.formData?.LicneseType?.LicenseType || "");
  const [ArchitectNo, setArchitectNo] = useState(formData?.LicneseType?.ArchitectNo || formData?.formData?.LicneseType?.ArchitectNo || null);

  const { data: qualificationTypes, isLoading: isQualificationLoading, error: qualificationError } = useQualificationTypes(tenantId);
  const { data, isLoading } = Digit.Hooks.obps.useMDMS(stateId, "StakeholderRegistraition", "TradeTypetoRoleMapping");
  let isopenlink = window.location.href.includes("/openlink/");
  const isCitizenUrl = Digit.Utils.browser.isMobile() ? true : false;
  const [selfCertification, setSelfCertification] = useState(formData?.selfCertification || formData?.formData?.selfCertification || null);
  let validation = {};
  const [errorMessage, setErrorMessage] = useState("");
  if (isopenlink)
    window.onunload = function () {
      sessionStorage.removeItem("Digit.BUILDING_PERMIT");
    };
  useEffect(() => {
    if (qualificationType) {
      mapQualificationToLicense(qualificationType);
    }
  }, [qualificationType]);

  function getLicenseType() {
    // let list = [];
    // let found = false;
    // data?.StakeholderRegistraition?.TradeTypetoRoleMapping.map((ob) => {
    //   found = list.some(el => el.i18nKey.includes(ob.tradeType.split(".")[0]));
    //   if (!found) list.push({ role: ob.role, i18nKey: `TRADELICENSE_TRADETYPE_${ob.tradeType.split(".")[0]}`, tradeType: ob.tradeType })
    // });
    // console.log("License Types:", list);
    // return list;

    let list = [];
    let found = false;

    data?.StakeholderRegistraition?.TradeTypetoRoleMapping.map((ob) => {
      found = list.some((el) => el.i18nKey.includes(ob.tradeType.split(".")[0]));
      if (!found) {
        list.push({
          role: ob.role,
          i18nKey: `TRADELICENSE_TRADETYPE_${ob.tradeType.split(".")[0]}`,
          tradeType: ob.tradeType,
        });
      }
    });

    if (qualificationType?.name === "B-Arch") {
      console.log("qualificationType in getlicense", qualificationType.name);
      list = list.filter((item) => item.i18nKey.includes("ARCHITECT"));
    } else {
      list = list.filter((item) => !item.i18nKey.includes("ARCHITECT"));
    }

    return list;
  }

  function mapQualificationToLicense(qualification) {
    let license = null;
    if (qualification === "B-Arch") {
      setLicenseType(null);
    } else if (qualification.name === "BE" || qualification.name === "B-Tech") {
      license = getLicenseType().find((type) => type.i18nKey.includes("ENGINEER"));
    } else if (qualification.name === "Diploma") {
      license = getLicenseType().find((type) => type.i18nKey.includes("TOWNPLANNER"));
    } else if (qualification.name === "Building designer & supervisor") {
      license = getLicenseType().find((type) => type.i18nKey.includes("DESIGNER"));
    }

    if (license) {
      setLicenseType(license);
    }
  }

  const onSkip = () => onSelect();

  function selectQualificationType(value) {
    setQualificationType(value);
    mapQualificationToLicense(value);
    setLicenseType(null);
  }

  function selectLicenseType(value) {
    setLicenseType(value);
  }

  function selectArchitectNo(e) {
    const input = e.target.value.trim();
    const pattern = /^CA(19[7-9][2-9]|20[0-9][0-9]|202[0-5])\d{5}$/;
    setArchitectNo(input);
    if (!pattern.test(input) && input !== "") {
      setErrorMessage("Invalid Council Number format! Format should be: CA<YEAR><5 DIGITS> (Year between 1972-2025) Example: CA20230012345");
    } else {
      setErrorMessage("");
    }
  }

  function goNext() {
    if (!(formData?.result && formData?.result?.Licenses[0]?.id))
      onSelect(config.key, { LicenseType, ArchitectNo, selfCertification, qualificationType: qualificationType?.name });
    else {
      let data = formData?.formData;
      data.LicneseType.LicenseType = LicenseType;
      data.LicneseType.ArchitectNo = ArchitectNo;
      data.LicneseType.selfCertification = selfCertification ? selfCertification : false;
      data.qualificationType = qualificationType?.name;
      onSelect("", formData);
    }
  }
  function selectSelfCertification(e) {
    setSelfCertification(e.target.checked);
  }
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div style={{ flex: 1, marginRight: "20px" }}>
        <div className={isopenlink ? "OpenlinkContainer" : ""}>
          {isopenlink && <BackButton style={{ border: "none" }}>{t("CS_COMMON_BACK")}</BackButton>}
          <Timeline currentStep={1} flow="STAKEHOLDER" />

          <FormStep
            t={t}
            config={config}
            onSelect={goNext}
            onSkip={onSkip}
            isDisabled={LicenseType && LicenseType?.i18nKey.includes("ARCHITECT") ? !LicenseType || !ArchitectNo : !LicenseType}
          >
            <CardLabel>{"Qualification*"}</CardLabel>
            <div className={"form-pt-dropdown-only"}>
              {/* {data && ( */}
              <RadioOrSelect
                t={t}
                optionKey="name"
                isMandatory={config.isMandatory}
                options={qualificationTypes || []}
                selectedOption={setQualificationType}
                onSelect={(value) => {
                  console.log("Selected Value:", value);
                  selectQualificationType(value);
                }}
              />
              {/* )} */}
            </div>
            <CardLabel>{t("BPA_LICENSE_TYPE")}*</CardLabel>
            <div className={"form-pt-dropdown-only"}>
              {data && (
                <RadioOrSelect
                  t={t}
                  optionKey="i18nKey"
                  isMandatory={config.isMandatory}
                  options={getLicenseType(qualificationType) || {}}
                  selectedOption={LicenseType}
                  onSelect={selectLicenseType}
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
                />
                {errorMessage && (
                  <div
                    style={{
                      color: "#d32f2f",
                      fontSize: "12px",
                      marginTop: "4px",
                      marginBottom: "12px",
                    }}
                  >
                    {errorMessage}
                  </div>
                )}
              </div>
            )}
            {LicenseType &&
              (LicenseType?.i18nKey.includes("ARCHITECT") ||
                LicenseType?.i18nKey.includes("_ENGINEER") ||
                LicenseType?.i18nKey.includes("DESIGNER") ||
                LicenseType?.i18nKey.includes("SUPERVISOR")) && (
                <div>
                  <CheckBox
                    label={
                      LicenseType?.i18nKey.includes("ARCHITECT")
                        ? "[DECLARATION UNDER SELF-CERTIFICATION SCHEME ('Residential') (BY ARCHITECT)]"
                        : LicenseType?.i18nKey.includes("_ENGINEER")
                        ? "[DECLARATION UNDER SELF-CERTIFICATION SCHEME ('Residential') (BY ENGINEER)]"
                        : LicenseType?.i18nKey.includes("DESIGNER")
                        ? "[DECLARATION UNDER SELF-CERTIFICATION SCHEME ('Residential') (BY DESIGNER)]"
                        : "[DECLARATION UNDER SELF-CERTIFICATION SCHEME ('Residential') (BY SUPERVISOR)]"
                    }
                    onChange={selectSelfCertification}
                    value={selfCertification}
                    checked={selfCertification || false}
                    style={{ marginBottom: "40px" }}
                  />
                </div>
              )}
          </FormStep>
          <div
            style={{
              flex: "0 0 30%",
              border: "1px solid #dcdcdc",
              backgroundColor: "#f9f9f9",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              marginTop: "20px",
            }}
          >
            <h1
              style={{
                fontSize: "22px",
                fontWeight: "600",
                color: "#333",
                marginBottom: "10px",
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Competencies
            </h1>
            <ul
              style={{
                fontSize: "16px",
                color: "#555",
                lineHeight: "1.6",
                textAlign: "justify",
                margin: "0",
                paddingLeft: "20px",
              }}
            >
              {LicenseType &&
                CompetencyDescriptions[LicenseType?.i18nKey.split("_").pop()].split("\n").map((point, index) => (
                  <li key={index} style={{ marginBottom: "8px" }}>
                    {point.trim()}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicenseType;
