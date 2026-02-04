import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_LayoutNewApplication_FORM } from "../../../redux/actions/LayoutNewApplicationActions";
import _ from "lodash";
import { UPDATE_OBPS_FORM } from "../../../redux/actions/OBPSActions";

const LayoutStepFormThree = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const stateId = Digit.ULBService.getStateId();
  const { isLoading, data } = Digit.Hooks.pt.usePropertyMDMS(stateId,  "BPA", ["LayoutDocuments"]);

  const currentStepData = useSelector((state) =>
    state.obps.LayoutNewApplicationFormReducer.formData &&
    state.obps.LayoutNewApplicationFormReducer.formData[config?.key]
      ? state.obps.LayoutNewApplicationFormReducer.formData[config?.key]
      : {},
  )

  const coordinates = useSelector((state) => state?.obps?.LayoutNewApplicationFormReducer?.coordinates || {})


  console.log("coordinates from redux", coordinates);

  function goNext(finaldata) {
    const missingFields = validation(finaldata);

    if (missingFields.length > 0) {
      setError(
        `${t("NOC_PLEASE_ATTACH_LABEL")} ${t(
          missingFields[0].replace(".", "_").toUpperCase()
        )}`
      );
      setShowToast(true);
      return;
    }

    if (
      !coordinates?.Latitude1?.trim() ||
      !coordinates?.Latitude2?.trim() ||
      !coordinates?.Longitude1?.trim() ||
      !coordinates?.Longitude2?.trim()
    ) {
      setError(`${t("NOC_PLEASE_ATTACH_GEO_TAGGED_PHOTOS_LABEL")}`);
      setShowToast(true);
      return;
    }

    onGoNext();
  }

  const completeData=useSelector((state)=>state?.obps?.LayoutNewApplicationFormReducer?.formData) || {};


  // function validation(documents) {
  //   if (!isLoading) {
  //     const isVacant =
  //       completeData?.siteDetails?.buildingStatus?.code === "VACANT";

  //     const layoutDocumentsType = isVacant
  //       ? data?.Layout?.Documents?.filter(
  //           (doc) => doc.code !== "OWNER.BUILDINGDRAWING"
  //         )
  //       : data?.Layout?.Documents;

  //     const documentsData = documents?.documents?.documents || [];

  //     const requiredDocs = (layoutDocumentsType || [])
  //       .filter((doc) => doc.required)
  //       .map((doc) => doc.code);

  //     const uploadedDocs = documentsData.map((doc) => doc.documentType);

  //     const missingDocs = requiredDocs.filter(
  //       (reqDoc) => !uploadedDocs.includes(reqDoc)
  //     );

  //     return missingDocs;
  //   }
  //   return [];
  // }

   function validation(documents) {
    if (!isLoading) {
      const isVacant = completeData?.siteDetails?.buildingStatus?.code === "VACANT" || false

      const layoutDocumentsType = isVacant
        ? data?.Layout?.Documents?.filter((doc) => doc.code !== "OWNER.BUILDINGDRAWING")
        : data?.Layout?.Documents

      const documentsData = documents?.documents?.documents || []

      const requiredDocs = (layoutDocumentsType || []).filter((doc) => doc.required).map((doc) => doc.code)

      const uploadedDocs = documentsData.map((doc) => doc.documentType)

      const missingDocs = requiredDocs.filter((reqDoc) => !uploadedDocs.includes(reqDoc))

      return missingDocs
    }
    return []
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    if (!_.isEqual(data, currentStepData)) {
       dispatch(UPDATE_LayoutNewApplication_FORM(config.key, data))
    }
  };

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  return (
    <React.Fragment>
      {!isLoading && config?.currStepConfig ? (
        <FormComposer
          defaultValues={currentStepData}
          config={config.currStepConfig}
          onSubmit={goNext}
          onFormValueChange={onFormValueChange}
          label={t(`${config.texts.submitBarLabel}`)}
          currentStep={config.currStepNumber}
          onBackClick={onGoBack}
        />
      ) : (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>Loading documents...</p>
        </div>
      )}

      {showToast && (
        <Toast
          isDleteBtn={true}
          error={true}
          label={error}
          onClose={closeToast}
        />
      )}
    </React.Fragment>
  );
};

export default LayoutStepFormThree;
