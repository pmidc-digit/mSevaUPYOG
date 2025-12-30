import React, { useState, useEffect, useMemo } from "react";
import { Card, TextInput, Header, ActionBar, SubmitBar, Loader, InfoIcon, Toast, Dropdown, Table } from "@mseva/digit-ui-react-components";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

const SearchReceipt = () => {
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
    setIsLoading(true);
    setHasSearched(true);
    console.log("data is here==========", data);
    const businessService = data?.businessServices?.code;

    // Filter out empty strings, null, undefined, and empty arrays
    const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
      if (
        value !== null &&
        value !== undefined &&
        !(typeof value === "string" && value.trim() === "") &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        // Replace businessServices with its code
        acc[key] = key === "businessServices" ? businessService : value;
      }
      return acc;
    }, {});

    try {
      const response = await Digit.MCollectService.recieptSearch(tenantId, businessService, filteredData);
      console.log("✅ recieptSearch response", response?.Payments);
      setTableData(response?.Payments);
      setIsLoading(false);
      // let collectionres = await Digit.PaymentService.recieptSearch(BPA?.tenantId, appBusinessService[i], { consumerCodes: BPA?.applicationNo, isEmployee: true });
    } catch (error) {
      setIsLoading(false);
      console.log("error", error);
    }
  };

  const closeToast = () => {
    setShowToast(null);
  };

  const downloadPDF = async (rowData) => {
    console.log("generating pdf here==========");
    setIsLoading(true);
    try {
      const response = await Digit.MCollectService.generatePdf(tenantId, { Payments: [{ ...rowData }] }, "consolidatedreceiptold");
      setIsLoading(false);
      fileFetch(response?.filestoreIds?.[0]);
      console.log("✅ generating pdf response", response);
    } catch (error) {
      setIsLoading(false);
      console.log("error", error);
    }
  };

  const fileFetch = async (fileStoreId) => {
    setIsLoading(true);
    console.log("fetching file here==========");
    try {
      const response = await Digit.MCollectService.file_fetch(tenantId, fileStoreId);
      setIsLoading(false);
      console.log("✅ fetching file response", response);

      // Extract the URL from the response
      const fileUrl = response?.[fileStoreId] || response?.fileStoreIds?.[0]?.url;
      if (fileUrl) {
        // Redirect or open in new tab
        window.open(fileUrl, "_blank"); // opens in new tab
        // OR use window.location.href = fileUrl; // to redirect in same tab
      } else {
        console.error("File URL not found in response.");
      }
    } catch (error) {
      setIsLoading(false);
      console.log("error", error);
    }
  };

  //need to get from workflow
  const GetCell = (value) => <span className="cell-text">{value}</span>;
  const columns = useMemo(
    () => [
      {
        Header: "Receipt No",
        disableSortBy: true,
        accessor: (row) => {
          const receiptNumber = row?.paymentDetails?.[0]?.receiptNumber;
          return (
            <span className="cell-text" style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }} onClick={() => downloadPDF(row)}>
              {receiptNumber}
            </span>
          );
          // return GetCell(row?.paymentDetails?.[0]?.receiptNumber);
        },
      },
      {
        Header: "Consumer Code/Application No/Challan No",
        disableSortBy: true,
        accessor: (row) => {
          return GetCell(row?.paymentDetails?.[0]?.bill?.consumerCode);
        },
      },
      {
        Header: "Consumer Name",
        disableSortBy: true,
        accessor: (row) => {
          return GetCell(row?.paidBy);
        },
      },
      {
        Header: "Service Type",
        disableSortBy: true,
        accessor: (row) => {
          return GetCell(row?.paymentDetails?.[0]?.businessService);
        },
      },
      {
        Header: "Receipt Date",
        disableSortBy: true,
        accessor: (row) => {
          return GetCell(row?.paymentDetails?.[0]?.receiptNumber);
        },
      },
      {
        Header: "Amount Paid[INR]",
        disableSortBy: true,
        accessor: (row) => {
          return GetCell(row?.paymentDetails?.[0]?.bill?.totalAmount);
        },
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <style>
        {`
          .formWrapperNDC {
            // padding: 20px;
            // background: #fff;
            // border-radius: 10px;
            max-width: 1200px;
            // margin: auto;
            // box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }

          .ndcFormCard {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }

          .surveydetailsform-wrapper {
            display: flex;
            flex-direction: column;
            width: 100%;
          }
          .surveydetailsform-wrapper p {
            color: red;
            font-size: 14px;
          }

         .citizen-card-input{
            margin-bottom: 0 !important;
         }

          @media (max-width: 1024px) {
            .ndcFormCard {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 768px) {
            .ndcFormCard {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
      <div className={"employee-application-details"} style={{ marginBottom: "15px" }}>
        <Header>Search Receipts</Header>
      </div>

      <div className="card">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="ndcFormCard">
              <div className="surveydetailsform-wrapper">
                <label>Receipt No</label>
                <TextInput
                  name="receiptNumbers"
                  type="text"
                  inputRef={register({
                    maxLength: {
                      value: 200,
                    },
                  })}
                />
                {errors.receiptNumbers && <p style={{ color: "red" }}>{errors.receiptNumbers.message}</p>}
              </div>
              <div className="surveydetailsform-wrapper">
                <label>
                  Service Type <span style={{ color: "red" }}>*</span>
                </label>
                <Controller
                  control={control}
                  rules={{ required: t("REQUIRED_FIELD") }}
                  name="businessServices"
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
                {errors.businessServices && <p style={{ color: "red" }}>{errors.businessServices.message}</p>}
              </div>
              <div className="surveydetailsform-wrapper">
                <label>Consumer code</label>
                <TextInput
                  name="consumerCodes"
                  type="text"
                  inputRef={register({
                    maxLength: {
                      value: 500,
                    },
                  })}
                />
                {errors.consumerCodes && <p style={{ color: "red" }}>{errors.consumerCodes.message}</p>}
              </div>
              <div className="surveydetailsform-wrapper">
                <label>Mobile No</label>
                <div className="field-container">
                  <span className="citizen-card-input citizen-card-input--front" style={{ flex: "none" }}>
                    +91
                  </span>
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
                  {errors.mobileNumber && <p style={{ color: "red" }}>{errors.mobileNumber.message}</p>}
                </div>
              </div>
            </div>
            <SubmitBar label="Search" submit="submit" />
          </form>
        </FormProvider>

        {tableData?.length > 0 ? (
          <div style={{ backgroundColor: "white", marginRight: "200px", marginLeft: "2.5%", width: "100%" }}>
            <Table
              t={t}
              data={tableData}
              totalRecords={9}
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
          hasSearched &&
          !isLoading && <div style={{ margin: "2rem 0", textAlign: "center", fontSize: "18px", color: "#505050" }}>{t("No Records Found")}</div>
        )}

        {isLoading && <Loader />}
        {showToast && <Toast error={showToast.isError} label={t(showToast.label)} onClose={closeToast} isDleteBtn={"true"} />}
      </div>
    </React.Fragment>
  );
};

export default SearchReceipt;
