import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
// import { FormComposer } from "../../../../../../../react-components/src/hoc/FormComposer";
import { UPDATE_PTNewApplication_FORM } from "../../../../redux/action/PTNewApplicationActions";

const PTOwnerTransfershipStepOne = ({ config, onGoNext, onBackClick, t }) => {
    const [showToast, setShowToast] = useState(null);

  const getStoredTransferData = () => {
    try {
      return JSON.parse(sessionStorage.getItem("ownerTransferData") || "{}");
    } catch (error) {
      return {};
    }
  };

  function goNext(data) {
    console.log(
      `Data in step ${config.currStepNumber}:`,
      data
    );

    // prevent moving if no data
    if (!data || _.isEmpty(data)) {
      return;
    }

    // Block navigation if mandatory registration details fields are missing
    const additionalDetails = data?.additionalDetails;
    if (
      !additionalDetails?.reasonForTransfer ||
      !additionalDetails?.marketValue ||
      !additionalDetails?.documentNumber ||
      !additionalDetails?.documentValue ||
      !additionalDetails?.documentDate
    ) {
      return;
    }

    if (additionalDetails?.documentDate) {
      const docDate = new Date(additionalDetails.documentDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (docDate.getTime() > today.getTime()) {
        return;
      }
    }

    // Block navigation if ownershipCategory or owners are invalid based on selection
    const ownershipCategory = data?.ownershipCategory;
    if (!ownershipCategory || !ownershipCategory.code) {
      return;
    }

    const owners = data?.owners;
    if (!owners || !Array.isArray(owners) || owners.length === 0) {
      return;
    }

    const isIndividualTypeOwner = ownershipCategory.code.includes("INDIVIDUAL");

    for (const owner of owners) {
      // Validate common fields first
      if (!owner.name || (typeof owner.name === "string" && !owner.name.trim())) {
        return;
      }
      
      const mobilePattern = /^[6-9]\d{9}$/;
      if (!owner.mobileNumber || !mobilePattern.test(owner.mobileNumber)) {
        return;
      }

      if (isIndividualTypeOwner) {
        // Individual fields validation
        if (!owner.gender || (typeof owner.gender === "object" && !owner.gender.code)) {
          return;
        }
        if (!owner.fatherOrHusbandName || (typeof owner.fatherOrHusbandName === "string" && !owner.fatherOrHusbandName.trim())) {
          return;
        }
        if (!owner.relationship || (typeof owner.relationship === "object" && !owner.relationship.code)) {
          return;
        }
        if (!owner.ownerType || (typeof owner.ownerType === "object" && !owner.ownerType.code)) {
          return;
        }

        const ownerTypeCode = typeof owner.ownerType === "object" ? owner.ownerType.code : owner.ownerType;
        if (ownerTypeCode && ownerTypeCode !== "NONE") {
          if (!owner.documents?.documentType || (typeof owner.documents.documentType === "object" && !owner.documents.documentType.code)) {
            return;
          }
          if (!owner.documents?.documentUid || (typeof owner.documents.documentUid === "string" && !owner.documents.documentUid.trim())) {
            return;
          }
        }

        if (
          ownershipCategory.code === "INDIVIDUAL.MULTIPLEOWNERS" ||
          ownershipCategory.code === "INDIVIDUAL.SINGLEOWNER"
        ) {
          if (
            !owner?.ownershipPercentage ||
            isNaN(Number(owner.ownershipPercentage)) ||
            Number(owner.ownershipPercentage) < 0 ||
            Number(owner.ownershipPercentage) > 100
          ) {
            return;
          }
          if (
            ownershipCategory.code === "INDIVIDUAL.SINGLEOWNER" &&
            Number(owner.ownershipPercentage) !== 100
          ) {
            return;
          }
        }
      } else {
        // Institutional fields validation
        if (!owner.institutionName || (typeof owner.institutionName === "string" && !owner.institutionName.trim())) {
          return;
        }
        if (!owner.institutionType || (typeof owner.institutionType === "object" && !owner.institutionType.code)) {
          return;
        }
        
        const landlinePattern = /^\d{11}$/;
        if (!owner.altContactNumber || !landlinePattern.test(owner.altContactNumber)) {
          return;
        }
        if (!owner.designation || (typeof owner.designation === "string" && !owner.designation.trim())) {
          return;
        }
        if (!owner.correspondenceAddress || (typeof owner.correspondenceAddress === "string" && !owner.correspondenceAddress.trim())) {
          return;
        }
      }
    }
    if (ownershipCategory?.code === "INDIVIDUAL.MULTIPLEOWNERS") {
      const totalPercentage = owners?.reduce((sum, owner) => sum + Number(owner.ownershipPercentage || 0), 0);
      if (totalPercentage !== 100) {
        setShowToast({ key: "error", label: "PT_PERCENTAGE_SUM_MUST_BE_100" });
        return;
      }
    }

    const { originalData, ...stepData } = data || {};
    dispatch(UPDATE_PTNewApplication_FORM(config.key, stepData));
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    const { originalData, ...stepData } = data || {};
    latestStepData.current = stepData;
  };

  // const onFormValueChange = (setValue = true, data) => {
  //   console.log("onFormValueChange data in Property details step one: +", data, "\n Bool: ", !_.isEqual(data, localStepData));

  //   // Check if data is not empty or only partial fields have changed
  //   const isDataValid = data?.owners?.length && data.owners[0].name !== "" && data.owners[0].mobileNumber !== "";

  //   // Only dispatch if the data is valid and changed
  //   if (isDataValid && !_.isEqual(data, localStepData)) {
  //     dispatch(UPDATE_PTNewApplication_FORM(config.key, data));
  //     setLocalStepData(data);
  //     console.log("Dispatching UPDATE_PTNewApplication_FORM with key: +", config.key, "and data:", data);
  //   } else {
  //     console.log("Skipping dispatch as data is either unchanged or invalid.+");
  //   }
  // };

  const formData = useSelector((state) => state.pt.PTNewApplicationFormReducer.formData || {});
  const reduxStepData = formData?.TransferorDetails || {};
  const storedTransferData = useMemo(getStoredTransferData, [formData?.originalData?.propertyId]);
  const defaultStepData = useMemo(() => ({ ...storedTransferData, ...formData, ...reduxStepData }), [storedTransferData, formData, reduxStepData]);
  console.log("Step one formdata +", formData);
  const [localStepData, setLocalStepData] = useState(defaultStepData);
  const latestStepData = useRef(defaultStepData);
  console.log("reduxStepData in step one: +", localStepData);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!_.isEqual(defaultStepData, localStepData)) {
      setLocalStepData(defaultStepData);
    }
  }, [defaultStepData]);

  if (!defaultStepData?.originalData) {
    return null;
  }
  

  return (
    <React.Fragment>
      <FormComposer
        key={defaultStepData?.originalData?.propertyId || defaultStepData?.originalData?.acknowldgementNumber}
        defaultValues={defaultStepData}
        //heading={t("")}
        config={config.currStepConfig}
        onSubmit={goNext}
        onFormValueChange={onFormValueChange}
        //isDisabled={!canSubmit}
        label={t(`${config.texts.submitBarLabel}`)}
        currentStep={config.currStepNumber}
        onBackClick={onGoBack}
      />
      {showToast && (
        <Toast
          error={showToast.key}
          label={t(showToast.label)}
          onClose={() => {
            setShowToast(null);
          }}
          isDleteBtn={true}
        />
      )}
    </React.Fragment>
  );
};

export default PTOwnerTransfershipStepOne;
