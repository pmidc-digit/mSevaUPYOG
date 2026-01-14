import { Card, KeyNote, SubmitBar, Toast, CardSubHeader } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useHistory } from "react-router-dom";
import ReasonModal from "../../../pageComponents/ReasonModal";
import { Loader } from "../../../components/Loader";

const ChbApplication = ({ application, tenantId, buttonLabel, refetch }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [showToast, setShowToast] = useState(null);
  const [loader, setLoader] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const state = tenantId?.split(".")[0];

  const getBookingDateRange = (bookingSlotDetails) => {
    if (!bookingSlotDetails || bookingSlotDetails.length === 0) {
      return t("CS_NA");
    }
    const startDate = bookingSlotDetails[0]?.bookingDate;
    const endDate = bookingSlotDetails[bookingSlotDetails.length - 1]?.bookingDate;
    if (startDate === endDate) {
      return startDate; // Return only the start date
    } else {
      // Format date range as needed, for example: "startDate - endDate"
      return startDate && endDate ? `${startDate}  -  ${endDate}` : t("CS_NA");
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleMakePayment = async () => {
    history.push(`/digit-ui/citizen/payment/collect/chb-services/${application?.bookingNo}/${tenantId}?tenantId=${tenantId}`);
  };

  const handleCancel = async () => {
    setShowModal(true);
  };

  const submitCancel = async () => {
    setLoader(true);
    setShowModal(false);
    // ✅ Final payload
    const finalPayload = {
      hallsBookingApplication: {
        ...application,
        workflow: {
          action: "CANCEL",
        },
      },
    };
    try {
      const response = await Digit.CHBServices.update({ tenantId, ...finalPayload });
      refetch();
      setLoader(false);
    } catch (err) {
      setLoader(false);
      setShowToast({ error: "true", label: "Cancel Error" });
      return err;
    }
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(null);
      }, 2000); // Close toast after 2 seconds

      return () => clearTimeout(timer); // Clear timer on cleanup
    }
  }, [showToast]);

  return (
    <Card>
      {/* <div style={{ display: "flex", justifyContent: "space-between" }}> */}
      <KeyNote keyValue={t("CHB_BOOKING_NO")} note={application?.bookingNo} />
      {/* { timeRemaining>0 && (<CardSubHeader 
              style={{ 
                textAlign: 'right', 
                fontSize: "24px"
              }}
            >
              {t("CS_TIME_REMAINING")}: <span className="astericColor">{formatTime(timeRemaining)}</span>
            </CardSubHeader>)}
        </div> */}
      <KeyNote keyValue={t("CHB_APPLICANT_NAME")} note={application?.applicantDetail?.applicantName} />
      {/* <KeyNote keyValue={t("CHB_COMMUNITY_HALL_NAME")} note={t(`${application?.communityHallCode}`)} /> */}
      <KeyNote keyValue={t("CHB_BOOKING_DATE")} note={getBookingDateRange(application?.bookingSlotDetails)} />
      <KeyNote keyValue={t("PT_COMMON_TABLE_COL_STATUS_LABEL")} note={t(`${application?.bookingStatus}`)} />
      <div className="action-button-myapplication">
        <Link to={`/digit-ui/citizen/chb/application/${application?.bookingNo}/${application?.tenantId}`}>
          <SubmitBar label={buttonLabel} />
        </Link>
        {application.bookingStatus === "PENDING_FOR_PAYMENT" && (
          <SubmitBar label={t("CS_APPLICATION_DETAILS_MAKE_PAYMENT")} onSubmit={handleMakePayment} />
        )}
        {application.bookingStatus === "BOOKED" && <SubmitBar label={t("WF_EMPLOYEE_NDC_CANCEL")} onSubmit={handleCancel} />}
      </div>
      {showToast && (
        <Toast
          error={showToast.error}
          warning={showToast.warning}
          label={t(showToast.label)}
          isDleteBtn={true}
          onClose={() => {
            setShowToast(null);
          }}
        />
      )}
      {showModal ? <ReasonModal t={t} closeModal={closeModal} cancelModal={submitCancel} /> : null}
      {loader && <Loader page={true} />}
    </Card>
  );
};

export default ChbApplication;
