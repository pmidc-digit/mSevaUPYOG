import { Card, KeyNote, SubmitBar, Toast } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useHistory } from "react-router-dom";
import ReservationTimer from "../../../pageComponents/ADSReservationsTimer";

const AdsApplication = ({ application, tenantId, buttonLabel, refetchBookings }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [showToast, setShowToast] = useState(null);

  const handleMakePayment = () => {
    history.push(`/digit-ui/citizen/payment/my-bills/adv-services/${application?.bookingNo}`);
    // history.push(`/digit-ui/citizen/payment/my-bills/adv-services/${application?.bookingNo}/${tenantId}?tenantId=${tenantId}`);
  };

  const handleCancelBooking = async () => {
    const formData = {
      tenantId: application?.tenantId,
      ...application,
      workflow: {
        businessService: "advandhoarding",
        action: "CANCEL",
        comments: "User cancelled booking",
      },
    };
    try {
      const response = await Digit.ADSServices.update({ bookingApplication: formData }, application?.tenantId);
      if (response?.ResponseInfo?.status == "SUCCESSFUL" || response?.status == "SUCCESSFUL") {
        setShowToast({ label: t(response?.resMsgId || "ADS_CANCEL_SUCCESS"), error: false });
        refetchBookings();
      }
    } catch (err) {
      setShowToast({ label: "ADS_CANCEL_FAILED", error: true });
    }
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
  const appDate = new Date(application?.applicationDate).toLocaleDateString();
  const [expired, setExpired] = useState(false);

  return (
    <Card>
      {application.bookingStatus === "PENDING_FOR_PAYMENT" && application?.auditDetails?.createdTime && (
        <div className="ads-reservation-wrapper">
          <ReservationTimer
            t={t}
            createTime={application?.auditDetails?.createdTime} // supply when reservation created
            onExpire={(val) => setExpired(val)}
          />
        </div>
      )}
      <KeyNote keyValue={t("ADS_BOOKING_NO")} note={application?.bookingNo} />
      <KeyNote keyValue={t("ADS_APPLICANT_NAME")} note={application?.applicantDetail?.applicantName} />
      {/* <KeyNote keyValue={t("ADS_BOOKING_START_DATE")} note={getBookingDateRange(application?.cartDetails)} /> */}
      <KeyNote keyValue={t("CS_APPLICATION_DETAILS_APPLICATION_DATE")} note={appDate} />
      <KeyNote keyValue={t("PT_COMMON_TABLE_COL_STATUS_LABEL")} note={t(`${application?.bookingStatus}`)} />

      <div className="action-button-myapplication">
        <Link to={`/digit-ui/citizen/ads/application/${application?.bookingNo}/${application?.tenantId}`}>
          <SubmitBar label={buttonLabel} />
        </Link>
        {/* application.bookingStatus === "BOOKING_CREATED" */}
        {(application.bookingStatus === "/mybookingsPAYMENT_FAILED" || application.bookingStatus === "PENDING_FOR_PAYMENT") && (
          <SubmitBar label={t("CS_APPLICATION_DETAILS_MAKE_PAYMENT")} onSubmit={handleMakePayment} disabled={expired} />
        )}
        {application.bookingStatus === "BOOKED" && <SubmitBar label={t("ADS_CANCEL_BOOKING")} onSubmit={handleCancelBooking} disabled={expired} />}
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
