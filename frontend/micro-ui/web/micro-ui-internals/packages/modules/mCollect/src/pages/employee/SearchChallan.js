import React, { useState, useEffect, useMemo } from "react";
import { Card, TextInput, Header, SubmitBar, Loader, Toast, Dropdown, Table } from "@mseva/digit-ui-react-components";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";

const SearchChallan = (props) => {
  console.log("props", props);

  const { t } = useTranslation();
  const history = useHistory();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [tableData, setTableData] = useState([]);

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
    // check if all fields are empty
    const noFieldFilled = !data?.challanNo?.trim() && !data?.businessService && !data?.mobileNumber?.trim();

    if (noFieldFilled) {
      setShowToast({ isError: true, label: "Please fill at least one field to search." });
      return;
    }

    console.log("data is here==========", data);
    setIsLoading(true);
    const businessServiceData = data?.businessService?.code;

    // Filter out empty strings, null, undefined, and empty arrays
    const filters = Object.entries(data).reduce((acc, [key, value]) => {
      if (
        value !== null &&
        value !== undefined &&
        !(typeof value === "string" && value.trim() === "") &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        // Replace businessService with its code
        acc[key] = key === "businessService" ? businessServiceData : value;
      }
      return acc;
    }, {});

    console.log("filters", filters);

    try {
      const response = await Digit.MCollectService.search({ tenantId, filters });
      console.log("✅ recieptSearch response", response?.challans);
      setTableData(response?.challans);
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

  //need to get from workflow
  const GetCell = (value) => <span className="cell-text">{value}</span>;
  const columns = useMemo(
    () => [
      {
        Header: "Challan No",
        disableSortBy: true,
        accessor: (row) => {
          const challanNumber = row?.challanNo;
          return (
            <span className="link">
              <Link to={`${props.parentRoute}/challansearch/` + challanNumber}>{challanNumber}</Link>
            </span>
            // <span className="cell-text" style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }} onClick={() => downloadPDF(row)}>
            //   {challanNumber}
            // </span>
          );
        },
      },
      {
        Header: "Consumer Name",
        disableSortBy: true,
        accessor: (row) => {
          return GetCell(row?.citizen?.name);
        },
      },
      {
        Header: "Service Type",
        disableSortBy: true,
        accessor: (row) => {
          return GetCell(row?.businessService);
        },
      },
      {
        Header: "Status",
        disableSortBy: true,
        accessor: (row) => {
          const formattedStatus = row?.applicationStatus.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
          return (
            <span className="cell-text" style={{ color: "green" }}>
              {formattedStatus}
            </span>
          );
          // return GetCell(row?.applicationStatus);
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
        <Header>Search Challan</Header>
      </div>

      <div className="card">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="ndcFormCard">
              <div className="surveydetailsform-wrapper">
                <label>Challan No</label>
                <TextInput
                  name="challanNo"
                  type="text"
                  inputRef={register({
                    maxLength: {
                      value: 200,
                    },
                  })}
                />
                {errors.challanNo && <p style={{ color: "red" }}>{errors.challanNo.message}</p>}
              </div>
              <div className="surveydetailsform-wrapper">
                <label>Service Type</label>
                <Controller
                  control={control}
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

                {errors.businessService && <p style={{ color: "red" }}>{errors.businessService.message}</p>}
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

        {tableData?.length > 0 && (
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
        )}
        {showToast && <Toast error={showToast.isError} label={t(showToast.label)} onClose={closeToast} isDleteBtn={"true"} />}
        {isLoading && <Loader />}
      </div>
    </React.Fragment>
  );
};

export default SearchChallan;
