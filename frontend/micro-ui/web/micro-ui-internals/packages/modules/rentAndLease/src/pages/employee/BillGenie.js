import React, { useState, useEffect } from "react";
import {
  Card,
  TextInput,
  Header,
  ActionBar,
  SubmitBar,
  Loader,
  Toast,
  Label,
  MobileNumber,
  CardLabelError,
} from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import ApplicationTable from "../../components/ApplicationTable";

const defaultValues = {
  mobileNumber: "",
  applicationNumber: "",
  propertyId: "",
};

const BillGenie = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const [loader, setLoader] = useState(false);
  const [getBills, setBills] = useState([]);
  const [showToast, setShowToast] = useState(null);

  const closeToast = () => {
    setShowToast(null);
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const GetCell = (value) => <span className="cell-text styled-cell">{value}</span>;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    register,
  } = useForm({
    defaultValues,
  });

  const onSubmit = async (data) => {
    const hasAtLeastOneField = data?.applicationNumber?.trim() || data?.mobileNumber?.trim() || data?.propertyId?.trim();
    if (!hasAtLeastOneField) {
      setShowToast({ error: true, label: t("ES_COMMON_ENTER_AT_LEAST_ONE_CRITERIA") });
      return;
    }

    setLoader(true);
    const filters = {
      ...(data?.applicationNumber && { applicationNumber: data.applicationNumber }),
      ...(data?.mobileNumber && { mobileNumber: data.mobileNumber }),
      ...(data?.propertyId && { propertyId: data.propertyId }),
      businesService: "rl-services",
    };

    try {
      const response = await Digit.RentAndLeaseService.search_bill(tenantId, filters);
      setLoader(false);
      if (response?.Bills?.length > 0) {
        setBills(response.Bills);
      } else {
        setBills([]);
        setShowToast({ error: true, label: t("CS_COMMON_NO_Bills_FOUND") });
      }
    } catch (error) {
      setLoader(false);
      setShowToast({ error: true, label: t("CS_COMMON_ERROR_SEARCHING_BILLSS") });
    }
  };

  const columns = [
    { Header: t("UC_BILL_NO_LABEL"), accessor: "billNumber" },
    { Header: t("UC_CONSUMER_NAME_LABEL"), accessor: "payerName" },
    {
      Header: t("UC_BILL_DATE_LABEL"),
      accessor: "billDate",
      Cell: ({ row }) => {
        return (
          <div>
            <span>{row.original?.billDate ? GetCell(format(new Date(row.original?.billDate), "dd/MM/yyyy")) : ""}</span>
          </div>
        );
      },
    },
    { Header: t("UC_BILL_AMOUNT_LABEL"), accessor: "totalAmount" },
    { Header: t("PT_COMMON_TABLE_COL_STATUS_LABEL"), accessor: "status" },
    {
      Header: t("Action"),
      accessor: "action",
      Cell: ({ row }) => {
        return (
          <div>
            <SubmitBar label={t("UC_DOWNLOAD_RECEIPT")} onSubmit={() => getReceiptSearch(row.original)} />
          </div>
        );
      },
    },
  ];

  const getReceiptSearch = async (bill) => {
    try {
      setLoader(true);
      const response = await Digit.PaymentService.generatePdf(tenantId, { Bills: [bill] }, "rentandlease-bill");

      const fileStore = await Digit.PaymentService.printReciept(tenantId, {
        fileStoreIds: response.filestoreIds[0],
      });

      window.open(fileStore[response?.filestoreIds[0]], "_blank");
    } catch (error) {
      setShowToast({ error: true, label: t("CS_COMMON_ERROR_GENERATING_RECEIPT") });
    } finally {
      setLoader(false);
    }
  };

  return (
    <React.Fragment>
      <div style={{ margin: "16px" }}>
        <Header>{t("RAL_BILL_GENIE_HEADER")}</Header>
      </div>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="search-complaint-container" style={{ padding: "0", margin: "0" }}>
            <div
              className="complaint-input-container for-pt"
              style={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "16px",
                margin: "0",
              }}
            >
              <div className="input-fields">
                <span className="complaint-input">
                  <Label>{t("CORE_COMMON_MOBILE_NUMBER")}</Label>
                  <Controller
                    control={control}
                    name="mobileNumber"
                    rules={{
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: t("CORE_INVALID_MOBILE_NUMBER"),
                      },
                    }}
                    render={(props) => (
                      <MobileNumber
                        onChange={props.onChange}
                        value={props.value}
                        t={t}
                      />
                    )}
                  />
                  {errors?.mobileNumber && <CardLabelError>{errors.mobileNumber.message}</CardLabelError>}
                </span>
              </div>

              <div className="input-fields">
                <span className="complaint-input">
                  <Label>{t("RAL_CONSUMER_CODE_APP_NO_LABEL")}</Label>
                  <TextInput
                    name="applicationNumber"
                    inputRef={register}
                  />
                </span>
              </div>

              <div className="input-fields">
                <span className="complaint-input">
                  <Label>{t("RENT_LEASE_PROPERTY_ID")}</Label>
                  <TextInput
                    name="propertyId"
                    inputRef={register}
                  />
                </span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              <SubmitBar
                label={t("CS_COMMON_RESET")}
                onSubmit={() => {
                  reset(defaultValues);
                  setBills([]);
                }}
                className="submit-bar ral-back-btn"
              />
              <SubmitBar label={t("ES_COMMON_SEARCH")} submit="submit" />
            </div>
          </div>
        </form>
      </Card>

      {getBills?.length > 0 && (
        <div style={{ marginTop: "24px", background: "white", padding: "16px", borderRadius: "8px" }}>
          <ApplicationTable
            t={t}
            data={getBills}
            columns={columns}
            getCellProps={(cellInfo) => ({
              style: {
                minWidth: "150px",
                padding: "20px 18px",
                fontSize: "16px",
              },
            })}
            isPaginationRequired={false}
            totalRecords={getBills.length}
          />
        </div>
      )}
      {showToast && <Toast error={showToast.error} label={showToast.label} isDleteBtn={true} onClose={closeToast} />}
      {loader && <Loader page={true} />}
    </React.Fragment>
  );
};

export default BillGenie;
