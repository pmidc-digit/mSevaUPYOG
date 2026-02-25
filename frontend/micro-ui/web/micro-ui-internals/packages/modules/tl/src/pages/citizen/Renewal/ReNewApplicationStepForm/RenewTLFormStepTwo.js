// RenewFormStepTwo.jsx

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_tlNewApplication } from "../../../../redux/action/TLNewApplicationActions";
import _ from "lodash";
import { convertDateToEpoch } from "../../../../utils";

export const RenewTLFormStepTwo = ({ config, onGoNext, onBackClick, t }) => {
  let tenantId = Digit.ULBService.getCurrentTenantId() || Digit.ULBService.getCitizenCurrentTenant();
  const dispatch = useDispatch();
  const tenants = Digit.Hooks.tl.useTenants();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const reduxStepData = useSelector((state) => state.tl.tlNewApplicationForm.formData.OwnerDetails);
  const [localStepData, setLocalStepData] = useState(reduxStepData);
  const formData = useSelector((state) => state.tl.tlNewApplicationForm.formData);
  useEffect(() => {
        if (showToast) {
          const timer = setTimeout(() => {
            closeToast();
          }, 3000); 
          return () => clearTimeout(timer);
        }
      }, [showToast]);

  const validateOwnerDetails = (data) => {
    const { ownershipCategory, owners } = data || {};
    const missingFields = [];

    if (!ownershipCategory?.value) {
      missingFields.push("Ownership Category");
      return missingFields;
    }

    if (!owners || owners.length === 0) {
      missingFields.push("At least one Owner");
      return missingFields;
    }

    const isSingleOwner = ownershipCategory.value === "INDIVIDUAL.SINGLEOWNER";
    const isMultipleOwner = ownershipCategory.value === "INDIVIDUAL.MULTIPLEOWNERS";

    const validateOwner = (owner, index = 1) => {
      if (!owner?.name) missingFields.push(`Name (Owner ${index})`);
      if (!owner?.mobileNumber) missingFields.push(`Mobile Number (Owner ${index})`);
      if (!owner?.gender?.code) missingFields.push(`Gender (Owner ${index})`);
      if (!owner?.dob) missingFields.push(`Date of Birth (Owner ${index})`);
      if (!owner?.relationship?.code) missingFields.push(`Relationship (Owner ${index})`);
      if (!owner?.fatherOrHusbandName) missingFields.push(`Father/Husband Name (Owner ${index})`);
    };

    if (isSingleOwner) {
      if (owners.length !== 1) {
        missingFields.push("Only one owner allowed for SINGLEOWNER");
      } else {
        validateOwner(owners[0], 1);
      }
    } else if (isMultipleOwner) {
      owners.forEach((owner, index) => validateOwner(owner, index + 1));
    } else {
      // For other ownership types like INSTITUTIONAL, apply same validations for now
      owners.forEach((owner, index) => validateOwner(owner, index + 1));
    }

    return missingFields;
  };

  const onSubmit = async (data) => {
    // let tenantId = Digit.ULBService.getCurrentTenantId() || Digit.ULBService.getCitizenCurrentTenant();
    let isSameAsPropertyOwner = sessionStorage.getItem("isSameAsPropertyOwner");

    const { TraidDetails, OwnerDetails, Documents, applicationData } = data;
    const Traid = TraidDetails || data.TraidDetailsRenew; // fallback in case you use different keys
    let tenantId = applicationData?.tenantId || Digit.ULBService.getCurrentTenantId() || Digit.ULBService.getCitizenCurrentTenant();

    // Prepare accessories
    let accessories = [];
    if (Traid?.accessories?.length > 0) {
      Traid.accessories.map((item) => {
        if (item?.accessoryCategory?.code) {
          accessories.push({
            accessoryCategory: item.accessoryCategory.code || null,
            uom: item.accessoryCategory.uom || null,
            count: item.count ? Number(item.count) : null,
            uomValue: item.uomValue ? Number(item.uomValue) : null,
          });
        }
      });
    }

    // Prepare tradeUnits
    let tradeUnits = [];
    if (Traid?.tradeUnits?.length > 0) {
      Traid.tradeUnits.map((item) => {
        if (item?.tradeSubType?.code) {
          tradeUnits.push({
            tradeType: item.tradeSubType.code || null,
            uom: item.tradeSubType.uom || null,
            uomValue: item.uomValue ? Number(item.uomValue) : null,
          });
        }
      });
    }

    // Prepare address
    let address = {};
    if (Traid?.cpt?.details?.address) {
      const addr = Traid.cpt.details.address;
      address.city = addr.city || addr.tenantId || tenantId;
      address.locality = { code: addr.locality?.code || null };
      if (addr.doorNo) address.doorNo = addr.doorNo;
      if (addr.street) address.street = addr.street;
      if (addr.pincode) address.pincode = addr.pincode;
    } else if (Traid?.address) {
      address.city = Traid.address.city?.code || tenantId;
      address.locality = { code: Traid.address.locality?.code || null };
      if (Traid.address.doorNo) address.doorNo = Traid.address.doorNo;
      if (Traid.address.street) address.street = Traid.address.street;
      if (Traid.address.pincode) address.pincode = Traid.address.pincode;
      if (Traid.address.buildingName) address.buildingName = Traid.address.buildingName;
    }
    if (TraidDetails?.address?.geoLocation?.latitude) {
      address.latitude = TraidDetails?.address?.geoLocation?.latitude;
      address.longitude = TraidDetails.address.geoLocation?.longitude;
    }

    // Prepare owners
    let owners = [];
    if (OwnerDetails?.owners?.length > 0) {
      const validOwners = OwnerDetails.owners.filter(owner => {
        const isValid = owner?.name && 
                       owner?.mobileNumber && 
                       owner?.name.trim() !== "" &&
                       owner?.mobileNumber.toString().length >= 10;        
        return isValid;
      });


      validOwners.forEach((owner, index) => {
        const gender = typeof owner?.gender === 'object' ? owner.gender?.code : owner?.gender;
        const relationship = typeof owner?.relationship === 'object' 
          ? owner.relationship?.code?.code || owner.relationship?.code 
          : owner?.relationship;
        const ownerType = typeof owner?.ownerType === 'object' ? owner.ownerType?.code : owner?.ownerType;


        let obj = {
          name: owner?.name || "",
          mobileNumber: owner?.mobileNumber ? Number(owner?.mobileNumber) : null,
          fatherOrHusbandName: owner?.fatherOrHusbandName || "",
          gender: gender || "MALE",
          permanentAddress: owner?.permanentAddress || "",
          relationship: relationship || "FATHER", // ✅ Now guaranteed to be a string
          ownerType: ownerType || "NONE",
          dob: owner?.dob ? convertDateToEpoch(owner.dob) : null,
          additionalDetails: {
            ownerSequence: index,
            ownerName: owner?.name || "",
          },
        };
        owners.push(obj);
      });
    }

    // Prepare documents
    let applicationDocuments = Documents?.documents?.documents || [];

    // ✅ Validate ownership type vs owner count before API call
    const ownershipCode = OwnerDetails?.ownershipCategory?.code;
    
    if (ownershipCode === "INDIVIDUAL.SINGLEOWNER" && owners.length !== 1) {
      throw new Error("Single ownership must have exactly 1 owner");
    }
    
    if (ownershipCode === "INDIVIDUAL.MULTIPLEOWNERS" && owners.length < 2) {
      throw new Error("Multiple ownership must have at least 2 owners");
    }

    if (owners.length === 0) {
      throw new Error("At least one valid owner is required");
    }


    // Prepare main formData
    let formData = {
      id: applicationData?.id,
      tradeName: applicationData.tradeName,
      applicationNumber: applicationData?.applicationNumber,
      licenseNumber: applicationData?.licenseNumber,
      tenantId: tenantId,
      action: "INITIATE",
      status: applicationData?.status || "APPROVED",
      applicationType: "RENEWAL",
      workflowCode: Traid?.tradeUnits?.some((unit) => unit?.tradeSubType?.ishazardous) ? "NEWTL.HAZ" : "NEWTL.NHAZ",
      commencementDate: convertDateToEpoch(Traid?.tradedetils?.[0]?.commencementDate),
      issuedDate: applicationData?.issuedDate,
      applicationDate: applicationData?.applicationDate,
      financialYear: Traid?.tradedetils?.[0]?.financialYear?.code,
      licenseType: Traid?.tradedetils?.[0]?.licenseType?.code || "PERMANENT",
      businessService: applicationData?.businessService || "TL",
      // wfDocuments: applicationDocuments,
      wfDocuments: [],
      accountId: applicationData?.accountId,
      propertyId: applicationData?.propertyId || Traid?.cpt?.details?.propertyId || null,
      tradeLicenseDetail: {
        id: applicationData?.tradeLicenseDetail?.id,
        surveyNo: applicationData?.tradeLicenseDetail?.surveyNo || null,
        channel: "CITIZEN",
        address: address,
        owners: owners,
        structureType: Traid?.tradedetils?.[0]?.structureSubType?.code,
        subOwnerShipCategory: OwnerDetails?.ownershipCategory?.code || "INDIVIDUAL.SINGLEOWNER",
        operationalArea: Traid?.tradedetils?.[0]?.operationalArea ? Number(Traid.tradedetils[0].operationalArea) : null,
        noOfEmployees: Traid?.tradedetils?.[0]?.noOfEmployees ? Number(Traid.tradedetils[0].noOfEmployees) : null,
        tradeUnits: tradeUnits,
        accessories: accessories,
        applicationDocuments: applicationDocuments,
        // verificationDocuments: applicationData?.tradeLicenseDetail?.verificationDocuments || null,
        verificationDocuments: null,
        additionalDetail: {
          validityYears: Traid?.validityYears?.code || 1,
          propertyId: Traid?.cpt?.details?.propertyId || null,
          isSameAsPropertyOwner: isSameAsPropertyOwner,
        },
        institution: applicationData?.tradeLicenseDetail?.institution || null,
        auditDetails: applicationData?.tradeLicenseDetail?.auditDetails || {},
      },
      auditDetails: applicationData?.auditDetails || {},
      fileStoreId: applicationData?.fileStoreId || null,
      isDeclared: "false",
    };

    // Call API
    const response = await Digit.TLService.update({ Licenses: [formData] }, tenantId);
    if (response?.ResponseInfo?.status === "successful") {
      dispatch(UPDATE_tlNewApplication("CreatedResponse", response.Licenses[0]));}

    return response?.ResponseInfo?.status === "successful";
  };

  const goNext = async () => {
    // if (!validateOwners(localStepData)) {
    //   setError(t("Please fill all owner mandatory details correctly."));
    //   setShowToast(true);
    //   return;
    // }

    const missingFields = validateOwnerDetails(localStepData);

    if (missingFields.length > 0) {
      setError(`Please fill the following fields: ${missingFields.join(", ")}`);
      setShowToast(true);
      return;
    }

    const res = await onSubmit(formData);

    if (res) {
      onGoNext();
    } else {
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
