// Determines if the back button should be hidden based on the current URL matching screen paths in the config array.
// Returns true to hide the back button if a match is found; otherwise, returns false.
export const shouldHideBackButton = (config = []) => {
  return config.filter((key) => window.location.href.includes(key.screenPath)).length > 0 ? true : false;
};

export const checkForNotNull = (value = "") => {
  return value && value != null && value != undefined && value != "" ? true : false;
};

export const checkForNA = (value = "") => {
  return checkForNotNull(value) ? value : "CS_NA";
};

export const stringReplaceAll = (str = "", searcher = "", replaceWith = "") => {
  if (searcher == "") return str;
  while (str.includes(searcher)) {
    str = str.replace(searcher, replaceWith);
  }
  return str;
};
export const pdfDownloadLink = (documents = {}, fileStoreId = "", format = "") => {
  /* Need to enhance this util to return required format*/

  let downloadLink = documents[fileStoreId] || "";
  let differentFormats = downloadLink?.split(",") || [];
  let fileURL = "";
  differentFormats.length > 0 &&
    differentFormats.map((link) => {
      if (!link.includes("large") && !link.includes("medium") && !link.includes("small")) {
        fileURL = link;
      }
    });
  return fileURL;
};

/**
 * Payload create api data for the advertisement booking application.
 *
 * setAddressDetails(data)`: Formats and sets address details.
 * setApplicantDetails(data)`: Formats and sets applicant information.
 * setDocumentDetails(data)`: Retains document details.
 * ADSDataConvert(data)`: Combines all details into a structured bookingApplication object for submission.
 */

export const setaddressDetails = (data) => {
  let { address } = data;

  let addressdetails = {
    pincode: address?.pincode,
    city: address?.city?.city?.name,
    cityCode: address?.city?.city?.code,
    locality: address?.locality?.i18nKey,
    localityCode: address?.locality?.code,
    streetName: address?.streetName,
    addressLine1: address?.addressline1,
    addressLine2: address?.addressline2,
    houseNo: address?.houseNo,
    landmark: address?.landmark,
  };

  data.address = addressdetails;
  return data;
};
export const setCartDetails = (data) => {
  let { adslist } = data;

  let cartDetails =
    adslist?.cartDetails.map((slot) => {
      return {
        addType: slot.addTypeCode,
        faceArea: slot.faceAreaCode,
        location: slot.locationCode,
        nightLight: slot.nightLight,
        bookingDate: slot.bookingDate,
        bookingFromTime: "06:00",
        bookingToTime: "05:59",
        status: "BOOKING_CREATED",
      };
    }) || [];
  let draftId = adslist?.existingDataSet?.draftId;

  data.adslist = { cartDetails, draftId };
  return data;
};
export const setApplicantDetails = (data) => {
  let { applicant } = data;

  let Applicant = {
    applicantName: applicant?.applicantName,
    applicantMobileNo: applicant?.mobileNumber,
    applicantAlternateMobileNo: applicant?.alternateNumber,
    applicantEmailId: applicant?.emailId,
  };
  let draftId = applicant?.draftId;
  data.applicant = { Applicant, draftId };
  return data;
};

export const setDocumentDetails = (data) => {
  let { documents } = data;

  let doc = {
    ...documents,
  };

  data.documents = doc;
  return data;
};

// ADSDataConvert(data)`: Combines all details into a structured bookingApplication object for submission.
export const ADSDataConvert = (data) => {
  data = setDocumentDetails(data);
  data = setApplicantDetails(data);
  data = setaddressDetails(data);
  data = setCartDetails(data);
  const formdata = {
    bookingApplication: {
      tenantId: data.tenantId,
      draftId: data.applicant.draftId,
      applicantDetail: {
        ...data.applicant.Applicant,
      },
      address: data.address,
      ...data.documents,
      bookingStatus: "BOOKING_CREATED",
      cartDetails: data.adslist.cartDetails,

      workflow: null,
    },
  };

  return formdata;
};

function normalizeDate(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export const validateSchedule = ({ startDate, endDate, scheduleType }) => {
  if (!startDate || !endDate) {
    return "Start and end date are required.";
  }
  // const now = new Date();
  // const s = new Date(`${startDate}T${startTime}`);
  // const e = new Date(`${endDate}T${endTime}`);
  // if (s < now) return "Start date/time cannot be in the past.";
  //   if (type !== "Yearly" && s < now) {
  //   return "Start date/time cannot be in the past.";
  // }

  // if (e <= s) return "End date/time must be later than start date/time.";

  const start = normalizeDate(new Date(startDate));
  const end = normalizeDate(new Date(endDate));

  const selYear = start.getFullYear();
  const selMonth = start.getMonth();
  const daysInSelMonth = new Date(selYear, selMonth + 1, 0).getDate();

  switch (scheduleType) {
    case "Monthly": {
      const monthStart = normalizeDate(new Date(selYear, selMonth, 1));
      const monthEnd = normalizeDate(new Date(selYear, selMonth, daysInSelMonth));
      const today = normalizeDate(new Date());

      // 🚫 Reject if the whole month is already finished
      if (monthEnd < today) {
        return `This Monthly block (${monthStart.toDateString()} – ${monthEnd.toDateString()}) is already in the past. Please select a future month.`;
      }

      // ✅ Still enforce exact month boundaries
      if (start.getTime() !== monthStart.getTime() || end.getTime() !== monthEnd.getTime()) {
        return `For Monthly, you must select ${monthStart.toDateString()} to ${monthEnd.toDateString()}`;
      }
      break;
    }

    case "Weekly": {
      const day = start.getDate();
      let blockStart, blockEnd;
      if (day >= 1 && day <= 7) {
        blockStart = 1;
        blockEnd = 7;
      } else if (day >= 8 && day <= 15) {
        blockStart = 8;
        blockEnd = 15;
      } else if (day >= 16 && day <= 23) {
        blockStart = 16;
        blockEnd = 23;
      } else {
        blockStart = 24;
        blockEnd = daysInSelMonth;
      }

      const blockStartDate = normalizeDate(new Date(selYear, selMonth, blockStart));
      const blockEndDate = normalizeDate(new Date(selYear, selMonth, blockEnd));
      const today = normalizeDate(new Date());

      // 🚫 Reject if the whole block is already finished
      if (blockEndDate < today) {
        return `This weekly block (${blockStart}-${blockEnd} ${start.toLocaleString("default", {
          month: "long",
        })}) is already in the past. Please select a future block.`;
      }

      // ✅ Still enforce exact block boundaries
      if (start.getTime() !== blockStartDate.getTime() || end.getTime() !== blockEndDate.getTime()) {
        return `For Weekly, you must select ${blockStart}-${blockEnd} of ${start.toLocaleString("default", { month: "long" })}`;
      }
      break;
    }

    case "FortNight": {
      const firstHalfStart = normalizeDate(new Date(selYear, selMonth, 1));
      const firstHalfEnd = normalizeDate(new Date(selYear, selMonth, 15));
      const secondHalfStart = normalizeDate(new Date(selYear, selMonth, 16));
      const secondHalfEnd = normalizeDate(new Date(selYear, selMonth, daysInSelMonth));

      const today = normalizeDate(new Date());

      // 🚫 Reject if the entire block is already finished
      if (
        (start.getTime() === firstHalfStart.getTime() && firstHalfEnd < today) ||
        (start.getTime() === secondHalfStart.getTime() && secondHalfEnd < today)
      ) {
        return `This FortNight block is already in the past. Please select a future block.`;
      }

      // ✅ Otherwise, enforce exact block boundaries
      if (
        !(
          (start.getTime() === firstHalfStart.getTime() && end.getTime() === firstHalfEnd.getTime()) ||
          (start.getTime() === secondHalfStart.getTime() && end.getTime() === secondHalfEnd.getTime())
        )
      ) {
        return `For FortNight, you must select 1–15 or 16–${daysInSelMonth} of ${start.toLocaleString("default", { month: "long" })}`;
      }
      break;
    }

    case "Yearly": {
      let fyStart, fyEnd;

      if (selMonth < 3) {
        // Jan–Mar → belongs to previous financial year
        fyStart = normalizeDate(new Date(selYear - 1, 3, 1)); // Apr 1 of previous year
        fyEnd = normalizeDate(new Date(selYear, 2, 31)); // Mar 31 of current year
      } else {
        // Apr–Dec → belongs to current financial year
        fyStart = normalizeDate(new Date(selYear, 3, 1)); // Apr 1 of current year
        fyEnd = normalizeDate(new Date(selYear + 1, 2, 31)); // Mar 31 of next year
      }

      if (start.getTime() !== fyStart.getTime() || end.getTime() !== fyEnd.getTime()) {
        return `For Yearly, you must select ${fyStart.toDateString()} to ${fyEnd.toDateString()} (Financial Year)`;
      }
      break;
    }

    default:
      return "Invalid schedule type.";
  }

  return null; // ✅ valid
};

// utils/scheduleMessages.js
export function getScheduleMessage(scheduleType, t) {
  switch (scheduleType) {
    case "Monthly":
      return t("ADS_GUIDE_MONTHLY");

    case "Weekly":
      return t("ADS_GUIDE_WEEKLY");

    case "FortNight":
      return t("ADS_GUIDE_FORTNIGHT");

    case "Yearly":
      return t("ADS_GUIDE_YEARLY");

    default:
      return "";
  }
}

export function getMinDateForType(scheduleType) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-based

  if (scheduleType === "Monthly" || scheduleType === "Weekly" || scheduleType === "FortNight") {
    // ✅ Allow current month and future months
    // Min = first day of current month
    return new Date(year, month, 1).toISOString().split("T")[0];
  }

  if (scheduleType === "Yearly") {
    // ✅ Financial year starts April 1
    // If today is Jan–Mar, still in previous FY → min = Apr 1 of last year
    // Else min = Apr 1 of current year
    if (month < 3) {
      return new Date(year - 1, 3, 1).toISOString().split("T")[0]; // Apr 1 last year
    } else {
      return new Date(year, 3, 1).toISOString().split("T")[0]; // Apr 1 this year
    }
  }

  // fallback
  return today.toISOString().split("T")[0];
}

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

//cart slots changed or not
export const areCartSlotsEqual = (a = [], b = []) => {
  if (a?.length !== b?.length) return false;

  // sort by ad.id for stable comparison
  const sortByAd = (arr) => [...arr]?.sort((x, y) => String(x?.ad?.id).localeCompare(String(y?.ad?.id)));

  const sortedA = sortByAd(a);
  const sortedB = sortByAd(b);

  return sortedA.every((item, idx) => {
    const other = sortedB[idx];
    if (String(item?.ad?.id) !== String(other?.ad?.id)) return false;

    // compare slots by bookingDate (or any unique key)
    const slotsA = item?.slots?.map((s) => s?.bookingDate)?.sort();
    const slotsB = other?.slots?.map((s) => s?.bookingDate)?.sort();

    if (slotsA?.length !== slotsB?.length) return false;
    return slotsA?.every((date, i) => date === slotsB[i]);
  });
};

export const haveSlotsChanged = (previousSlots, updatedSlots) => {
  // Use advertisementId + bookingDate as the unique key
  const makeKey = (slot) => `${slot.advertisementId}|${slot.bookingDate}`;

  const prevKeys = new Set(previousSlots.map(makeKey));
  const updatedKeys = new Set(updatedSlots.map(makeKey));

  // Check if any previous slot is missing in updated
  for (let key of prevKeys) {
    if (!updatedKeys.has(key)) {
      return true; // removed slot
    }
  }

  // Check if any updated slot is new compared to previous
  for (let key of updatedKeys) {
    if (!prevKeys.has(key)) {
      return true; // new slot
    }
  }

  return false; // no changes
};

// slots are equal
export const areSlotsEqual = (a = [], b = []) => {
  if (a?.length !== b?.length) return false;
  const key = (s) => s?.bookingDate; // or slotId if available
  const aKeys = a?.map(key).sort();
  const bKeys = b?.map(key).sort();
  return JSON?.stringify(aKeys) === JSON?.stringify(bKeys);
};

// Transforms raw booking data into grouped ad objects with enriched metadata and slot arrays
export function transformAdsData(adsData) {
  const grouped = {};

  adsData?.forEach((item) => {
    const adId = item?.advertisementId;

    if (!grouped[adId]) {
      grouped[adId] = {
        ad: {
          id: Number(adId),
          name: item?.advertisementName,
          ...item,
        },
        slots: [],
      };
    }

    grouped[adId]?.slots.push({
      addType: item?.addType,
      location: item?.location,
      faceArea: item?.faceArea,
      nightLight: item?.nightLight,
      bookingId: item?.bookingId,
      timerValue: 0,
      bookingDate: item?.bookingDate,
      bookingStartDate: item?.bookingDate,
      bookingEndDate: item?.bookingDate,
      advertisementId: item?.advertisementId,
      slotStaus: item?.status,
      bookingFromTime: item?.bookingFromTime,
      bookingToTime: item?.bookingToTime,
      advertisementName: item?.advertisementName,
    });
  });

  // Update bookingStartDate and bookingEndDate for each ad
  Object.values(grouped)?.forEach((group) => {
    const dates = group?.slots.map((s) => new Date(s?.bookingDate));
    const minDate = new Date(Math?.min(...dates));
    const maxDate = new Date(Math?.max(...dates));
    const format = (d) => d.toISOString().split("T")[0];

    group.ad.bookingStartDate = format(minDate);
    group.ad.bookingEndDate = format(maxDate);
    group.ad.startDate = format(minDate);
    group.ad.endDate = format(maxDate);
  });

  return Object.values(grouped);
}

// Formats a raw key into a readable label with spacing and capitalization
export const formatLabel = (key) => {
  const spaced = key
    ?.replace(/([a-z])([A-Z])/g, "$1 $2") // Add space before capital letters
    ?.replace(/_/g, " ") // Replace underscores with spaces
    ?.replace(/([a-z])([0-9])/gi, "$1 $2"); // Add space before digits

  return spaced
    ?.split(" ") // Split into words
    ?.map((word) => word?.charAt(0)?.toUpperCase() + word?.slice(1)) // Capitalize each word
    ?.join(" "); // Join back into a single string
};

export const allowedKeys = [
  "addType",
  "location",
  "faceArea",
  "nightLight",
  "bookingId",
  "bookingDate",
  "advertisementId",
  "bookingFromTime",
  "bookingToTime",
  "tenantId",
  "amount",
  "advertisementName",
  "poleNo",
  "imageSrc",
  "width",
  "height",
  "lightType",
  "status",
];
