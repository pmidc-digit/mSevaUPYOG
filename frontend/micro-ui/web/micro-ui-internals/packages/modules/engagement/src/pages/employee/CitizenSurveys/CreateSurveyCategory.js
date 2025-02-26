import React, { useState } from "react";
import { Card, TextInput, Header, ActionBar, SubmitBar, Toast } from "@mseva/digit-ui-react-components";
import { useForm, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";

// Keep below values in localisation:
const SURVEY_CATEGORY = "Survey Category";
const CATEGORY_CREATED = "Survey category created successfully";
const ERR_MESSAGE = "Something went wrong";

const CreateSurveyCategory = () => {
  const { t } = useTranslation();
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
    const details = {
      Categories: [
        {
          tenantId: tenantId,
          label: data.categoryName,
        },
      ],
    };

    try {
      const response = await Digit.Surveys.createCategory(details);
      if (response?.Categories?.length > 0) {
        setShowToast({ isError: false, label: CATEGORY_CREATED });
        reset();
      } else {
        setShowToast({ isError: true, label: response?.Errors?.[0]?.message || ERR_MESSAGE });
      }
    } catch (error) {
      console.log("Error in Digit.Surveys.createCategory:", error?.response);
      setShowToast({ isError: true, label: error?.response?.data?.Errors?.[0]?.message || ERR_MESSAGE });
    }
  };

  const closeToast = () => {
    setShowToast(null);
  };

  return (
    <div className="pageCard">
      <Header>{t(SURVEY_CATEGORY)}</Header>
      {/* <CardHeader styles={{ fontSize: "28px", fontWeight: "400", color: "#1C1D1F" }} divider={true}>
        {t(SURVEY_CATEGORY)}
      </CardHeader> */}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="surveydetailsform-wrapper">
            <span className="surveyformfield">
              <label>{`${t("Category Name")} * `}</label>
              <TextInput
                name="categoryName"
                type="text"
                inputRef={register({
                  required: t("ES_ERROR_REQUIRED"),
                  maxLength: {
                    value: 60,
                    message: t("EXCEEDS_60_CHAR_LIMIT"),
                  },
                })}
              />
            </span>
            {errors.categoryName && <p style={{ color: "red" }}>{errors.categoryName.message}</p>}
          </div>
          <ActionBar>
            <SubmitBar label={t("Create Category")} submit="submit" />
          </ActionBar>
        </form>
      </FormProvider>
      {showToast && <Toast error={showToast.isError} label={t(showToast.label)} onClose={closeToast} isDleteBtn={"true"} />}
    </div>
  );
};

export default CreateSurveyCategory;
