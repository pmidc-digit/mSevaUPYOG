import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LinkButton, Button } from "@mseva/digit-ui-react-components";

import {
  Card,
  Header,
  CardSubHeader,
  StatusTable,
  Row,
  TextArea,
  SubmitBar,
  DisplayPhotos,
  ImageViewer,
  Loader,
  Toast,
  ButtonSelector,
} from "@mseva/digit-ui-react-components";

const ViewAttendence = () => {
  const userInfo = Digit.SessionStorage.get("User")?.info;
  const { t } = useTranslation();
  const user = userInfo?.uuid;
  const tenantId = Digit.SessionStorage.get("CITIZEN.COMMON.HOME.CITY")?.code;
  const [addresses, setAddresses] = useState({});
  const getTodayTimestamp = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.getTime();
  };
  const { data, isLoading, error } = Digit.Hooks.swach.useViewAttendence({
    tenantId,
    userIds: user,
    fromDate: getTodayTimestamp(),
  });

  const fetchAddress = async (lat, long) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}`);
      const result = await response.json();
      return result.display_name || "Address not available";
    } catch (error) {
      console.error("Error fetching address:", error);
      return "Address not available";
    }
  };
  useEffect(() => {
    const fetchAllAddresses = async () => {
      if (data?.Attendance) {
        const addressPromises = data.Attendance.map(async (attendance) => {
          if (attendance.latitude && attendance.longitude) {
            const address = await fetchAddress(attendance.latitude, attendance.longitude);
            return { id: attendance.id, address };
          }
          return { id: attendance.id, address: "Address not available" };
        });

        const resolvedAddresses = await Promise.all(addressPromises);
        const addressMap = resolvedAddresses.reduce((acc, curr) => {
          acc[curr.id] = curr.address;
          return acc;
        }, {});
        setAddresses(addressMap);
      }
    };

    fetchAllAddresses();
  }, [data]);

  if (isLoading) return <Loader />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="ViewAttendence">
      <Header>{t("VIEW_ATTENDANCE")}</Header>
      {data?.Attendance?.map((attendance) => (
        <Card key={attendance.id} className="attendancecard">
          <CardSubHeader>{attendance.dateOfAttendance || "N/A"}</CardSubHeader>
          <div className="tablechart">
            <div className="tablechartinner">
              <StatusTable>
                <Row label="Name" text={attendance.userDetail?.name || "N/A"} />
                <Row label="Mobile" text={attendance.userDetail?.mobileNumber || "N/A"} />
                <Row label="Date & Time" text={new Date(attendance.createdTime).toLocaleString()} />
                <Row label="Location" text={addresses[attendance.id] || "Fetching address..."} />
              </StatusTable>
            </div>

            {attendance.imagerUrl && (
              <div className="attendanceimage">
                <img
                  src={`${window.location.origin}/filestore/v1/files/id?tenantId=${tenantId}&fileStoreId=${attendance.imagerUrl}`}
                  alt="Attendance"
                  className="attendanceimg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/300?text=Image+Not+Available";
                  }}
                />
              </div>
            )}
          </div>
        </Card>
      ))}

      {(!data?.Attendance || data.Attendance.length === 0) && (
        <Card>
          <div className="mb-2.5 text-center">
            <h3>No attendance records found</h3>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ViewAttendence;
