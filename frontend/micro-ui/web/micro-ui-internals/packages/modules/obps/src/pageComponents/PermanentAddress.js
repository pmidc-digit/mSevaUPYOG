import {
  CardLabel,
  CheckBox,
  CitizenInfoLabel,
  FormStep,
  TextInput,
  TextArea,
  OpenLinkContainer,
  BackButton,
  RadioOrSelect,
  MultiSelectDropdown,
  Dropdown,
  ActionBar,
  SubmitBar,
  Toast,
} from "@mseva/digit-ui-react-components";
import React, { useState, useEffect, useMemo } from "react";
import Timeline from "../components/Timeline";
import { convertDateToEpoch } from "../utils";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";
import { LoaderNew } from "../components/LoaderNew";

const PermanentAddress = ({ t, config, onSelect, value, userType, formData }) => {
  let validation = {};
  const [loader, setLoader] = useState(false);
  const onSkip = () => onSelect();
  const [PermanentAddress, setPermanentAddress] = useState(
    formData?.LicneseDetails?.PermanentAddress ||
      formData?.formData?.LicneseDetails?.PermanentAddress ||
      formData?.result?.Licenses?.[0]?.tradeLicenseDetail?.owners?.[0]?.permanentAddress
  );
  const { pathname: url } = useLocation();
  const tenantId = window?.localStorage?.getItem("CITIZEN.CITY");
  const stateId = Digit.ULBService.getStateId();
  let isopenlink = window.location.href.includes("/openlink/");
  const isCitizenUrl = Digit.Utils.browser.isMobile() ? true : false;
  const [pinCode, setPinCode] = useState(formData?.LicneseDetails?.Pincode || formData?.formData?.LicneseDetails?.Pincode || "");
  const [ulbType, setUlbType] = useState("");
  const [selectedUlbTypes, setSelectedUlbTypes] = useState(formData?.LicneseDetails?.Ulb || formData?.formData?.LicneseDetails?.Ulb || []);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedState, setSelectedState] = useState(
    formData?.LicneseDetails?.SelectedState || formData?.formData?.LicneseDetails?.SelectedState || {}
  );
  const [selectedDistrict, setSelectedDistrict] = useState(
    formData?.LicneseDetails?.SelectedDistrict || formData?.formData?.LicneseDetails?.SelectedDistrict || {}
  );

  const [isAddressSame, setIsAddressSame] = useState(formData?.isAddressSame || formData?.formData?.isAddressSame || formData?.result?.Licenses?.[0]?.tradeLicenseDetail?.additionalDetail?.isAddressSame || false);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(null);
  // merging the CorrospondenceAddress to this page

  const [correspondenceAddress, setCorrespondenceAddress] = useState(
    formData?.LicneseDetails?.correspondenceAddress ||
      formData?.formData?.LicneseDetails?.correspondenceAddress ||
      formData?.Correspondenceaddress ||
      formData?.formData?.Correspondenceaddress ||
      ""
  );

  // const { data: districtList, isLoading } = Digit.Hooks.useCustomMDMS(selectedState.code, "BPA", [{ name: "Ulb" }]);
  const { data: districtList, isLoading } = Digit.Hooks.useCustomMDMS(selectedState?.code || "pb", "BPA", [{ name: "Ulb" }]);

  const stateOptions = useMemo(() => {
    return [{ code: "pb", name: "Punjab", i18Code: "Punjab" }];
  }, []);
  const isMobile = window.Digit.Utils.browser.isMobile();

  const uniqueDistricts = useMemo(() => {
    if (isLoading || !districtList?.BPA?.Ulb?.length) return [];

    return [...new Set(districtList.BPA.Ulb.map((item) => item.Districts?.trim()))]
      .filter(Boolean) // remove null/undefined/empty
      .sort((a, b) => a.localeCompare(b))
      .map((district) => ({
        name: district,
        code: district,
      }));
  }, [isLoading, districtList]);

  // const [ulbTypes, setUlbTypes] = useState(["Abohar", "Adampur", "Ahmedgarh", "Ajnala", "Alawalpur", "Amargarh", "Amloh"]);
  const tenantName = Digit.SessionStorage.get("OBPS_TENANTS").map((tenant) => tenant.name);

  console.log("formData==????", formData);

  // useEffect(() => {
  //   const role = formData?.LicneseType?.LicenseType?.role;
  //   if (role == "BPA_ARCHITECT") {
  //     const allUlbs = tenantName.map((ulb) => ({ ulbname: ulb }));
  //     setSelectedUlbTypes(allUlbs);
  //   }
  // }, [formData?.LicneseType?.LicenseType?.role]);

  const status = formData?.result?.Licenses?.[0]?.status;
  const isCitizenEditable = status === "CITIZEN_ACTION_REQUIRED";

  useEffect(() => {
    const role = formData?.LicneseType?.LicenseType?.role;
    const isArchitect = Array.isArray(role) && role.includes("BPA_ARCHITECT");
    if (isArchitect) {
      setSelectedUlbTypes([]); // keep it empty for BPA_ARCHITECT
    }
  }, [formData?.LicneseType?.LicenseType?.role]);

  useEffect(() => {
    if (typeof selectedState === "string") {
      const state = stateOptions.find((state) => state.name === selectedState);
      setSelectedState(state);
    }
  }, [selectedState]);

  useEffect(() => {
    if (typeof selectedDistrict === "string" && !isLoading && uniqueDistricts.length > 0) {
      const district = uniqueDistricts.find((district) => district.code === selectedDistrict);
      setSelectedDistrict(district);
    }
  }, [selectedDistrict, isLoading, uniqueDistricts]);

  useEffect(() => {
    if (selectedState === "undefined" || !selectedState?.code) {
      setSelectedState({ code: "pb", name: "Punjab" });
    }
  }, []);

  // useEffect(() => {
  //   console.log("come here", formData?.formData);
  //   if (formData?.formData?.LicneseDetails?.SelectedState) {
  //     console.log("yeah in");
  //     const selState = formData?.formData?.LicneseDetails?.SelectedState;
  //     console.log("selState", selState);
  //     console.log("stateOptions", stateOptions);
  //     const state = stateOptions?.find((state) => state.name === selState);
  //     setSelectedState(state);
  //   }
  // }, [formData]);

  useEffect(() => {
    if (formData?.result?.Licenses) {
      console.log("eya come here");
      const selCity = formData?.result?.Licenses?.[0]?.tradeLicenseDetail?.owners?.[0]?.permanentCity;
      console.log("selState", selCity);
      console.log("stateOptions", uniqueDistricts);
      const cityOpt = uniqueDistricts?.find((state) => state.code === selCity);
      setSelectedDistrict(cityOpt);
    }
  }, [formData, uniqueDistricts]);

  //const isEdit = window.location.href.includes("/edit-application/") || window.location.href.includes("renew-trade");
  //const { isLoading, data: fydata = {} } = Digit.Hooks.tl.useTradeLicenseMDMS(stateId, "egf-master", "FinancialYear");

  //   let mdmsFinancialYear = fydata["egf-master"] ? fydata["egf-master"].FinancialYear.filter(y => y.module === "TL") : [];
  //   let FY = mdmsFinancialYear && mdmsFinancialYear.length > 0 && mdmsFinancialYear.sort((x, y) => y.endingDate - x.endingDate)[0]?.code;

  if (isopenlink)
    window.onunload = function () {
      sessionStorage.removeItem("Digit.BUILDING_PERMIT");
    };

  function selectPermanentAddress(e) {
    setPermanentAddress(e.target.value);
  }

  function handleUlbSelection(selectedOptions) {
    // setSelectedUlbTypes(selectedOptions);
    const flattenedOptions = selectedOptions.map((option) => option[1]);
    const role = formData?.LicneseType?.LicenseType?.role;
    if (role == "BPA_ARCHITECT") {
      const allUlbs = tenantName.map((ulb) => ({ ulbname: ulb }));

      // Check if the user is deselecting options
      if (flattenedOptions.length < allUlbs.length) {
        // Allow manual deselection
        setSelectedUlbTypes(flattenedOptions);
      } else {
        // If no deselection, keep all options selected
        setSelectedUlbTypes(allUlbs);
      }
    } else {
      // For other roles, allow manual selection
      setSelectedUlbTypes(flattenedOptions);
    }
  }
  function SelectPincode(e) {
    const value = e.target.value;
    if (/^[0-9]*$/.test(value) && value.length <= 6) {
      setPinCode(value);
    }
  }

  function SelectState(e) {
    setSelectedState(e);
  }

  function SelectDistrict(e) {
    setSelectedDistrict(e);
  }

  function handleAddressSame(e) {
    const checked = e.target.checked;
    setIsAddressSame(checked);
    if (checked) {
      setCorrespondenceAddress(PermanentAddress || "");
    } else {
      setCorrespondenceAddress("");
    }
  }

  // const goNext = () => {
  //   // if(PermanentAddress === "" || PermanentAddress.length<4){
  //   //   setErrorMessage("Enter valid address &  it should be greater than 3 characters");
  //   //   return;
  //   // }

  //   if (pinCode === "" || pinCode.length < 6) {
  //     setErrorMessage(t("BPA_PINCODE_ERROR_MESSAGE"));
  //     return;
  //   }

  //   // sessionStorage.setItem("CurrentFinancialYear", FY);
  //   if (!(formData?.result && formData?.result?.Licenses[0]?.id))
  //     onSelect(config.key, { PermanentAddress: PermanentAddress,  correspondenceAddress: isAddressSame ? PermanentAddress : correspondenceAddress, isAddressSame, Pincode: pinCode, Ulb: selectedUlbTypes, SelectedState: selectedState, SelectedDistrict: selectedDistrict });
  //   else {
  //     let data = formData?.formData;
  //     data.LicneseDetails.PermanentAddress = PermanentAddress;
  //     data.LicneseDetails.correspondenceAddress = isAddressSame ? PermanentAddress : correspondenceAddress;
  //     data.isAddressSame = isAddressSame;
  //     data.LicneseDetails.Ulb = selectedUlbTypes;
  //     data.LicneseDetails.Pincode = pinCode;
  //     data.LicneseDetails.SelectedState = selectedState;
  //     data.LicneseDetails.SelectedDistrict = selectedDistrict;
  //     onSelect("", formData);
  //   }
  // };

  const goNext = (selectedAction) => {
    console.log("selectedDistrict", selectedDistrict);
    if (pinCode === "" || pinCode.length < 6) {
      setErrorMessage(t("BPA_PINCODE_ERROR_MESSAGE"));
      setShowToast({ error: true, message: t("BPA_PINCODE_ERROR_MESSAGE") });
      return;
    }

    // If first time, API call
    if (!(formData?.result && formData?.result?.Licenses?.[0]?.id)) {
      setErrorMessage("");
      setShowToast(null); // reset errors

      const role = formData?.LicneseType?.LicenseType?.role;
      const isArchitect = Array.isArray(role) && role.includes("BPA_ARCHITECT");

      const tenantToSend = isArchitect ? "pb.punjab" : window?.localStorage?.getItem("CITIZEN.CITY");

      const actionToSend = selectedAction?.action || "NOWORKFLOW";

      const payload = {
        Licenses: [
          {
            validTo: formData?.LicneseType?.validTo ? convertDateToEpoch(formData?.LicneseType?.validTo) : null,
            tradeLicenseDetail: {
              owners: [
                {
                  gender: formData?.LicneseDetails?.gender?.code,
                  mobileNumber: formData?.LicneseDetails?.mobileNumber,
                  name: formData?.LicneseDetails?.name,
                  dob: formData?.LicneseDetails?.dateOfBirth ? convertDateToEpoch(formData?.LicneseDetails?.dateOfBirth) : null,
                  emailId: formData?.LicneseDetails?.email,
                  permanentAddress: PermanentAddress,
                  correspondenceAddress: isAddressSame ? PermanentAddress : correspondenceAddress,
                  pan: formData?.LicneseDetails?.PanNumber,
                  permanentCity: selectedDistrict.code,
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
                isSelfCertificationRequired: formData?.LicneseType?.selfCertification || null,
                isAddressSame: isAddressSame,

                // Ulb: selectedUlbTypes,
                // Ulb: isArchitect ? [] : selectedUlbTypes,
                Ulb: tenantToSend,
              },
              address: {
                city: "",
                landmark: "",
                pincode: pinCode,
              },
            },
            licenseType: "PERMANENT",
            businessService: "BPAREG",
            tenantId: tenantToSend,
            // action: "NOWORKFLOW",
            action: actionToSend,
            assignee: selectedAction?.assignee || null,
            comment: selectedAction?.comment || null,
            wfDocuments: selectedAction?.wfDocuments || null,
          },
        ],
      };
      console.log("payload", payload);
      setLoader(true);
      Digit.OBPSService.BPAREGCreate(payload, tenantId)
        .then((result) => {
          setLoader(false);
          let data = {
            result: result,
            formData: {
              ...formData,
              LicneseDetails: {
                ...formData?.LicneseDetails,
                PermanentAddress,
                correspondenceAddress: isAddressSame ? PermanentAddress : correspondenceAddress,
                isAddressSame,
                Pincode: pinCode,
                // Ulb: selectedUlbTypes,
                // Ulb: isArchitect ? [] : selectedUlbTypes,
                Ulb: tenantToSend,
                SelectedState: selectedState,
                SelectedDistrict: selectedDistrict,
              },
            },
          };
          onSelect("", data, "", true);
        })
        .catch((e) => {
          setLoader(false);
          setErrorMessage(e?.response?.data?.Errors?.[0]?.message || "Something went wrong");
          setShowToast({ error: true, message: e?.response?.data?.Errors?.[0]?.message || "Something went wrong" });
        });
    } else {
      // ✅ Update Flow - ensure nested objects exist
      let updatedFormData = { ...formData };
      updatedFormData.LicneseDetails = updatedFormData.LicneseDetails || {};

      updatedFormData.LicneseDetails.PermanentAddress = PermanentAddress;
      updatedFormData.LicneseDetails.correspondenceAddress = isAddressSame ? PermanentAddress : correspondenceAddress;
      updatedFormData.isAddressSame = isAddressSame;
      updatedFormData.LicneseDetails.Pincode = pinCode;
      updatedFormData.LicneseDetails.Ulb = selectedUlbTypes;
      updatedFormData.LicneseDetails.SelectedState = selectedState;
      updatedFormData.LicneseDetails.SelectedDistrict = selectedDistrict;

      onSelect("", updatedFormData, "", true);
    }
  };

  const role = formData?.LicneseType?.LicenseType?.role;
  const isArchitect = Array.isArray(role) && role.includes("BPA_ARCHITECT");

  const closeToast = () => {
    setShowToast(null);
  };
  return (
    <React.Fragment>
      <div className={isopenlink ? "OpenlinkContainer" : ""}>
        {isopenlink && <BackButton style={{ border: "none" }}>{t("CS_COMMON_BACK")}</BackButton>}
        {isMobile && <Timeline currentStep={2} flow="STAKEHOLDER" />}
        <FormStep
          config={config}
          // onSelect={goNext}
          // onSkip={onSkip}
          t={t}
          // isDisabled={!PermanentAddress || selectedUlbTypes.length === 0 || pinCode === "" || !selectedState?.code || !selectedDistrict?.code}
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
            // disable={!isCitizenEditable}
          />

          <CheckBox
            label={t("BPA_SAME_AS_PERMANENT_ADDRESS")}
            onChange={handleAddressSame}
            checked={isAddressSame}
            style={{ paddingBottom: "10px", paddingTop: "10px" }}
            //  disable={!isCitizenEditable}
          />

          <CardLabel>{t("BPA_APPLICANT_CORRESPONDENCE_ADDRESS_LABEL")}</CardLabel>
          <TextArea
            t={t}
            isMandatory={false}
            type={"text"}
            name="correspondenceAddress"
            value={correspondenceAddress}
            onChange={(e) => setCorrespondenceAddress(e.target.value)}
            // disable={isAddressSame}
          />

          <CardLabel>{t("BPA_STATE_TYPE")}*</CardLabel>
          <div>
            <Dropdown
              t={t}
              optionKey="code"
              // isMandatory={config.isMandatory}
              option={stateOptions}
              selected={selectedState}
              select={SelectState}
              // disable={true}
              // disable={!isCitizenEditable}
            />
          </div>

          <div>
            {" "}
            <CardLabel>{t("BPA_DISTRICT_TYPE")}*</CardLabel>
            <Dropdown
              t={t}
              optionKey="code"
              // isMandatory={config.isMandatory}
              // option={districtList?.BPA?.Districts?.sort((a, b) => a.name.localeCompare(b.name)) || []}
              option={uniqueDistricts}
              selected={selectedDistrict}
              select={SelectDistrict}
              // disable={true}
              // disable={!isCitizenEditable}
            />
          </div>

          <div>
            <CardLabel>{t("BPA_DETAILS_PIN_LABEL")}*</CardLabel>
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
              // disable={!isCitizenEditable}
              {...(validation = {
                isRequired: true,
                pattern: "^[0-9]{6}$",
                type: "number",
                title: t("BPA_PINCODE_ERROR_MESSAGE"),
              })}
            />
            {/* {errorMessage && (
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
            )} */}

            {showToast && (
              <Toast error={showToast?.error} warning={showToast?.warning} label={showToast?.message} isDleteBtn={true} onClose={closeToast} />
            )}
          </div>

          {/* <CardLabel>{t("BPA_SELECT_ULB")}*</CardLabel>

          {Array.isArray(formData?.LicneseType?.LicenseType?.role) &&
            formData?.LicneseType?.LicenseType?.role.includes("BPA_ARCHITECT") ? (
              <div 
                style={{
                  pointerEvents: "none", 
                  opacity: 0.6,
                  cursor: "not-allowed",
                  maxWidth:"540px"
                }}
              >
                <MultiSelectDropdown
                  options={tenantName.map((ulb) => ({ ulbname: ulb }))}
                  optionsKey="ulbname"
                  onSelect={(selectedOptions) => handleUlbSelection(selectedOptions)}
                  defaultLabel={t("Select ULBs")}
                  defaultUnit={t("ULBs")}
                  selected={selectedUlbTypes}
                  style={{ maxWidth: "540px" }}
                />
              </div>
            ) : (
              <div style={{ maxWidth: "540px" }}>
              <MultiSelectDropdown
                options={tenantName.map((ulb) => ({ ulbname: ulb }))}
                optionsKey="ulbname"
                onSelect={(selectedOptions) => handleUlbSelection(selectedOptions)}
                defaultLabel={t("Select ULBs")}
                defaultUnit={t("ULBs")}
                selected={selectedUlbTypes}
                style={{ maxWidth: "540px" }}
              />
              </div>
            )} */}
        </FormStep>
      </div>
      <ActionBar>
        <SubmitBar
          label={t("CS_COMMON_NEXT")}
          onSubmit={goNext}
          disabled={!PermanentAddress || pinCode === "" || !selectedState?.code || !PermanentAddress || !selectedDistrict?.code}
        />
      </ActionBar>
      {(isLoading || loader) && <LoaderNew page={true} />}
    </React.Fragment>
  );
};

export default PermanentAddress;
