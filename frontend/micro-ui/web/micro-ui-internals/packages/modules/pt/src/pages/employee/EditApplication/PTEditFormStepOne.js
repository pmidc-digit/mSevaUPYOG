import React,{useState} from "react";
import { useDispatch, useSelector } from "react-redux";
//
import { FormComposer } from "../../../../../../react-components/src/hoc/FormComposer";
import { UPDATE_PtNewApplication } from "../../../redux/actions/PTNewApplicationActions";

const PTEditFormStepOne = ({ config, onGoNext, onBackClick, t }) => {
  function goNext(data) {
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_PtNewApplication(config.key, data));
      
  };

  const currentStepData = useSelector(function (state) {
    return state.pt.PTNewApplicationForm.formData && state.pt.PTNewApplicationForm.formData[config.key] 
        ? state.pt.PTNewApplicationForm.formData[config.key] 
        : {};
});
const reduxStepData = useSelector((state) => state.pt.PTNewApplicationForm.formData.LocationDetails);
const [localStepData, setLocalStepData] = useState(reduxStepData);
  const dispatch = useDispatch();


  return (
    <React.Fragment>
      <FormComposer
        defaultValues={localStepData}
        //heading={t("")}
        config={config.currStepConfig}
        onSubmit={goNext}
        onFormValueChange={onFormValueChange}
        //isDisabled={!canSubmit}
        label={t(`${config.texts.submitBarLabel}`)}
        currentStep={config.currStepNumber}
        onBackClick={onGoBack}
      />
    </React.Fragment>
  );
};
}
export default PTEditFormStepOne;
