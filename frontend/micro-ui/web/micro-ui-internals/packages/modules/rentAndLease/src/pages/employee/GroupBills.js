import React, { useState, useEffect, useMemo } from "react";
import { Card, TextInput, Header, ActionBar, SubmitBar, Loader, InfoIcon, Toast, Dropdown, Table } from "@mseva/digit-ui-react-components";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

const GroupBills = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const { data: EmployeeStatusData = [], isLoading: callMDMS } = Digit.Hooks.useCustomMDMS(
    tenantId,
    "BillingService",
    [{ name: "BusinessService", filter: "[?(@.type=='Adhoc')]" }],
    {
      select: (data) => {
        const formattedData = data?.["BillingService"]?.["BusinessService"];
        return formattedData;
      },
    }
  );

  const methods = useForm({
    defaultValues: {
      categoryName: "",
    },
  });

  // console.log("props====", props);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = methods;

  const onSubmit = async (data) => {
    console.log("data is here==========", data);
  };

  useEffect(() => {
    console.log("errors", errors);
  }, [errors]);

  const closeToast = () => {
    setShowToast(null);
  };
  return (
    <React.Fragment>
      <div className={"employee-application-details ral-group-bills-header"}>
        <Header>Group Bills</Header>
      </div>

      <div className="pageCard">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="ndcFormCard">
              <div className="surveydetailsform-wrapper">
                <label>
                  ULB <span className="ral-mandatory-symbol">*</span>
                </label>
                <Controller
                  control={control}
                  rules={{ required: t("REQUIRED_FIELD") }}
                  name="ULB"
                  render={(props) => (
                    <Dropdown
                      option={[{ active: true, code: "CONTRACT" }]}
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
                {errors.ULB && <p className="ral-error-message-p">{errors.ULB.message}</p>}
              </div>
              <div className="surveydetailsform-wrapper">
                <label>
                  Service Category <span className="ral-mandatory-symbol">*</span>
                </label>
                <Controller
                  control={control}
                  rules={{ required: t("REQUIRED_FIELD") }}
                  name="businesService"
                  render={(props) => (
                    <Dropdown
                      option={EmployeeStatusData}
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

                {errors.businesService && <p className="ral-error-message-p">{errors.businesService.message}</p>}
              </div>
              <div className="surveydetailsform-wrapper">
                <label>
                  select Batch or Locality *
                  <span className="ral-mandatory-symbol">*</span>
                </label>
                <Controller
                  control={control}
                  rules={{ required: t("REQUIRED_FIELD") }}
                  name="serviceCategory"
                  render={(props) => (
                    <Dropdown
                      option={[{ active: true, code: "CONTRACT" }]}
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
                {errors.serviceCategory && <p className="ral-error-message-p">{errors.serviceCategory.message}</p>}
              </div>
              <div className="surveydetailsform-wrapper">
                <label>Location/Mohalla</label>
                <Controller
                  control={control}
                  rules={{ required: t("REQUIRED_FIELD") }}
                  name="serviceCategory"
                  render={(props) => (
                    <Dropdown
                      option={[{ active: true, code: "CONTRACT" }]}
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
                {errors.serviceCategory && <p className="ral-error-message-p">{errors.serviceCategory.message}</p>}
              </div>
              <div className="surveydetailsform-wrapper">
                <label>Batch</label>
                <Controller
                  control={control}
                  name="serviceCategory"
                  render={(props) => (
                    <Dropdown
                      option={[{ active: true, code: "CONTRACT" }]}
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
                {errors.serviceCategory && <p className="ral-error-message-p">{errors.serviceCategory.message}</p>}
              </div>
              <div className="surveydetailsform-wrapper">
                <label>Group</label>
                <Controller
                  control={control}
                  name="group"
                  render={(props) => (
                    <Dropdown
                      option={[{ active: true, code: "CONTRACT" }]}
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
                {errors.serviceCategory && <p className="ral-error-message-p">{errors.serviceCategory.message}</p>}
              </div>

              <div className="surveydetailsform-wrapper">
                <label>Consumer ID</label>
                <TextInput
                  name="billNo"
                  type="text"
                  inputRef={register({
                    maxLength: {
                      value: 500,
                    },
                  })}
                />
                {errors.billNo && <p className="ral-error-message-p">{errors.billNo.message}</p>}
              </div>
            </div>
            <SubmitBar label="Next" submit="submit" />
          </form>
        </FormProvider>
        {showToast && <Toast error={showToast.isError} label={t(showToast.label)} onClose={closeToast} isDleteBtn={"true"} />}
        {isLoading && <Loader />}
      </div>
    </React.Fragment>
  );
};

export default GroupBills;
