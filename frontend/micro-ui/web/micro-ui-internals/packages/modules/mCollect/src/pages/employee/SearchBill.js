import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  TextInput,
  Header,
  ActionBar,
  SubmitBar,
  Loader,
  InfoIcon,
  Toast,
  Dropdown,
  Table,
  Label,
  MobileNumber,
  CardLabelError,
} from "@mseva/digit-ui-react-components";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

const SearchBill = () => {
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
    getValues,
  } = methods;

  const onSubmit = async (data) => {
    setIsLoading(true);
    setHasSearched(true);
    const businessServiceData = data?.businesService?.code;
    delete data["ULB"];

    data["url"] = "egov-searcher/bill-genie/mcollectbills/_get";

    // Filter out empty strings, null, undefined, and empty arrays
    const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
      if (
        value !== null &&
        value !== undefined &&
        !(typeof value === "string" && value.trim() === "") &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        // Replace businessServices with its code
        acc[key] = key === "businesService" ? businessServiceData : value;
      }
      return acc;
    }, {});

    try {
      const response = await Digit.MCollectService.search_bill(tenantId, filteredData);
      setTableData(response?.Bills);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log("error", error);
    }
  };

  const closeToast = () => {
    setShowToast(null);
  };

  const downloadPDF = async (rowData) => {
    setIsLoading(true);
    try {
      const response = await Digit.MCollectService.generatePdf(tenantId, { Bills: [{ ...rowData }] }, "mcollectbill");
      setIsLoading(false);
      if (response?.filestoreIds?.[0]) {
        fileFetch(response?.filestoreIds?.[0]);
      } else {
        setShowToast({ isError: true, label: "ERR_PDF_GEN_FAILED" });
      }
    } catch (error) {
      setIsLoading(false);
      console.log("error", error);
      setShowToast({ isError: true, label: "ERR_PDF_GEN_FAILED" });
    }
  };

  const fileFetch = async (fileStoreId) => {
    setIsLoading(true);
    try {
      const response = await Digit.MCollectService.file_fetch(tenantId, fileStoreId);
      setIsLoading(false);
      const fileUrl = response?.[fileStoreId] || response?.fileStoreIds?.[0]?.url;
      if (fileUrl) {
        window.open(fileUrl, "_blank");
      } else {
        console.error("File URL not found in response.");
      }
    } catch (error) {
      setIsLoading(false);
      console.log("error", error);
    }
  };

  const GetCell = (value) => <span className="cell-text">{value}</span>;
  const columns = useMemo(
    () => [
      {
        Header: t("UC_BILL_NO_LABEL"),
        disableSortBy: true,
        accessor: (row) => {
          const receiptNumber = row?.billNumber;
          return (
            <span className="link" onClick={() => downloadPDF(row)}>
              {receiptNumber}
            </span>
          );
        },
      },
      {
        Header: t("UC_CONSUMER_NAME_LABEL"),
        disableSortBy: true,
        accessor: (row) => {
          return GetCell(row?.payerName);
        },
      },
      {
        Header: t("UC_BILL_DATE_LABEL"),
        disableSortBy: true,
        accessor: (row) => {
          const date = new Date(row?.billDate);
          const formattedDate = date.toLocaleDateString("en-GB");
          return GetCell(formattedDate);
        },
      },
      {
        Header: t("UC_BILL_AMOUNT_LABEL"),
        disableSortBy: true,
        accessor: (row) => {
          return GetCell(row?.totalAmount);
        },
      },
      {
        Header: t("UC_STATUS_LABEL"),
        disableSortBy: true,
        accessor: (row) => {
          return GetCell(row?.status);
        },
      },
      {
        Header: t("UC_ACTION_LABEL"),
        disableSortBy: true,
        accessor: (row) => {
          return <SubmitBar onSubmit={() => alert("payment integration is pending")} label={t("UC_PAY_LABEL")} />;
        },
      },
    ],
    [t]
  );

  return (
    <React.Fragment>
      <div className={"employee-application-details"}>
        <Header>{t("UC_SEARCH_BILL_HEADER")}</Header>
        <SubmitBar onSubmit={() => history.push("/digit-ui/employee/mcollect/group-bill")} label={t("UC_GROUP_BILLS_LABEL")} />
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
                      // rules={{ required: t("REQUIRED_FIELD") }}
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
                    {errors.ULB && <CardLabelError>{errors.ULB.message}</CardLabelError>}
                  </span>
                </div>
                <div className="input-fields">
                  <span className="complaint-input">
                    <Label>{t("UC_SERVICE_TYPE_LABEL")}*</Label>
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
                    {errors.businesService && <CardLabelError>{errors.businesService.message}</CardLabelError>}
                  </span>
                </div>
                <div className="input-fields">
                  <span className="complaint-input">
                    <Label>{t("UC_CONSUMER_CODE_LABEL")}</Label>
                    <TextInput
                      name="consumerCode"
                      type="text"
                      inputRef={register({
                        maxLength: {
                          value: 500,
                        },
                      })}
                    />
                    {errors.consumerCode && <CardLabelError>{errors.consumerCode.message}</CardLabelError>}
                  </span>
                </div>
                <div className="input-fields">
                  <span className="complaint-input">
                    <Label>{t("UC_BILL_NO_LABEL")}</Label>
                    <TextInput
                      name="billNo"
                      type="text"
                      inputRef={register({
                        maxLength: {
                          value: 500,
                        },
                      })}
                    />
                    {errors.billNo && <CardLabelError>{errors.billNo.message}</CardLabelError>}
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
                  minWidth: cellInfo.column.Header === t("UC_BILL_NO_LABEL") ? "240px" : "",
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

export default SearchBill;
