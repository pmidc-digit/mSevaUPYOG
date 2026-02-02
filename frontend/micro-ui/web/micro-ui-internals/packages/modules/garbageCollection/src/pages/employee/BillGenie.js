import React, { useEffect, useState } from "react";
import { CardLabel, ActionBar, SubmitBar, CardSubHeader, Dropdown, MobileNumber, TextInput } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import ApplicationTable from "../../components/ApplicationTable";
import { Loader } from "../../components/Loader";

const defaultValues = {
  locality: null,
  billNo: "",
  mobileNumber: "",
};

const BillGenie = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { t } = useTranslation();
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");

  const [loader, setLoader] = useState(false);
  const [getData, setData] = useState();
  const [getBills, setBills] = useState([]);
  const GetCell = (value) => <span className="cell-text styled-cell">{value}</span>;

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues,
    watch,
    clearErrors,
    reset,
  } = useForm({
    defaultValues,
  });

  const onSubmit = async (data) => {
    const hasAtLeastOneField = data?.locality || data?.billNo?.trim() || data?.mobileNumber?.trim();
    if (!hasAtLeastOneField) {
      alert(t("Please select at least one search criteria"));
      return;
    }

    // console.log("data===", data);
    // return;
    setLoader(true);
    const payload = {
      searchCriteria: {
        tenantId: tenantId,
        url: "egov-searcher/bill-genie/garbagecollectionbills/_get",
        businesService: "GC",
        ...(data?.locality?.code && { locality: data.locality.code }),
        ...(data?.billNo && { consumerCode: data.billNo }),
        ...(data?.mobileNumber && { mobileNumber: data.mobileNumber }),
      },
    };
    try {
      const response = await Digit.GCService.billGenieSearch(payload);
      setLoader(false);
      setBills(response?.Bills);
    } catch (error) {
      setLoader(false);
      // setShowToast(true);
      // setError(error.response.data?.Errors?.[0]?.message);
    }
  };

  const handleApiData = async () => {
    setLoader(true);
    const filters = {};
    filters.hierarchyTypeCode = "REVENUE";
    filters.boundaryType = "Locality";
    try {
      const response = await Digit.GCService.location({ tenantId, filters });
      setLoader(false);
      setData(response?.TenantBoundary?.[0]?.boundary);
    } catch (error) {
      setLoader(false);
      // setLoader(false);
    }
  };

  useEffect(() => {
    handleApiData();
  }, []);

  const columns = [
    { Header: `${t("NOC_HOME_SEARCH_RESULTS_APP_NO_LABEL")}`, accessor: "uuid" },
    {
      Header: `${t("TL_COMMON_TABLE_COL_APP_DATE")}`,
      accessor: "createdtime",
      Cell: ({ row }) => {
        console.log("row", row);
        return (
          <div>
            <span>{row.original?.createdtime ? GetCell(format(new Date(row.original?.createdtime), "dd/MM/yyyy")) : ""}</span>
          </div>
        );
      },
    },
    { Header: `${t("PT_COMMON_TABLE_COL_STATUS_LABEL")}`, accessor: "status" },
    {
      Header: `${t("Action")}`,
      accessor: "action",
      Cell: ({ row }) => {
        return (
          <div>
            <SubmitBar label="Download" onSubmit={() => getRecieptSearch({ tenantId, bills: getBills })} />
          </div>
        );
      },
    },
  ];

  const slotlistRows =
    getBills?.map((bills) => ({
      uuid: bills?.consumerCode,
      createdtime: bills?.billDate,
      status: t(bills.status),
    })) || [];

  const getRecieptSearch = async ({ tenantId, bills }) => {
    try {
      setLoader(true);
      const response = await Digit.PaymentService.generatePdf(tenantId, { Bills: [...bills] }, "garbage-bill");

      const fileStore = await Digit.PaymentService.printReciept(tenantId, {
        fileStoreIds: response.filestoreIds[0],
      });

      window.open(fileStore[response?.filestoreIds[0]], "_blank");
    } catch (error) {
      console.error("Receipt generation failed", error);
    } finally {
      setLoader(false);
    }
  };

  return (
    <React.Fragment>
      <CardSubHeader style={{ fontSize: "24px", margin: "30px 0 40px" }}>{t("ACTION_TEST_GARBAGE_COLLECTION_BILL_GENIE")}</CardSubHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "24px",
            width: "100%",
          }}
        >
          {/*Service Category */}
          <div
            style={{
              flex: "0 0 20%", // 2 items per row
              maxWidth: "20%",
            }}
          >
            <CardLabel>{`${t("CS_SWACH_LOCALITY")}`}*</CardLabel>
            <Controller
              control={control}
              name={"locality"}
              render={(props) => (
                <Dropdown
                  style={{ marginBottom: 0, width: "100%" }}
                  className="form-field"
                  select={(e) => {
                    props.onChange(e);
                  }}
                  selected={props.value}
                  option={getData}
                  optionKey="name"
                  t={t}
                />
              )}
            />
            {errors?.locality && <p style={{ color: "red" }}>{errors.locality.message}</p>}
          </div>

          {/*Property Tax Unique ID */}
          {/* <div
            style={{
              flex: "0 0 20%", // 2 items per row
              maxWidth: "20%",
            }}
          >
            <CardLabel>
              {`${t("NDC_MSG_PROPERTY_LABEL")}`} <span style={{ color: "red" }}></span>
            </CardLabel>
            <Controller
              control={control}
              name="propertyId"
              // rules={{
              //   required: "Name is required",
              //   minLength: { value: 2, message: "Name must be at least 2 characters" },
              // }}
              render={(props) => (
                <TextInput
                  style={{ marginBottom: 0 }}
                  value={props.value}
                  error={errors?.name?.message}
                  onChange={(e) => {
                    props.onChange(e.target.value);
                  }}
                  onBlur={(e) => {
                    props.onBlur(e);
                  }}
                  t={t}
                />
              )}
            />
          </div> */}

          {/*Bill No. */}
          <div
            style={{
              flex: "0 0 20%", // 2 items per row
              maxWidth: "20%",
            }}
          >
            <CardLabel>{`${t("Bill No.")}`}</CardLabel>
            <Controller
              control={control}
              name="billNo"
              render={(props) => (
                <TextInput
                  style={{ marginBottom: 0 }}
                  value={props.value}
                  onChange={(e) => {
                    props.onChange(e.target.value);
                  }}
                  onBlur={(e) => {
                    props.onBlur(e);
                  }}
                  t={t}
                />
              )}
            />
          </div>

          {/*Mobile No. */}
          <div
            style={{
              flex: "0 0 20%", // 2 items per row
              maxWidth: "20%",
            }}
          >
            <CardLabel>{`${t("NOC_APPLICANT_MOBILE_NO_LABEL")}`}</CardLabel>
            <Controller
              control={control}
              name="mobileNumber"
              rules={{
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: "Enter a valid 10-digit mobile number",
                },
              }}
              render={(props) => (
                <MobileNumber
                  style={{ marginBottom: 0 }}
                  value={props.value}
                  onChange={(e) => {
                    props.onChange(e);
                  }}
                  onBlur={props.onBlur}
                  t={t}
                />
              )}
            />
          </div>
        </div>

        {getBills.length > 0 && (
          <div className="tableClass">
            <ApplicationTable
              t={t}
              data={slotlistRows}
              columns={columns}
              getCellProps={(cellInfo) => ({
                style: {
                  minWidth: "150px",
                  padding: "10px",
                  fontSize: "16px",
                  paddingLeft: "20px",
                },
              })}
              isPaginationRequired={false}
              totalRecords={slotlistRows.length}
            />
          </div>
        )}
        <ActionBar>
          <SubmitBar
            style={{ background: "#eee", color: "black", border: "1px solid" }}
            label="Reset"
            onSubmit={() => {
              reset(defaultValues);
              setBills([]);
            }}
          />
          <SubmitBar label="Search" submit="submit" />
        </ActionBar>
      </form>
      {loader && <Loader page={true} />}
    </React.Fragment>
  );
};

export default BillGenie;
