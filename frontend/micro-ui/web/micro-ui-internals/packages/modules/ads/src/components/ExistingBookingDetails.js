import React, { useState, useEffect } from "react";
import { Loader, Card, KeyNote } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

// The ExistingBookingDetails component displays a list of existing booking applications.
// It allows users to view and select an existing booking for further actions.

export const ExistingBookingDetails = ({ onSubmit, setExistingDataSet, Searchdata }) => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCitizenCurrentTenant(true) || Digit.ULBService.getCurrentTenantId();
  const [filters, setFilters] = useState(null);
  const [isDataSet, setIsDataSet] = useState(false); // State to track if data has been set
  const user = Digit.UserService.getUser().info;

  // Slot search data for Ads (Advertisement)
  const slotSearchData = Digit.Hooks.ads.useADSSlotSearch();

  // Prepare form data for Advertisement Service
  const formdata = {
    advertisementSlotSearchCriteria: Searchdata.map((item) => ({
      bookingId: "",
      addType: item?.addTypeCode,
      bookingStartDate: item?.bookingDate,
      bookingEndDate: item?.bookingDate,
      faceArea: item?.faceAreaCode,
      tenantId: tenantId,
      location: item?.location,
      nightLight: item?.nightLight,
      isTimerRequired: true,
    })),
  };

  const setchbData = async (application) => {
    const result = await slotSearchData.mutateAsync(formdata);
    const timerValue = result?.advertisementSlotAvailabiltityDetails[0].timerValue;
    const newSessionData = {
      documents: {
        documents: application?.documents?.map((doc) => ({
          documentDetailId: doc?.documentDetailId,
          documentType: doc?.documentType,
          fileStoreId: doc?.fileStoreId,
        })),
      },
      address: {
        pincode: application?.address?.pincode,
        houseNo: application?.address?.houseNo,
        streetName: application?.address?.streetName,
        landmark: application?.address?.landmark,
        addressline1: application?.address?.addressLine1,
        addressline2: application?.address?.addressLine2,
      },
      applicant: {
        applicantName: application?.applicantDetail?.applicantName,
        mobileNumber: application?.applicantDetail?.applicantMobileNo,
        alternateNumber: application?.applicantDetail?.applicantAlternateMobileNo,
        emailId: application?.applicantDetail?.applicantEmailId,
      },
      timervalue: {
        timervalue: timerValue || 0,
      },
      draftId: result?.draftId || "",
    };
    setExistingDataSet(newSessionData);
    setIsDataSet(true); // Set the flag to true after data is set
  };

  useEffect(() => {
    if (isDataSet) {
      // If data is set, call onSubmit
      onSubmit();
      setIsDataSet(false); // Reset the flag after onSubmit is called
    }
  }, [isDataSet, onSubmit]);

  // URL parsing for dynamic filter values
  let filter = window.location.href.split("/").pop();
  let t1;
  let off;
  if (!isNaN(parseInt(filter))) {
    off = filter;
    t1 = parseInt(filter) + 50;
  } else {
    t1 = 3;
  }
  let initialFilters = !isNaN(parseInt(filter))
    ? { limit: "3", sortOrder: "ASC", sortBy: "createdTime", offset: off, tenantId }
    : { limit: "3", sortOrder: "ASC", sortBy: "createdTime", offset: "0", tenantId, mobileNumber: user?.mobileNumber };

  useEffect(() => {
    setFilters(initialFilters);
  }, [filter]);

  // Use the search hook with dynamic filters
  const { isLoading, data } = Digit.Hooks.ads.useADSSearch({ filters });

  if (isLoading) {
    return <Loader />;
  }

  const filteredApplications = data?.bookingApplication || [];
  return (
    <React.Fragment>
      <div>
        {filteredApplications.length > 0 &&
          filteredApplications.map((application, index) => (
            <div key={index}>
              <Card
                className="ads-existing-booking__application"
                onClick={() => {
                  // Trigger the setchbData function with the clicked application data
                  setchbData(application);
                }}
              >
                <KeyNote keyValue={t("ADS_BOOKING_NO")} note={application?.bookingNo} />
                <KeyNote keyValue={t("ADS_APPLICANT_NAME")} note={application?.applicantDetail?.applicantName} />
                <KeyNote keyValue={t("PT_COMMON_TABLE_COL_STATUS_LABEL")} note={t(`${application?.bookingStatus}`)} />
              </Card>
            </div>
          ))}
        {filteredApplications.length === 0 && !isLoading && (
          <p className="ads-components-existing-booking-details--style-1">{t("ADS_NO_APPLICATION_FOUND_MSG")}</p>
        )}
      </div>
    </React.Fragment>
  );
};

/*
Black shadow with 50% opacity
*/
