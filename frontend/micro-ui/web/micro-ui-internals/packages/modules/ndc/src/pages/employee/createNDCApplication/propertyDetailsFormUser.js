import React, { useState, useEffect } from "react";
import { TextInput, Header, ActionBar, SubmitBar, Loader, InfoIcon, Toast } from "@mseva/digit-ui-react-components";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

// Keep below values in localisation:
const SURVEY_CATEGORY = "Create Category";
const CATEGORY_CREATED = "Category created successfully";
const ERR_MESSAGE = "Something went wrong";

const PropertyDetailsFormUser = ({ onBackClick }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [showToast, setShowToast] = useState(null);

  const methods = useForm({
    defaultValues: {
      propertyID: "",
      waterConnectionNumbers: [{ value: "" }],
      sewageConnectionNumbers: [{ value: "" }],
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

  const { fields: waterFields, append: addWater, remove: removeWater } = useFieldArray({
    control,
    name: "waterConnectionNumbers",
  });

  const { fields: sewageFields, append: addSewage, remove: removeSewage } = useFieldArray({
    control,
    name: "sewageConnectionNumbers",
  });

  const onSubmit = async (data) => {
    console.log("Submitted Data:", data);
  };

  useEffect(() => {
    console.log("errors", errors);
  }, [errors]);

  const closeToast = () => {
    setShowToast(null);
  };

  return (
    <div className="card">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="surveydetailsform-wrapper">
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

            {errors.propertyID && <p style={{ color: "red" }}>{errors.propertyID.message}</p>}
          </div>
          <div className="surveydetailsform-wrapper">
            <label>
              Water Connection Number <span style={{ color: "red" }}>*</span>
            </label>
            {waterFields.map((field, index) => (
              <div key={field.id} className="dynamic-field" style={{ display: "flex", gap: "10px" }}>
                <TextInput {...register(`waterConnectionNumbers.${index}.value`, { required: "This field is required" })} />
                {index > 0 && (
                  <button type="button" onClick={() => removeWater(index)}>
                    ❌
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addWater({ value: "" })}>
              ➕ Add
            </button>
          </div>
          <div className="surveydetailsform-wrapper">
            <label>
              Sewage Connection Number <span style={{ color: "red" }}>*</span>
            </label>
            {sewageFields.map((field, index) => (
              <div key={field.id} className="dynamic-field" style={{ display: "flex", gap: "10px" }}>
                <TextInput {...register(`sewageConnectionNumbers.${index}.value`, { required: "This field is required" })} />
                {index > 0 && (
                  <button type="button" onClick={() => removeSewage(index)}>
                    ❌
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addSewage({ value: "" })}>
              ➕ Add
            </button>
          </div>
          <div className="surveydetailsform-wrapper">
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
            {errors.propertyType && <p style={{ color: "red" }}>{errors.propertyType.message}</p>}
          </div>
          <div className="surveydetailsform-wrapper">
            <label>
              Property Usage Type <span style={{ color: "red" }}>*</span>
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
            {errors.propertyUsageType && <p style={{ color: "red" }}>{errors.propertyUsageType.message}</p>}
          </div>
          <div className="surveydetailsform-wrapper">
            <label>
              Property Location Type <span style={{ color: "red" }}>*</span>
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
            {errors.propertyLocationType && <p style={{ color: "red" }}>{errors.propertyLocationType.message}</p>}
          </div>
          <div className="surveydetailsform-wrapper">
            <label>
              No of Floors <span style={{ color: "red" }}>*</span>
            </label>
            <TextInput
              name="numberOfFloors"
              type="text"
              inputRef={register({
                required: "This field is required",
                maxLength: {
                  value: 500,
                  message: "Category length should be less than or equal to 500 characters",
                },
              })}
            />
            {errors.numberOfFloors && <p style={{ color: "red" }}>{errors.numberOfFloors.message}</p>}
          </div>
          <div>Upload Files</div>
          <div className="surveydetailsform-wrapper">
            <label>
              Copy of Property Registry <span style={{ color: "red" }}>*</span>
            </label>
            <input
              name="numberOfFloors"
              type="file"
              inputRef={register({
                required: "This field is required",
                maxLength: {
                  value: 500,
                  message: "Category length should be less than or equal to 500 characters",
                },
              })}
            />
            {errors.numberOfFloors && <p style={{ color: "red" }}>{errors.numberOfFloors.message}</p>}
          </div>
          <div className="surveydetailsform-wrapper">
            <label>
              Approved Building Plan <span style={{ color: "red" }}>*</span>
            </label>
            <input
              name="numberOfFloors"
              type="file"
              inputRef={register({
                required: "This field is required",
                maxLength: {
                  value: 500,
                  message: "Category length should be less than or equal to 500 characters",
                },
              })}
            />
            {errors.numberOfFloors && <p style={{ color: "red" }}>{errors.numberOfFloors.message}</p>}
          </div>
          <div className="surveydetailsform-wrapper">
            <label>
              Last Water Tax Receipt <span style={{ color: "red" }}>*</span>
            </label>
            <input
              name="numberOfFloors"
              type="file"
              inputRef={register({
                required: "This field is required",
                maxLength: {
                  value: 500,
                  message: "Category length should be less than or equal to 500 characters",
                },
              })}
            />
            {errors.numberOfFloors && <p style={{ color: "red" }}>{errors.numberOfFloors.message}</p>}
          </div>
          <div className="surveydetailsform-wrapper">
            <label>
              Last Property Tax Receipt <span style={{ color: "red" }}>*</span>
            </label>
            <input
              name="numberOfFloors"
              type="file"
              inputRef={register({
                required: "This field is required",
                maxLength: {
                  value: 500,
                  message: "Category length should be less than or equal to 500 characters",
                },
              })}
            />
            {errors.numberOfFloors && <p style={{ color: "red" }}>{errors.numberOfFloors.message}</p>}
          </div>
          <ActionBar>
            <SubmitBar label="Submit" submit="submit" />
          </ActionBar>
          {/* <button type="submit">Submit</button> */}
          <button onClick={() => onBackClick()}>Back</button>
        </form>
      </FormProvider>

      {showToast && <Toast error={showToast.isError} label={t(showToast.label)} onClose={closeToast} isDleteBtn={"true"} />}
      {isLoading && <Loader />}
    </div>
  );
};

export default PropertyDetailsFormUser;
