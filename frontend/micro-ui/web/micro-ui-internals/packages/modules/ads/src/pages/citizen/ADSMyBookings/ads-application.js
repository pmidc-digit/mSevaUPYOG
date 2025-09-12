import { Card, KeyNote, SubmitBar, Toast } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useHistory } from "react-router-dom";

const AdsApplication = ({ application, tenantId, buttonLabel }) => {
  console.log("application :>> ", application);
  const { t } = useTranslation();
  const history = useHistory();
  const [showToast, setShowToast] = useState(null);

  const slotSearchData = Digit.Hooks.ads.useADSSlotSearch();
  let formdata = {
    advertisementSlotSearchCriteria: application?.cartDetails.map((item) => ({
      bookingId: application?.bookingId,
      addType: item?.addType,
      bookingStartDate: item?.bookingDate,
      bookingEndDate: item?.bookingDate,
      faceArea: item?.faceArea,
      tenantId: tenantId,
      location: item?.location,
      nightLight: item?.nightLight,
      isTimerRequired: true,
    })),
  };

  const getBookingDateRange = (bookingSlotDetails) => {
    if (!bookingSlotDetails || bookingSlotDetails.length === 0) {
      return t("CS_NA");
    }
    const startDate = bookingSlotDetails[0]?.bookingDate;
    const endDate = bookingSlotDetails[bookingSlotDetails.length - 1]?.bookingDate;
    if (startDate === endDate) {
      return startDate;
    } else {
      return startDate && endDate ? `${startDate}  -  ${endDate}` : t("CS_NA");
    }
  };

  // const handleMakePayment = async () => {
  //   try {
  //     const result = await slotSearchData.mutateAsync(formdata);
  //     let SlotSearchData = {
  //       bookingId: application?.bookingId,
  //       tenantId: tenantId,
  //       cartDetails: application?.cartDetails,
  //     };
  //     const isSlotBooked = result?.advertisementSlotAvailabiltityDetails?.some((slot) => slot.slotStaus === "BOOKED");
  //     const timerValue = result?.advertisementSlotAvailabiltityDetails[0].timerValue;
  //     if (isSlotBooked) {
  //       setShowToast({ error: true, label: t("ADS_ADVERTISEMENT_ALREADY_BOOKED") });
  //     } else {
  //       history.push({
  //         pathname: `/digit-ui/citizen/payment/my-bills/${"adv-services"}/${application?.bookingNo}`,
  //         state: { tenantId: application?.tenantId, bookingNo: application?.bookingNo, timerValue: timerValue, SlotSearchData: SlotSearchData },
  //       });
  //     }
  //   } catch (error) {
  //     setShowToast({ error: true, label: t("CS_SOMETHING_WENT_WRONG") });
  //   }
  // };

  const handleMakePayment = () => {
    history.push(`/digit-ui/citizen/payment/collect/adv-services/${application?.bookingNo}/${tenantId}?tenantId=${tenantId}`);
    // pathname: `/digit-ui/citizen/payment/collect/${application?.businessService}/${application?.applicationNumber}`,
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);
  //so the earlier made ads application page path is this : /digit-ui/citizen/ads/application/${application?.bookingNo}/${application?.tenantId}
  console.log("56565application :>> ", application);
  //mine citizenapplicationoverview is this : /digit-ui/citizen/ads/adsservice/application-overview/${application?.bookingNo}
  return (
    <Card>
      <KeyNote keyValue={t("ADS_BOOKING_NO")} note={application?.bookingNo} />
      <KeyNote keyValue={t("ADS_APPLICANT_NAME")} note={application?.applicantDetail?.applicantName} />
      <KeyNote keyValue={t("ADS_BOOKING_START_DATE")} note={getBookingDateRange(application?.cartDetails)} />
      <KeyNote keyValue={t("PT_COMMON_TABLE_COL_STATUS_LABEL")} note={t(`${application?.bookingStatus}`)} />

      <div>
        <Link to={`/digit-ui/citizen/ads/application/${application?.bookingNo}/${application?.tenantId}`}>
          <SubmitBar label={buttonLabel} />
        </Link>

        {(application.bookingStatus === "BOOKING_CREATED" ||
          application.bookingStatus === "/mybookingsPAYMENT_FAILED" ||
          application.bookingStatus === "PENDING_FOR_PAYMENT") && (
          <SubmitBar label={t("CS_APPLICATION_DETAILS_MAKE_PAYMENT")} onSubmit={handleMakePayment} style={{ margin: "20px" }} />
        )}
      </div>

      {showToast && (
        <Toast
          error={showToast.error}
          warning={showToast.warning}
          label={t(showToast.label)}
          onClose={() => {
            setShowToast(null);
          }}
        />
      )}
    </Card>
  );
};

export default AdsApplication;
