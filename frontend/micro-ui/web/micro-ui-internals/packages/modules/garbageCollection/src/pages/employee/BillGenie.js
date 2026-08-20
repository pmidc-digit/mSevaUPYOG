import React, { useEffect, useState } from "react";
import { CardLabel, ActionBar, SubmitBar, CardSubHeader, Dropdown, MobileNumber, TextInput, Toast } from "@mseva/digit-ui-react-components";
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

  const isCitizenCheck = window.location.href.includes("citizen");

  const [loader, setLoader] = useState(false);
  const [getData, setData] = useState();
  const [getBills, setBills] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const [getLable, setLable] = useState(false);
  const GetCell = (value) => <span className="cell-text styled-cell">{value}</span>;

  const { printReceipt } = Digit.Hooks.usePrintBillReceipt({
    tenantId,
    setLoader,
    t,
    pdfkey: "garbage-bill",
  });
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
      console.log("response", response?.Bills);

      setLoader(false);
      setBills(response?.Bills);
      if (response?.Bills.length < 1) {
        setLable("No Bill Found");
        setError(false);
        setShowToast(true);
      }
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

  const closeToast = () => {
    setShowToast(null);
  };

  const columns = [
    { Header: `${t("NOC_HOME_SEARCH_RESULTS_APP_NO_LABEL")}`, accessor: "uuid" },
    {
      Header: `${t("TL_COMMON_TABLE_COL_APP_DATE")}`,
      accessor: "createdtime",
      Cell: ({ row }) => {
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
          <div className="gc-style-0bac17190a gc-bill-genie__row-actions">
            <SubmitBar label="Download" onSubmit={() => getReceiptSearch(getBills[row.original._index])} />
            {row?.original?.status == "Active" && (
              <SubmitBar
                label="Pay"
                onSubmit={() => {
                  const isCitizen = window.location.href.includes("citizen");
                  const setRole = isCitizen ? "citizen" : "employee";
                  const id = row?.original?.uuid;
                  history.push(`/digit-ui/${setRole}/payment/collect/GC/${id}/${tenantId}?tenantId=${tenantId}`);
                }}
              />
            )}
          </div>
        );
      },
    },
  ];

  const slotlistRows =
    getBills?.map((bills, index) => ({
      _index: index,
      uuid: bills?.consumerCode,
      createdtime: bills?.billDate,
      status: t(bills.status),
    })) || [];

  const getReceiptSearch = async (bill) => {
    printReceipt({
      billOrPaymentResponse: bill,
      businessService: "GC.ONE_TIME_FEE",
      rootKey: "BILLS",
    });
  };

  return (
    <div className={`gc-bill-genie ${isCitizenCheck ? "gc-bill-genie--citizen" : "gc-bill-genie--employee"}`}>
      <CardSubHeader className="gc-style-3852417c9d">
        {isCitizenCheck ? "Search and Pay" : t("ACTION_TEST_GARBAGE_COLLECTION_BILL_GENIE")}
      </CardSubHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div
          className="gc-style-287885dae7 gc-bill-genie__filters"
        >
          {/*Service Category */}
          <div
            className="gc-style-af0f5324e8 gc-bill-genie__field"
          >
            <CardLabel>{`${t("CS_SWACH_LOCALITY")}`}*</CardLabel>
            <Controller
              control={control}
              name={"locality"}
              render={(props) => (
                <Dropdown

                  className="form-field gc-style-6b38c97cb9"
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
            {errors?.locality && <p className="gc-style-31981a7d51">{errors.locality.message}</p>}
          </div>

          {/*Bill No. */}
          <div
            className="gc-style-af0f5324e8 gc-bill-genie__field"
          >
            <CardLabel>{`${t("Bill No.")}`}</CardLabel>
            <Controller
              control={control}
              name="billNo"
              render={(props) => (
                <TextInput
                  className="gc-style-648149cea2"
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
            className="gc-style-af0f5324e8 gc-bill-genie__field"
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
                  className="gc-style-648149cea2"
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
          <div className="tableClass gc-bill-genie__results">
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
        <ActionBar className="gc-bill-genie__actions">
          <SubmitBar
            className="gc-style-65b1b5e6ec"
            label="Reset"
            onSubmit={() => {
              reset(defaultValues);
              setBills([]);
            }}
          />
          <SubmitBar label="Search" submit="submit" />
        </ActionBar>
      </form>
      {showToast && <Toast isDleteBtn={true} error={error} label={getLable} onClose={closeToast} />}

      {loader && <Loader page={true} />}
    </div>
  );
};

export default BillGenie;
