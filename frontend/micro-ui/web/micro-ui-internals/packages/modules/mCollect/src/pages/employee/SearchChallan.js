import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  TextInput,
  Header,
  SubmitBar,
  Loader,
  Toast,
  Dropdown,
  Table,
  Label,
  MobileNumber,
  CardLabelError,
} from "@mseva/digit-ui-react-components";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";

const SearchChallan = (props) => {
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

  const {
    register,
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { errors },
  } = methods;

  const onSubmit = async (data) => {
    const noFieldFilled = !data?.challanNo?.trim() && !data?.businessService && !data?.mobileNumber?.trim();

    if (noFieldFilled) {
      setShowToast({ isError: true, label: t("ES_COMMON_FILL_ATLEAST_ONE_FIELD") });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    const businessServiceData = data?.businessService?.code;

    const filters = Object.entries(data).reduce((acc, [key, value]) => {
      if (
        value !== null &&
        value !== undefined &&
        !(typeof value === "string" && value.trim() === "") &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        acc[key] = key === "businessService" ? businessServiceData : value;
      }
      return acc;
    }, {});

    try {
      const response = await Digit.MCollectService.search({ tenantId, filters });
      setTableData(response?.challans);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log("error", error);
    }
  };

  const closeToast = () => {
    setShowToast(null);
  };

  const GetCell = (value) => <span className="cell-text">{value}</span>;
  const columns = useMemo(
    () => [
      {
        Header: t("UC_CHALLAN_NO_LABEL"),
        disableSortBy: true,
        accessor: (row) => {
          const challanNumber = row?.challanNo;
          return (
            <span className="link">
              <Link to={`${props.parentRoute}/challansearch/` + challanNumber}>{challanNumber}</Link>
            </span>
          );
        },
      },
      {
        Header: t("UC_CONSUMER_NAME_LABEL"),
        disableSortBy: true,
        accessor: (row) => {
          return GetCell(row?.citizen?.name);
        },
      },
      {
        Header: t("UC_SERVICE_TYPE_LABEL"),
        disableSortBy: true,
        accessor: (row) => {
          return GetCell(row?.businessService);
        },
      },
      {
        Header: t("UC_STATUS_LABEL"),
        disableSortBy: true,
        accessor: (row) => {
          const formattedStatus = row?.applicationStatus.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
          return (
            <span className="cell-text" style={{ color: "green" }}>
              {formattedStatus}
            </span>
          );
        },
      },
    ],
    [props.parentRoute, t]
  );

  return (
    <React.Fragment>
      <div className={"employee-application-details"}>
        <Header>{t("UC_SEARCH_CHALLAN_HEADER")}</Header>
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
                    <Label>{t("UC_CHALLAN_NO_LABEL")}</Label>
                    <TextInput
                      name="challanNo"
                      type="text"
                      inputRef={register({
                        maxLength: {
                          value: 200,
                        },
                      })}
                    />
                    {errors.challanNo && <CardLabelError>{errors.challanNo.message}</CardLabelError>}
                  </span>
                </div>
                <div className="input-fields">
                  <span className="complaint-input">
                    <Label>{t("UC_SERVICE_TYPE_LABEL")}*</Label>
                    <Controller
                      control={control}
                      rules={{ required: t("REQUIRED_FIELD") }}
                      name="businessService"
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
                    {errors.businessService && <CardLabelError>{errors.businessService.message}</CardLabelError>}
                  </span>
                </div>
                <div className="input-fields">
                  <span className="complaint-input">
                    <Label>{t("UC_MOBILE_NO_LABEL")}</Label>
                    <Controller
                      control={control}
                      name="mobileNumber"
                      rules={{
                        pattern: {
                          value: /^[0-9]+$/,
                          message: t("ERR_INVALID_MOBILE_NUMBER"),
                        },
                        minLength: {
                          value: 10,
                          message: t("ERR_MIN_LENGTH_MOBILE_NUMBER"),
                        },
                        maxLength: {
                          value: 15,
                          message: t("ERR_MAX_LENGTH_MOBILE_NUMBER"),
                        },
                      }}
                      render={(props) => (
                        <div className="field-container">
                          <MobileNumber
                            onChange={props.onChange}
                            value={props.value}
                            componentInFront={<div className="employee-card-input employee-card-input--front">+91</div>}
                          />
                        </div>
                      )}
                    />
                    {errors.mobileNumber && <CardLabelError>{errors.mobileNumber.message}</CardLabelError>}
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

      {tableData?.length > 0 ? (
        <div style={{ marginTop: "24px", background: "white", padding: "16px", borderRadius: "8px" }}>
          <Table
            t={t}
            data={tableData}
            totalRecords={tableData.length}
            columns={columns}
            getCellProps={(cellInfo) => {
              return {
                style: {
                  minWidth: cellInfo.column.Header === t("ES_INBOX_APPLICATION_NO") ? "240px" : "",
                  padding: "20px 18px",
                  fontSize: "16px",
                },
              };
            }}
            currentPage={getValues("offset") / getValues("limit")}
            pageSizeLimit={getValues("limit")}
            disableSort={false}
          />
        </div>
      ) : (
        hasSearched &&
        !isLoading && (
          <div style={{ margin: "2rem 0", textAlign: "center", fontSize: "18px", color: "#505050" }}>{t("CS_COMMON_NO_RECORDS_FOUND")}</div>
        )
      )}
      {showToast && <Toast error={showToast.isError} label={t(showToast.label)} onClose={closeToast} isDleteBtn={"true"} />}
      {isLoading && <Loader />}
    </React.Fragment>
  );
};

export default SearchChallan;
