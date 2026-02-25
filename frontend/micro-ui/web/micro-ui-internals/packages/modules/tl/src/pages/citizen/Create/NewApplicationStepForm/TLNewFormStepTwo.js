import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_tlNewApplication } from "../../../../redux/action/TLNewApplicationActions";
import { convertDateToEpoch } from "../../../../utils";
import { Loader } from "../../../../components/Loader";

const TLNewFormStepTwo = ({ config, onGoNext, onBackClick, t }) => {
  //const tenantId = Digit.ULBService.getCurrentPermanentCity(); //Digit.ULBService.getCurrentTenantId();
  const currentUserType = JSON.parse(window.localStorage.getItem("user-info"))?.type;
  const dispatch = useDispatch();
  let tenantId;
  if (currentUserType === "CITIZEN") {
    tenantId = window.localStorage.getItem("CITIZEN.CITY");
  } else {
    tenantId = Digit.ULBService.getCurrentPermanentCity();
  }
  const tenants = Digit.Hooks.tl.useTenants();
  const [canSubmit, setSubmitValve] = useState(false);
  const history = useHistory();
  const [getLoader, setLoader] = useState(false);
  // delete
  // const [propertyId, setPropertyId] = useState(new URLSearchParams(useLocation().search).get("propertyId"));
  const formData = useSelector((state) => state.tl.tlNewApplicationForm.formData);
  const [propertyId, setPropertyId] = useState(
    new URLSearchParams(useLocation().search).get("propertyId")
    || formData?.TraidDetails?.cpt?.details?.propertyId
    || ""
  );
  const currentStepData = formData && formData[config.key] ? formData[config.key] : {};
  // const isEmpNewApplication = window.location.href.includes("/employee/tl/new-application");
  // const isEmpRenewLicense = window.location.href.includes("/employee/tl/renew-application-details") || window.location.href.includes("/employee/tl/edit-application-details");

  // const [sessionFormData, setSessionFormData, clearSessionFormData] = Digit.Hooks.useSessionStorage("PT_CREATE_EMP_TRADE_NEW_FORM", {});
  // const [mutationHappened, setMutationHappened, clear] = Digit.Hooks.useSessionStorage("EMPLOYEE_MUTATION_HAPPENED", false);
  // const [successData, setsuccessData, clearSuccessData] = Digit.Hooks.useSessionStorage("EMPLOYEE_MUTATION_SUCCESS_DATA", {});
  const [showToast, setShowToast] = useState(null);
  const [error, setError] = useState(null);
  const stateId = Digit.ULBService.getStateId();
  let { data: newConfig, isLoading } = Digit.Hooks.tl.useMDMS.getFormConfig(stateId, {});
 
  const { data: propertyDetails } = Digit.Hooks.pt.usePropertySearch(
    { filters: { propertyIds: propertyId }, tenantId: tenantId },
    { filters: { propertyIds: propertyId }, tenantId: tenantId, enabled: propertyId ? true : false }
  );

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  // const validateOwnerDetails = (ownerDetails) => {
  //   const { ownershipCategory, owners } = ownerDetails || {};

  //   if (!ownershipCategory?.value) {
  //     return false;
  //   }

  //   if (!owners?.length) {
  //     return false;
  //   }

  //   const isSingleOwner = ownershipCategory.value === "INDIVIDUAL.SINGLEOWNER";

  //   if (isSingleOwner && owners.length !== 1) {
  //     return false;
  //   }

  //   const mandatoryFieldsCheck = owners.every((owner) => {
  //     return (
  //       owner?.name &&
  //       typeof owner.name === "string" &&
  //       owner.name.trim() !== "" &&

  //       owner?.mobileNumber &&
  //       /^[0-9]{10}$/.test(owner.mobileNumber) &&

  //       owner?.gender?.code &&
  //       typeof owner.gender.code === "string" &&
  //       owner.gender.code.trim() !== "" &&

  //       owner?.relationship?.code &&
  //       typeof owner.relationship.code === "string" &&
  //       owner.relationship.code.trim() !== "" &&

  //       owner?.fatherOrHusbandName &&
  //       typeof owner.fatherOrHusbandName === "string" &&
  //       owner.fatherOrHusbandName.trim() !== ""
  //     );
  //   });

  //   return mandatoryFieldsCheck;
  // };

  const validateOwnerDetails = (data) => {

    const { owners } = data;

    // if (!ownershipCategory?.code || !owners?.length) return false;
    
    return owners?.every(
      (owner) => owner?.name && owner?.mobileNumber && owner?.gender?.code && owner?.relationship?.code && owner?.fatherOrHusbandName
    );
  };

  const goNext = async (data) => {

    const { OwnerDetails } = formData || {};

    if (!validateOwnerDetails(OwnerDetails)) {
      setError(t("Please fill all owner mandatory details correctly."));
      setShowToast(true);
      return;
    }

    const res = await onSubmit(formData);
  

    if (res) {
      onGoNext();
    } else {
      console.error("Submission failed, not moving to next step.");
    }
  };

  const onSubmit = async (data) => {
    let isSameAsPropertyOwner = sessionStorage.getItem("isSameAsPropertyOwner");
   

    const { TraidDetails, OwnerDetails } = data;

    if (TraidDetails?.cpt?.id) {
      if (!TraidDetails?.cpt?.details || !propertyDetails) {
   
        setShowToast({ key: "error" });
        setError(t("ERR_INVALID_PROPERTY_ID"));
        return;
      }
    }

    // Validate pincode - check if city exists and pincode is valid format
    if (TraidDetails?.address?.pincode) {
      const pincodeRegex = /^[1-9][0-9]{5}$/;
      if (!pincodeRegex.test(TraidDetails.address.pincode)) {
        setShowToast({ key: "error" });
        setError(t("CORE_COMMON_PINCODE_INVALID"));
        return;
      }
      
      // Check if the selected city is valid
      if (!TraidDetails?.address?.city) {
        setShowToast({ key: "error" });
        setError(t("TL_CITY_REQUIRED"));
        return;
      }
      
      // Optional: Check if pincode exists in tenant master data (soft validation)
      const foundValue = tenants?.find((obj) => obj.pincode?.find((item) => item.toString() === TraidDetails.address.pincode));
      if (!foundValue) {
        console.warn(`Pincode ${TraidDetails.address.pincode} not found in master data, but proceeding with valid city-locality combination`);
        // Don't block submission - just log warning
      }
    }

    let accessories = [];
    if (TraidDetails?.accessories?.length > 0) {
      TraidDetails.accessories.map((item) => {
        if (item?.accessoryCategory?.code) {
          accessories.push({
            accessoryCategory: item.accessoryCategory.code || null,
            uom: item.accessoryCategory.uom || null,
            count: Number(item.count) || null,
            uomValue: Number(item.uomValue) || null,
          });
        }
      });
    }

    let tradeUnits = [];
    if (TraidDetails?.tradeUnits?.length > 0) {
      TraidDetails.tradeUnits.map((item) => {
        tradeUnits.push({
          tradeType: item.tradeSubType?.code || null,
          uom: item.tradeSubType?.uom || null,
          uomValue: Number(item.uomValue) || null,
        });
      });
    }

    let address = {};
    if (TraidDetails?.cpt?.details?.address) {
      address.city = TraidDetails.cpt.details.address.city || null;
      address.locality = { code: TraidDetails.cpt.details.address.locality?.code || null };
      if (TraidDetails.cpt.details.address.doorNo || TraidDetails.address?.doorNo)
        address.doorNo = TraidDetails.cpt.details.address.doorNo || TraidDetails.address.doorNo || null;
      if (TraidDetails.cpt.details.address.street || TraidDetails.address?.street)
        address.street = TraidDetails.cpt.details.address.street || TraidDetails.address.street || null;
      if (TraidDetails.cpt.details.address.pincode) address.pincode = TraidDetails.cpt.details.address.pincode;
    } else if (TraidDetails?.address) {
      address.city = TraidDetails.address.city?.code || null;
      if (TraidDetails?.address?.locality?.code) {
      }
      address.locality = { code: TraidDetails.address.locality?.code || null };
      if (TraidDetails.address.doorNo) address.doorNo = TraidDetails.address.doorNo;
      if (TraidDetails.address.street) address.street = TraidDetails.address.street;
      if (TraidDetails.address.buildingName) address.buildingName = TraidDetails.address.buildingName;
      if (TraidDetails.address.electricityNo) address.electricityNo = TraidDetails.address.electricityNo;
      if (TraidDetails.address.pincode) address.pincode = TraidDetails.address.pincode;
    }
    if (TraidDetails.address?.geoLocation?.latitude) {
      address.latitude = TraidDetails.address?.geoLocation?.latitude;
      address.longitude = TraidDetails.address?.geoLocation?.longitude;
    }

    let owners = [];
    if (OwnerDetails?.owners?.length > 0) {
      OwnerDetails.owners.map((owner, index) => {
        let obj = {};
        obj.dob = owner?.dob ? convertDateToEpoch(owner.dob) : null;
        obj.additionalDetails = { ownerSequence: index, ownerName: owner.name };
        if (owner.fatherOrHusbandName) obj.fatherOrHusbandName = owner.fatherOrHusbandName;
        if (owner.gender?.code) {
          // Handle nested gender objects - extract the final code string
          let genderCode = owner.gender.code;
          while (genderCode && typeof genderCode === 'object' && genderCode.code) {
            genderCode = genderCode.code;
          }
          obj.gender = typeof genderCode === 'string' ? genderCode : owner.gender.code;
        }
        if (owner.mobileNumber) obj.mobileNumber = Number(owner.mobileNumber);
        if (owner.name) obj.name = !OwnerDetails?.ownershipCategory?.code.includes("INSTITUTIONAL") ? owner.name : "";
        if (owner.permanentAddress) obj.permanentAddress = owner.permanentAddress;
        obj.permanentAddress = obj.permanentAddress || null;
        if (owner.relationship) {
          // Handle nested relationship objects - extract the final code string
          let relationshipCode = owner.relationship;
          while (relationshipCode && typeof relationshipCode === 'object' && relationshipCode.code) {
            relationshipCode = relationshipCode.code;
          }
          obj.relationship = typeof relationshipCode === 'string' ? relationshipCode : owner.relationship?.code;
        }
        if (owner.emailId) obj.emailId = owner.emailId;
        if (owner.ownerType?.code) obj.ownerType = owner.ownerType.code;
        owners.push(obj);
      });
    }

    let applicationDocuments = TraidDetails?.documents?.documents || [];
    let commencementDate = convertDateToEpoch(TraidDetails?.tradedetils?.[0]?.commencementDate);
    let financialYear = TraidDetails?.tradedetils?.[0]?.financialYear?.code;
    let gstNo = TraidDetails?.tradedetils?.[0]?.gstNo || ""; //
    let noOfEmployees = Number(TraidDetails?.tradedetils?.[0]?.noOfEmployees) || "";
    let operationalArea = Number(TraidDetails?.tradedetils?.[0]?.operationalArea) || "";
    let structureType = TraidDetails?.tradedetils?.[0]?.structureSubType?.code || "";
    let tradeName = TraidDetails?.tradedetils?.[0]?.tradeName || "";
    let subOwnerShipCategory = OwnerDetails?.ownershipCategory?.code || "";
    let licenseType = TraidDetails?.tradedetils?.[0]?.licenseType?.code || "PERMANENT";
    let validityYears = TraidDetails?.validityYears?.code || 1;
    let oldReceiptNo = Number(TraidDetails?.tradedetils?.[0]?.oldReceiptNo) || "";


    let formData = {
      action: "INITIATE",
      applicationType: "NEW",
      workflowCode: TraidDetails?.tradeUnits.some((unit) => unit?.tradeSubType?.ishazardous) ? "NEWTL.HAZ" : "NEWTL.NHAZ",
      commencementDate,
      financialYear,
      licenseType,
      tenantId,
      tradeName,
      wfDocuments: [],
      tradeLicenseDetail: {
        channel: "COUNTER",
        additionalDetail: {
          validityYears,
        },
      },
    };

    if (gstNo) formData.tradeLicenseDetail.gstNo = gstNo;
    if (noOfEmployees) formData.tradeLicenseDetail.noOfEmployees = noOfEmployees;
    if (operationalArea) formData.tradeLicenseDetail.operationalArea = operationalArea;
    if (oldReceiptNo) formData.tradeLicenseDetail.oldReceiptNo = oldReceiptNo;
    if (accessories?.length > 0) formData.tradeLicenseDetail.accessories = accessories;
    if (tradeUnits?.length > 0) formData.tradeLicenseDetail.tradeUnits = tradeUnits;
    if (owners?.length > 0) formData.tradeLicenseDetail.owners = owners;
    if (address) formData.tradeLicenseDetail.address = address;
    if (structureType) formData.tradeLicenseDetail.structureType = structureType;
    if (OwnerDetails?.ownershipCategory?.code.includes("INDIVIDUAL"))
      formData.tradeLicenseDetail.subOwnerShipCategory = OwnerDetails?.ownershipCategory?.code;
    if (subOwnerShipCategory) formData.tradeLicenseDetail.subOwnerShipCategory = subOwnerShipCategory;

    if (OwnerDetails?.owners?.length && subOwnerShipCategory.includes("INSTITUTIONAL")) {
      formData.tradeLicenseDetail.institution = {
        designation: OwnerDetails.owners[0]?.designation,
        instituionName: OwnerDetails.owners[0]?.instituionName,
        name: OwnerDetails.owners[0]?.name,
        contactNo: OwnerDetails.owners[0]?.altContactNumber,
      };
    }

    if (TraidDetails?.cpt) {
      formData.tradeLicenseDetail.additionalDetail.propertyId = TraidDetails.cpt.details?.propertyId;
      formData.tradeLicenseDetail.additionalDetail.isSameAsPropertyOwner = isSameAsPropertyOwner;
    }

    const subOwner = sessionStorage.getItem("SubownershipCategory");


    formData.tradeLicenseDetail.subOwnerShipCategory = subOwner;

    formData = Digit?.Customizations?.TL?.customiseCreateFormData ? Digit.Customizations.TL.customiseCreateFormData(data, formData) : formData;

    setLoader(true);
    try {
      const response = await Digit.TLService.create({ Licenses: [formData] }, tenantId);
      if (response?.ResponseInfo?.status === "successful") {
        dispatch(UPDATE_tlNewApplication("CreatedResponse", response.Licenses[0]));
       
      }
      setLoader(false);
      return response?.ResponseInfo?.status === "successful";
    } catch (error) {
      setLoader(false);
      return error;
    }
  };

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue, data) => {
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_tlNewApplication(config.key, data));
    }
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        closeToast();
      }, 3000); 
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <React.Fragment>
      <FormComposer
        defaultValues={currentStepData}
        config={config.currStepConfig}
        onSubmit={goNext}
        onFormValueChange={onFormValueChange}
        label={t(`${config.texts.submitBarLabel}`)}
        currentStep={config.currStepNumber}
        onBackClick={onGoBack}
        
      />
      {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
      {getLoader && <Loader page={true} />}
    </React.Fragment>
  );
};

export default TLNewFormStepTwo;
