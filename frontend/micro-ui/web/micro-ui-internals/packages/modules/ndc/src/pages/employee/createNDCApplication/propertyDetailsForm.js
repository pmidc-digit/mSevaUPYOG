import React, { useState, useEffect } from "react";
import { TextInput, Header, ActionBar, SubmitBar, Loader, InfoIcon, Toast } from "@mseva/digit-ui-react-components";
import { useForm, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

// Keep below values in localisation:
const SURVEY_CATEGORY = "Create Category";
const CATEGORY_CREATED = "Category created successfully";
const ERR_MESSAGE = "Something went wrong";

const PropertyDetailsForm = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [showToast, setShowToast] = useState(null);
  const methods = useForm({
    defaultValues: {
      categoryName: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  const onSubmit = async (data) => {
    console.log("data", data);
    return;
    setIsLoading(true);
    const details = {
      Categories: [
        {
          tenantId: tenantId,
          label: data.categoryName.trim(),
        },
      ],
    };

    try {
      const response = await Digit.Surveys.createCategory(details);
      if (response?.Categories?.length > 0) {
        setIsLoading(false);
        setShowToast({ isError: false, label: CATEGORY_CREATED });
        reset();
      } else {
        setIsLoading(false);
        setShowToast({ isError: true, label: response?.Errors?.[0]?.message || ERR_MESSAGE });
      }
    } catch (error) {
      console.log("Error in Digit.Surveys.createCategory:", error?.response);
      setIsLoading(false);
      setShowToast({ isError: true, label: error?.response?.data?.Errors?.[0]?.message || ERR_MESSAGE });
    }
  };

  useEffect(() => {
    console.log("errors", errors);
  }, [errors]);

  const closeToast = () => {
    setShowToast(null);
  };

  return (
    <div className="pageCard">
      <Header>NDC Form</Header>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="surveydetailsform-wrapper">
            <span className="surveyformfield">
              <label>
                Property Id<span style={{ color: "red" }}>*</span>
              </label>
              <TextInput
                name="propertyId"
                type="text"
                inputRef={register({
                  required: "This field is required",
                  maxLength: {
                    value: 500,
                    message: "Category length should be less than or equal to 500 characters",
                  },
                })}
              />
            </span>
            {errors.propertyId && <p style={{ color: "red" }}>{errors.propertyId.message}</p>}
          </div>
          <button type="submit">Submit</button>
        </form>
      </FormProvider>

      {showToast && <Toast error={showToast.isError} label={t(showToast.label)} onClose={closeToast} isDleteBtn={"true"} />}
      {isLoading && <Loader />}
    </div>
  );
};

export default PropertyDetailsForm;
