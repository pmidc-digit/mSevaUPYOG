import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast, ActionBar, SubmitBar, Loader } from "@mseva/digit-ui-react-components";
import { UPDATE_LayoutNewApplication_FORM } from "../../../redux/actions/LayoutNewApplicationActions";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { useParams } from "react-router-dom";
import { convertToDDMMYYYY } from "../../../utils";

const LayoutStepFormTwo = ({ config, onBackClick, onGoNext }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const isEditApplication = Boolean(id);
  console.log("LOOK IN STEER",isEditApplication);
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const [error, setError] = useState("");
  console.log("LOOK APPLICATION NUMBER +++++>", isEditApplication);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    trigger,
    watch,
  } = useForm({
    defaultValues: {
      floorArea: [{ value: "" }],
      vasikaNumber: "",
      vasikaDate: "",
    },
  });

  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" };

  const currentStepData = useSelector(function (state) {
    return state.obps.LayoutNewApplicationFormReducer.formData;
  });

  console.log(currentStepData, "FFFFFFFFFFF");

  const commonProps = { Controller, control, setValue, errors, errorStyle, useFieldArray, watch };

  let tenantId;

  if (window.location.href.includes("citizen")) tenantId = window.localStorage.getItem("CITIZEN.CITY");
  else {
    tenantId = window.localStorage.getItem("Employee.tenant-id");
  }

  // Zone mapping logic (same as CLU)
  const stateId = Digit.ULBService.getStateId();
  const { data: zoneList, isLoading: isZoneListLoading } = Digit.Hooks.useCustomMDMS(stateId, "tenant", [{name:"zoneMaster",filter: `$.[?(@.tanentId == '${tenantId}')]`}]);
  const zoneOptions = zoneList?.tenant?.zoneMaster?.[0]?.zones || [];

  const siteDetails = currentStepData?.siteDetails;
  
  // Map zone object to match zoneOptions format
  useEffect(() => {
    if (zoneOptions?.length > 0 && siteDetails?.zone) {
      const zoneName = siteDetails?.zone?.name || siteDetails?.zone;
      const matchedZone = zoneOptions?.find((loc) => loc.name === zoneName);

      if (matchedZone) {
        setValue("zone", matchedZone);
      }
    }
  }, [zoneOptions, siteDetails?.zone, setValue]);

  const onSubmit = (data) => {
    trigger()

    // Validation for Jamabandi Area Must Be Equal To Total Plot Area (A)
    const isEqual = parseFloat(data?.specificationPlotArea) === parseFloat(data?.areaLeftForRoadWidening) || false

    if (!isEqual) {
      setShowToast({ key: "true", error: true, message: "Net Plot Area As Per Jamabandi Must Be Equal To Total Area in sq mt (A)" })
      return
    }

    // Save data in redux
    dispatch(UPDATE_LayoutNewApplication_FORM(config.key, data))

    // If create api is already called then move to next step
    if (isEditApplication || currentStepData?.apiData?.Layout?.applicationNo) {
      onGoNext()
    } else {
      // Call Create API and move to next Page
      callCreateAPI({ ...currentStepData, siteDetails: { ...data } })
    }
  }

  const callCreateAPI = async (formData) => {
    const userInfo = Digit.UserService.getUser()?.info || {};

    console.log("  Form data for CREATE API:", formData);

    const transformedSiteDetails = {
      ...formData?.siteDetails,
      ulbName: formData?.siteDetails?.ulbName?.name || formData?.siteDetails?.ulbName || "",
      roadType: formData?.siteDetails?.roadType || "",  // Keep full object
      buildingStatus: formData?.siteDetails?.buildingStatus?.name || formData?.siteDetails?.buildingStatus || "",  // Extract name
      buildingCategory: formData?.siteDetails?.buildingCategory || "",  // Keep full object
      schemeType: formData?.siteDetails?.schemeType || "",  // Keep full object
      layoutAreaType: formData?.siteDetails?.layoutAreaType || "",  // Keep full object
      cluIsApproved: formData?.siteDetails?.cluIsApproved || { code: "NO", i18nKey: "NO" },  // Keep full object
      isBasementAreaAvailable: formData?.siteDetails?.isBasementAreaAvailable?.code || formData?.siteDetails?.isBasementAreaAvailable || "",
      district: formData?.siteDetails?.district?.name || formData?.siteDetails?.district || "",
      zone: formData?.siteDetails?.zone?.name || formData?.siteDetails?.zone || "",
      specificationBuildingCategory: formData?.siteDetails?.specificationBuildingCategory?.name || "",
      specificationNocType: formData?.siteDetails?.specificationNocType?.name || "",
      specificationRestrictedArea: formData?.siteDetails?.specificationRestrictedArea?.code || "",
      specificationIsSiteUnderMasterPlan: formData?.siteDetails?.specificationIsSiteUnderMasterPlan?.code || "",
      // CLU Fields
      isCluRequired: formData?.siteDetails?.isCluRequired?.code || formData?.siteDetails?.isCluRequired || "",
      cluType: formData?.siteDetails?.cluType?.code || formData?.siteDetails?.cluType || "",
      cluNumber: formData?.siteDetails?.cluNumber || "",
      cluNumberOffline: formData?.siteDetails?.cluNumberOffline || "",
      cluApprovalDate: formData?.siteDetails?.cluApprovalDate || "",
      cluDocumentUpload: formData?.siteDetails?.cluDocumentUpload || "",
      applicationAppliedUnder: formData?.siteDetails?.applicationAppliedUnder?.code || formData?.siteDetails?.applicationAppliedUnder || "",
      nonSchemeType: formData?.siteDetails?.nonSchemeType || "",
      approvedColonyName: formData?.siteDetails?.approvedColonyName || "",
      // Exclude vasikaNumber and vasikaDate from here - they go at top level
      vasikaNumber: undefined,
      vasikaDate: undefined,
    };

    // Build applicants array: Primary applicant from form fields + additional applicants
    const applicants = [];
    
    // First applicant: from primary applicant form fields (top section of LayoutApplicantDetails)
    applicants.push({
      mobileNumber: formData?.applicationDetails?.applicantMobileNumber || userInfo?.mobileNumber || "",
      name: formData?.applicationDetails?.applicantOwnerOrFirmName || userInfo?.name || "",
      emailId: formData?.applicationDetails?.applicantEmailId || userInfo?.emailId || "",
      userName: formData?.applicationDetails?.applicantMobileNumber || userInfo?.userName || userInfo?.mobileNumber || "",
      gender: formData?.applicationDetails?.applicantGender?.code || formData?.applicationDetails?.applicantGender || null,
      dob: formData?.applicationDetails?.applicantDateOfBirth ? Digit.Utils.pt.convertDateToEpoch(formData?.applicationDetails?.applicantDateOfBirth) : null,
      fatherOrHusbandName: formData?.applicationDetails?.applicantFatherHusbandName || "",
      permanentAddress: formData?.applicationDetails?.applicantAddress || "",
      additionalDetails: {
        documentFile: formData?.documentUploadedFiles?.[0]?.fileStoreId || formData?.documentUploadedFiles?.[0] || null,
        ownerPhoto: formData?.photoUploadedFiles?.[0]?.fileStoreId || formData?.photoUploadedFiles?.[0] || null,
      },
    });

    // Additional applicants: from applicants array (starting from index 1, skipping the first empty one)
    if (formData?.applicants?.length > 1) {
      formData.applicants.slice(1).forEach((applicant, index) => {
        applicants.push({
          mobileNumber: applicant?.mobileNumber || "",
          name: applicant?.name || "",
          emailId: applicant?.emailId || "",
          userName: applicant?.mobileNumber || userInfo?.userName || userInfo?.mobileNumber || "",
          gender: applicant?.gender?.code || applicant?.gender || null,
          dob: applicant?.dob ? Digit.Utils.pt.convertDateToEpoch(applicant?.dob) : null,
          fatherOrHusbandName: applicant?.fatherOrHusbandName || "",
          permanentAddress: applicant?.address || "",
          additionalDetails: {
            documentFile: formData?.documentUploadedFiles?.[index + 1]?.fileStoreId || formData?.documentUploadedFiles?.[index + 1] || null,
            ownerPhoto: formData?.photoUploadedFiles?.[index + 1]?.fileStoreId || formData?.photoUploadedFiles?.[index + 1] || null,
          },
        });
      });
    }

    // Build transformedApplicationDetails (owners NOT here - only at top level)
    const transformedApplicationDetails = {
      ...formData?.applicationDetails,
      applicantGender: formData?.applicationDetails?.applicantGender,  // Keep full object
    };

    const payload = {
      Layout: {
        vasikaDate: formData?.siteDetails?.vasikaDate ? convertToDDMMYYYY(formData?.siteDetails?.vasikaDate) : "",
        vasikaNumber: formData?.siteDetails?.vasikaNumber || "",
        applicationType: "NEW",
        documents: [],
        layoutType: "LAYOUT",
        status: "ACTIVE",
        tenantId: tenantId,
        workflow: {
          action: "INITIATE",
        },
        layoutDetails: {
          additionalDetails: {
            applicationDetails: transformedApplicationDetails,
            siteDetails: transformedSiteDetails,
          },
          tenantId: tenantId,
        },
        owners: applicants,  // ← Top-level owners array for backend
      },
    };

    console.log("  Final CREATE payload:", payload);

    try {
      const response = await Digit.OBPSService.LayoutCreate(payload, tenantId);

      console.log("  CREATE API Response:", response);
      console.log("  Response Layout:", response?.Layout);
      console.log("  Response Status:", response?.ResponseInfo?.status);

      if (response?.ResponseInfo?.status === "successful") {
        console.log("  Success: create api executed successfully!");
        
        // Restructure: Convert Layout array to object
        const restructuredResponse = {
          ...response,
          Layout: response?.Layout?.[0] || response?.Layout, // Get first element if array
        };
        
        console.log("  Restructured response - Layout is now:", restructuredResponse?.Layout);
        console.log("  Layout applicationNo:", restructuredResponse?.Layout?.applicationNo);
        console.log("  Full restructured response:", restructuredResponse);
        
        // Save API response to Redux
        dispatch(UPDATE_LayoutNewApplication_FORM("apiData", restructuredResponse));
        console.log("  Dispatched to Redux, calling onGoNext()");
        onGoNext();
      } else {
        console.error("  Error: create api not executed properly!", response);
        setShowToast({ key: "true", error: true, message: "COMMON_SOMETHING_WENT_WRONG_LABEL" });
      }
    } catch (error) {
      console.error("  CREATE API Error:", error);
      setShowToast({ key: "true", error: true, message: "COMMON_SOME_ERROR_OCCURRED_LABEL" });
    }
  };

  function goNext(data) {
    dispatch(UPDATE_LayoutNewApplication_FORM(config.key, data));
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const closeToast = () => {
    setShowToast(null);
  };

  const LayoutLocalityInfo = Digit?.ComponentRegistryService?.getComponent("LayoutLocalityInfo");
  const LayoutSiteDetails = Digit?.ComponentRegistryService?.getComponent("LayoutSiteDetails");
  const LayoutSpecificationDetails = Digit?.ComponentRegistryService?.getComponent("LayoutSpecificationDetails");

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="employeeCard">
          {LayoutLocalityInfo && <LayoutLocalityInfo onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />}
          {LayoutSiteDetails && <LayoutSiteDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />}
          {LayoutSpecificationDetails && <LayoutSpecificationDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />}
          {LayoutCLUDetails && <LayoutCLUDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />}
        </div>
        <ActionBar>
          <SubmitBar className="go-back-footer-button" label="Back" onSubmit={onGoBack} />
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
      </form>

      {showToast && <Toast isDleteBtn={true} error={showToast?.error} warning={showToast?.warning} label={t(showToast?.message)} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default LayoutStepFormTwo;
