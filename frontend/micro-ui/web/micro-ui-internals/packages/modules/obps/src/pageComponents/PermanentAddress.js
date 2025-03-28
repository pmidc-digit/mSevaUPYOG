import { CardLabel, CheckBox, CitizenInfoLabel, FormStep, Loader, TextInput, TextArea, OpenLinkContainer, BackButton, RadioOrSelect, MultiSelectDropdown } from "@mseva/digit-ui-react-components";
import React, { useState,useEffect } from "react";
import Timeline from "../components/Timeline";

const PermanentAddress = ({ t, config, onSelect, value, userType, formData }) => {
  let validation = {};
  const onSkip = () => onSelect();
  const [PermanentAddress, setPermanentAddress] = useState(formData?.LicneseDetails?.PermanentAddress || formData?.formData?.LicneseDetails?.PermanentAddress);
  
   
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  let isopenlink = window.location.href.includes("/openlink/");
  const isCitizenUrl = Digit.Utils.browser.isMobile() ? true : false;
  const [pinCode, setPinCode] = useState(formData?.LicneseDetails?.Pincode || formData?.formData?.LicneseDetails?.Pincode || "");
  const [ulbType, setUlbType] = useState(""); // Initialize with the value from formData if it exists
  const [selectedUlbTypes, setSelectedUlbTypes] = useState([]); // Initialize with the value from formData if it exists
  // const [selectedUlbTypes, setSelectedUlbTypes] = useState(() => {
  //   const role = formData?.LicneseType?.LicenseType?.role;
  //   const savedUlbs = formData?.LicneseDetails?.Ulb || [];
  //   if (role === "BPA_ARCHITECT") {
  //     return getUlbTypes().map(ulb => ({ ulbname: ulb }));
  //   }
  //   return savedUlbs;



  // });
console.log("formData",formData?.LicneseType.LicenseType.role)
  function getUlbTypes() {
    return [
      "Abohar",
      "Adampur",
      "Ahmedgarh",
      "Ajnala",
      "Alawalpur",
      "Amargarh",
      "Amloh"
    ]
  }
  // useEffect(() => {
  //   const role = formData?.LicneseType?.LicenseType?.role;
  //   if (role === "BPA_ARCHITECT") {
  //     const allUlbs = getUlbTypes().map(ulb => ({ ulbname: ulb }));
  //     setSelectedUlbTypes([...allUlbs]);
  //   }
  // }, [formData?.LicneseType?.LicenseType?.role]);
  //const isEdit = window.location.href.includes("/edit-application/") || window.location.href.includes("renew-trade");
  //const { isLoading, data: fydata = {} } = Digit.Hooks.tl.useTradeLicenseMDMS(stateId, "egf-master", "FinancialYear");

  //   let mdmsFinancialYear = fydata["egf-master"] ? fydata["egf-master"].FinancialYear.filter(y => y.module === "TL") : [];
  //   let FY = mdmsFinancialYear && mdmsFinancialYear.length > 0 && mdmsFinancialYear.sort((x, y) => y.endingDate - x.endingDate)[0]?.code;

  if(isopenlink)  
  window.onunload = function () {
    sessionStorage.removeItem("Digit.BUILDING_PERMIT");
  }


  function selectPermanentAddress(e) {
    setPermanentAddress(e.target.value);
  }
  function handleUlbSelection(selectedOptions) {
    setSelectedUlbTypes(selectedOptions); 
  //   const role = formData?.LicneseType?.LicenseType?.role;
  // if (role === "BPA_ARCHITECT") {
  //   // For BPA_ARCHITECT, keep all options selected
  //   const allUlbs = getUlbTypes().map(ulb => ({ ulbname: ulb }));
  //   setSelectedUlbTypes([...allUlbs]);
  // } else {
  //   // For other roles, allow manual selection
  //   setSelectedUlbTypes(selectedOptions);
  // }
    console.log("Selected ULB Types:", selectedOptions); // Log the selected options to the console
  }
  function SelectPincode(e) {
    // setPinCode(e.target.value);
    const value = e.target.value;
    if (/^[0-9]*$/.test(value) && value.length <= 6) {
      setPinCode(value); // Only update if the value is numeric and has a maximum length of 6
    }
  }
  const goNext = () => {

    // sessionStorage.setItem("CurrentFinancialYear", FY);
    if (!(formData?.result && formData?.result?.Licenses[0]?.id))
      onSelect(config.key, { PermanentAddress: PermanentAddress, Pincode: pinCode, Ulb: selectedUlbTypes });
    else {
      let data = formData?.formData;
      data.LicneseDetails.PermanentAddress = PermanentAddress;
      onSelect("", formData)
    }
  };

  return (
    <React.Fragment>
      <div className={isopenlink ? "OpenlinkContainer" : ""}>

        {isopenlink && <BackButton style={{ border: "none" }}>{t("CS_COMMON_BACK")}</BackButton>}
        <Timeline currentStep={2} flow="STAKEHOLDER" />
        <FormStep
          config={config}
          onSelect={goNext}
          onSkip={onSkip}
          t={t}
          isDisabled={!PermanentAddress}
        >
          <CardLabel>{`${t("BPA_PERMANANT_ADDRESS_LABEL")}*`}</CardLabel>
          <TextArea
            t={t}
            isMandatory={false}
            type={"text"}
            optionKey="i18nKey"
            name="PermanentAddress"
            onChange={selectPermanentAddress}
            value={PermanentAddress}
          />

          <CardLabel>{"Pincode*"}</CardLabel>
          <TextInput
            t={t}
            type={"text"}
            isMandatory={false}
            optionKey="i18nKey"
            name="Pcode"
            minLength="6"
            value={pinCode}
            onChange={SelectPincode}
            // disable={name && !isOpenLinkFlow ? true : false}
            {...(validation = {
              isRequired: true,
              pattern: "^[0-9]{6}$",
              type: "number",
              title: t("Please enter a valid 6-digit pincode."),
            })}
          />
          <CardLabel>{"ULB*"}</CardLabel>
          <MultiSelectDropdown
            options={getUlbTypes().map((ulb) => ({ ulbname: ulb }))} // Convert ULB types to objects with a "name" key
            optionsKey="ulbname"
            selected={selectedUlbTypes}
            onSelect={handleUlbSelection}
            defaultLabel={t("Select ULBs")}
            defaultUnit={t("ULBs")}
          />
         
        </FormStep>

      </div>
    </React.Fragment>
  );
};

export default PermanentAddress;