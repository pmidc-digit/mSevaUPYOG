import React, { useEffect, useState } from "react";
import { RadioButtons, FormComposer, Dropdown, CardSectionHeader, Loader, Toast, Card, Header } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useHistory, useParams, useRouteMatch, useLocation } from "react-router-dom";
import { useQueryClient } from "react-query";
import { useCashPaymentDetails } from "../../../common/src/payments/employee/payment-collect/ManualReciept";
import { useCardPaymentDetails } from "../../../common/src/payments/employee/payment-collect/card";
import { useChequeDetails } from "../../../common/src/payments/employee/payment-collect/cheque";
import isEqual from "lodash/isEqual";
import { BillDetailsFormConfig } from "../../../common/src/payments/employee/payment-collect/Bill-details/billDetails";

export const PaymentCollectionDetails = (props) => {
  // const { formData, addParams } = props;
  console.log("in collect payment")
  const userInfo = Digit.UserService.getUser();
  const { workflow: ModuleWorkflow, IsDisconnectionFlow } = Digit.Hooks.useQueryParams();
  console.log("ModuleWorkflow",ModuleWorkflow,IsDisconnectionFlow)
  const { t } = useTranslation();
  const history = useHistory();
  const queryClient = useQueryClient();
   
  const { path: currentPath } = useRouteMatch();
  let { consumerCode, businessService } = useParams();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const search = useLocation().search;
  if (window.location.href.includes("ISWSAPP")) consumerCode = new URLSearchParams(search).get("applicationNumber");
  if (window.location.href.includes("ISWSCON") || ModuleWorkflow === "WS") consumerCode = decodeURIComponent(consumerCode);

  const { data: paymentdetails, isLoading } = Digit.Hooks.useFetchPayment({ tenantId: tenantId, consumerCode, businessService });
  const bill = paymentdetails?.Bill ? paymentdetails?.Bill[0] : {};
  const { data: applicationData } = Digit.Hooks.fsm.useSearch(
    tenantId,
    { applicationNos: consumerCode },
    { staleTime: Infinity, enabled: businessService?.toUpperCase()?.includes("FSM") ? true : false }
  );

  const advanceBill = applicationData?.advanceAmount;

  // const { data: applicationData } = Digit.Hooks.fsm.useSearch(tenantId, { applicationNos: consumerCode }, { staleTime: Infinity });
  // const advanceBill = applicationData?.advanceAmount;

  // const { isLoading: storeLoading, data: store } = Digit.Services.useStore({
  //   stateCode: props.stateCode,
  //   moduleCode: businessService.split(".")[0],
  //   language: Digit.StoreData.getCurrentLanguage(),
  // });

  const { cardConfig } = useCardPaymentDetails(props, t);
  const { chequeConfig } = useChequeDetails(props, t);
  const { cashConfig } = useCashPaymentDetails(props, t);

  const [formState, setFormState] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (paymentdetails?.Bill && paymentdetails.Bill.length === 0) {
      setToast({ key: "error", action: "CS_BILL_NOT_FOUND" });
    }
  }, [paymentdetails]);

  const defaultPaymentModes = [
    { code: "CASH", label: t("COMMON_MASTERS_PAYMENTMODE_CASH") },
    { code: "CHEQUE", label: t("COMMON_MASTERS_PAYMENTMODE_CHEQUE") },
    { code: "CARD", label: t("COMMON_MASTERS_PAYMENTMODE_CREDIT/DEBIT CARD") },
    // { code: "DD", label: "Demand Draft" },
    // { code: "OFFLINE_NEFT", label: "Offline NEFT" },
    // { code: "OFFLINE_RTGS", label: "Offline RTGS" },
    // { code: "POSTAL_ORDER", label: "Postal Order" },
  ];

  const formConfigMap = {
    CHEQUE: chequeConfig,
    CARD: cardConfig,
  };

  useEffect(() => {
    props.setLink(t("PAYMENT_COLLECT_LABEL"));
  }, []);

  const getPaymentModes = () => defaultPaymentModes;
  const paidByMenu = [
    { code: "OWNER", name: t("COMMON_OWNER") },
    { code: "OTHER", name: t("COMMON_OTHER") },
  ];
  const [selectedPaymentMode, setPaymentMode] = useState(formState?.selectedPaymentMode || getPaymentModes()[0]);
  const [selectedPaidBy, setselectedPaidBy] = useState(formState?.paidBy || { code: "OWNER", name: t("COMMON_OWNER") });

  // const onSubmit = async (data) => {
  //   bill.totalAmount = Math.round(bill.totalAmount);
  //   data.paidBy = data.paidBy.code;

  //   if (
  //     BillDetailsFormConfig({ consumerCode, businessService }, t)[
  //       ModuleWorkflow ? (businessService === "SW" && ModuleWorkflow === "WS" ? businessService : ModuleWorkflow) : businessService
  //     ] &&
  //     !data?.amount?.paymentAllowed
  //   ) {
  //     let action =
  //       data?.amount?.error === "CS_CANT_PAY_BELOW_MIN_AMOUNT"
  //         ? t(data?.amount?.error) + "- " + data?.amount?.minAmountPayable
  //         : t(data?.amount?.error);

  //     setToast({
  //       key: "error",
  //       action,
  //     });
  //     return;
  //   }

  //   const { ManualRecieptDetails, paymentModeDetails, ...rest } = data;
  //   const { errorObj, ...details } = paymentModeDetails || {};

  //   let recieptRequest = {
  //     Payment: {
  //       mobileNumber: data.payerMobile,
  //       paymentDetails: [
  //         {
  //           businessService,
  //           billId: bill.id,
  //           totalDue: bill.totalAmount,
  //           totalAmountPaid: data?.amount?.amount || bill.totalAmount,
  //         },
  //       ],
  //       tenantId: bill.tenantId,
  //       totalDue: bill.totalAmount,
  //       totalAmountPaid: data?.amount?.amount || bill.totalAmount,
  //       paymentMode: data.paymentMode.code,
  //       payerName: data.payerName,
  //       paidBy: data.paidBy,
  //     },
  //   };
  //   if (advanceBill !== null && (applicationData?.applicationStatus === "PENDING_APPL_FEE_PAYMENT" || applicationData?.applicationStatus === "PENDING_APPL_FEE_PAYMENT_CITIZEN") && !applicationData.paymentPreference) {
  //     (recieptRequest.Payment.paymentDetails[0].totalAmountPaid = advanceBill),
  //       (recieptRequest.Payment.totalAmountPaid = advanceBill),
  //       (recieptRequest.Payment.totalDue = bill.totalAmount);
  //   }

  //   if (data.ManualRecieptDetails.manualReceiptDate) {
  //     recieptRequest.Payment.paymentDetails[0].manualReceiptDate = new Date(ManualRecieptDetails.manualReceiptDate).getTime();
  //   }
  //   if (data.ManualRecieptDetails.manualReceiptNumber) {
  //     recieptRequest.Payment.paymentDetails[0].manualReceiptNumber = ManualRecieptDetails.manualReceiptNumber;
  //   }
  //   recieptRequest.Payment.paymentMode = data?.paymentMode?.code;

  //   if (data.paymentModeDetails) {
  //     recieptRequest.Payment = { ...recieptRequest.Payment, ...details };
  //     delete recieptRequest.Payment.paymentModeDetails;
  //     if (data.paymentModeDetails.errorObj) {
  //       const errors = data.paymentModeDetails.errorObj;
  //       const messages = Object.keys(errors)
  //         .map((e) => t(errors[e]))
  //         .join();
  //       if (messages) {
  //         setToast({ key: "error", action: `${messages} ${t("ES_ERROR_REQUIRED")}` });
  //         setTimeout(() => setToast(null), 5000);
  //         return;
  //       }
  //     }
  //     if (data.errorMsg) setToast({ key: "error", action: t(errorMsg) });

  //     recieptRequest.Payment.instrumentDate = new Date(recieptRequest?.Payment?.instrumentDate).getTime();
  //     recieptRequest.Payment.transactionNumber = data.paymentModeDetails.transactionNumber;
  //   }

  //   if (data?.paymentModeDetails?.transactionNumber) {
  //     if (data.paymentModeDetails.transactionNumber !== data.paymentModeDetails.reTransanctionNumber && ["CARD"].includes(data.paymentMode.code)) {
  //       setToast({ key: "error", action: t("ERR_TRASACTION_NUMBERS_DONT_MATCH") });
  //       setTimeout(() => setToast(null), 5000);
  //       return;
  //     }
  //     delete recieptRequest.Payment.last4Digits;
  //     delete recieptRequest.Payment.reTransanctionNumber;
  //   }

  //   if (
  //     recieptRequest.Payment?.instrumentNumber?.length &&
  //     recieptRequest.Payment?.instrumentNumber?.length < 6 &&
  //     recieptRequest?.Payment?.paymentMode === "CHEQUE"
  //   ) {
  //     setToast({ key: "error", action: t("ERR_CHEQUE_NUMBER_LESS_THAN_6") });
  //     setTimeout(() => setToast(null), 5000);
  //     return;
  //   }

  //   try {
  //     const resposne = await Digit.PaymentService.createReciept(tenantId, recieptRequest);
  //     queryClient.invalidateQueries();
  //     history.push(
  //       IsDisconnectionFlow ? `${props.basePath}/success/${businessService}/${resposne?.Payments[0]?.paymentDetails[0]?.receiptNumber.replace(/\//g, "%2F")}/${
  //         resposne?.Payments[0]?.paymentDetails[0]?.bill?.consumerCode
  //       }?IsDisconnectionFlow=${IsDisconnectionFlow}` : 
  //       `${props.basePath}/success/${businessService}/${resposne?.Payments[0]?.paymentDetails[0]?.receiptNumber.replace(/\//g, "%2F")}/${
  //         resposne?.Payments[0]?.paymentDetails[0]?.bill?.consumerCode
  //       }?IsDisconnectionFlow=${IsDisconnectionFlow}`
  //     );
  //   } catch (error) {
  //     setToast({ key: "error", action: error?.response?.data?.Errors?.map((e) => t(e.code)) })?.join(" , ");
  //     setTimeout(() => setToast(null), 5000);
  //     return;
  //   }
  // };
  const onSubmit = async (d) => {
    console.log("d",d)
    const filterData = {
      Transaction: {
        tenantId: bill?.tenantId,
        txnAmount:bill?.totalAmount,
        module: businessService,
        businessService:businessService,
        billId: bill?.id,
        consumerCode: consumerCode,
        productInfo: "Common Payment",
        //gateway: d?.paymentType || "AXIS",
        gateway:"RAZORPAY",
        taxAndPayments: [
          {
            billId: bill?.id,
            amountPaid: d?.amount?.amount || bill?.totalAmount,
          },
        ],
        user: {
          name:  userInfo?.info?.name || d?.payerName,
          mobileNumber: d?.mobileNumber || userInfo?.info?.mobileNumber || d?.mobileNumber,
          tenantId: bill?.tenantId,
          emailId: bill?.payerEmail
        },
        // success
        callbackUrl: window.location.href.includes("mcollect") || businessService === "WNS"
          ? `${window.location.protocol}//${window.location.host}/digit-ui/citizen/payment/success/${businessService}/${businessService === "WNS"? consumerCode:consumerCode}/${tenantId}}`
          : `${window.location.protocol}//${window.location.host}/digit-ui/citizen/payment/success/${businessService}/${businessService === "WNS"? encodeURIComponent(consumerCode):consumerCode}/${tenantId}`,
        additionalDetails: {
          isWhatsapp: false,
        },
      },
    };

    try {
      const data = await Digit.PaymentService.createCitizenReciept(bill?.tenantId, filterData);
      const redirectUrl = data?.Transaction?.redirectUrl;
        localStorage.setItem("BillPaymentEnabled", "true");
      // if (d?.paymentType == "AXIS") {
        window.location = redirectUrl;
      // }
      // else if (d?.paymentType == "NTTDATA") {
      //   let redirect= redirectUrl.split("returnURL=")
      //   let url=redirect[0].split("?")[1].split("&")
      //   const options = {
      //     "atomTokenId": url[0].split("=")[1],
      //     "merchId": url[1].split("=")[1],
      //     "custEmail": "sriranjan.srivastava@owc.com",
      //     "custMobile": url[3].split("=")[1],
      //     "returnUrl": redirect[1]
      //   }
      //   let atom = new AtomPaynetz(options, 'uat');
      // }
      // else {
      //   // new payment gatewayfor UPYOG pay
      //   try {
      //     const gatewayParam = redirectUrl
      //       ?.split("?")
      //       ?.slice(1)
      //       ?.join("?")
      //       ?.split("&")
      //       ?.reduce((curr, acc) => {
      //         var d = acc.split("=");
      //         curr[d[0]] = d[1];
      //         return curr;
      //       }, {});
      //     var newForm = $("<form>", {
      //       action: gatewayParam.txURL,
      //       method: "POST",
      //       target: "_top",
      //     });
      //     const orderForNDSLPaymentSite = [
      //       "checksum",
      //       "messageType",
      //       "merchantId",
      //       "serviceId",
      //       "orderId",
      //       "customerId",
      //       "transactionAmount",
      //       "currencyCode",
      //       "requestDateTime",
      //       "successUrl",
      //       "failUrl",
      //       "additionalField1",
      //       "additionalField2",
      //       "additionalField3",
      //       "additionalField4",
      //       "additionalField5",
      //     ];

      //     // override default date for UPYOG Custom pay
      //     gatewayParam["requestDateTime"] = gatewayParam["requestDateTime"]?.split(new Date().getFullYear()).join(`${new Date().getFullYear()} `);

      //     gatewayParam["successUrl"]= redirectUrl?.split("successUrl=")?.[1]?.split("eg_pg_txnid=")?.[0]+'eg_pg_txnid=' +gatewayParam?.orderId;
      //     gatewayParam["failUrl"]= redirectUrl?.split("failUrl=")?.[1]?.split("eg_pg_txnid=")?.[0]+'eg_pg_txnid=' +gatewayParam?.orderId;
      //     // gatewayParam["successUrl"]= data?.Transaction?.callbackUrl;
      //     // gatewayParam["failUrl"]= data?.Transaction?.callbackUrl;

      //     // var formdata = new FormData();

      //     for (var key of orderForNDSLPaymentSite) {

      //       // formdata.append(key,gatewayParam[key]);

      //       newForm.append(
      //         $("<input>", {
      //           name: key,
      //           value: gatewayParam[key],
      //           // type: "hidden",
      //         })
      //       );
      //     }
      //     $(document.body).append(newForm);
      //     newForm.submit();

      //     makePayment(gatewayParam.txURL,newForm);

      //   } catch (e) {
      //     console.log("Error in payment redirect ", e);
      //     //window.location = redirectionUrl;
      //   }
      // }
     // window.location = redirectUrl;
    } catch (error) {
      let messageToShow = "CS_PAYMENT_UNKNOWN_ERROR_ON_SERVER";
      if (error.response?.data?.Errors?.[0]) {
        const { code, message } = error.response?.data?.Errors?.[0];
        messageToShow = code;
      }
      console.log("err",error)
     // setShowToast({ key: true, label: t(messageToShow) });
    }
  };
  useEffect(() => {
    document?.getElementById("paymentInfo")?.scrollIntoView({ behavior: "smooth" });
    document?.querySelector("#paymentInfo + .label-field-pair input")?.focus();
  }, [selectedPaymentMode]);

  let config = [
    {
      head: !ModuleWorkflow && businessService !== "TL" ? t("COMMON_PAYMENT_HEAD") : "",
      body: [
        {
          label: t("PAY_TOTAL_AMOUNT"),
          populators: <CardSectionHeader style={{ marginBottom: 0, textAlign: "right" }}> {`₹ ${bill?.totalAmount}`} </CardSectionHeader>,
        },
      ],
    },
    {
      head: t("PAYMENT_PAID_BY_HEAD"),
      body: [
        {
          label: t("PAYMENT_PAID_BY_LABEL"),
          isMandatory: true,
          type: "custom",
          populators: {
            name: "paidBy",
            customProps: { t, isMendatory: true, option: paidByMenu, optionKey: "name" },
            component: (props, customProps) => (
              <Dropdown
                {...customProps}
                selected={props.value}
                select={(d) => {
                  if (d.name == paidByMenu[0].name) {
                    props.setValue("payerName", bill?.payerName);
                    // SM-1953: commenting to resolve showing mobile number when selecting the owner option
                    // props.setValue("payerMobile", bill?.mobileNumber);
                  } else {
                    props.setValue("payerName", "");
                    props.setValue("payerMobile", "");
                  }
                  props.onChange(d);
                  setselectedPaidBy(d);
                }}
              />
            ),
            defaultValue: formState?.paidBy || paidByMenu[0],
          },
        },
        {
          label: t("PAYMENT_PAYER_NAME_LABEL"),
          isMandatory: true,
         // disable: selectedPaidBy?.code === "OWNER" && (bill?.payerName || formState?.payerName) ? true : false,
         disable:false,
          type: "text",
          populators: {
            name: "payerName",
            validation: {
              required: true,
              pattern: /^[A-Za-z]/,
            },
            error: t("PAYMENT_INVALID_NAME"),
            defaultValue: bill?.payerName || formState?.payerName || "",
            className: "payment-form-text-input-correction",
          },
        },
        {
          label: t("PAYMENT_PAYER_MOB_LABEL"),
          isMandatory: true,
          type: "text",
          populators: {
            name: "payerMobile",
            validation: {
              required: true,
              pattern: /^[6-9]\d{9}$/,
            },
            error: t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID"),
             defaultValue: bill?.mobileNumber || formState?.mobileNumber || "",
            className: "payment-form-text-input-correction",
          },
        },
      ],
    },
    // {
    //   head: t("PAYMENT_MODE_HEAD"),
    //   body: [
    //     {
    //       label: t("PAYMENT_MODE_LABEL"),
    //       type: "custom",
    //       populators: {
    //         name: "paymentMode",
    //         customProps: {
    //           options: getPaymentModes(),
    //           optionsKey: "label",
    //           style: { display: "flex", flexWrap: "wrap" },
    //           innerStyles: { minWidth: "33%" },
    //         },
    //         defaultValue: formState?.paymentMode || getPaymentModes()[0],
    //         component: (props, customProps) => (
    //           <RadioButtons
    //             selectedOption={props.value}
    //             onSelect={(d) => {
    //               props.onChange(d);
    //             }}
    //             {...customProps}
    //           />
    //         ),
    //       },
    //     },
    //   ],
    // },
  ];

  const getDefaultValues = () => ({
    payerName: bill?.payerName || formState?.payerName || "",
  });

  const getFormConfig = () => {
    
    if (
      BillDetailsFormConfig({ consumerCode, businessService }, t)[
        ModuleWorkflow ? (businessService === "SW" && ModuleWorkflow === "WS" ? businessService : ModuleWorkflow) : businessService
      ] ||
      ModuleWorkflow ||
      businessService === "TL" ||
      businessService.includes("ONE_TIME_FEE")
    ) {
      config.splice(0, 1);
    }
    let conf= config
    console.log("formconfig",BillDetailsFormConfig({ consumerCode, businessService }, t)[
          ModuleWorkflow ? (businessService === "SW" && ModuleWorkflow === "WS" ? businessService : ModuleWorkflow) : businessService
        ].concat(conf))
    // let conf = config.concat(formConfigMap[formState?.paymentMode?.code] || []);
    // conf = conf?.concat(cashConfig);
    return BillDetailsFormConfig({ consumerCode, businessService }, t)[
      ModuleWorkflow ? (businessService === "SW" && ModuleWorkflow === "WS" ? businessService : ModuleWorkflow) : businessService
    ]
      ? BillDetailsFormConfig({ consumerCode, businessService }, t)[
          ModuleWorkflow ? (businessService === "SW" && ModuleWorkflow === "WS" ? businessService : ModuleWorkflow) : businessService
        ].concat(conf)
      : conf;
    
  };
  const checkFSM = window.location.href.includes("FSM");

  if (isLoading) {
    return <Loader />;
  }

  return (
    <React.Fragment>
         <div style={{display:'flex',gap:'10px'}}>
      <Header styles={{ marginLeft: "15px" }}>{checkFSM ? t("PAYMENT_COLLECT_LABEL") : t("Payment Information")}</Header>
       <h1 style={{fontSize:'18px',border:'1px solid grey',padding:'8px',backgroundColor:'grey',color:'white'}}>Unique Property ID: {consumerCode}</h1>
     </div>
      <FormComposer
        cardStyle={{ paddingBottom: "100px" }}
        label={t("PAYMENT_COLLECT_LABEL")}
        config={getFormConfig()}
        onSubmit={onSubmit}
        formState={formState}
        defaultValues={getDefaultValues()}
        isDisabled={IsDisconnectionFlow ? false : businessService === "SW" || "WS" ?false:bill?.totalAmount ? !bill.totalAmount > 0 : true}
        // isDisabled={BillDetailsFormConfig({ consumerCode }, t)[businessService] ? !}
        onFormValueChange={(setValue, formValue) => {
          if (!isEqual(formValue.paymentMode, selectedPaymentMode)) {
            setFormState(formValue);
            setPaymentMode(formState.paymentMode);
          }
        }}
      ></FormComposer>
      {toast && (
        <Toast
          error={toast.key === "error"}
          label={t(toast.key === "success" ? `ES_${businessService.split(".")[0].toLowerCase()}_${toast.action}_UPDATE_SUCCESS` : toast.action)}
          onClose={() => setToast(null)}
          style={{ maxWidth: "670px" }}
        />
      )}
    </React.Fragment>
  );
};
