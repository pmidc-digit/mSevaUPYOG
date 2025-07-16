import React, { useState, useEffect } from "react";
import { TextInput, SearchIconSvg, DatePicker, CardLabelError } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
export const useQRDetails = (props, t) => {
  const config = [
    {
      head: t("PAYMENT_QR_HEAD"),
      headId: "paymentInfo",
      body: [
        {
          withoutLabel: true,
          type: "custom",
          populators: {
            name: "paymentModeDetails",
            customProps: {},
            defaultValue: { instrumentNumber: "", instrumentDate: "" },
            component: (props, customProps) => <QRDetailsComponent onChange={props.onChange} chequeDetails={props.value} {...customProps} />,
          },
        },
      ],
    },
  ];

  return { qrConfig: config };
};

// to be used in config

export const QRDetailsComponent = (props) => {
  const { t } = useTranslation();
  const [instrumentDate, setChequeDate] = useState(props.chequeDetails.instrumentDate);
  const [instrumentNumber, setChequeNo] = useState(props.chequeDetails.instrumentNumber);
  const [ifscCode, setIfsc] = useState(props.chequeDetails.ifscCode);
  const [ifscCodeError, setIfscCodeError] = useState("");
  const [bankName, setBankName] = useState(props.chequeDetails.bankName);
  const [bankBranch, setBankBranch] = useState(props.chequeDetails.bankBranch?.replace("┬á", " "));
  useEffect(() => {
    if (props.onChange) {
      let errorObj = {};
      if (!instrumentDate) errorObj.instrumentDate = "ES_COMMON_INSTRUMENT_DATE";
      if (!instrumentNumber) errorObj.instrumentNumber = "ES_COMMON_INSTR_NUMBER";
      props.onChange({ instrumentDate, instrumentNumber, ifscCode, bankName, bankBranch, errorObj, transactionNumber: instrumentNumber });
    }
  }, [bankName, bankBranch, instrumentDate, instrumentNumber]);

  const setBankDetailsFromIFSC = async () => {
    try {
      const res = await window.fetch(`https://ifsc.razorpay.com/${ifscCode}`);
      if (res.ok) {
        const { BANK, BRANCH } = await res.json();
        setBankName(BANK);
        setBankBranch(BRANCH?.replace("┬á", " "));
      } else setIfscCodeError(t("CS_PAYMENT_INCORRECT_IFSC_CODE_ERROR"));
    } catch (er) {
      setIfscCodeError(t("CS_PAYMENT_INCORRECT_IFSC_CODE_ERROR"));
    }
  };

  const handleIFSCChange = (e) => {
    setIfsc(e.target.value);
    setIfscCodeError("");
  }

  return (
    <React.Fragment>
      <div className="label-field-pair">
        <h2 className="card-label">{t("PAYMENT_TRANSACTION_NO_LABEL")} *</h2>
        <div className="field">
          <div className="field-container">
            <input
              className="employee-card-input"
              value={instrumentNumber}
              type="text"
              name="instrumentNumber"
              onChange={(e) => setChequeNo(e.target.value)}
              required
              // minlength="6"
              // maxLength="6"
            />
          </div>
        </div>
      </div>
      <div className="label-field-pair">
        <h2 className="card-label">{t("PAYMENT_TRANSACTION_DATE_LABEL")} *</h2>
        <div className="field">
          <div className="field-container">
            <DatePicker
              isRequired={true}
              date={instrumentDate}
              onChange={(d) => {
                setChequeDate(d);
              }}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
