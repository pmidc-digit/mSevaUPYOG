import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import { UPDATE_NOCNewApplication_FORM } from "../../redux/action/NOCNewApplicationActions";
import { useTranslation } from "react-i18next";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import FireNOCPropertyLocationDetails from "../FireNOCPropertyLocationDetails";
import FireNOCPropertyDetails from "../FireNOCPropertyDetails";

const emptyBuilding = {
  buildingName: "",
  buildingUsageType: null,
  buildingUsageSubType: null,
  noOfFloors: null,
  noOfBasements: null,
  groundFloorBuiltupArea: "",
  heightOfBuilding: "",
  landArea: "",
  totalCoveredArea: "",
  parkingArea: "",
  leftSurrounding: "",
  rightSurrounding: "",
  frontSurrounding: "",
  backSurrounding: "",
};

const NewNOCStepFormTwo = ({ config, onBackClick, onGoNext }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);

  const currentStepData = useSelector((state) => state.noc.NOCNewApplicationFormReducer.formData?.siteDetails || {});

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    getValues,
    trigger,
    reset,
  } = useForm({
    defaultValues: {
      areaType: currentStepData?.areaType || null,
      districtName: currentStepData?.districtName || null,
      cityName: currentStepData?.cityName || null,
      villageName: currentStepData?.villageName || "",
      fireStationId: currentStepData?.fireStationId || "",
      propertyId: currentStepData?.propertyId || "",
      plotSurveyNo: currentStepData?.plotSurveyNo || "",
      streetName: currentStepData?.streetName || "",
      landmarkName: currentStepData?.landmarkName || "",
      mohalla: currentStepData?.mohalla || null,
      pincode: currentStepData?.pincode || "",
      geoLocation: currentStepData?.geoLocation || null,
      noOfBuildings: currentStepData?.noOfBuildings || "SINGLE",
      buildings: currentStepData?.buildings || [{ ...emptyBuilding }],
    },
  });

  // Hydrate form from Redux on mount
  useEffect(() => {
    if (currentStepData && Object.keys(currentStepData).length > 0) {
      Object.entries(currentStepData).forEach(([key, value]) => {
        if (key !== "buildings") setValue(key, value);
      });
    }
  }, []);

  const handleBack = () => {
    dispatch(UPDATE_NOCNewApplication_FORM(config.key, getValues()));
    onBackClick();
  };

  const onSubmit = (data) => {
    dispatch(UPDATE_NOCNewApplication_FORM(config.key, data));
    onGoNext();
  };

  const closeToast = () => setShowToast(null);

  const commonProps = { Controller, control, setValue, errors, trigger, watch, useFieldArray, getValues, reset, config };

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="employeeCard">
          <FireNOCPropertyLocationDetails t={t} currentStepData={currentStepData} {...commonProps} />
        </div>
        <FireNOCPropertyDetails t={t} currentStepData={currentStepData} {...commonProps} />
        <ActionBar>
          <SubmitBar className="submit-bar-back" label="Back" onSubmit={handleBack} />
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
      </form>
      {showToast && <Toast isDleteBtn={true} error={showToast?.error} label={t(showToast?.message)} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default NewNOCStepFormTwo;
