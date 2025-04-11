// RenewFormStepTwo.jsx

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_tlNewApplication } from "../../../../redux/action/tlNewApplicationActions";
import _ from "lodash";

const RenewTLFormStepTwo = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  
    const reduxStepData = useSelector((state) => state.tl.tlNewApplicationForm.formData.OwnerDetails);
    const [localStepData, setLocalStepData] = useState(reduxStepData);

    // useEffect(()=>{
    //     console.log("currentStepData in step 2: formData:", formData); 
    //     // console.log("currentStepData in step 2: ", currentStepData);
    // },[])
  const validateOwners = (data) => {
    const { ownershipCategory, owners } = data;
    if (!ownershipCategory?.value || !owners?.length) return false;
    return owners.every(
      (owner) =>
        owner?.name && owner?.mobileNumber && owner?.gender?.code && owner?.relationship?.code && owner?.fatherOrHusbandName
    );
  };

  const onSubmit = async (data) => {
      let isSameAsPropertyOwner = sessionStorage.getItem("isSameAsPropertyOwner");
      console.log("sample_formData: ", data);
      
      const { TraidDetails, OwnerDetails } = data;
    
      if (TraidDetails?.cpt?.id) {
        if (!TraidDetails?.cpt?.details || !propertyDetails) {
          setShowToast({ key: "error" });
          setError(t("ERR_INVALID_PROPERTY_ID"));
          return;
        }
      }
    
      const foundValue = tenants?.find((obj) =>
        obj.pincode?.find((item) => item.toString() === TraidDetails?.address?.pincode)
      );
      if (!foundValue && TraidDetails?.address?.pincode) {
        setShowToast({ key: "error" });
        setError(t("TL_COMMON_PINCODE_NOT_SERVICABLE"));
        return;
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
        if (TraidDetails.cpt.details.address.pincode)
          address.pincode = TraidDetails.cpt.details.address.pincode;
      } else if (TraidDetails?.address) {
        address.city = TraidDetails.address.city?.code || null;
        if(TraidDetails?.address?.locality?.code){
  
        }
        address.locality = { code: TraidDetails.address.locality?.code || null };
        if (TraidDetails.address.doorNo) address.doorNo = TraidDetails.address.doorNo;
        if (TraidDetails.address.street) address.street = TraidDetails.address.street;
        if (TraidDetails.address.pincode) address.pincode = TraidDetails.address.pincode;
      }
    
      let owners = [];
      if (OwnerDetails?.owners?.length > 0) {
        OwnerDetails.owners.map((owner, index) => {
          let obj = {};
          obj.dob = owner?.dob ? convertDateToEpoch(owner.dob) : null;
          obj.additionalDetails = { ownerSequence: index, ownerName: owner.name };
          if (owner.fatherOrHusbandName) obj.fatherOrHusbandName = owner.fatherOrHusbandName;
          if (owner.gender?.code) obj.gender = owner.gender.code;
          if (owner.mobileNumber) obj.mobileNumber = Number(owner.mobileNumber);
          if (owner.name) obj.name = !OwnerDetails?.ownershipCategory?.code.includes("INSTITUTIONAL") ? owner.name : "";
          if (owner.permanentAddress) obj.permanentAddress = owner.permanentAddress;
          obj.permanentAddress = obj.permanentAddress || null;
          if (owner.relationship) obj.relationship = owner.relationship?.code;
          if (owner.emailId) obj.emailId = owner.emailId;
          if (owner.ownerType?.code) obj.ownerType = owner.ownerType.code;
          owners.push(obj);
        });
      }
    
      let applicationDocuments = TraidDetails?.documents?.documents || [];
      let commencementDate = convertDateToEpoch(TraidDetails?.tradedetils?.[0]?.commencementDate);
      let financialYear = TraidDetails?.tradedetils?.[0]?.financialYear?.code;
      let gstNo = TraidDetails?.tradedetils?.[0]?.gstNo || "";
      let noOfEmployees = Number(TraidDetails?.tradedetils?.[0]?.noOfEmployees) || "";
      let operationalArea = Number(TraidDetails?.tradedetils?.[0]?.operationalArea) || "";
      let structureType = TraidDetails?.tradedetils?.[0]?.structureSubType?.code || "";
      let tradeName = TraidDetails?.tradedetils?.[0]?.tradeName || "";
      let subOwnerShipCategory = OwnerDetails?.ownershipCategory?.code || "";
      let licenseType = TraidDetails?.tradedetils?.[0]?.licenseType?.code || "PERMANENT";
      let validityYears = TraidDetails?.validityYears?.code || 1;
  
      console.log("trade type", );
    
      let formData = {
        // action: "INITIATE",
        // applicationType: "NEW",
        workflowCode: TraidDetails?.tradeUnits.some(unit => unit?.tradeSubType?.ishazardous) ? "NEWTL.HAZ" : "NEWTL.NHAZ",
        commencementDate,
        financialYear,
        licenseType,
        tenantId,
        tradeName,
        wfDocuments: applicationDocuments,
        tradeLicenseDetail: {
          channel: "COUNTER",
          additionalDetail: {
            validityYears
          },
          applicationDocuments: applicationDocuments
        },
      };
    //   formdata.calculation.applicationNumber = formdata.applicationNumber;
    // formdata.action = "APPLY";
    
      if (gstNo) formData.tradeLicenseDetail.additionalDetail.gstNo = gstNo;
      if (noOfEmployees) formData.tradeLicenseDetail.noOfEmployees = noOfEmployees;
      if (operationalArea) formData.tradeLicenseDetail.operationalArea = operationalArea;
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
    
      formData = Digit?.Customizations?.TL?.customiseCreateFormData
        ? Digit.Customizations.TL.customiseCreateFormData(data, formData)
        : formData;
  
        console.log("formData in step 2: ", formData);
        const response = await Digit.TLService.update({ Licenses: [formData] }, tenantId);
        if(response?.ResponseInfo?.status === "successful"){
          dispatch(UPDATE_tlNewApplication("CreatedResponse", response.Licenses[0]));
          console.log("response in step 2: ", response.Licenses[0]);
        }
        return (response?.ResponseInfo?.status === "successful");
      
    };

  const goNext = async () => {
    if (!validateOwners(localStepData)) {
      setError(t("Please fill all owner mandatory details correctly."));
      setShowToast(true);
      return;
    }

    const res = await onSubmit(formData);
    console.log("API response: ", res);

    if (res) {
      console.log("Submission successful, moving to next step.");
      onGoNext();
    } else {
      console.error("Submission failed, not moving to next step.");
    }
    // onGoNext();
  };

  const onGoBack = () => {
    onBackClick(config.key, localStepData);
  };

  const onFormValueChange = (setValue, data) => {
    if (!_.isEqual(data, localStepData)) {
      dispatch(UPDATE_tlNewApplication(config.key, data));
      setLocalStepData(data);
    }
  };

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  return (
    <React.Fragment>
      <FormComposer
        defaultValues={localStepData}
        config={config.currStepConfig}
        onSubmit={goNext}
        onFormValueChange={onFormValueChange}
        label={t(config.texts.submitBarLabel)}
        currentStep={config.currStepNumber}
        onBackClick={onGoBack}
      />
      {showToast && <Toast error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default RenewTLFormStepTwo;
