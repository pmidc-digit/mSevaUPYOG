import { Card, CardSubHeader, Header, KeyNote, Loader, RadioButtons, SubmitBar, TextInput } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation, useParams, Redirect } from "react-router-dom";
import ArrearSummary from "./arrear-summary";
import BillSumary from "./bill-summary";
import { stringReplaceAll } from "./utils";

const BillDetails = ({ paymentRules, businessService }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { state, pathname, search } = useLocation();
  const userInfo = Digit.UserService.getUser();
  let { consumerCode } = useParams();
  const { workflow: wrkflow, tenantId: _tenantId, authorization, ConsumerName } = Digit.Hooks.useQueryParams();
  const [bill, setBill] = useState(state?.bill);
  const tenantId = state?.tenantId || _tenantId || Digit.UserService.getUser().info?.tenantId;
  const propertyId = state?.propertyId;
  const applicationNumber = state?.applicationNumber;
  if (wrkflow === "WNS" && consumerCode.includes("?")) consumerCode = consumerCode.substring(0, consumerCode.indexOf("?"));
  const { data, isLoading } = state?.bill
    ? { isLoading: false }
    : Digit.Hooks.useFetchPayment({
      tenantId,
      businessService,
      consumerCode: wrkflow === "WNS" ? stringReplaceAll(consumerCode, "+", "/") : consumerCode,
    });

  let Useruuid = data?.Bill?.[0]?.userId || "";
  let requestCriteria = [
    "/user/_search",
    {},
    { data: { uuid: [Useruuid] } },
    { recordId: Useruuid, plainRequestFields: ["mobileNumber"] },
    {
      enabled: Useruuid ? true : false,
      cacheTime: 100,
    },
  ];

  const { isLoading: isUserLoading, data: userData, revalidate } = Digit.Hooks.useCustomAPIHook(...requestCriteria);

  const { isLoading: isFSMLoading, isError, error, data: application, error: errorApplication } = Digit.Hooks.fsm.useApplicationDetail(
    t,
    tenantId,
    consumerCode,
    { enabled: pathname.includes("FSM") ? true : false },
    "CITIZEN"
  );

  let { minAmountPayable, isAdvanceAllowed } = paymentRules;
  minAmountPayable = wrkflow === "WNS" ? 100 : minAmountPayable;
  const billDetails = bill?.billDetails?.sort((a, b) => b.fromPeriod - a.fromPeriod)?.[0] || [];
  const Arrears =
    bill?.billDetails
      ?.sort((a, b) => b.fromPeriod - a.fromPeriod)
      ?.reduce((total, current, index) => (index === 0 ? total : total + current.amount), 0) || 0;

  const { key, label } = Digit.Hooks.useApplicationsForBusinessServiceSearch({ businessService }, { enabled: false });

  const getBillingPeriod = () => {
    const { fromPeriod, toPeriod } = billDetails;
    if (fromPeriod && toPeriod) {
      let from, to;
      if (wrkflow === "mcollect" || wrkflow === "WNS") {
        from =
          new Date(fromPeriod).getDate().toString() +
          " " +
          Digit.Utils.date.monthNames[new Date(fromPeriod).getMonth()]?.toString() +
          " " +
          new Date(fromPeriod).getFullYear().toString();
        to = new Date(toPeriod).getDate() + " " + Digit.Utils.date.monthNames[new Date(toPeriod).getMonth()] + " " + new Date(toPeriod).getFullYear();
        return from + " - " + to;
      }
      from = new Date(billDetails.fromPeriod).getFullYear().toString();
      to = new Date(billDetails.toPeriod).getFullYear().toString();
      if (from === to) {
        if (window.location.href.includes("BPA")) {
          if (new Date(data?.Bill?.[0]?.billDate).getMonth() + 1 < 4) {
            let newfrom = (parseInt(from) - 1).toString();
            return "FY " + newfrom + "-" + to;
          } else {
            let newTo = (parseInt(to) + 1).toString();
            return "FY " + from + "-" + newTo;
          }
        } else return "FY " + from;
      }
      return "FY " + from + "-" + to;
    } else return "N/A";
  };

  const getBillBreakDown = () => billDetails?.billAccountDetails || [];

  const getTotal = () => bill?.totalAmount || 0;
  const getAdvanceAmount = () => application?.pdfData?.advanceAmount;

  const [paymentType, setPaymentType] = useState(t("CS_PAYMENT_FULL_AMOUNT"));
  const [amount, setAmount] = useState(getTotal());
  const [paymentAllowed, setPaymentAllowed] = useState(true);
  const [formError, setError] = useState("");

  if (authorization === "true" && !userInfo?.access_token) {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = `/digit-ui/citizen/login?from=${encodeURIComponent(pathname + search)}`;
  }
  useEffect(() => {
    window.scroll({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (paymentType == t("CS_PAYMENT_FULL_AMOUNT")) setAmount(getTotal());
  }, [paymentType, bill]);

  useEffect(() => {
    let changeAdvanceAllowed = isAdvanceAllowed;
    if (isAdvanceAllowed && wrkflow === "WNS") changeAdvanceAllowed = false;
    const allowPayment = minAmountPayable && amount >= minAmountPayable && !changeAdvanceAllowed && amount <= getTotal() && !formError;
    if (paymentType != t("CS_PAYMENT_FULL_AMOUNT")) setPaymentAllowed(allowPayment);
    else setPaymentAllowed(true);
  }, [paymentType, amount]);

  useEffect(() => {
    if (
      !isFSMLoading &&
      (application?.pdfData?.applicationStatus === "PENDING_APPL_FEE_PAYMENT_CITIZEN" ||
        application?.pdfData?.applicationStatus === "PENDING_APPL_FEE_PAYMENT")
    ) {
      setPaymentAllowed(true);
      setPaymentType(t("CS_PAYMENT_ADV_COLLECTION"));
    }
  });

  useEffect(() => {
    if (!bill && data) {
      let requiredBill = data.Bill.filter((e) => e.consumerCode == (wrkflow === "WNS" ? stringReplaceAll(consumerCode, "+", "/") : consumerCode))[0];
      setBill(requiredBill);
    }
  }, [isLoading]);

  const onSubmit = () => {
    let paymentAmount =
      paymentType === t("CS_PAYMENT_FULL_AMOUNT")
        ? getTotal()
        : amount || businessService === "FSM.TRIP_CHARGES"
          ? application?.pdfData?.advanceAmount
          : amount;
    if (window.location.href.includes("mcollect")) {
      history.push(`/digit-ui/citizen/payment/collect/${businessService}/${consumerCode}?workflow=mcollect`, {
        paymentAmount,
        tenantId: billDetails.tenantId,
      });
    } else if (wrkflow === "WNS") {
      history.push(
        `/digit-ui/citizen/payment/billDetails/${businessService}/${consumerCode}/${paymentAmount}?workflow=WNS&ConsumerName=${ConsumerName}`,
        {
          paymentAmount,
          tenantId: billDetails.tenantId,
          name: bill.payerName,
          mobileNumber: bill.mobileNumber && bill.mobileNumber?.includes("*") ? userData?.user?.[0]?.mobileNumber : bill.mobileNumber,
        }
      );
    } else if (businessService === "PT") {
      history.push(`/digit-ui/citizen/payment/billDetails/${businessService}/${consumerCode}/${paymentAmount}`, {
        paymentAmount,
        tenantId: billDetails.tenantId,
        name: bill.payerName,
        mobileNumber: bill.mobileNumber && bill.mobileNumber?.includes("*") ? userData?.user?.[0]?.mobileNumber : bill.mobileNumber,
      });
    } else if (businessService === "pet-services") {
      history.push(`/digit-ui/citizen/payment/billDetails/${businessService}/${consumerCode}/${paymentAmount}`, {
        paymentAmount,
        tenantId: billDetails.tenantId,
        name: bill.payerName,
        mobileNumber: bill.mobileNumber && bill.mobileNumber?.includes("*") ? userData?.user?.[0]?.mobileNumber : bill.mobileNumber,
      });
    } else {
      history.push(`/digit-ui/citizen/payment/collect/${businessService}/${consumerCode}`, {
        paymentAmount,
        tenantId: billDetails.tenantId,
        propertyId: propertyId,
      });
    }
  };

  const onChangeAmount = (value) => {
    setError("");
    if (isNaN(value) || value.includes(".")) {
      setError("AMOUNT_INVALID");
    } else if (!isAdvanceAllowed && value > getTotal()) {
      setError("CS_ADVANCED_PAYMENT_NOT_ALLOWED");
    } else if (value < minAmountPayable) {
      setError("CS_CANT_PAY_BELOW_MIN_AMOUNT");
    }
    setAmount(value);
  };

  if (isLoading || isFSMLoading) return <Loader />;

  return (
    <React.Fragment>
      <Header>{t("CS_PAYMENT_BILL_DETAILS")}</Header>
      <Card>
        <div className="bill-details-container">
          <div className="bill-details-wrapper">
            {/* Header Section */}
            <div className="bill-header-section">
              <h1 className="bill-header-title">{t("CS_PAYMENT_BILL_DETAILS")}</h1>
            </div>

            {/* Details Card */}
            <div className="bill-details-card">
              {/* Bill Information Section */}
              <div className="bill-info-section">
                <div className="bill-info-row">
                  <span className="bill-info-label">
                    {t(businessService == "PT.MUTATION" ? "PDF_STATIC_LABEL_MUATATION_NUMBER_LABEL" : label)}
                  </span>
                  <span className="bill-info-value">
                    {wrkflow === "WNS" ? stringReplaceAll(consumerCode, "+", "/") : consumerCode}
                  </span>
                </div>

                {businessService !== "PT.MUTATION" && businessService !== "FSM.TRIP_CHARGES" && (
                  <div className="bill-info-row">
                    <span className="bill-info-label">{t("CS_PAYMENT_BILLING_PERIOD")}</span>
                    <span className="bill-info-value">{getBillingPeriod()}</span>
                  </div>
                )}

                {(businessService?.includes("PT") || wrkflow === "WNS") && billDetails?.currentBillNo && (
                  <div className="bill-info-row">
                    <span className="bill-info-label">{t("CS_BILL_NO")}</span>
                    <span className="bill-info-value">{billDetails?.currentBillNo}</span>
                  </div>
                )}

                {(businessService?.includes("PT") || wrkflow === "WNS") && billDetails?.currentExpiryDate && (
                  <div className="bill-info-row">
                    <span className="bill-info-label">{t("CS_BILL_DUEDATE")}</span>
                    <span className="bill-info-value">{new Date(billDetails?.currentExpiryDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Bill Summary */}
              {businessService !== "FSM.TRIP_CHARGES" ? (
                <>
                  <BillSumary billAccountDetails={getBillBreakDown()} total={getTotal()} businessService={businessService} arrears={Arrears} />
                  <ArrearSummary bill={bill} />
                </>
              ) : (
                <div className="bill-info-section">
                  <div className="bill-info-row">
                    <span className="bill-info-label">{t("ES_PAYMENT_DETAILS_TOTAL_AMOUNT")}</span>
                    <span className="bill-info-value">₹ {application?.pdfData?.totalAmount}</span>
                  </div>
                  <div className="bill-info-row">
                    <span className="bill-info-label">{t("ES_PAYMENT_DETAILS_ADV_AMOUNT")}</span>
                    <span className="bill-info-value">₹ {application?.pdfData?.advanceAmount}</span>
                  </div>
                  {(application?.pdfData?.applicationStatus !== "PENDING_APPL_FEE_PAYMENT_CITIZEN" ||
                    application?.pdfData?.applicationStatus !== "PENDING_APPL_FEE_PAYMENT") && (
                      <div className="bill-info-row">
                        <span className="bill-info-label">{t("FSM_DUE_AMOUNT_TO_BE_PAID")}</span>
                        <span className="bill-info-value">
                          ₹ {application?.pdfData?.totalAmount - application?.pdfData?.advanceAmount}
                        </span>
                      </div>
                    )}
                </div>
              )}

              {/* Payment Divider */}
              <hr className="bill-divider" />

              {/* Payment Amount Section */}
              <div className="bill-payment-amount">
                <h3 className="bill-payment-section-title">{t("CS_COMMON_PAYMENT_AMOUNT")}</h3>

                {/* Payment Type Selection */}
                {businessService !== "FSM.TRIP_CHARGES" && (
                  <div className="bill-input-group">
                    <RadioButtons
                      selectedOption={paymentType}
                      onSelect={setPaymentType}
                      options={
                        paymentRules.partPaymentAllowed &&
                          application?.pdfData?.paymentPreference !== "POST_PAY" &&
                          application?.pdfData?.applicationStatus === "PENDING_APPL_FEE_PAYMENT_CITIZEN"
                          ? [t("CS_PAYMENT_ADV_COLLECTION")]
                          : [t("CS_PAYMENT_FULL_AMOUNT")]
                      }
                    />
                  </div>
                )}

                {/* Amount Display Card */}
                <div className="bill-amount-display">
                  <div className="bill-amount-label">{t("CS_COMMON_PAYMENT_AMOUNT")}</div>
                  <div className="bill-amount-value">
                    ₹ {paymentType !== t("CS_PAYMENT_FULL_AMOUNT")
                      ? (businessService === "FSM.TRIP_CHARGES" ? getAdvanceAmount() : amount)
                      : getTotal()}
                  </div>
                </div>

                {/* Amount Input Field */}
                {paymentType !== t("CS_PAYMENT_FULL_AMOUNT") && businessService !== "FSM.TRIP_CHARGES" && (
                  <div className="bill-input-group">
                    <label className="bill-input-label">{t("CS_COMMON_ENTER_AMOUNT")}</label>
                    <div className="bill-amount-input-wrapper">
                      <span className="bill-currency-symbol">₹</span>
                      <TextInput
                        className="bill-text-input"
                        onChange={(e) => onChangeAmount(e.target.value)}
                        value={amount}
                        disable={getTotal() === 0}
                        type="number"
                      />
                    </div>
                    {formError && (
                      <span className="bill-error-message">
                        {formError === "CS_CANT_PAY_BELOW_MIN_AMOUNT"
                          ? `${t(formError)}: ₹${minAmountPayable}`
                          : t(formError)}
                      </span>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  className="bill-submit-btn"
                  disabled={!paymentAllowed || getTotal() === 0}
                  onClick={onSubmit}
                >
                  {t("CS_COMMON_PROCEED_TO_PAY")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </React.Fragment>
  );
};

export default BillDetails;
