import React, { useEffect, useState } from "react";
import { ImageViewer } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import EXIF from "exif-js";

const NocUploadedDocument = ({ filestoreId, documentType, documentName, latitude, longitude }) => {
  const stateCode = Digit.ULBService.getStateId();
  const { t } = useTranslation();
  const [docUrl, setDocUrl] = useState(null);
  const [zoomUrl, setZoomUrl] = useState(null);
  const [dateTaken, setDateTaken] = useState(null);

  const onCloseZoom = () => setZoomUrl(null);

  useEffect(() => {
    if (filestoreId) {
      const fileUrl = `${window.origin}/filestore/v1/files/id?fileStoreId=${filestoreId}&tenantId=${stateCode}`;
      setDocUrl(fileUrl);
      console.log('fileUrl in latlong component', fileUrl)
      extractExifDate(fileUrl);
    }
  }, [filestoreId, stateCode]);

  const extractExifDate = (fileUrl) => {
    const img = new Image();
    img.onload = function () {
      EXIF.getData(img, function () {
        const dateTimeOriginal = EXIF.getTag(this, "DateTimeOriginal");
        if (dateTimeOriginal) {
          setDateTaken(dateTimeOriginal);
        }
      });
    };
    img.src = fileUrl;
  };

  return (
    <div style={{ padding: "20px 0px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginTop: "10px", padding: "0px 20px" }}>
        <span style={{ fontWeight: "500" }}>{t(documentType?.replaceAll(".", "_"))}</span>

        <img
          src={docUrl}
          alt={documentName || t(documentType?.replaceAll(".", "_"))}
          style={{
            width: "100px",
            height: "100px",
            objectFit: "cover",
            borderRadius: "10%",
            cursor: docUrl ? "pointer" : "default",
            marginTop: "8px",
          }}
          onClick={() => docUrl && setZoomUrl(docUrl)}
        />

        {(latitude || longitude) && (
          <div style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>
            {latitude && <div>Lat: {latitude}</div>}
            {longitude && <div>Long: {longitude}</div>}
          </div>
        )}

        {dateTaken && (
          <div style={{ marginTop: "4px", fontSize: "12px", color: "#666" }}>
            <span>Date Taken: {dateTaken}</span>
          </div>
        )}
      </div>

      {zoomUrl && <ImageViewer imageSrc={zoomUrl} onClose={onCloseZoom} />}
    </div>
  );
};

export default NocUploadedDocument;
