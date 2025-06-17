import React, { useState, useEffect } from "react";
import { TextInput, Header, ActionBar, SubmitBar, Loader, Toast, Dropdown } from "@mseva/digit-ui-react-components";
import { useForm, FormProvider, useFieldArray, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { updateNDCForm } from "../../../redux/actions/NDCFormActions";

const reasonData = [
  { active: true, code: "Electricity connection for PSPCL" },
  { active: true, code: "For sale of Property" },
  { active: true, code: "For change of Ownership" },
];

const PropertyDetailsForm = ({ onGoNext }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [showToast, setShowToast] = useState(null);
  const formStateValues = useSelector((state) => state.ndc.NDCForm);

  const methods = useForm({
    defaultValues: {
      propertyID: "",
      waterConnectionNumbers: [{ value: "" }],
      sewageConnectionNumbers: [{ value: "" }],
      firstName: "",
      lastName: "",
      address: "",
      email: "",
      mobileNumber: "",
    },
  });
  // console.log("props====", props);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = methods;

  const { fields: waterFields, append: addWater, remove: removeWater, replace: replaceWater } = useFieldArray({
    control,
    name: "waterConnectionNumbers",
  });

  const { fields: sewageFields, append: addSewage, remove: removeSewage, replace: replaceSewage } = useFieldArray({
    control,
    name: "sewageConnectionNumbers",
  });

  const onSubmit = async (data) => {
    console.log("data is here==========", data);

    dispatch(updateNDCForm("PropertyDetailsStep1", data)); // Use a meaningful key
    onGoNext();
  };

  useEffect(() => {
    console.log("errors", errors);
  }, [errors]);

  const closeToast = () => {
    setShowToast(null);
  };

  useEffect(() => {
    console.log("here", formStateValues?.formData);
    if (formStateValues?.formData?.PropertyDetailsStep1) {
      const data = formStateValues?.formData?.PropertyDetailsStep1;
      const fieldKeysToSkip = ["waterConnectionNumbers", "sewageConnectionNumbers"];
      Object?.entries(data)?.forEach(([key, value]) => {
        if (!fieldKeysToSkip.includes(key)) {
          setValue(key, value);
        }
      });

      if (data?.waterConnectionNumbers?.length > 0) {
        waterFields.forEach((_, i) => removeWater(0));
        // Clear existing fields
        // Append required number of fields
        data?.waterConnectionNumbers?.forEach(() => addWater({ value: "" }));

        setTimeout(() => {
          data?.waterConnectionNumbers?.forEach((item, index) => {
            setValue(`waterConnectionNumbers.${index}.value`, item.value);
          });
        }, 0);
      }

      if (data?.sewageConnectionNumbers?.length > 0) {
        sewageFields.forEach((_, i) => removeSewage(0));
        // Clear existing fields
        // Append required number of fields
        data?.sewageConnectionNumbers?.forEach(() => addSewage({ value: "" }));

        setTimeout(() => {
          data?.sewageConnectionNumbers?.forEach((item, index) => {
            setValue(`sewageConnectionNumbers.${index}.value`, item.value);
          });
        }, 0);
      }
    }
  }, [formStateValues]);

  return (
    <div className="pageCard">
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
                // required: "This field is required",
              })}
            />

            {errors.propertyID && <p style={{ color: "red" }}>{errors.propertyID.message}</p>}
          </div>
          <div className="surveydetailsform-wrapper">
            <label>
              Water Connection Number <span style={{ color: "red" }}>*</span>
            </label>
            {waterFields.map((field, index) => (
              <div key={field.id}>
                <div className="dynamic-field" style={{ display: "flex", gap: "10px" }}>
                  <TextInput
                    name={`waterConnectionNumbers.${index}.value`}
                    inputRef={register({
                      // required: "This field is required",
                    })}
                  />
                  {index > 0 && (
                    <button type="button" onClick={() => removeWater(index)}>
                      ❌
                    </button>
                  )}
                </div>
                {errors?.waterConnectionNumbers?.[index]?.value && (
                  <p style={{ color: "red" }}>{errors.waterConnectionNumbers[index].value.message}</p>
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
              <div key={field.id}>
                <div className="dynamic-field" style={{ display: "flex", gap: "10px" }}>
                  <TextInput
                    name={`sewageConnectionNumbers.${index}.value`}
                    inputRef={register({
                      // required: "This field is required",
                    })}
                  />
                  {index > 0 && (
                    <button type="button" onClick={() => removeSewage(index)}>
                      ❌
                    </button>
                  )}
                </div>
                {errors?.sewageConnectionNumbers?.[index]?.value && (
                  <p style={{ color: "red" }}>{errors.sewageConnectionNumbers[index].value.message}</p>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addSewage({ value: "" })}>
              ➕ Add
            </button>
          </div>
          <div className="surveydetailsform-wrapper">
            <label>
              First Name <span style={{ color: "red" }}>*</span>
            </label>
            <TextInput
              name="firstName"
              type="text"
              inputRef={register({
                // required: "This field is required",
              })}
            />
            {errors.firstName && <p style={{ color: "red" }}>{errors.firstName.message}</p>}
          </div>
          <div className="surveydetailsform-wrapper">
            <label>
              Last Name <span style={{ color: "red" }}>*</span>
            </label>
            <TextInput
              name="lastName"
              type="text"
              inputRef={register({
                // required: "This field is required",
              })}
            />
            {errors.lastName && <p style={{ color: "red" }}>{errors.lastName.message}</p>}
          </div>
          <div className="surveydetailsform-wrapper">
            <label>
              Email <span style={{ color: "red" }}>*</span>
            </label>
            <TextInput
              name="email"
              type="text"
              inputRef={register({
                // required: "This field is required",
              })}
            />
            {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}
          </div>
          <div className="surveydetailsform-wrapper">
            <label>
              Mobile Number <span style={{ color: "red" }}>*</span>
            </label>
            <TextInput
              name="mobileNumber"
              type="text"
              inputRef={register({
                // required: "This field is required",
              })}
            />
            {errors.mobileNumber && <p style={{ color: "red" }}>{errors.mobileNumber.message}</p>}
          </div>
          <div className="surveydetailsform-wrapper">
            <label>
              Address <span style={{ color: "red" }}>*</span>
            </label>
            <TextInput
              name="address"
              type="text"
              inputRef={register({
                // required: "This field is required",
              })}
            />
            {errors.address && <p style={{ color: "red" }}>{errors.address.message}</p>}
          </div>
          <div className="surveydetailsform-wrapper">
            <label>
              Reason of applying for NDC <span style={{ color: "red" }}>*</span>
            </label>
            <Controller
              control={control}
              // rules={{ required: t("REQUIRED_FIELD") }}
              name="reason"
              render={(props) => (
                <Dropdown
                  option={reasonData}
                  select={(e) => {
                    props.onChange(e);
                  }}
                  optionKey="code"
                  onBlur={props.onBlur}
                  t={t}
                  selected={props.value}
                />
              )}
            />
            {errors.reason && <p style={{ color: "red" }}>{errors.reason.message}</p>}
          </div>
          <ActionBar>
            <SubmitBar label="Next" submit="submit" />
          </ActionBar>
          {/* <button type="submit">Submit</button> */}
        </form>
      </FormProvider>

      {showToast && <Toast error={showToast.isError} label={t(showToast.label)} onClose={closeToast} isDleteBtn={"true"} />}
      {isLoading && <Loader />}
    </div>
  );
};

export default PropertyDetailsForm;
