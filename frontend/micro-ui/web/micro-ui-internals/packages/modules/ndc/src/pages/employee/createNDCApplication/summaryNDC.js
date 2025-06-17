import React, { useState, useEffect } from "react";
import { ActionBar, SubmitBar, Toast, UploadFile } from "@mseva/digit-ui-react-components";
import { useForm, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Loader } from "../../../utils/Loader";
import { updateNDCForm } from "../../../redux/actions/NDCFormActions";

const summaryNDC = ({ onBackClick }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [error, setError] = useState(null);

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const cityDetails = Digit.ULBService.getCurrentUlb();
  const formStateValues = useSelector((state) => state.ndc.NDCForm);

  const methods = useForm({
    defaultValues: {
      propertyType: "",
      propertyUsageType: "",
      propertyLocationType: "",
      numberOfFloors: "",
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  const closeToast = () => setShowToast(null);

  const onSubmit = async (data) => {
    console.log(" formStateValues:", formStateValues);
  };

  return (
    <div className="pageCard">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <h1>Summary Page</h1>
          <ActionBar>
            <SubmitBar label="Back" onSubmit={() => onBackClick()} />
            <SubmitBar style={{ marginLeft: "20px" }} label="Submit" submit="submit" />
          </ActionBar>
        </form>
        {isLoading && <Loader />}
      </FormProvider>

      {showToast && <Toast error={showToast.isError} label={t(showToast.label)} onClose={closeToast} isDleteBtn={"true"} />}

      {error && <Toast error={true} label={error} onClose={() => setError(null)} />}
    </div>
  );
};

export default summaryNDC;
