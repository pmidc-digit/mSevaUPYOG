import React, { useState, useEffect } from 'react';
import { Toast } from '@mseva/digit-ui-react-components';

export const TimerValues = ({t, timerValues, SlotSearchData}) => {
  const [timeRemaining, setTimeRemaining] = useState(0 || timerValues); // Initialize with `timerValues`
  const [showToast, setShowToast] = useState(null);
  const tenantId = Digit.ULBService.getCitizenCurrentTenant(true) || Digit.ULBService.getCurrentTenantId();
  const [hasFetched, setHasFetched] = useState(false); // To track if data has been fetched once
  // Refetch logic for CHB (Community Hall Booking)
//   const { refetch } = Digit.Hooks.chb.useChbSlotSearch({
//     tenantId:tenantId,
//     filters: {
//       communityHallCode: SlotSearchData?.communityHallCode,
//       bookingStartDate: SlotSearchData?.bookingStartDate,
//       bookingEndDate: SlotSearchData?.bookingEndDate,
//       hallCode: SlotSearchData?.hallCode,
//       isTimerRequired: true,
//     },
//     enabled: false,
//   });

//   useEffect(() => {
//     const fetchSlotData = async () => {
//       try {
//           // Fetching data for Community Hall Booking Service
//           const result = await refetch();
//           const isSlotBooked = result?.data?.hallSlotAvailabiltityDetails?.some(
//             (slot) => slot.slotStaus === "BOOKED"
//           );

//           if (isSlotBooked) {
//             setShowToast({ error: true, label: t("CHB_COMMUNITY_HALL_ALREADY_BOOKED") });
//           } else {
//             setTimeRemaining(result?.data.timerValue || 0);
//           }
//       } catch (error) {
//         setShowToast({ error: true, label: t("CS_SOMETHING_WENT_WRONG") });
//       }
//     };

//     // Only fetch if timeRemaining is 0 and data hasn't been fetched before
//     if (timeRemaining === 0 && !hasFetched) {
//       fetchSlotData();
//       setHasFetched(true); // Mark that the data has been fetched once
//     }

//   }, [refetch, t, timeRemaining, hasFetched]);

  // Timer decrement logic (every second)
  useEffect(() => {
    if (timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      // Cleanup interval when the timer is cleared or component unmounts
      return () => clearInterval(interval);
    }
  }, [timeRemaining]);

  // Toast cleanup (hide after 2 seconds)
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Format time in MM:SS format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div>
       <span className="astericColor">{formatTime(timeRemaining)}</span>
      
      {/* Show Toast Message */}
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
    </div>
  );
};
