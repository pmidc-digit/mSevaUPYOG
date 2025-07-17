import React, { useEffect, useState } from "react";
import { FormStep, TextInput, CardLabel, RadioButtons, LabelFieldPair, Dropdown, Menu, MobileNumber, TextArea } from "@mseva/digit-ui-react-components";
import { cardBodyStyle } from "../utils";
import { useLocation, useRouteMatch } from "react-router-dom";
import Timeline from "../components/PTRTimeline";

const PTRCitizenDetails
 = ({ t, config, onSelect, userType, formData, ownerIndex }) => {
  const { pathname: url } = useLocation();

  let index = 0
  // window.location.href.charAt(window.location.href.length - 1);
  // console.log("index in detail page ",  index)
   
  let validation = {};

  // const [applicantName, setName] = useState((formData.ownerss && formData.ownerss[index] && formData.ownerss[index].applicantName) || formData?.ownerss?.applicantName || "");
  const [firstName, setFirstName] = useState((formData.ownerss && formData.ownerss[index] && formData.ownerss[index].firstName) || formData?.ownerss?.firstName || "");
  const [lastName, setLastName] = useState((formData.ownerss && formData.ownerss[index] && formData.ownerss[index].lastName) || formData?.ownerss?.lastName || "");
  const [address, setAddress] = useState((formData.ownerss && formData.ownerss[index] && formData.ownerss[index].address) || formData?.ownerss?.address || "");
  const [emailId, setEmail] = useState((formData.ownerss && formData.ownerss[index] && formData.ownerss[index].emailId) || formData?.ownerss?.emailId || "");
  const [mobileNumber, setMobileNumber] = useState(
    (formData.ownerss && formData.ownerss[index] && formData.ownerss[index].mobileNumber) || formData?.ownerss?.mobileNumber || ""
  );
  // const [alternateNumber, setAltMobileNumber] = useState(
  //   (formData.ownerss && formData.ownerss[index] && formData.ownerss[index].alternateNumber) || formData?.ownerss?.alternateNumber || ""
  // );

  
  const [fatherName, setFatherOrHusbandName] = useState(
    (formData.ownerss && formData.ownerss[index] && formData.ownerss[index].fatherName) || formData?.ownerss?.fatherName || ""
  );
  
 

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();

  
  function setOwnerFirstName(e) {
    setFirstName(e.target.value);
  }

  function setOwnerAddress(e) {
    setAddress(e.target.value);
  }

  function setOwnerLastName(e) {
    setLastName(e.target.value);
  }

  // function setOwnerName(e) {
  //   setName(e.target.value);
  // }
  function setOwnerEmail(e) {
    setEmail(e.target.value);
  }
  

  function setMobileNo(e) {
    setMobileNumber(e.target.value);
  }
  
  // function setAltMobileNo(e) {
  //   setAltMobileNumber(e.target.value);
  // }
  function setGuardiansName(e) {
    setFatherOrHusbandName(e.target.value);
  }
  

  const goNext = () => {
    console.log("GoNext Called", formData);
    let owner = formData.ownerss && formData.ownerss[index];
    let ownerStep;
    if (userType === "citizen") {
      ownerStep = { ...owner, mobileNumber, fatherName, emailId, firstName, lastName, address };
      onSelect(config.key, { ...formData[config.key], ...ownerStep }, false, index);
    } else {
      
      ownerStep = { ...owner,  mobileNumber, fatherName,emailId, firstName, lastName, address };
      onSelect(config.key, ownerStep, false,index);
    }
  };

  const onSkip = () => onSelect();

  
  

  useEffect(() => {
    console.log("useEffect called in PTRCitizenDetails", formData, userType);
    if (userType === "citizen") {
      goNext();
    }
  }, [ mobileNumber, fatherName, emailId, firstName, lastName, address]);

 

  return (
    <React.Fragment>
    {
      window.location.href.includes("/citizen") ?
 <Timeline currentStep={1} />
    : null
    }

    <FormStep
      config={config}
      onSelect={goNext}
      onSkip={onSkip}
      t={t}
      isDisabled={ !mobileNumber || !fatherName || !emailId || !firstName || !lastName || !address}
    >
      <div>
        <CardLabel>{`${t("PTR_APPLICANT_FIRST_NAME")}`}</CardLabel>
        <TextInput
          t={t}
          type={"text"}
          isMandatory={false}
          optionKey="i18nKey"
          name="firstName"
          value={firstName}
          onChange={setOwnerFirstName}
          ValidationRequired = {true}
          {...(validation = {
            isRequired: true,
            pattern: "^[a-zA-Z ]+$",
            type: "tel",
            title: t("PT_NAME_ERROR_MESSAGE"),
          })}
       
         
        />

        <CardLabel>{`${t("PTR_APPLICANT_LAST_NAME")}`}</CardLabel>
        <TextInput
          t={t}
          type={"text"}
          isMandatory={false}
          optionKey="i18nKey"
          name="lastName"
          value={lastName}
          onChange={setOwnerLastName}
          ValidationRequired = {true}
          {...(validation = {
            isRequired: true,
            pattern: "^[a-zA-Z ]+$",
            type: "tel",
            title: t("PT_NAME_ERROR_MESSAGE"),
          })}
       
         
        />

        <CardLabel>{`${t("PTR_EMAIL_ID")}`}</CardLabel>
        <TextInput
          t={t}
          type={"text"}
          isMandatory={true}
          optionKey="i18nKey"
          name="emailId"
          value={emailId}
          onChange={setOwnerEmail}
          ValidationRequired = {true}
          {...(validation = {
            isRequired: true,
            pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
            type: "text",
            title: t("PTR_NAME_ERROR_MESSAGE"),
          })}
        />

        {/* <CardLabel>{`${t("PTR_APPLICANT_NAME")}`}</CardLabel>
        <TextInput
          t={t}
          type={"text"}
          isMandatory={false}
          optionKey="i18nKey"
          name="applicantName"
          value={applicantName}
          onChange={setOwnerName}
          ValidationRequired = {true}
          {...(validation = {
            isRequired: true,
            pattern: "^[a-zA-Z ]+$",
            type: "tel",
            title: t("PT_NAME_ERROR_MESSAGE"),
          })}
       
         
        /> */}
       
        <CardLabel>{`${t("PTR_MOBILE_NUMBER")}`}</CardLabel>
        <MobileNumber
          value={mobileNumber}
          name="mobileNumber"
          onChange={(value) => setMobileNo({ target: { value } })}
          {...{ required: true, pattern: "[6-9]{1}[0-9]{9}", type: "tel", title: t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID") }}
        />

        {/* <CardLabel>{`${t("PTR_ALT_MOBILE_NUMBER")}`}</CardLabel>
          <MobileNumber
            value={alternateNumber}
            name="alternateNumber"
            onChange={(value) => setAltMobileNo({ target: { value } })}
            {...{ required: false, pattern: "[6-9]{1}[0-9]{9}", type: "tel", title: t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID") }}
          /> */}
        <CardLabel>{`${t("PTR_FATHER_HUSBAND_NAME")}`}</CardLabel>
        <TextInput
          t={t}
          type={"text"}
          isMandatory={false}
          optionKey="i18nKey"
          name="fatherName"
          value={fatherName}
          onChange={setGuardiansName}
          ValidationRequired = {true}
          {...(validation = {
            isRequired: true,
            pattern: "^[a-zA-Z ]+$",
            type: "tel",
            title: t("PTR_NAME_ERROR_MESSAGE"),
          })}
        />

        <CardLabel>{`${t("PTR_APPLICANT_ADDRESS")}`}</CardLabel>
        <TextInput
          t={t}
          type={"text"}
          isMandatory={false}
          optionKey="i18nKey"
          name="address"
          value={address}
          onChange={setOwnerAddress}
          ValidationRequired = {true}
          {...(validation = {
            isRequired: true,
            // pattern: "^[a-zA-Z ]+$",
            type: "text",
            title: t("PT_ADDRESS_ERROR_MESSAGE"),
          })}
       
         
        />
        
        
      </div>
    </FormStep>
    </React.Fragment>
  );
};

export default PTRCitizenDetails;