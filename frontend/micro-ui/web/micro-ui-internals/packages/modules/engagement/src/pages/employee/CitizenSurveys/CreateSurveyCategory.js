import React, { useState } from "react";
import { Card, TextInput, Header, ActionBar, SubmitBar,  Loader, InfoIcon, Toast } from "@mseva/digit-ui-react-components";
import { useForm, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import Dialog from "../../../components/Modal/Dialog";

// Keep below values in localisation:
const SURVEY_CATEGORY = "Create Category";
const CATEGORY_CREATED = "Category created successfully";
const ERR_MESSAGE = "Something went wrong";

const CreateSurveyCategory = () => {
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
    setIsLoading(true);
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
        setIsLoading(false);
        setShowToast({ isError: false, label: CATEGORY_CREATED });
        reset();
        setTimeout(() => {
          history.push("/digit-ui/employee/engagement/surveys/search-categories");
        }, 2000);
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

  function closeToast() {
    setShowToast(null);
  }

  const [showDialog, setShowDialog] = useState(false);

  function handleInfoButtonClick() {
    setShowDialog(true);
  }

  function handleOnSubmitDialog() {
    setShowDialog(false);
  }
  function handleOnCancelDialog() {
    setShowDialog(false);
  }

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
              <label>
                {t("Category")} <span style={{ color: "red" }}>*</span>
              </label>
              <TextInput
                name="categoryName"
                type="text"
                inputRef={register({
                  required: t("REQUIRED_FIELD"), // t("EVENTS_CATEGORY_ERROR_REQUIRED")//t("ES_ERROR_REQUIRED"),
                  maxLength: {
                    value: 60,
                    message: t("EXCEEDS_60_CHAR_LIMIT"),
                  },
                })}
              />
              <button
                onClick={handleInfoButtonClick}
                style={{ width: "24px", display: "flex", justifyContent: "center", alignItems: "center", outline: "none" }}
              >
                <InfoIcon />
              </button>
            </span>
            {errors.categoryName && <p style={{ color: "red" }}>{errors.categoryName.message}</p>}
          </div>
          <ActionBar>
            <SubmitBar label={t("Create Category")} submit="submit" />
          </ActionBar>
        </form>
      </FormProvider>
      {showDialog && (
        <Dialog
          onSelect={handleOnSubmitDialog}
          onCancel={handleOnCancelDialog}
          onDismiss={handleOnCancelDialog}
          heading="ABOUT_CREATE_CATEGORY_HEADER"
          content="CREATE_CATEGORY_DESCRIPTION"
          hideSubmit={true}
        />
      )}
      {showToast && <Toast error={showToast.isError} label={t(showToast.label)} onClose={closeToast} isDleteBtn={"true"} />}
      {isLoading && <Loader />}
    </div>
  );
};

export default CreateSurveyCategory;
