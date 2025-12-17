import React, { useState, useEffect, useMemo } from "react";
import { Card, TextInput, Header, ActionBar, SubmitBar, Loader, InfoIcon, Toast, Dropdown, Table } from "@mseva/digit-ui-react-components";
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

    // const payload = {
    //   businesService: businessServiceData,
    //   billNo: data?.billNo,
    //   consumerCode: data?.consumerCode,
    //   mobileNumber: data?.mobileNumber,
    //   url: "egov-searcher/bill-genie/mcollectbills/_get",
    // };

    try {
      const response = await Digit.ChallanGenerationService.search_bill(tenantId, filteredData);
      // setTableData(response?.Payments);
      setTableData(response?.Bills);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const closeToast = () => {
    setShowToast(null);
  };

  //need to get from workflow
  const GetCell = (value) => <span className="cell-text">{value}</span>;
  const columns = useMemo(
    () => [
      {
        Header: "Bill No",
        disableSortBy: true,
        accessor: (row) => {
          const receiptNumber = row?.billNumber;
          return (
            <span className="cell-text ral-link-blue-underline" onClick={() => downloadPDF(row)}>
              {receiptNumber}
            </span>
          );
          // return GetCell(row?.paymentDetails?.[0]?.receiptNumber);
        },
      },
      {
        Header: "Consumer Name",
        disableSortBy: true,
        accessor: (row) => {
          return GetCell(row?.payerName);
        },
      },
      {
        Header: "Bill Date",
        disableSortBy: true,
        accessor: (row) => {
          const date = new Date(row?.billDate);
          const formattedDate = date.toLocaleDateString("en-GB");
          return GetCell(formattedDate);
        },
      },
      {
        Header: "Bill Amount (Rs)",
        disableSortBy: true,
        accessor: (row) => {
          return GetCell(row?.totalAmount);
        },
      },
      {
        Header: "Status",
        disableSortBy: true,
        accessor: (row) => {
          return GetCell(row?.status);
        },
      },
      {
        Header: "Action",
        disableSortBy: true,
        accessor: (row) => {
          return (
            <SubmitBar onSubmit={() => alert("payment integration is pending")} label="Pay" />
            // <span className="cell-text" style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }} onClick={() => alert("new bill")}>
            //   Generate New Bill
            // </span>
          );
        },
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <div className={"employee-application-details ral-group-bills-header"}>
        <Header>Search Bill</Header>
        <div>
          <SubmitBar onSubmit={() => history.push("/digit-ui/employee/mcollect/group-bill")} label="Group Bills" />{" "}
        </div>
      </div>

      <div className="pageCard">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="ndcFormCard">
              <div className="surveydetailsform-wrapper">
                <label>
                  ULB<span className="ral-mandatory-symbol">*</span>
                </label>
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
                {errors.serviceCategory && <p className="ral-error-message-p">{errors.serviceCategory.message}</p>}
              </div>
              <div className="surveydetailsform-wrapper">
                <label>
                  Service Type <span className="ral-mandatory-symbol">*</span>
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
                <label>Consumer code</label>
                <TextInput
                  name="consumerCode"
                  type="text"
                  inputRef={register({
                    maxLength: {
                      value: 500,
                    },
                  })}
                />
                {errors.consumerCode && <p className="ral-error-message-p">{errors.consumerCode.message}</p>}
              </div>
              <div className="surveydetailsform-wrapper">
                <label>Bill No</label>
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
              <div className="surveydetailsform-wrapper">
                <label>Mobile No</label>
                <div className="field-container">
                  <span className="citizen-card-input citizen-card-input--front ral-flex-none">+91</span>
                  <TextInput
                    name="mobileNumber"
                    type="text"
                    inputRef={register({
                      pattern: {
                        value: /^[0-9]+$/,
                        message: "Only numbers are allowed",
                      },
                      minLength: {
                        value: 10,
                        message: "Mobile number must be at least 10 digits",
                      },
                      maxLength: {
                        value: 15,
                        message: "Mobile number cannot exceed 15 digits",
                      },
                    })}
                  />
                  {errors.mobileNumber && <p className="ral-error-message-p">{errors.mobileNumber.message}</p>}
                </div>
              </div>
            </div>
            <SubmitBar label="Next" submit="submit" />
          </form>
        </FormProvider>

        {tableData?.length > 0 ? (
          <div className="ral-table-container">
            <Table
              t={t}
              data={tableData}
              totalRecords={9}
              columns={columns}
              getCellProps={(cellInfo) => {
                return {
                  className: "ral-table-cell",
                  minWidth: cellInfo.column.Header === t("ES_INBOX_APPLICATION_NO") ? "240px" : "",
                };
              }}
              // onPageSizeChange={onPageSizeChange}
              currentPage={getValues("offset") / getValues("limit")}
              // onNextPage={nextPage}
              // onPrevPage={previousPage}
              pageSizeLimit={getValues("limit")}
              // onSort={onSort}
              disableSort={false}
              sortParams={[{ id: getValues("sortBy"), desc: getValues("sortOrder") === "DESC" ? true : false }]}
            />
          </div>
        ) : (
          hasSearched && !isLoading && <div className="ral-no-records">{t("No Records Found")}</div>
        )}

        {showToast && <Toast error={showToast.isError} label={t(showToast.label)} onClose={closeToast} isDleteBtn={"true"} />}
        {isLoading && <Loader />}
      </div>
    </React.Fragment>
  );
};

export default SearchBill;
