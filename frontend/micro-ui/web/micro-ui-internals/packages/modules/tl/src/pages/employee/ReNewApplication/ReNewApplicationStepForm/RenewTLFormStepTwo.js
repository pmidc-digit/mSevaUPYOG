// RenewFormStepTwo.jsx

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_tlNewApplication } from "../../../../redux/action/TLNewApplicationActions";
import _ from "lodash";
import { convertDateToEpoch } from "../../../../utils";

// Safely extract a string code from a value that may be a string, object {code}, or doubly-nested {code: {code}}
const extractCode = (val) => {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    const code = val.code;
    if (typeof code === "string") return code;
    if (typeof code === "object" && typeof code.code === "string") return code.code;
  }
  return null;
};

const RenewTLFormStepTwo = ({ config, onGoNext, onBackClick, t }) => {
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
      if (!owner?.gender) missingFields.push(`Gender (Owner ${index})`);
      if (!owner?.dob) missingFields.push(`Date of Birth (Owner ${index})`);
      if (!owner?.relationship) missingFields.push(`Relationship (Owner ${index})`);
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
    let tenantId = Digit.ULBService.getCurrentTenantId() || Digit.ULBService.getCitizenCurrentTenant();
    let isSameAsPropertyOwner = sessionStorage.getItem("isSameAsPropertyOwner");

    const { TraidDetails, OwnerDetails, Documents, applicationData } = data;
    const Traid = TraidDetails || data.TraidDetailsRenew; // fallback in case you use different keys

    // ─── EDIT PATH (edit-application-details for sent-back applications) ───
    // For edit-application, do NOT call the API here at Step 2.
    // Instead, build the resubmit payload and save it to Redux so Step 4 (Summary) can submit it.
    // This avoids the double-call problem (Step 2 RESUBMIT + Step 4 APPLY).
    const isEditApplication = window.location.href.includes("edit-application-details");

    if (isEditApplication) {
      const resubmitPayload = _.cloneDeep(applicationData);

      // Workflow fields — will be submitted at Step 4
      // Use APPLY for INITIATED applications, RESUBMIT for sent-back applications
      resubmitPayload.action = applicationData?.status === "INITIATED" ? "APPLY" : "RESUBMIT";
      resubmitPayload.comment = "";
      resubmitPayload.wfDocuments = null;
      const currentUserUuid = Digit.UserService.getUser()?.info?.uuid;
      resubmitPayload.assignee = currentUserUuid ? [currentUserUuid] : null;

      // Overlay owner edits while keeping full original owner objects (with roles, userName, etc.)
      if (OwnerDetails?.owners?.length > 0) {
        const origOwners = resubmitPayload.tradeLicenseDetail?.owners || [];
        resubmitPayload.tradeLicenseDetail.owners = OwnerDetails.owners.map((formOwner, index) => {
          const orig = origOwners.find(o => o.id && o.id === formOwner.id) || origOwners[index] || {};
          return {
            ...orig,
            name: formOwner?.name || orig.name,
            mobileNumber: formOwner?.mobileNumber ? String(formOwner.mobileNumber) : orig.mobileNumber,
            fatherOrHusbandName: formOwner?.fatherOrHusbandName || orig.fatherOrHusbandName,
            gender: extractCode(formOwner?.gender) || orig.gender,
            permanentAddress: formOwner?.permanentAddress !== undefined ? formOwner.permanentAddress : orig.permanentAddress,
            relationship: extractCode(formOwner?.relationship) || orig.relationship,
            ownerType: extractCode(formOwner?.ownerType) || orig.ownerType,
            dob: formOwner?.dob ? convertDateToEpoch(formOwner.dob) : orig.dob,
          };
        });
      }

      // Overlay ownership category
      if (OwnerDetails?.ownershipCategory?.code) {
        resubmitPayload.tradeLicenseDetail.subOwnerShipCategory = OwnerDetails.ownershipCategory.code;
      }

      // Overlay trade details if form-edited
      if (Traid?.tradedetils?.[0]) {
        const td = Traid.tradedetils[0];
        if (td.commencementDate) resubmitPayload.commencementDate = convertDateToEpoch(td.commencementDate);
        if (td.financialYear?.code) resubmitPayload.financialYear = td.financialYear.code;
        if (td.structureSubType?.code) resubmitPayload.tradeLicenseDetail.structureType = td.structureSubType.code;
        if (td.licenseType?.code) resubmitPayload.licenseType = td.licenseType.code;
        if (td.tradeName) resubmitPayload.tradeName = td.tradeName;
      }

      // Overlay tradeUnits if form-edited
      if (Traid?.tradeUnits?.length > 0) {
        const origUnits = resubmitPayload.tradeLicenseDetail?.tradeUnits || [];
        resubmitPayload.tradeLicenseDetail.tradeUnits = Traid.tradeUnits.map((item, idx) => {
          const orig = origUnits[idx] || {};
          return {
            ...orig,
            tradeType: item.tradeSubType?.code || orig.tradeType,
            uom: item.tradeSubType?.uom || orig.uom,
            uomValue: item.uomValue ? Number(item.uomValue) : orig.uomValue,
            active: true,
          };
        });
      }

      // Backend expects null for empty accessories, not []
      if (!resubmitPayload.tradeLicenseDetail.accessories?.length) {
        resubmitPayload.tradeLicenseDetail.accessories = null;
      }

      // Save the built payload to Redux — Step 4 (Summary) will submit it with documents
      dispatch(UPDATE_tlNewApplication("EditPayload", resubmitPayload));
      return true; // proceed to next step without API call
    }

    // ─── NORMAL RENEWAL PATH (below code only runs for renewal, NOT for RESUBMIT) ───

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

    // Prepare tradeUnits (preserve original IDs for renewal)
    let tradeUnits = [];
    const originalTradeUnits = applicationData?.tradeLicenseDetail?.tradeUnits || [];
    if (Traid?.tradeUnits?.length > 0) {
      Traid.tradeUnits.map((item, index) => {
        if (item?.tradeSubType?.code) {
          const originalUnit = originalTradeUnits[index] || {};
          tradeUnits.push({
            id: originalUnit?.id || undefined,
            tenantId: originalUnit?.tenantId || tenantId,
            active: true,
            tradeType: item.tradeSubType.code || null,
            uom: item.tradeSubType.uom || null,
            uomValue: item.uomValue ? Number(item.uomValue) : null,
            auditDetails: originalUnit?.auditDetails || null,
          });
        }
      });
    }

    // Prepare address (preserve original address ID for renewal)
    const originalAddress = applicationData?.tradeLicenseDetail?.address || {};
    let address = {};
    if (Traid?.cpt?.details?.address) {
      const addr = Traid.cpt.details.address;
      address.id = originalAddress?.id || undefined;
      address.tenantId = originalAddress?.tenantId || tenantId;
      address.city = addr.city || addr.tenantId || tenantId;
      address.locality = { code: addr.locality?.code || null, name: addr.locality?.name || null, label: addr.locality?.label || "Locality" };
      if (addr.doorNo) address.doorNo = addr.doorNo;
      if (addr.street) address.street = addr.street;
      if (addr.pincode) address.pincode = addr.pincode;
    } else if (Traid?.address) {
      address.id = originalAddress?.id || undefined;
      address.tenantId = originalAddress?.tenantId || tenantId;
      address.city = Traid.address.city?.code || tenantId;
      address.locality = { code: Traid.address.locality?.code || null, name: Traid.address.locality?.name || null, label: Traid.address.locality?.label || "Locality" };
      if (Traid.address.doorNo) address.doorNo = Traid.address.doorNo;
      if (Traid.address.street) address.street = Traid.address.street;
      if (Traid.address.pincode) address.pincode = Traid.address.pincode;
      if (Traid.address.buildingName) address.buildingName = Traid.address.buildingName;
    }
    if (TraidDetails?.address?.geoLocation?.latitude) {
      address.latitude = TraidDetails?.address?.geoLocation?.latitude;
      address.longitude = TraidDetails.address.geoLocation?.longitude;
    }

    // Prepare owners — preserve id/uuid/tenantId from original application for update
    let owners = [];
    const originalOwners = applicationData?.tradeLicenseDetail?.owners || [];
    if (OwnerDetails?.owners?.length > 0) {
      OwnerDetails.owners.map((owner, index) => {
        // Try to match with original owner by id, or fall back to index
        const original = originalOwners.find(o => o.id && o.id === owner.id) || originalOwners[index] || {};
        let obj = {
          ...original, // spread full original owner (preserves roles, userName, type, active, tenantId, etc.)
          name: owner?.name || original.name || "",
          mobileNumber: owner?.mobileNumber ? String(owner.mobileNumber) : (original.mobileNumber ? String(original.mobileNumber) : null),
          fatherOrHusbandName: owner?.fatherOrHusbandName || original.fatherOrHusbandName || "",
          gender: extractCode(owner?.gender) || original.gender || "MALE",
          permanentAddress: owner?.permanentAddress !== undefined ? owner.permanentAddress : (original.permanentAddress || ""),
          relationship: extractCode(owner?.relationship) || original.relationship || "FATHER",
          ownerType: extractCode(owner?.ownerType) || original.ownerType || "NONE",
          dob: owner?.dob ? convertDateToEpoch(owner.dob) : original.dob,
        };
        owners.push(obj);
      });
    }

    // Prepare documents
    let applicationDocuments = Documents?.documents?.documents || [];

    // Renewal-specific workflow values (RESUBMIT case is handled above with early return)
    const computedAction = "INITIATE";
    const computedApplicationType = "RENEWAL";
    const computedWorkflowCode = Traid?.tradeUnits?.some((unit) => unit?.tradeSubType?.ishazardous) ? "NEWTL.HAZ" : "NEWTL.NHAZ";

    // Prepare main formData
    let formData = {
      comment: null,
      id: applicationData?.id,
      tradeName: applicationData.tradeName,
      applicationNumber: applicationData?.applicationNumber,
      licenseNumber: applicationData?.licenseNumber,
      oldLicenseNumber: applicationData?.oldLicenseNumber || null,
      tenantId: tenantId,
      action: computedAction,
      assignee: null,
      status: applicationData?.status || "APPROVED",
      applicationType: computedApplicationType,
      workflowCode: computedWorkflowCode,
      commencementDate: convertDateToEpoch(Traid?.tradedetils?.[0]?.commencementDate),
      issuedDate: applicationData?.issuedDate,
      applicationDate: applicationData?.applicationDate,
      financialYear: Traid?.tradedetils?.[0]?.financialYear?.code || applicationData?.financialYear,
      validFrom: applicationData?.validFrom || null,
      validTo: applicationData?.validTo || null,
      licenseType: Traid?.tradedetils?.[0]?.licenseType?.code || "PERMANENT",
      businessService: applicationData?.businessService || "TL",
      // wfDocuments: applicationDocuments,
      wfDocuments: [],
      accountId: applicationData?.accountId,
      oldPropertyId: applicationData?.oldPropertyId || null,
      propertyId: applicationData?.propertyId || Traid?.cpt?.details?.propertyId || null,
      tradeLicenseDetail: {
        id: applicationData?.tradeLicenseDetail?.id,
        surveyNo: applicationData?.tradeLicenseDetail?.surveyNo || null,
        channel: "COUNTER",
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
    try {
      const response = await Digit.TLService.update({ Licenses: [formData] }, tenantId);
      if (response?.ResponseInfo?.status === "successful") {
        dispatch(UPDATE_tlNewApplication("CreatedResponse", response.Licenses[0]));
        return true;
      }
      return false;
    } catch (e) {
      const errMsg = e?.response?.data?.Errors?.[0]?.message || e?.message || "Renewal request failed. Please try again.";
      setError(errMsg);
      setShowToast(true);
      return false;
    }
  };

  const goNext = async () => {
    // if (!validateOwners(localStepData)) {
    //   setError(t("Please fill all owner mandatory details correctly."));
    //   setShowToast(true);
    //   return;
    // }

    const missingFields = validateOwnerDetails(formData?.OwnerDetails);

    if (missingFields.length > 0) {
      setError(`Please fill the following fields: ${missingFields.join(", ")}`);
      setShowToast(true);
      return;
    }

    const res = await onSubmit(formData);

    if (res) {
      onGoNext();
    }
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
