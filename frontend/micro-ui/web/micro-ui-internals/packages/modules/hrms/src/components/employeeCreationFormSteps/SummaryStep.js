import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { FormComposer, Toast, Loader } from "@mseva/digit-ui-react-components";
import { onSubmit } from "../../utils/onSubmitCreateEmployee";

const SummaryStep = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(null);
  
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const formData = useSelector((state) => state.hrms.employeeForm.formData);

  useEffect(()=>{
  },[formData]);

  // Auto-close toast
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const goNext = async () => {

    setIsLoading(true);

    try {
      let data = {};
      ["employeeDetails", "administrativeDetails"].forEach((key) => {
        if (formData[key]) {
          data = { ...data, ...formData[key] };
        }
      });
      
      // Transform objects to codes for API submission
      // Summary shows the NAME but API needs the CODE
      if (data.Jurisdictions) {
        data.Jurisdictions = data.Jurisdictions.map(juris => ({
          ...juris,
          boundary: typeof juris.boundary === 'string' ? juris.boundary : (juris.boundary?.code || juris.boundary),
          boundaryType: typeof juris.boundaryType === 'string' ? juris.boundaryType : (juris.boundaryType?.code || juris.boundaryType),
        }));
      }
      
      if (data.Assignments) {
        data.Assignments = data.Assignments.map(assign => ({
          ...assign,
          department: typeof assign.department === 'string' ? assign.department : (assign.department?.code || assign.department),
          designation: typeof assign.designation === 'string' ? assign.designation : (assign.designation?.code || assign.designation),
          reportingTo: typeof assign.reportingTo === 'string' ? assign.reportingTo : (assign.reportingTo?.code || assign.reportingTo),
        }));
      }
      
      
      await onSubmit(data, tenantId, setShowToast, history);
      
    } catch (error) {
      setShowToast({ 
        key: true, 
        label: error.message || "HR_EMPLOYEE_CREATION_FAILED" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onGoBack = () => {
    onBackClick(config.key, formData);
  };

  return (
    <React.Fragment>
      <FormComposer
        defaultValues={formData}
        config={config.currStepConfig}
        onSubmit={goNext}
        label={t(`${config.texts.submitBarLabel}`)}
        currentStep={config.currStepNumber}
        onBackClick={onGoBack}
      />
      {isLoading && <Loader page={true} />}
      {showToast && (
        <Toast
          error={showToast.key === true}
          label={t(showToast.label)}
          onClose={() => setShowToast(null)}
          isDleteBtn={true}
        />
      )}
    </React.Fragment>
  );
};

export default SummaryStep;
