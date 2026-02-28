import React, { useEffect, useState } from "react";
import {
  Header,
  Card,
  RadioButtons,
  SubmitBar,
  BackButton,
  CardLabel,
  CardLabelDesc,
  CardSectionHeader,
  InfoBanner,
  Loader,
  Toast,
  CardText,
  LabelFieldPair,
  Dropdown,
  TextInput,
  MobileNumber,
} from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { useParams, useHistory, useLocation, Redirect } from "react-router-dom";
import { stringReplaceAll } from "../../citizen/bills/routes/bill-details/utils";
// import { stringReplaceAll } from "../bills/routes/bill-details/utils";
import _ from "lodash";
import {
  MERCHENT_KEY,
  ORDER_ID,
  POPUP_DIPSPLAY_IMAGE,
  POPUP_DIPSPLAY_NAME,
  RAZORPAY_CALLBACK_URL_KEYS,
  RAZORPAY_LOADSCRIPT_URL,
  TRANSACTION_AMMOUNT,
  TRANSACTION_BUSINESSSERVICE,
  TRANSACTION_CALLBACKURL,
  TRANSACTION_REDIRECTURL,
  TRANSACTION_USER_EMAIL,
  TRANSACTION_USER_MOBILE,
  TRANSACTION_USERNAME,
} from "../../../constants/razorpayConstants";
import { gatewayType } from "../../../constants/gatewayTypeConstants";

export const SelectPaymentType = (props) => {
  const { state = {} } = useLocation();
  const userInfo = Digit.UserService.getUser();
  const [showToast, setShowToast] = useState(null);
  const [showOwnerToast, setShowOwnerToast] = useState(null);
  const { tenantId: __tenantId, authorization, workflow: wrkflow, consumerCode: connectionNo } = Digit.Hooks.useQueryParams();
  const paymentAmount = state?.paymentAmount;
  const { t } = useTranslation();
  const history = useHistory();
  const { pathname, search } = useLocation();
  // const menu = ["RAZORPAY"];
  let { consumerCode, businessService } = useParams();
  const tenantId = state?.tenantId || __tenantId || Digit.ULBService.getCurrentTenantId();
  const propertyId = state?.propertyId;
  const stateTenant = Digit.ULBService.getStateId();
  const { control, handleSubmit, setValue } = useForm();
  // const moduleName = tenantId?.split(".")?.[1];
  const moduleName = "testing"; //need to change this back to testing -> tenantId?.split(".")?.[1];
  // const { data: menu2, isLoading } = Digit.Hooks.useCommonMDMS("pb", "testing", "PaymentGateway");
  // const { data: menuList } = Digit.Hooks.useCustomMDMS(tenantId, moduleName, [{ name: "PaymentGateway" }]);
  const { data: menuList, isLoading } = Digit.Hooks.useCustomMDMS(tenantId, "PAYMENT", [{ name: "PaymentGateway" }]); // will change back to pb.testing -> tenantId
  console.log("menuList", menuList);

  const [isPaymentLoading, setPaymentLoading] = useState(false);
  const { data: paymentdetails, isLoading: paymentLoading } = Digit.Hooks.useFetchPayment(
    { tenantId: tenantId, consumerCode: wrkflow === "WNS" ? connectionNo : consumerCode, businessService },
    {}
  );
  if (window.location.href.includes("ISWSCON") || wrkflow === "WNS") consumerCode = decodeURIComponent(consumerCode);
  if (wrkflow === "WNS") consumerCode = stringReplaceAll(consumerCode, "+", "/");
  useEffect(() => {
    if (paymentdetails?.Bill && paymentdetails.Bill.length == 0) {
      setShowToast({ key: true, label: "CS_BILL_NOT_FOUND" });
    }
  }, [paymentdetails]);
  useEffect(() => {
    localStorage.setItem("BillPaymentEnabled", "true");
  }, []);
  const { name, mobileNumber } = state;

  const billDetails = paymentdetails?.Bill ? paymentdetails?.Bill[0] : {};
  console.log(billDetails, "BILL");

  const userOptions = ["OWNER", "OTHER"];

  const onSubmit = async (d) => {
    if (!d?.name || d?.name.trim() === "") {
      setShowOwnerToast({ key: true, label: t("PAYMENT_NAME_MANDATORY_MESSAGE") });
      return;
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!d?.mobileNumber || d?.mobileNumber.trim() === "") {
      setShowOwnerToast({ key: true, label: t("PAYMENT_MOBILE_NUMBER_MANDATORY_MESSAGE") });
      return;
    } else if (!mobileRegex.test(d.mobileNumber)) {
      setShowOwnerToast({ key: true, label: t("ERR_INVALID_MOBILE") });
      return;
    }

    setPaymentLoading(true);

    // const baseURL = process.env.REACT_APP_BASE_URL;
    const baseURL = document.location.origin;
    console.log("BASEURLINPAYMENT", baseURL);

    const filterData = {
      Transaction: {
        tenantId: billDetails?.tenantId,
        txnAmount: paymentAmount || billDetails.totalAmount,
        module: businessService,
        businessService: businessService,
        billId: billDetails.id,
        consumerCode: consumerCode,
        productInfo: "Common Payment",
        gateway: d?.paymentType,
        taxAndPayments: [
          {
            taxAmount: paymentAmount || billDetails.totalAmount,
            billId: billDetails.id,
            amountPaid: paymentAmount || billDetails.totalAmount,
            businessService: businessService,
          },
        ],
        user: {
          name: d?.name,
          mobileNumber: d?.mobileNumber,
          tenantId: billDetails?.tenantId,
          // emailId: "sriranjan.srivastava@owc.com"
        },
        // success
        // callbackUrl: window.location.href.includes("mcollect") || wrkflow === "WNS"
        //   ? `${window.location.protocol}//${window.location.host}/digit-ui/citizen/payment/success/${businessService}/${wrkflow === "WNS"? consumerCode:consumerCode}/${tenantId}?workflow=${wrkflow === "WNS"? wrkflow : "mcollect"}`
        //   : `${window.location.protocol}//${window.location.host}/digit-ui/citizen/payment/success/${businessService}/${wrkflow === "WNS"? encodeURIComponent(consumerCode):consumerCode}/${tenantId}?propertyId=${consumerCode}`,
        // callbackUrl: (paymentAmount === 0 || billDetails.totalAmount === 0) ?
        // window.location.href.includes("mcollect") || wrkflow === "WNS"
        //   ? `${window.location.protocol}//${window.location.host}/digit-ui/citizen/payment/zero/${businessService}/${wrkflow === "WNS"? consumerCode:consumerCode}/${tenantId}?workflow=${wrkflow === "WNS"? wrkflow : "mcollect"}`
        //   : `${window.location.protocol}//${window.location.host}/digit-ui/citizen/payment/zero/${businessService}/${wrkflow === "WNS"? encodeURIComponent(consumerCode):consumerCode}/${tenantId}?propertyId=${consumerCode}`:
        // window.location.href.includes("mcollect") || wrkflow === "WNS"
        //   ? `${window.location.protocol}//${window.location.host}/digit-ui/citizen/payment/success/${businessService}/${wrkflow === "WNS"? consumerCode:consumerCode}/${tenantId}?workflow=${wrkflow === "WNS"? wrkflow : "mcollect"}`
        //   : `${window.location.protocol}//${window.location.host}/digit-ui/citizen/payment/success/${businessService}/${wrkflow === "WNS"? encodeURIComponent(consumerCode):consumerCode}/${tenantId}?propertyId=${consumerCode}`,
        callbackUrl: `${baseURL}/digit-ui/employee/payment/challan/success/${businessService}`,

        // `${props.basePath}/success/${businessService}/${resposne?.Payments[0]?.paymentDetails[0]?.receiptNumber.replace(/\//g, "%2F")}/${
        //       resposne?.Payments[0]?.paymentDetails[0]?.bill?.consumerCode
        //     }?IsDisconnectionFlow=${IsDisconnectionFlow}`,
        // paymentAmount === 0 || billDetails.totalAmount === 0
        //   ? window.location.href.includes("mcollect") || wrkflow === "WNS"
        //     ? `${baseURL}/digit-ui/citizen/payment/zero/${businessService}/${
        //         wrkflow === "WNS" ? consumerCode : consumerCode
        //       }/${tenantId}?workflow=${wrkflow === "WNS" ? wrkflow : "mcollect"}`
        //     : `${baseURL}/digit-ui/citizen/payment/zero/${businessService}/${
        //         wrkflow === "WNS" ? encodeURIComponent(consumerCode) : consumerCode
        //       }/${tenantId}?propertyId=${consumerCode}`
        //   : window.location.href.includes("mcollect") || wrkflow === "WNS"
        //   ? `${baseURL}/digit-ui/citizen/payment/success/${businessService}/${
        //       wrkflow === "WNS" ? consumerCode : consumerCode
        //     }/${tenantId}?workflow=${wrkflow === "WNS" ? wrkflow : "mcollect"}`
        //   : `${baseURL}/digit-ui/citizen/payment/success/${businessService}/${
        //       wrkflow === "WNS" ? encodeURIComponent(consumerCode) : consumerCode
        //     }/${tenantId}?propertyId=${consumerCode}`,
        additionalDetails: {
          isWhatsapp: false,
          paidBy: d?.paidBy, // Need To change
        },
      },
    };
    console.log("coming here", filterData);
    try {
      const data = await Digit.PaymentService.createCitizenReciept(billDetails?.tenantId, filterData);
      console.log("data=========", data);
      if (paymentAmount === 0 || billDetails.totalAmount === 0) {
        setPaymentLoading(false);
        if (data?.ResponseInfo?.status === "SUCCESSFUL") {
          window.location.href = data?.Transaction?.callbackUrl;
        } else {
          window.location.href = "/digit-ui/citizen/payment/failure";
        }
        return;
      }

      if (d?.paymentType === gatewayType.RAZORPAY) {
        displayRazorpay(data);
      } else {
        //Do Nothing
        setPaymentLoading(false);
      }
    } catch (error) {
      console.log("error", error);
      let messageToShow = "CS_PAYMENT_UNKNOWN_ERROR_ON_SERVER";
      if (error.response?.data?.Errors?.[0]) {
        const { code, message } = error.response?.data?.Errors?.[0];
        messageToShow = code;
      }
      setPaymentLoading(false);
      setShowToast({ key: true, label: t(messageToShow) });
    }
  };

  async function displayRazorpay(getOrderData) {
    const res = await loadScript(RAZORPAY_LOADSCRIPT_URL);

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    function getQueryVariable(variable) {
      const query = _.get(getOrderData, TRANSACTION_REDIRECTURL);
      var vars = query.split("&");
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
          return pair[1];
        }
      }
      return false;
    }
    const options = {
      key: getQueryVariable(MERCHENT_KEY),
      amount: _.get(getOrderData, TRANSACTION_AMMOUNT) * 100,
      //currency: getQueryVariable('currency'),
      name: POPUP_DIPSPLAY_NAME,
      description: _.get(getOrderData, TRANSACTION_BUSINESSSERVICE) + " Charge Collection",
      image: POPUP_DIPSPLAY_IMAGE,
      order_id: getQueryVariable(ORDER_ID),
      handler: async function (response) {
        const data = {
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        };

        window.location =
          _.get(getOrderData, TRANSACTION_CALLBACKURL) +
          RAZORPAY_CALLBACK_URL_KEYS.PAYMENT_ID +
          data.razorpayPaymentId +
          RAZORPAY_CALLBACK_URL_KEYS.ORDER_ID +
          data.razorpayOrderId +
          RAZORPAY_CALLBACK_URL_KEYS.SIGNATURE +
          data.razorpaySignature;
      },
      prefill: {
        name: _.get(getOrderData, TRANSACTION_USERNAME),
        email: _.get(getOrderData, TRANSACTION_USER_EMAIL),
        contact: _.get(getOrderData, TRANSACTION_USER_MOBILE),
      },
      theme: {
        color: "#61dafb",
      },
    };

    const paymentObject = new window.Razorpay(options);
    setPaymentLoading(false);
    paymentObject.open();
  }

  function loadScript(src) {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  if (authorization === "true" && !userInfo.access_token) {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = `/digit-ui/citizen/login?from=${encodeURIComponent(pathname + search)}`;
  }

  if (paymentLoading || isPaymentLoading || isLoading) {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // for smooth scrolling
    });
    return <Loader />;
  }

  return (
    <React.Fragment>
      {/* <BackButton>{t("CS_COMMON_BACK")}</BackButton> */}
      <form style={{ padding: "20px" }} onSubmit={handleSubmit(onSubmit)}>
        <Header>{t("PAYMENT_CS_HEADER")}</Header>
        <Card>
          <div className="payment-amount-info" style={{ marginBottom: "26px" }}>
            <CardLabel className="dark">{t("PAYMENT_CS_TOTAL_AMOUNT_DUE")}</CardLabel>
            <CardSectionHeader>
              {" "}
              ₹ {paymentAmount !== undefined ? Number(paymentAmount).toFixed(2) : Number(billDetails?.totalAmount).toFixed(2)}
            </CardSectionHeader>
          </div>
          <CardLabel>{t("PAYMENT_CS_SELECT_METHOD")}</CardLabel>
          {menuList?.PAYMENT?.PaymentGateway?.length && (
            <Controller
              name="paymentType"
              defaultValue={menuList?.PAYMENT?.PaymentGateway?.[0]?.gateway}
              control={control}
              render={(props) => (
                <RadioButtons
                  selectedOption={props.value}
                  options={menuList?.PAYMENT?.PaymentGateway?.map((item) => item?.gateway)}
                  onSelect={props.onChange}
                />
              )}
            />
          )}
        </Card>
        <Card>
          <div className="payment-amount-info" style={{ marginBottom: "26px" }}>
            <CardLabel className="dark">{t("PAYMENT_CS_PAYER_DETAILS")}</CardLabel>
          </div>
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("PAYMENT_CS_PAID_BY")} * `}</CardLabel>
            <Controller
              name={"paidBy"}
              defaultValue={userOptions[0]}
              control={control}
              render={(props) => (
                <Dropdown
                  selected={props.value}
                  option={userOptions}
                  select={(val) => {
                    if (val === "OWNER") {
                      props.onChange(val);
                      setValue("name", name || billDetails?.payerName || "");
                      setValue("mobileNumber", mobileNumber || billDetails?.mobileNumber || "");
                    } else if (val === "OTHER") {
                      props.onChange(val);
                      setValue("name", "");
                      setValue("mobileNumber", "");
                    }
                  }}
                />
              )}
            />
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("PAYMENT_CS_PAYER_NAME")} * `}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={"name"}
                defaultValue={name || billDetails?.payerName || ""}
                render={(props) => (
                  <TextInput
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                  />
                )}
              />
            </div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("PAYMENT_CS_PAYER_NUMBER")} * `}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={"mobileNumber"}
                defaultValue={mobileNumber || billDetails?.mobileNumber || ""}
                render={(props) => (
                  <MobileNumber
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e);
                    }}
                    componentInFront={<div className="employee-card-input employee-card-input--front numberdisplay">+91</div>}
                  />
                )}
              />
            </div>
          </LabelFieldPair>
        </Card>
        {!showToast && (
          <Card>
            <SubmitBar label={t("PAYMENT_CS_BUTTON_LABEL")} submit={true} />
          </Card>
        )}
      </form>
      <InfoBanner label={t("CS_COMMON_INFO")} text={t("CS_PAYMENT_REDIRECT_NOTICE")} />
      {showToast && (
        <Toast
          error={showToast.key}
          label={t(showToast.label)}
          onClose={() => {
            setShowToast(null);
          }}
          isDleteBtn={true}
        />
      )}
      {showOwnerToast && (
        <Toast
          isDleteBtn={true}
          error={showOwnerToast.key}
          label={t(showOwnerToast.label)}
          onClose={() => {
            setShowOwnerToast(null);
          }}
        />
      )}
    </React.Fragment>
  );
};
