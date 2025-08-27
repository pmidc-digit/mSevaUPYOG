import { BackButton, CardLabel, CheckBox, FormStep, TextArea, Toast } from "@mseva/digit-ui-react-components";
import React, { useState } from "react";
import Timeline from "../components/Timeline";
import { convertDateToEpoch } from "../utils";

const CorrospondenceAddress = ({ t, config, onSelect, value, userType, formData }) => {
  let validation = {};
  console.log(formData, "FORM1");
  const onSkip = () => onSelect();
  const [Correspondenceaddress, setCorrespondenceaddress] = useState(
    formData?.Correspondenceaddress || formData?.formData?.Correspondenceaddress || ""
  );
  const [isAddressSame, setisAddressSame] = useState(formData?.isAddressSame || formData?.formData?.isAddressSame || false);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(null);
  const [isDisableForNext, setIsDisableForNext] = useState(false);
  // const tenantId = Digit.ULBService.getCurrentTenantId();
  const tenantId = window?.localStorage?.getItem("CITIZEN.CITY");
  const stateId = Digit.ULBService.getStateId();
  let isopenlink = window.location.href.includes("/openlink/");
  const isCitizenUrl = Digit.Utils.browser.isMobile() ? true : false;

  if (isopenlink)
    window.onunload = function () {
      sessionStorage.removeItem("Digit.BUILDING_PERMIT");
    };

  function selectChecked(e) {
    if (isAddressSame == false) {
      setisAddressSame(true);
      setCorrespondenceaddress(
        formData?.LicneseDetails?.PermanentAddress ? formData?.LicneseDetails?.PermanentAddress : formData?.formData?.LicneseDetails?.PermanentAddress
      );
    } else {
      Array.from(document.querySelectorAll("input")).forEach((input) => (input.value = ""));
      setisAddressSame(false);
      setCorrespondenceaddress("");
    }
  }
  function selectCorrespondenceaddress(e) {
    setCorrespondenceaddress(e.target.value);
  }

  console.log("FORM2");

  const goNext = () => {
    if (!(formData?.result && formData?.result?.Licenses[0]?.id)) {
      setIsDisableForNext(true);
      // console.log("dob here in payload", formData?.LicneseDetails?.dateOfBirth ? convertDateToEpoch(formData?.LicenseDetails?.dateOfBirth): null);
      console.log("Correspondenceaddress", formData?.LicneseDetails);
      let payload = {
        Licenses: [
          {
            tradeLicenseDetail: {
              owners: [
                {
                  gender: formData?.LicneseDetails?.gender?.code,
                  mobileNumber: formData?.LicneseDetails?.mobileNumber,
                  name: formData?.LicneseDetails?.name,
                  dob: formData?.LicneseDetails?.dateOfBirth ? convertDateToEpoch(formData?.LicenseDetails?.dateOfBirth) : null,
                  emailId: formData?.LicneseDetails?.email,
                  permanentAddress:
                    formData?.LicneseDetails?.PermanentAddress +
                    " , " +
                    formData?.LicneseDetails?.SelectedDistrict?.name +
                    " , " +
                    formData?.LicneseDetails?.SelectedState?.name,
                  correspondenceAddress: Correspondenceaddress,
                  pan: formData?.LicneseDetails?.PanNumber,
                  // "permanentPinCode": "143001"
                },
              ],
              subOwnerShipCategory: "INDIVIDUAL",
              tradeUnits: [
                {
                  tradeType: formData?.LicneseType?.LicenseType?.tradeType,
                },
              ],
              additionalDetail: {
                qualificationType: formData?.LicneseType?.qualificationType?.name,
                counsilForArchNo: formData?.LicneseType?.ArchitectNo,
                isSelfCertificationRequired: formData?.LicneseType?.selfCertification ? formData?.LicneseType?.selfCertification : null,
                Ulb: formData?.LicneseDetails?.Ulb,
              },
              address: {
                city: "",
                landmark: "",
                pincode: formData?.LicneseDetails?.Pincode,
              },
              institution: null,
              applicationDocuments: null,
            },
            licenseType: "PERMANENT",
            businessService: "BPAREG",
            tenantId: tenantId,
            action: "NOWORKFLOW",
          },
        ],
      };

      console.log(payload, "FORM3");

      Digit.OBPSService.BPAREGCreate(payload, tenantId)
        .then((result, err) => {
          setIsDisableForNext(false);
          let data = { result: result, formData: formData, Correspondenceaddress: Correspondenceaddress, isAddressSame: isAddressSame };
          //1, units
          onSelect("", data, "", true);
        })
        .catch((e) => {
          setIsDisableForNext(false);
          setShowToast({ key: "error" });
          console.log("error message here", e?.response?.data?.Errors[0]?.message);
          setError(e?.response?.data?.Errors[0]?.message || null);
          //setError("A user account with this mobile number already exists. Please use a different number or log in with the existing account");
        });
    } else {
      formData.Correspondenceaddress = Correspondenceaddress;
      formData.isAddressSame = isAddressSame;
      onSelect("", formData, "", true);
    }
    // sessionStorage.setItem("CurrentFinancialYear", FY);
    // onSelect(config.key, { TradeName });
  };

  return (
    <React.Fragment>
      <div className={isopenlink ? "OpenlinkContainer" : ""}>
        {isopenlink && <BackButton style={{ border: "none" }}>{t("CS_COMMON_BACK")}</BackButton>}
        <Timeline currentStep={2} flow="STAKEHOLDER" />
        <FormStep config={config} onSelect={goNext} onSkip={onSkip} t={t} isDisabled={isDisableForNext}>
          <CheckBox
            label={t("BPA_SAME_AS_PERMANENT_ADDRESS")}
            onChange={(e) => selectChecked(e)}
            //value={field.isPrimaryOwner}
            checked={isAddressSame}
            style={{ paddingBottom: "10px", paddingTop: "10px" }}
          />
          <CardLabel>{`${t("BPA_APPLICANT_CORRESPONDENCE_ADDRESS_LABEL")}`}</CardLabel>
          <TextArea
            t={t}
            isMandatory={false}
            type={"text"}
            optionKey="i18nKey"
            name="Correspondenceaddress"
            onChange={selectCorrespondenceaddress}
            value={Correspondenceaddress}
            disable={isAddressSame}
          />
        </FormStep>
      </div>
      <div style={{ disabled: "true", height: "30px", width: "100%", fontSize: "14px" }}></div>
      {showToast && (
        <Toast
          error={showToast?.key === "error" ? true : false}
          label={error}
          isDleteBtn={true}
          onClose={() => {
            setShowToast(null);
            setError(null);
          }}
        />
      )}
    </React.Fragment>
  );
};

export default CorrospondenceAddress;
