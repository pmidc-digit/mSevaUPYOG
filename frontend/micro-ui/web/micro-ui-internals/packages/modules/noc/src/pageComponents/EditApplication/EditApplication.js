import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation, useParams } from "react-router-dom";

import Stepper from "../../../../../react-components/src/customComponents/Stepper"
import { stepperConfig } from "../../config/Create/stepperConfig";
import { SET_NOCNewApplication_STEP, RESET_NOC_NEW_APPLICATION_FORM, 
  UPDATE_NOCNewApplication_FORM, UPDATE_NOCNewApplication_CoOrdinates } from "../../redux/action/NOCNewApplicationActions";
import { CardHeader, Toast, Loader } from "@mseva/digit-ui-react-components";

//Config for steps
const createEmployeeConfig = [
  {
    head: "APPLICATION DETAILS",
    stepLabel: "NOC_APPLICATION_DETAILS",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "NewNOCStepFormOne",
    key: "applicationDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "SITE DETAILS",
    stepLabel: "NOC_SITE_DETAILS",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "NewNOCStepFormTwo",
    key: "siteDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "DOCUMENT DETAILS",
    stepLabel: "ES_TITILE_DOCUMENT_DETAILS",
    stepNumber: 3,
    isStepEnabled: true,
    type: "component",
    component: "NewNOCStepFormThree",
    key: "documents",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "SUMMARY DETAILS",
    stepLabel: "ES_TITILE_SUMMARY_DETAILS",
    stepNumber: 4,
    isStepEnabled: true,
    type: "component",
    component: "NewNOCStepFormFour",
    key: "summary",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_SUBMIT",
    },
  },

];

const updatedCreateEmployeeconfig = createEmployeeConfig.map((item) => {
  return { ...item, currStepConfig: stepperConfig.filter((newConfigItem) => newConfigItem.stepNumber === item.stepNumber) };
});

const EditApplication = () => {
  const { id } = useParams();
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const formState = useSelector((state) => state.noc.NOCNewApplicationFormReducer);
  const formData = formState.formData;
  const step = formState.step;

  //Makesure to pass tenantId correctly
  const tenantId = Digit.ULBService.getCurrentTenantId();
  //const tenantId = window.localStorage.getItem("CITIZEN.CITY");
  console.log("tenantId here", tenantId);

  const { isLoading, data: applicationDetails } = Digit.Hooks.noc.useNOCSearchApplication({ applicationNo: id }, tenantId);
  console.log("applicationDetails here==>", applicationDetails);
  
  const nocObject = applicationDetails?.Noc?.[0] || {};
  const applicantDetails = nocObject?.nocDetails?.additionalDetails?.applicationDetails || {};
  const siteDetails = nocObject?.nocDetails?.additionalDetails?.siteDetails || {};
  const documents = nocObject?.documents || [];
  const coordinates= nocObject?.nocDetails?.additionalDetails?.coordinates || {};
  // console.log("coordinates here in edit", coordinates);


  const setStep = (updatedStepNumber) => {
    dispatch(SET_NOCNewApplication_STEP(updatedStepNumber));
  };

  useEffect(() => {
   // dispatch(RESET_NOC_NEW_APPLICATION_FORM());
    if(!isLoading && nocObject?.nocDetails){
        
     const formattedDocuments = {
      documents: {
        documents: documents?.map((doc) => ({
          documentType: doc?.documentType || "",
          uuid: doc?.uuid || "",
          documentUid: doc?.documentUid || "",
          documentAttachment: doc?.documentAttachment || "",
          filestoreId: doc?.uuid || ""
        })),
       },
      };

      // Object.keys(coordinates).forEach((key)=>{
      //   dispatch(UPDATE_NOCNewApplication_CoOrdinates({key, value: coordinates[key]}));
      // });
      //dispatch(UPDATE_NOCNewApplication_CoOrdinates("Latitude1",location.latitude));

        dispatch(UPDATE_NOCNewApplication_FORM("applicationDetails", applicantDetails));
        dispatch(UPDATE_NOCNewApplication_FORM("siteDetails", siteDetails));
        dispatch(UPDATE_NOCNewApplication_FORM("documents", formattedDocuments));
        dispatch(UPDATE_NOCNewApplication_FORM("apiData", applicationDetails));
        dispatch(UPDATE_NOCNewApplication_CoOrdinates("coordinates",{...coordinates}));
    }
  }, [isLoading, applicationDetails, coordinates]);

  // console.log("formData",formData);

  const handleSubmit = (dataGet) => {
    
  };

  
   if (isLoading || !formData.applicationDetails) {
    return <div><Loader/></div>; // or a spinner component
   }


  return (
    <div className="pageCard">
      <CardHeader styles={{ fontSize: "28px", fontWeight: "400", color: "#1C1D1F" }} divider={true}>
        {t("NOC_REGISTRATION_APPLICATION")}
      </CardHeader>
      <Stepper stepsList={updatedCreateEmployeeconfig} onSubmit={handleSubmit} step={step} setStep={setStep} />
      {showToast && (
        <Toast
          error={showToast.key}
          label={t(showToast.label)}
          onClose={() => {
            setShowToast(null);
          }}
          isDleteBtn={"true"}
        />
      )}
    </div>
  );
};

export default EditApplication;
