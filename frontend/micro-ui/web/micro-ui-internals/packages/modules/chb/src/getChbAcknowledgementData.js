const capitalize = (text) => text.substr(0, 1).toUpperCase() + text.substr(1);
const ulbCamel = (ulb) => ulb.toLowerCase().split(" ").map(capitalize).join(" ");

const getChbAcknowledgementData = async (application, tenantInfo, t) => {
  const filesArray = application?.documents?.map((value) => value?.fileStoreId);
  const res = filesArray?.length > 0 && (await Digit.UploadServices.Filefetch(filesArray, Digit.ULBService.getStateId()));
  const getBookingDateRange = (bookingSlotDetails) => {
    if (!bookingSlotDetails || bookingSlotDetails.length === 0) {
      return t("CS_NA");
    }

    const startDate = bookingSlotDetails[0]?.bookingDate;
    const endDate = bookingSlotDetails[bookingSlotDetails.length - 1]?.bookingDate;

    if (startDate === endDate) {
      return startDate;
    }

    return `${startDate} - ${endDate}`;
  };

  const getBookingTimeRange = (bookingSlotDetails) => {
    if (!bookingSlotDetails || bookingSlotDetails.length === 0) {
      return t("CS_NA");
    }

    const startDate = bookingSlotDetails[0]?.bookingDate;
    const endDate = bookingSlotDetails[bookingSlotDetails.length - 1]?.bookingDate;

    return `00:00 (${startDate}) - 23:59 (${endDate})`;
  };
const splitAddress = (addressLine1) => {
  if (!addressLine1) return [""];
  return addressLine1.split("\n");
};

  return {
    t: t,
    tenantId: tenantInfo?.code,
    name: `${t(tenantInfo?.i18nKey)} ${ulbCamel(t(`ULBGRADE_${tenantInfo?.city?.ulbGrade.toUpperCase().replace(" ", "_").replace(".", "_")}`))}`,
    email: tenantInfo?.emailId,
    applicationNumber: application?.bookingNo,
    phoneNumber: tenantInfo?.contactNumber,
    heading: t("CHB_ACKNOWLEDGEMENT"),
    details: [
      {
        title: t("CHB_APPLICANT_DETAILS"),
        values: [
          { title: t("CHB_APPLICANT_NAME"), value: application?.applicantDetail?.applicantName },
          { title: t("CHB_MOBILE_NUMBER"), value: application?.applicantDetail?.applicantMobileNo },
          { title: t("CHB_ALT_MOBILE_NUMBER"), value: application?.applicantDetail?.applicantAlternateMobileNo || "N/A" },
          { title: t("CHB_EMAIL_ID"), value: application?.applicantDetail?.applicantEmailId },
        ],
      },
      {
        title: t("SLOT_DETAILS"),
        values: [
          { title: t("CHB_COMMUNITY_HALL_NAME"), value: application?.communityHallCode },
          { title: t("CHB_BOOKING_DATE"), value: getBookingDateRange(application?.bookingSlotDetails) },
          { title: t("ADS_BOOKING_TIME"), value: getBookingTimeRange(application?.bookingSlotDetails) },
        ],
      },
      {
        title: t("CHB_EVENT_DETAILS"),
        values: [
          { title: t("CHB_SPECIAL_CATEGORY"), value: t(application?.specialCategory?.category) },
          { title: t("CHB_PURPOSE"), value: application?.purpose?.purpose },
          { title: t("CHB_PURPOSE_DESCRIPTION"), value: application?.purposeDescription },
        ],
      },
      {
  title: t("ADS_ADDRESS_DETAILS"),
  values: [
    { title: t("ADS_ADDRESS_LINE1"), value: splitAddress(application?.address?.addressLine1)[0] },
    { title: t("TL_NEW_TRADE_DETAILS_CITY_LABEL"), value: splitAddress(application?.address?.addressLine1)[1] }
  ]
}

    ],
  };
};

export default getChbAcknowledgementData;
