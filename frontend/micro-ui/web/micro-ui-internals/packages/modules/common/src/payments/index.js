import { Loader } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { useRouteMatch } from "react-router-dom";
import CitizenPayment from "./citizen";
import { getKeyNotesConfig } from "./citizen/keynotesConfig";
import EmployeePayment from "./employee";

export const PaymentModule = ({ deltaConfig = {}, stateCode, cityCode, moduleCode = "Payment", userType }) => {
  const { path, url } = useRouteMatch();
  const store = { data: {} }; //Digit.Services.useStore({}, { deltaConfig, stateCode, cityCode, moduleCode, language });

  if (Object.keys(store).length === 0) {
    return <Loader />;
  }

  const getPaymentHome = () => {
    if (userType === "citizen") return <CitizenPayment {...{ stateCode, moduleCode, cityCode, path, url }} />;
    else return <EmployeePayment {...{ stateCode, cityCode, moduleCode }} />;
  };
  return <React.Fragment>{getPaymentHome()}</React.Fragment>;
};

export const PaymentLinks = ({ matchPath }) => {
  const { t } = useTranslation();
  return null;
};

export const paymentConfigs = {
  getBillDetailsConfigWithBusinessService: getKeyNotesConfig,
};

export const getCurrentEpoch = () => Date.now();

export const groupKeyForCart = (c) =>
  `${c.location || "NA"}|${c.advertisementId || "NA"}|${c.addType || "NA"}|${c.faceArea || "NA"}|${c.advertisementName || "NA"}|${c.poleNo || "NA"}`;

export const transformBookingResponseToBookingData = (apiResponse = {}) => {
  const resp = apiResponse || {};
  const apps = Array.isArray(resp.bookingApplication) ? resp.bookingApplication : [];

  const transformedApps = apps.map((app) => {
    const out = {};

    const copyFields = [
      "bookingNo",
      "paymentDate",
      "draftId",
      "applicationDate",
      "tenantId",
      "receiptNo",
      "permissionLetterFilestoreId",
      "paymentReceiptFilestoreId",
      "advertisementId",
      "bookingId",
      "bookingStatus",
      "auditDetails",
      "businessService",
      "workflow",
    ];
    copyFields.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(app, k)) out[k] = app[k];
    });

    out.applicantDetail = app.applicantDetail || null;
    out.address = app.address || null;
    out.owners = app.owners || [];
    out.documents = app.documents || [];

    const cart = Array.isArray(app.cartDetails) ? app.cartDetails : [];

    const groups = cart.reduce((acc, item) => {
      const key = groupKeyForCart(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    const groupedCartDetails = Object.keys(groups).map((key) => {
      const items = groups[key];

      const sorted = items.slice().sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));

      const startDate = sorted[0]?.bookingDate || null;
      const endDate = sorted[sorted.length - 1]?.bookingDate || null;
      const numberOfDays = sorted.length;

      const first = sorted[0] || {};

      const amounts = sorted.map((s) => (typeof s.amount === "number" ? s.amount : null));
      const hasAmounts = amounts.every((a) => a !== null);
      let amount = undefined;
      let amountForDaysChosen = undefined;
      if (hasAmounts) {
        const total = amounts.reduce((acc, v) => acc + v, 0);
        amountForDaysChosen = total;
        amount = sorted.length ? Math.round((total / sorted.length) * 100) / 100 : 0;
      } else if (typeof first.amount === "number") {
        amount = first.amount;
      }

      return {
        location: first.location,
        advertisementId: first.advertisementId || first.advertisementId === 0 ? `${first.advertisementId}` : undefined,
        startDate,
        endDate,
        numberOfDays,
        addType: first.addType,
        faceArea: first.faceArea,
        nightLight: first.nightLight,
        status: first.status,
        advertisementName: first.advertisementName,
        poleNo: first.poleNo,
        amount,
        amountForDaysChosen,
      };
    });

    out.cartDetails = groupedCartDetails;
    return out;
  });

  const totalCount = transformedApps.reduce((acc, app) => {
    const sum = Array.isArray(app.cartDetails) ? app.cartDetails.reduce((s, cd) => s + (cd.numberOfDays || 0), 0) : 0;
    return acc + sum;
  }, 0);

  const bookingData = [
    {
      count: totalCount,
      currentTime: getCurrentEpoch(),
      bookingApplication: transformedApps,
    },
  ];

  return { bookingData };
};
