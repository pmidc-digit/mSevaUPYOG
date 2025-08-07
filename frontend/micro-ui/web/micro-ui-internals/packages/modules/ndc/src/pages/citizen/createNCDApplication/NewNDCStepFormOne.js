import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { updateNDCForm } from "../../../redux/actions/NDCFormActions";
import { useState } from "react";

export const NewNDCStepFormOne = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const currentStepData = useSelector((state) =>
    state.ndc.NDCForm.formData && state.ndc.NDCForm.formData[config.key] ? state.ndc.NDCForm.formData[config.key] : {}
  );
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");

  function goNext(data) {
    console.log(`Data in step ${config.currStepNumber} is: \n`, data);
    const missingFields = validateStepData(currentStepData);

    if (missingFields.length > 0) {
      setError(`${missingFields[0]}`);
      setShowToast(true);
      return;
    }

    createApplication(data);
    console.log("data", data);

    // onGoNext();
  }

  const createApplication = async (data) => {
    const applicant = Digit.UserService.getUser()?.info || {};
    const auditDetails = data?.cpt?.details?.auditDetails;
    const applicantId = applicant?.uuid;

    const payload = {
      Applicant: {
        tenantId: tenantId,
        firstname: data?.PropertyDetails?.firstName,
        lastname: data?.PropertyDetails?.lastName,
        mobile: data?.PropertyDetails?.mobileNumber,
        email: data?.PropertyDetails?.email,
        address: data?.PropertyDetails?.address,
        applicationStatus: "CREATE",
        createdby: auditDetails?.createdBy,
        lastmodifiedby: auditDetails?.lastModifiedBy,
        createdtime: auditDetails?.createdTime,
        lastmodifiedtime: auditDetails?.lastModifiedTime,
        workflow: {
          action: "INITIATE",
        },
      },
      NdcDetails: [],
      Documents: [], // Add documents mapping if needed
    };

    // Add each water connection to NdcDetails
    (data?.PropertyDetails?.waterConnection || []).forEach((wc) => {
      payload.NdcDetails.push({
        uuid: wc?.billData?.id,
        applicantId: applicantId,
        businessService: "WS",
        consumerCode: wc?.connectionNo,
        additionalDetails: {
          propertyAddress: data?.PropertyDetails?.address,
          propertyType: data?.cpt?.details?.usageCategory,
          // connectionType: wc?.billData,
          // meterNumber: "NOT_AVAILABLE"
        },
        dueAmount: wc?.billData?.totalAmount || 0,
        status: wc?.billData?.status,
      });
    });

    // Add each sewerage connection to NdcDetails
    (data?.PropertyDetails?.sewerageConnection || []).forEach((sc) => {
      payload.NdcDetails.push({
        uuid: sc?.billData?.id,
        applicantId: applicantId,
        businessService: "SW",
        consumerCode: sc?.connectionNo,
        additionalDetails: {
          propertyAddress: data?.PropertyDetails?.address,
          propertyType: data?.cpt?.details?.usageCategory,
        },
        dueAmount: sc?.billData?.totalAmount || 0,
        status: sc?.billData?.status,
      });
    });

    if (data?.PropertyDetails?.propertyBillData?.billData) {
      const billData = data?.PropertyDetails?.propertyBillData?.billData;
      payload.NdcDetails.push({
        uuid: billData?.id,
        applicantId: applicantId,
        businessService: "PT",
        consumerCode: data?.cpt?.id,
        additionalDetails: {
          propertyAddress: data?.PropertyDetails?.address,
          propertyType: data?.cpt?.details?.usageCategory,
        },
        dueAmount: billData?.totalAmount || 0,
        status: billData?.status,
      });
    }

    console.log("payload", payload);

    const response = await Digit.NDCService.NDCcreate({ tenantId, details: payload });
    console.log("response====", response);

    if (response?.ResponseInfo?.status === "successful") {
      dispatch(updateNDCForm("apiData", response));
      onGoNext();
      return { isSuccess: true, response };
    } else {
      return { isSuccess: false, response };
    }
  };

  // const onSubmit = async (data) => {
  //   const finalPayload = mapToNDCPayload(data);

  //   const response = await Digit.NDCService.NDCcreate({ tenantId, filters: { skipWorkFlow: true }, details: finalPayload });

  //   if (response?.ResponseInfo?.status === "successful") {
  //     return { isSuccess: true, response };
  //   } else {
  //     return { isSuccess: false, response };
  //   }
  // };

  function validateStepData(data) {
    const missingFields = [];
    const invalidFields = [];

    const cpt = data?.cpt || {};
    const cptDetails = cpt?.details || {};
    const propertyDetails = data?.PropertyDetails || {};
    const NDCReason = data?.NDCReason || {};

    // Mandatory Field Checks
    if (!cpt?.id) missingFields.push(t("NDC_MESSAGE_PROPERTY_ID"));
    if (!cptDetails || Object.keys(cptDetails).length === 0) missingFields.push(t("NDC_MESSAGE_PLEASE_SEARCH_PROPERTY_ID"));
    if (!propertyDetails?.firstName) missingFields.push(t("NDC_MESSAGE_FIRST_NAME"));
    if (!propertyDetails?.lastName) missingFields.push(t("NDC_MESSAGE_LAST_NAME"));
    if (!propertyDetails?.mobileNumber) missingFields.push(t("NDC_MESSAGE_MOBILE_NUMBER"));
    if (!propertyDetails?.address) missingFields.push(t("NDC_MESSAGE_ADDRESS"));
    if (!propertyDetails?.email) missingFields.push(t("NDC_MESSAGE_EMAIL"));
    // if (propertyDetails?.waterConnection?.length === 0) missingFields.push(t("NDC_MESSAGE_WATER_CONNECTION"));
    // if (propertyDetails?.sewerageConnection?.length === 0) missingFields.push(t("NDC_MESSAGE_SEWERAGE_CONNECTION"));
    if (!NDCReason?.code) missingFields.push(t("NDC_MESSAGE_NDC_REASON"));

    // if (propertyDetails?.waterConnection?.length > 0) {
    //   propertyDetails.waterConnection.forEach(value => {
    //     if (!value?.billData?.id) {
    //       invalidFields.push(`${t("NDC_MESSAGE_PLEASE_CHECK_STATUS_OF_WATER_CONNECTION")} ${value?.connectionNo}`);
    //     }
    //     if (value?.billData?.id && value?.billData?.totalAmount > 0) {
    //       invalidFields.push(`${t("NDC_MESSAGE_PLEASE_PAY_DUES_OF_WATER_CONNECTION")} ${value?.connectionNo}`);
    //     }
    //   });
    // }

    // if (propertyDetails?.sewerageConnection?.length > 0) {
    //   propertyDetails.sewerageConnection.forEach(value => {
    //     if (!value?.billData?.id) {
    //       invalidFields.push(`${t("NDC_MESSAGE_PLEASE_CHECK_STATUS_OF_SEWERAGE_CONNECTION")} ${value?.connectionNo}`);
    //     }
    //     if (value?.billData?.id && value?.billData?.totalAmount > 0) {
    //       invalidFields.push(`${t("NDC_MESSAGE_PLEASE_PAY_DUES_OF_SEWERAGE_CONNECTION")} ${value?.connectionNo}`);
    //     }
    //   });
    // }

    // if (!propertyDetails?.propertyBillData?.billData?.id) {
    //       invalidFields.push(`${t("NDC_MESSAGE_PLEASE_CHECK_STATUS_OF_PROPERTY_TAX")} ${cpt?.id}`);
    //     }
    //     if (propertyDetails?.propertyBillData?.billData?.id && propertyDetails?.propertyBillData?.billData?.totalAmount > 0) {
    //       invalidFields.push(`${t("NDC_MESSAGE_PLEASE_PAY_DUES_OF_PROPERTY_TAX")} ${cpt?.id}`);
    //     }

    // Format Validations
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[6-9]\d{9}$/;

    if (propertyDetails?.firstName && !nameRegex.test(propertyDetails.firstName)) {
      invalidFields.push(t("NDC_MESSAGE_FIRST_NAME_ONLY_ALPHABETS_ALLOWED"));
    }

    if (propertyDetails?.lastName && !nameRegex.test(propertyDetails.lastName)) {
      invalidFields.push(t("NDC_MESSAGE_LAST_NAME_ONLY_ALPHABETS_ALLOWED"));
    }

    if (propertyDetails?.email && !emailRegex.test(propertyDetails.email)) {
      invalidFields.push(t("NDC_MESSAGE_EMAIL_INVALID_FORMAT"));
    }

    if (propertyDetails?.mobileNumber && !mobileRegex.test(propertyDetails.mobileNumber)) {
      invalidFields.push(t("NDC_MESSAGE_MOBILE_NUMBER_MUST_BE_A_VALID_TEN_DIGIT_INDIAN_NUMBER"));
    }

    const allErrors = [...missingFields, ...invalidFields];
    return allErrors;
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    // console.log("onFormValueChange data in AdministrativeDetails: ", data, "\n Bool: ", !_.isEqual(data, currentStepData));
    if (!_.isEqual(data, currentStepData)) {
      dispatch(updateNDCForm(config.key, data));
    }
  };

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

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
    </React.Fragment>
  );
};
