import {
  CardLabel,
  CheckBox,
  CitizenInfoLabel,
  FormStep,
  Loader,
  TextInput,
  TextArea,
  OpenLinkContainer,
  BackButton,
  RadioOrSelect,
  MultiSelectDropdown,
  Dropdown,
  ActionBar,
  SubmitBar
} from "@mseva/digit-ui-react-components";
import React, { useState, useEffect, useMemo, } from "react";
import Timeline from "../components/Timeline";
import { convertDateToEpoch } from "../utils";

const PermanentAddress = ({ t, config, onSelect, value, userType, formData }) => {
  let validation = {};
  const onSkip = () => onSelect();
  const [PermanentAddress, setPermanentAddress] = useState(
    formData?.LicneseDetails?.PermanentAddress || formData?.formData?.LicneseDetails?.PermanentAddress
  );

  const tenantId = window?.localStorage?.getItem("CITIZEN.CITY");
  const stateId = Digit.ULBService.getStateId();
  let isopenlink = window.location.href.includes("/openlink/");
  const isCitizenUrl = Digit.Utils.browser.isMobile() ? true : false;
  const [pinCode, setPinCode] = useState(formData?.LicneseDetails?.pincode || formData?.formData?.LicneseDetails?.pincode || "");
  const [ulbType, setUlbType] = useState("");
  const [selectedUlbTypes, setSelectedUlbTypes] = useState(formData?.LicneseDetails?.Ulb || formData?.formData?.LicneseDetails?.Ulb || []);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedState, setSelectedState] = useState(formData?.LicneseDetails?.SelectedState || formData?.formData?.LicneseDetails?.SelectedState || {})
  const [selectedDistrict, setSelectedDistrict] = useState(formData?.LicneseDetails?.SelectedDistrict || formData?.formData?.LicneseDetails?.SelectedDistrict || {})


  // merging the CorrospondenceAddress to this page 

    const [correspondenceAddress, setCorrespondenceAddress] = useState(
      formData?.LicneseDetails?.correspondenceAddress ||
      formData?.formData?.LicneseDetails?.correspondenceAddress ||
      ""
    );

    const [isAddressSame, setIsAddressSame] = useState(
      formData?.isAddressSame || formData?.formData?.isAddressSame || false
    );



  const { data: districtList, isLoading } = Digit.Hooks.useCustomMDMS(selectedState.code, "BPA", [{ name: "Ulb" }]);
  const stateOptions = useMemo(() => {return [{code: "pb",name: "Punjab",i18Code: "Punjab"}]},[])
  const isMobile = window.Digit.Utils.browser.isMobile();

  const uniqueDistricts = useMemo(() => {
  if (isLoading || !districtList?.BPA?.Ulb?.length) return [];

  return [
    ...new Set(districtList.BPA.Ulb.map(item => item.Districts?.trim()))
  ]
    .filter(Boolean) // remove null/undefined/empty
    .sort((a, b) => a.localeCompare(b))
    .map(district => ({
      name: district,
      code: district
    }));
}, [isLoading, districtList]);
  // console.log("data: newConfig", newConfig);

  // const [ulbTypes, setUlbTypes] = useState(["Abohar", "Adampur", "Ahmedgarh", "Ajnala", "Alawalpur", "Amargarh", "Amloh"]);
  const tenantName = Digit.SessionStorage.get("OBPS_TENANTS").map((tenant) => tenant.name);

  
  // console.log("tenantName=+",tenantName);
  useEffect(() => {
    const role = formData?.LicneseType?.LicenseType?.role;
    if (role == "BPA_ARCHITECT") {
      const allUlbs = tenantName.map((ulb) => ({ ulbname: ulb }));
      setSelectedUlbTypes(allUlbs);
      console.log("Initial ULBs for BPA_ARCHITECT:", allUlbs);
    }
  }, [formData?.LicneseType?.LicenseType?.role]);

  useEffect(()=>{
    if(typeof selectedState === "string"){
      const state = stateOptions.find(state => state.name === selectedState)
      setSelectedState(state)
    }
  },[selectedState])

  useEffect(()=>{
    if(typeof selectedDistrict === "string" && !isLoading && uniqueDistricts.length > 0){
      const district = uniqueDistricts.find(district => district.code === selectedDistrict)
      // console.log("districtx", district)
      setSelectedDistrict(district)
    }
  },[selectedDistrict, isLoading, uniqueDistricts])
  // console.log("obpas tentants",Digit.SessionStorage.get("OBPS_TENANTS"))
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
    // console.log("selectedOptions=======", selectedOptions);
    const flattenedOptions = selectedOptions.map((option) => option[1]);
    const role = formData?.LicneseType?.LicenseType?.role;
    if (role == "BPA_ARCHITECT") {
      const allUlbs = tenantName.map((ulb) => ({ ulbname: ulb }));

      // Check if the user is deselecting options
      if (flattenedOptions.length < allUlbs.length) {
        // Allow manual deselection
        setSelectedUlbTypes(flattenedOptions);
        console.log("Updated ULBs for BPA_ARCHITECT after deselection:", flattenedOptions);
      } else {
        // If no deselection, keep all options selected
        setSelectedUlbTypes(allUlbs);
        console.log("All ULBs selected for BPA_ARCHITECT:", allUlbs);
      }
    } else {
      // For other roles, allow manual selection
      setSelectedUlbTypes(flattenedOptions);
      console.log("Selected ULB Types:", flattenedOptions); // Log the selected options to the console
    }
  }
  function SelectPincode(e) {
    const value = e.target.value;
    if (/^[0-9]*$/.test(value) && value.length <= 6) {
      setPinCode(value);
    }
  }

  function SelectState(e) {
    setSelectedState(e)
  }

  function SelectDistrict(e){
    setSelectedDistrict(e)
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
  //     console.log("data", data);
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


  const goNext = () => {
  if (pinCode === "" || pinCode.length < 6) {
    setErrorMessage(t("BPA_PINCODE_ERROR_MESSAGE"));
    return;
  }

  // If first time, API call
  if (!(formData?.result && formData?.result?.Licenses?.[0]?.id)) {
    setErrorMessage(""); // reset errors

    const payload = {
      Licenses: [
        {
          tradeLicenseDetail: {
            owners: [
              {
                gender: formData?.LicneseDetails?.gender?.code,
                mobileNumber: formData?.LicneseDetails?.mobileNumber,
                name: [
                  formData?.LicneseDetails?.name ? formData.LicneseDetails.name.trim() : "",
                  formData?.LicneseDetails?.middleName ? formData.LicneseDetails.middleName.trim() : "",
                  formData?.LicneseDetails?.lastName ? formData.LicneseDetails.lastName.trim() : ""
                ].filter(Boolean).join(" ").trim(),
                dob: formData?.LicneseDetails?.dateOfBirth
                  ? convertDateToEpoch(formData?.LicneseDetails?.dateOfBirth)
                  : null,
                emailId: formData?.LicneseDetails?.email,
                permanentAddress: PermanentAddress + " , " + selectedDistrict?.name + " , " + selectedState?.name,
                correspondenceAddress: isAddressSame ? PermanentAddress : correspondenceAddress,
                pan: formData?.LicneseDetails?.PanNumber,
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
              Ulb: selectedUlbTypes,
            },
            address: {
              city: "",
              landmark: "",
              pincode: pinCode,
            },
          },
          licenseType: "PERMANENT",
          businessService: "BPAREG",
          tenantId: tenantId,
          action: "NOWORKFLOW",
        },
      ],
    };

    console.log("Payload being sent", payload);

    Digit.OBPSService.BPAREGCreate(payload, tenantId)
      .then((result) => {
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
              Ulb: selectedUlbTypes,
              SelectedState: selectedState,
              SelectedDistrict: selectedDistrict,
            },
          },
        };
        onSelect("", data, "", true);
      })
      .catch((e) => {
        console.error("API Error", e?.response?.data?.Errors);
        setErrorMessage(e?.response?.data?.Errors?.[0]?.message || "Something went wrong");
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



  useEffect(() => {
    // console.log("selectedUlbTypes", selectedUlbTypes);
  }, [selectedUlbTypes]);

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
          />

            <CheckBox
              label={t("BPA_SAME_AS_PERMANENT_ADDRESS")}
              onChange={handleAddressSame}
              checked={isAddressSame}
              style={{ paddingBottom: "10px", paddingTop: "10px" }}
            />

            <CardLabel>{t("BPA_APPLICANT_CORRESPONDENCE_ADDRESS_LABEL")}</CardLabel>
            <TextArea
              t={t}
              isMandatory={false}
              type={"text"}
              name="correspondenceAddress"
              value={correspondenceAddress}
              onChange={(e) => setCorrespondenceAddress(e.target.value)}
              disable={isAddressSame}
            />



          <CardLabel>{t("BPA_STATE_TYPE")}*</CardLabel>
          <div className={"form-pt-dropdown-only"}>
            {/* {data && ( */}
                  <Dropdown
                    t={t}
                    optionKey="code"
                    // isMandatory={config.isMandatory}
                    option={stateOptions}
                    selected={selectedState}
                    select={SelectState}
                    // disable={true}
                  />
            {/* )} */}
          </div>

          {isLoading? <Loader /> :<div> <CardLabel>{t("BPA_DISTRICT_TYPE")}*</CardLabel>
                  <Dropdown
                    t={t}
                    optionKey="code"
                    // isMandatory={config.isMandatory}
                    // option={districtList?.BPA?.Districts?.sort((a, b) => a.name.localeCompare(b.name)) || []}
                    option={uniqueDistricts}
                    selected={selectedDistrict}
                    select={SelectDistrict}
                    // disable={true}
                  />
          </div>}

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
              {...(validation = {
                isRequired: true,
                pattern: "^[0-9]{6}$",
                type: "number",
                title: t("BPA_PINCODE_ERROR_MESSAGE"),
              })}
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



          <CardLabel>{t("BPA_SELECT_ULB")}*</CardLabel>
          <MultiSelectDropdown
            options={tenantName.map((ulb) => ({ ulbname: ulb }))}
            optionsKey="ulbname"
            onSelect={(selectedOptions) => handleUlbSelection(selectedOptions)}
            defaultLabel={t("Select ULBs")}
            defaultUnit={t("ULBs")}
            selected={selectedUlbTypes}
          />
        </FormStep>
      </div>
      <ActionBar>
        <SubmitBar 
          label={t("CS_COMMON_NEXT")}
          onSubmit={goNext}
          disabled={!PermanentAddress || selectedUlbTypes.length === 0 || pinCode === "" || !selectedState?.code || !selectedDistrict?.code}
        />
      </ActionBar>
    </React.Fragment>
  );
};

export default PermanentAddress;
