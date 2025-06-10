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
  const user =  userInfo?.uuid
  const tenantId = "pb.testing";
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

  if (isLoading) return <Loader />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="ViewAttendence">
      <Header>{t("VIEW_ATTENDANCE")}</Header>
      {data?.Attendance?.map((attendance) => (
        <Card key={attendance.id} className="attendancecard"
        // style={{ marginBottom: "16px" }}
        >
          <CardSubHeader>{attendance.dateOfAttendance || "N/A"}</CardSubHeader>
          <div className="tablechart" 
          // style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "16px" }}
          >
            <div className="tablechartinner" 
            // style={{ flex: "1 1 300px", minWidth: "300px" }}
            >
              <StatusTable>
                <Row label="Name" text={attendance.userDetail?.name || "N/A"} />
                <Row label="Mobile" text={attendance.userDetail?.mobileNumber || "N/A"} />
                <Row label="Date & Time" text={new Date(attendance.createdTime).toLocaleString()} />
                <Row label="Location" text={attendance.locality || "N/A"} />
              </StatusTable>
            </div>

            {attendance.imagerUrl && (
              <div className="attendanceimage" 
              // style={{ flex: "1 1 300px", minWidth: "300px", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
              >
                <img
                  src={`${window.location.origin}/filestore/v1/files/id?tenantId=${tenantId}&fileStoreId=${attendance.imagerUrl}`}
                  alt="Attendance"
                  className="attendanceimg"
                  // style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "contain" }}
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
          <div style={{ padding: "16px", textAlign: "center" }}>
            <h3>No attendance records found</h3>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ViewAttendence;
