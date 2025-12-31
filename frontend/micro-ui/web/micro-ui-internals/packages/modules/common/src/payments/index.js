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
      const GAP = 7;

      const dateRanges = [];
      if (sorted.length) {
        let rangeStart = sorted[0].bookingDate || null;
        let rangeEnd = sorted[0].bookingDate || null;

        for (let i = 1; i < sorted.length; i++) {
          const prev = new Date(rangeEnd);
          const curr = new Date(sorted[i].bookingDate);

          const diffDays = Math.round((curr - prev) / (24 * 60 * 60 * 1000));

          if (diffDays <= GAP) {
            rangeEnd = sorted[i].bookingDate;
          } else {
            dateRanges.push([rangeStart, rangeEnd]);
            rangeStart = sorted[i].bookingDate;
            rangeEnd = sorted[i].bookingDate;
          }
        }

        dateRanges.push([rangeStart, rangeEnd]);
      }
      const dateRangesFlat = dateRanges.map(([start, end]) => `${start} to ${end}`).join(", ");

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
        dateRangesFlat,
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

export const amountToWords =(num) =>{
  if (num == null || num === "") return "Zero Rupees";
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
                "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen",
                "Seventeen","Eighteen","Nineteen"],
        tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"],
        units = ["","Thousand","Lakh","Crore"];

  const chunk = n => n < 20 ? ones[n] :
                 n < 100 ? tens[Math.floor(n/10)] + (n%10? " " + ones[n%10]:"") :
                 ones[Math.floor(n/100)] + " Hundred" + (n%100? " " + chunk(n%100):"");

  const toWords = n => {
    if (!n) return "";
    let parts = [n%1000], res = "";
    n = Math.floor(n/1000);
    while(n){ parts.push(n%100); n=Math.floor(n/100); }
    for(let j=parts.length-1;j>=0;j--) if(parts[j]) res += chunk(parts[j])+" "+units[j]+" ";
    return res.trim();
  };

  let [r,p] = num.toString().split(".").map(x=>+x||0);
  return (r? toWords(r)+" Rupees":"") + (p? (r?" and ":"")+toWords(p)+" Paise":"") || "Zero Rupees";
}
export const ChallanData = (tenantId, consumerCode) => {
  const wfData = Digit.Hooks.useWorkflowDetails({
    tenantId,
    id: consumerCode,
    moduleCode: "challan-generation",
    role: "EMPLOYEE",
  });

  const officerInstance = wfData?.data?.processInstances?.find((pi) => pi?.action === "SUBMIT");

  const codes = officerInstance?.assigner?.userName;
  const employeeData = Digit.Hooks.useEmployeeSearch(tenantId, { codes: codes, isActive: true }, { enabled: !!codes && !wfData?.isLoading });
  console.log("employeeData", employeeData);
  const officerRaw = employeeData?.data?.Employees?.[0];
  const officerAssignment = officerRaw?.assignments?.[0];

  const officer = officerRaw
    ? {
        code: officerRaw?.code,
        id: officerRaw?.id,
        name: officerRaw?.user?.name,
        department: officerAssignment?.department,
      }
    : null;

  return { officer };
};

export const getLocationName = async (lat, lng) => {
  try {
    if (lat == null || lng == null || (lat === 0 && lng === 0)) {
      return "Address not provided";
    }
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    return data?.display_name || "Address not provided";
  } catch {
    return "Address not provided";
  }
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};
