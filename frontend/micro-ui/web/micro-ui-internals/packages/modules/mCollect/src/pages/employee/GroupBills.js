import React, { useState, useEffect, useMemo } from "react";
import { Card, TextInput, Header, ActionBar, SubmitBar, Loader, InfoIcon, Toast, Dropdown, Table, Label } from "@mseva/digit-ui-react-components";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

const GroupBills = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(null);

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

  const { data: ULBData = [], isLoading: ulbLoading } = Digit.Hooks.useCustomMDMS(tenantId, "tenant", [{ name: "tenants" }], {
    select: (data) => {
      const formattedData = data?.["tenant"]?.["tenants"];
      return formattedData;
    },
  });

  const methods = useForm({
    defaultValues: {
      categoryName: "",
    },
  });

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

  const closeToast = () => {
    setShowToast(null);
  };

  return (
    <React.Fragment>
      <div className={"employee-application-details"}>
        <Header>{t("UC_GROUP_BILLS_HEADER")}</Header>
      </div>

      <Card>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="search-complaint-container" style={{ padding: "0", margin: "0" }}>
              <div
                className="complaint-input-container for-pt"
                style={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", margin: "0" }}
              >
                <div className="input-fields">
                  <span className="complaint-input">
                    <Label>{t("UC_ULB_LABEL")}*</Label>
                    <Controller
                      control={control}
                      rules={{ required: t("REQUIRED_FIELD") }}
                      name="ULB"
                      render={(props) => (
                        <Dropdown
                          option={ULBData}
                          select={(e) => {
                            props.onChange(e);
                          }}
                          optionKey="name"
                          onBlur={props.onBlur}
                          t={t}
                          selected={props.value}
                        />
                      )}
                    />
                    {errors.ULB && <p style={{ color: "red", fontSize: "14px" }}>{errors.ULB.message}</p>}
                  </span>
                </div>
                <div className="input-fields">
                  <span className="complaint-input">
                    <Label>{t("UC_SERVICE_CATEGORY_LABEL")}*</Label>
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
                    {errors.businesService && <p style={{ color: "red", fontSize: "14px" }}>{errors.businesService.message}</p>}
                  </span>
                </div>
                <div className="input-fields">
                  <span className="complaint-input">
                    <Label>{t("UC_SELECT_BATCH_OR_LOCALITY_LABEL")}*</Label>
                    <Controller
                      control={control}
                      rules={{ required: t("REQUIRED_FIELD") }}
                      name="batchOrLocality"
                      render={(props) => (
                        <Dropdown
                          option={[
                            { active: true, code: "BATCH", name: t("UC_BATCH_LABEL") },
                            { active: true, code: "LOCALITY", name: t("UC_LOCALITY_LABEL") },
                          ]}
                          select={(e) => {
                            props.onChange(e);
                          }}
                          optionKey="name"
                          onBlur={props.onBlur}
                          t={t}
                          selected={props.value}
                        />
                      )}
                    />
                    {errors.batchOrLocality && <p style={{ color: "red", fontSize: "14px" }}>{errors.batchOrLocality.message}</p>}
                  </span>
                </div>
                <div className="input-fields">
                  <span className="complaint-input">
                    <Label>{t("UC_LOCATION_MOHALLA_LABEL")}</Label>
                    <Controller
                      control={control}
                      name="locality"
                      render={(props) => (
                        <Dropdown
                          option={[]} // Locality data should ideally come from MDMS or another hook
                          select={(e) => {
                            props.onChange(e);
                          }}
                          optionKey="name"
                          onBlur={props.onBlur}
                          t={t}
                          selected={props.value}
                        />
                      )}
                    />
                    {errors.locality && <p style={{ color: "red", fontSize: "14px" }}>{errors.locality.message}</p>}
                  </span>
                </div>
                <div className="input-fields">
                  <span className="complaint-input">
                    <Label>{t("UC_BATCH_LABEL")}</Label>
                    <Controller
                      control={control}
                      name="batch"
                      render={(props) => (
                        <Dropdown
                          option={[]}
                          select={(e) => {
                            props.onChange(e);
                          }}
                          optionKey="name"
                          onBlur={props.onBlur}
                          t={t}
                          selected={props.value}
                        />
                      )}
                    />
                    {errors.batch && <p style={{ color: "red", fontSize: "14px" }}>{errors.batch.message}</p>}
                  </span>
                </div>
                <div className="input-fields">
                  <span className="complaint-input">
                    <Label>{t("UC_GROUP_LABEL")}</Label>
                    <Controller
                      control={control}
                      name="group"
                      render={(props) => (
                        <Dropdown
                          option={[]}
                          select={(e) => {
                            props.onChange(e);
                          }}
                          optionKey="name"
                          onBlur={props.onBlur}
                          t={t}
                          selected={props.value}
                        />
                      )}
                    />
                    {errors.group && <p style={{ color: "red", fontSize: "14px" }}>{errors.group.message}</p>}
                  </span>
                </div>
                <div className="input-fields">
                  <span className="complaint-input">
                    <Label>{t("UC_CONSUMER_ID_LABEL")}</Label>
                    <TextInput
                      name="consumerId"
                      type="text"
                      inputRef={register({
                        maxLength: {
                          value: 500,
                        },
                      })}
                    />
                    {errors.consumerId && <p style={{ color: "red", fontSize: "14px" }}>{errors.consumerId.message}</p>}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
                <SubmitBar label={t("Next")} submit="submit" />
              </div>
            </div>
          </form>
        </FormProvider>
      </Card>
      {showToast && <Toast error={showToast.isError} label={t(showToast.label)} onClose={closeToast} isDleteBtn={"true"} />}
      {isLoading && <Loader />}
    </React.Fragment>
  );
};

export default GroupBills;
