import React, { useState, useEffect } from "react";
import { TextInput, Header, ActionBar, SubmitBar, Loader, InfoIcon, Toast } from "@mseva/digit-ui-react-components";
import { useForm, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

// Keep below values in localisation:
const SURVEY_CATEGORY = "Create Category";
const CATEGORY_CREATED = "Category created successfully";
const ERR_MESSAGE = "Something went wrong";

const PropertyDetailsFormUser = () => {
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
  };

  useEffect(() => {
    console.log("errors", errors);
  }, [errors]);

  const closeToast = () => {
    setShowToast(null);
  };

  return (
    <div className="pageCard">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="surveydetailsform-wrapper">
            <span className="surveyformfield">
              <label>
                Property ID <span style={{ color: "red" }}>*</span>
              </label>
              <TextInput
                name="propertyID"
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
            {errors.propertyID && <p style={{ color: "red" }}>{errors.propertyID.message}</p>}
          </div>
          <div className="surveydetailsform-wrapper">
            <span className="surveyformfield">
              <label>
                Water Connection Number <span style={{ color: "red" }}>*</span>
              </label>
              <TextInput
                name="waterConnectionNumber"
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
            {errors.lastName && <p style={{ color: "red" }}>{errors.lastName.message}</p>}
          </div>
          <div className="surveydetailsform-wrapper">
            <span className="surveyformfield">
              <label>
                Sewage Connection Number <span style={{ color: "red" }}>*</span>
              </label>
              <TextInput
                name="email"
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
            {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}
          </div>
          <div className="surveydetailsform-wrapper">
            <span className="surveyformfield">
              <label>
                Property Type <span style={{ color: "red" }}>*</span>
              </label>
              <TextInput
                name="address"
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
            {errors.address && <p style={{ color: "red" }}>{errors.address.message}</p>}
          </div>
          {/* <button type="submit">Submit</button> */}
        </form>
      </FormProvider>

      {showToast && <Toast error={showToast.isError} label={t(showToast.label)} onClose={closeToast} isDleteBtn={"true"} />}
      {isLoading && <Loader />}
    </div>
  );
};

export default PropertyDetailsFormUser;
