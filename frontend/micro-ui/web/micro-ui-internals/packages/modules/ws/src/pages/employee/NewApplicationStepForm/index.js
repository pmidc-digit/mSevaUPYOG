import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
//import { Toast } from "@mseva/digit-ui-react-components";
import cloneDeep from "lodash/cloneDeep";
import { Loader } from "@mseva/digit-ui-react-components";
//
import Stepper from "../../../../../../react-components/src/customComponents/Stepper";
import { newConfig as fullConfig } from "../../../config/wsCreateConfig";
import { resetWSApplicationForm, setWSNewApplicationFormStep } from "../../../redux/actions/newWSApplicationFormActions";
//import { createAndUpdateWS } from "../../../utils/apiCalls";
import { CardHeader, Toast } from "@mseva/digit-ui-react-components";
import { createPayloadOfWS, updatePayloadOfWS } from "../../../utils";

//Config for steps
const config = [
  {
    head: "WS_COMMON_CONNECTION_DETAILS",
    stepLabel: "WS_COMMON_CONNECTION_DETAILS", //"WS_CONNECTION_DETAILS_STEP_LABEL",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "WSConnectionDetailsStep",
    key: "connectionDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "WS_COMMON_BUTTON_NXT_STEP",
    },
  },
  {
    head: "WS_COMMON_DOCS",
    stepLabel: "WS_COMMON_DOCS", //"WS_DOCS_STEP_LABEL",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "WSDocumentsStep",
    key: "documents",
    withoutLabel: true,
    texts: {
      submitBarLabel: "WS_COMMON_BUTTON_NXT_STEP",
    },
  },
  {
    head: "WS_COMMON_ADDN_DETAILS",
    stepLabel: "WS_COMMON_ADDN_DETAILS", //"WS_ADDN_DETAILS_STEP_LABEL",
    stepNumber: 3,
    isStepEnabled: true,
    type: "component",
    component: "WSAdditionalDetailsStep",
    key: "additionalDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "WS_COMMON_BUTTON_SUBMIT",
    },
  },
  {
    head: "WS_COMMON_SUMMARY",
    stepLabel: "WS_COMMON_SUMMARY", //"WS_SUMMARY_STEP_LABEL",
    stepNumber: 4,
    isStepEnabled: false,
    type: "component",
    component: "WSSummaryStep",
    key: "summary",
    withoutLabel: true,
    texts: {
      submitBarLabel: "WS_COMMON_BUTTON_SUBMIT",
    },
  },
];

const newConfig = fullConfig.find((conf) => conf.hideInCitizen && conf.isCreate)?.body;
const updatedConfig = config.map((item) => {
  return {
    ...item,
    currStepConfig: newConfig.filter((newConfigItem) => newConfigItem.stepNumber === item.stepNumber && newConfigItem.isCreateConnection),
  };
});

const NewApplicationStepForm = () => {
  const dispatch = useDispatch();
  const formState = useSelector((state) => state.ws.newWSApplicationForm);
  const formData = formState.formData;
  const step = formState.step;

  const setStep = (updatedStepNumber) => {
    dispatch(setWSNewApplicationFormStep(updatedStepNumber));
  };

  //
  const { t } = useTranslation();
  const history = useHistory();
  const [isEnableLoader, setIsEnableLoader] = useState(false);
  const [appDetails, setAppDetails] = useState({});
  const [waterAndSewerageBoth, setWaterAndSewerageBoth] = useState(null);
  const [showToast, setShowToast] = useState(null);
  let tenantId = Digit.ULBService.getCurrentTenantId();
  tenantId ? tenantId : Digit.SessionStorage.get("CITIZEN.COMMON.HOME.CITY")?.code;
  const isLoading = false;
  const [propertyId, setPropertyId] = useState(new URLSearchParams(useLocation().search).get("propertyId"));
  const [sessionFormData, setSessionFormData, clearSessionFormData] = Digit.Hooks.useSessionStorage("PT_CREATE_EMP_WS_NEW_FORM", {});
  const { data: propertyDetails } = Digit.Hooks.pt.usePropertySearch(
    { filters: { propertyIds: propertyId }, tenantId: tenantId },
    { filters: { propertyIds: propertyId }, tenantId: tenantId, enabled: propertyId && propertyId !== "" ? true : false }
  );

  useEffect(() => {
    !propertyId && sessionFormData?.cpt?.details?.propertyId && setPropertyId(sessionFormData?.cpt?.details?.propertyId);
  }, [sessionFormData?.cpt]);

  useEffect(() => {
    setSessionFormData({ ...sessionFormData, cpt: { details: propertyDetails?.Properties?.[0] } });
  }, [propertyDetails]);

  const {
    isLoading: creatingWaterApplicationLoading,
    isError: createWaterApplicationError,
    data: createWaterResponse,
    error: createWaterError,
    mutate: waterMutation,
  } = Digit.Hooks.ws.useWaterCreateAPI("WATER");

  const {
    isLoading: updatingWaterApplicationLoading,
    isError: updateWaterApplicationError,
    data: updateWaterResponse,
    error: updateWaterError,
    mutate: waterUpdateMutation,
  } = Digit.Hooks.ws.useWSApplicationActions("WATER");

  const {
    isLoading: creatingSewerageApplicationLoading,
    isError: createSewerageApplicationError,
    data: createSewerageResponse,
    error: createSewerageError,
    mutate: sewerageMutation,
  } = Digit.Hooks.ws.useWaterCreateAPI("SEWERAGE");

  const {
    isLoading: updatingSewerageApplicationLoading,
    isError: updateSewerageApplicationError,
    data: updateSewerageResponse,
    error: updateSewerageError,
    mutate: sewerageUpdateMutation,
  } = Digit.Hooks.ws.useWSApplicationActions("SEWERAGE");

  if (isEnableLoader || isLoading) {
    return <Loader />;
  }

  // const handleSubmit = () => {
  //   let data = {};
  //   config.forEach((configItem) => {
  //     if (configItem.isStepEnabled) {
  //       data = { ...data, ...formData[configItem.key] };
  //     }
  //   });
  //   createAndUpdateWS(
  //     data,
  //     // propertyDetails,
  //     // waterMutation,
  //     // sewerageMutation,
  //     // waterUpdateMutation,
  //     // sewerageUpdateMutation,
  //     // clearSessionFormData,
  //     // history,
  //     // waterAndSewerageBoth, 
  //     // appDetails,
  //     // setIsEnableLoader,
  //     // setShowToast,
  //     // setAppDetails,
  //     // setWaterAndSewerageBoth,
  //     // closeToastOfError
  //   );
  // };

  const closeToastOfError = () => { setShowToast(null); };
  const closeToast = () => {
    setShowToast(null);
  };


  const createAndUpdateWS = async (
    // data,
    // propertyDetails,
    // waterMutation,
    // sewerageMutation,
    // waterUpdateMutation,
    // sewerageUpdateMutation,
    // clearSessionFormData,
    // history,
    // waterAndSewerageBoth,
    // appDetails,
    // setIsEnableLoader,
    // setShowToast,
    // setAppDetails,
    // setWaterAndSewerageBoth,
    // closeToastOfError
  ) => {
    let data = {};
    config.forEach((configItem) => {
      if (configItem.isStepEnabled) {
        data = { ...data, ...formData[configItem.key] };
      }
    });
    console.log("Data WS new application onSubmit:\n", data,"\n",propertyDetails);
    if (!data?.cpt?.id && !propertyDetails?.Properties?.[0]) {
      if (!data?.cpt?.details || !propertyDetails) {
        setShowToast({ key: "error", message: "ERR_INVALID_PROPERTY_ID" });
        return;
      }
    }
  
    const errors = sessionStorage.getItem("FORMSTATE_ERRORS");
    const formStateErros = typeof errors == "string" ? JSON.parse(errors) : {};
  
    if (
      Object.keys(formStateErros).length > 0 &&
      !(
        Object.keys(formStateErros).length == 1 &&
        formStateErros?.["ConnectionHolderDetails"]?.type &&
        Object.keys(formStateErros?.["ConnectionHolderDetails"]?.type)?.length == 1 &&
        formStateErros["ConnectionHolderDetails"] &&
        Object.values(formStateErros["ConnectionHolderDetails"].type).filter((ob) => ob.type === "required" && ob?.ref?.value !== "").length > 0
      )
    ) {
      setShowToast({ warning: true, message: "PLEASE_FILL_MANDATORY_DETAILS" });
      return;
    } else {
      if (!data?.cpt?.details) {
        data.cpt = {
          details: propertyDetails?.Properties?.[0],
        };
      }
      const allDetails = cloneDeep(data);
      const payload = await createPayloadOfWS(data);
      let waterAndSewerageLoader = false,
        waterLoader = false,
        sewerageLoader = false;
      if (payload?.water && payload?.sewerage) waterAndSewerageLoader = true;
      if (payload?.water && !payload?.sewerage) waterLoader = true;
      if (!payload?.water && payload?.sewerage) sewerageLoader = true;
      let waterConnection = { WaterConnection: payload, disconnectRequest: false, reconnectRequest: false };
      let sewerageConnection = { SewerageConnection: payload, disconnectRequest: false, reconnectRequest: false };
  
      if (waterAndSewerageLoader) {
        setWaterAndSewerageBoth(true);
        sessionStorage.setItem("setWaterAndSewerageBoth", JSON.stringify(true));
      } else {
        sessionStorage.setItem("setWaterAndSewerageBoth", JSON.stringify(false));
      }
  
      if (payload?.water && payload?.sewerage) {
        if (waterMutation && sewerageMutation) {
          setIsEnableLoader(true);
          await waterMutation(waterConnection, {
            onError: (error, variables) => {
              setIsEnableLoader(false);
              setShowToast({ key: "error", message: error?.response?.data?.Errors?.[0].message ? error?.response?.data?.Errors?.[0].message : error });
              setTimeout(closeToastOfError, 5000);
            },
            onSuccess: async (waterData, variables) => {
              let response = await updatePayloadOfWS(waterData?.WaterConnection?.[0], "WATER");
              let waterConnectionUpdate = { WaterConnection: response, disconnectRequest: false, reconnectRequest: false };
              waterUpdateMutation(waterConnectionUpdate, {
                onError: (error, variables) => {
                  setIsEnableLoader(false);
                  setShowToast({
                    key: "error",
                    message: error?.response?.data?.Errors?.[0].message ? error?.response?.data?.Errors?.[0].message : error,
                  });
                  setTimeout(closeToastOfError, 5000);
                },
                onSuccess: async (waterUpdateData, variables) => {
                  setAppDetails({ ...appDetails, waterConnection: waterUpdateData?.WaterConnection?.[0] });
                  await sewerageMutation(sewerageConnection, {
                    onError: (error, variables) => {
                      setIsEnableLoader(false);
                      setShowToast({
                        key: "error",
                        message: error?.response?.data?.Errors?.[0].message ? error?.response?.data?.Errors?.[0].message : error,
                      });
                      setTimeout(closeToastOfError, 5000);
                    },
                    onSuccess: async (sewerageData, variables) => {
                      let response = await updatePayloadOfWS(sewerageData?.SewerageConnections?.[0], "SEWERAGE");
                      let sewerageConnectionUpdate = { SewerageConnection: response, disconnectRequest: false, reconnectRequest: false };
                      await sewerageUpdateMutation(sewerageConnectionUpdate, {
                        onError: (error, variables) => {
                          setIsEnableLoader(false);
                          setShowToast({
                            key: "error",
                            message: error?.response?.data?.Errors?.[0].message ? error?.response?.data?.Errors?.[0].message : error,
                          });
                          setTimeout(closeToastOfError, 5000);
                        },
                        onSuccess: async (sewerageUpdateData, variables) => {
                          setAppDetails({ ...appDetails, sewerageConnection: sewerageUpdateData?.SewerageConnections?.[0] });
                          clearSessionFormData();
                          history.push(
                            `/digit-ui/employee/ws/ws-response?applicationNumber=${waterUpdateData?.WaterConnection?.[0]?.applicationNo}&applicationNumber1=${sewerageUpdateData?.SewerageConnections?.[0]?.applicationNo}`
                          );
                          dispatch(resetWSApplicationForm());
                          // window.location.href = `${window.location.origin}/digit-ui/employee/ws/ws-response?applicationNumber=${waterUpdateData?.WaterConnection?.[0]?.applicationNo}&applicationNumber1=${sewerageUpdateData?.SewerageConnections?.[0]?.applicationNo}`
                        },
                      });
                    },
                  });
                },
              });
            },
          });
        }
      } else if (payload?.water && !payload?.sewerage) {
        if (waterMutation) {
          setIsEnableLoader(true);
          await waterMutation(waterConnection, {
            onError: (error, variables) => {
              setIsEnableLoader(false);
              setShowToast({ key: "error", message: error?.response?.data?.Errors?.[0].message ? error?.response?.data?.Errors?.[0].message : error });
              setTimeout(closeToastOfError, 5000);
            },
            onSuccess: async (data, variables) => {
              let response = await updatePayloadOfWS(data?.WaterConnection?.[0], "WATER");
              let waterConnectionUpdate = { WaterConnection: response };
              waterUpdateMutation(waterConnectionUpdate, {
                onError: (error, variables) => {
                  setIsEnableLoader(false);
                  setShowToast({
                    key: "error",
                    message: error?.response?.data?.Errors?.[0].message ? error?.response?.data?.Errors?.[0].message : error,
                  });
                  setTimeout(closeToastOfError, 5000);
                },
                onSuccess: (data, variables) => {
                  setAppDetails({ ...appDetails, waterConnection: data?.WaterConnection?.[0] });
                  clearSessionFormData();
                  history.push(`/digit-ui/employee/ws/ws-response?applicationNumber=${data?.WaterConnection?.[0]?.applicationNo}`);
                  dispatch(resetWSApplicationForm());
                  // window.location.href = `${window.location.origin}/digit-ui/employee/ws/ws-response?applicationNumber=${data?.WaterConnection?.[0]?.applicationNo}`;
                },
              });
            },
          });
        }
      } else if (payload?.sewerage && !payload?.water) {
        if (sewerageMutation) {
          setIsEnableLoader(true);
          await sewerageMutation(sewerageConnection, {
            onError: (error, variables) => {
              setIsEnableLoader(false);
              setShowToast({ key: "error", message: error?.response?.data?.Errors?.[0].message ? error?.response?.data?.Errors?.[0].message : error });
              setTimeout(closeToastOfError, 5000);
            },
            onSuccess: async (data, variables) => {
              let response = await updatePayloadOfWS(data?.SewerageConnections?.[0], "SEWERAGE");
              let sewerageConnectionUpdate = { SewerageConnection: response };
              await sewerageUpdateMutation(sewerageConnectionUpdate, {
                onError: (error, variables) => {
                  setIsEnableLoader(false);
                  setShowToast({
                    key: "error",
                    message: error?.response?.data?.Errors?.[0].message ? error?.response?.data?.Errors?.[0].message : error,
                  });
                  setTimeout(closeToastOfError, 5000);
                },
                onSuccess: (data, variables) => {
                  setAppDetails({ ...appDetails, sewerageConnection: data?.SewerageConnections?.[0] });
                  clearSessionFormData();
                  history.push(`/digit-ui/employee/ws/ws-response?applicationNumber1=${data?.SewerageConnections?.[0]?.applicationNo}`);
                  dispatch(resetWSApplicationForm());
                  // window.location.href = `${window.location.origin}/digit-ui/employee/ws/ws-response?applicationNumber1=${data?.SewerageConnections?.[0]?.applicationNo}`;
                },
              });
            },
          });
        }
      }
    }
  };

  console.log("formState: ", formState);
  return (
    <div className="card">
      <CardHeader divider={true}>{t("WS_APPLICATION_NEW_CONNECTION_HEADER")}</CardHeader>
      <Stepper stepsList={updatedConfig} onSubmit={createAndUpdateWS} step={step} setStep={setStep} />
      {showToast && (
        <Toast
          isDleteBtn={"true"}
          label={t(showToast?.message)}
          onClose={closeToast}
          error={showToast?.key === "error" ? true : false}
          warning={showToast?.warning}
          isWarning={showToast?.isWarning}
        />
      )}
    </div>
  );
};

export default NewApplicationStepForm;
