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
    <div className="noc-components-noc-uploaded-document--style-1">
      <div className="noc-components-noc-uploaded-document--style-2">
        <span className="noc-components-noc-uploaded-document--style-3">{t(documentType?.replaceAll(".", "_"))}</span>

        <img
          src={docUrl}
          alt={documentName || t(documentType?.replaceAll(".", "_"))}
          className={docUrl ? "noc-uploaded-document__image noc-uploaded-document__image--clickable" : "noc-uploaded-document__image"}
          onClick={() => docUrl && setZoomUrl(docUrl)}
        />

        {(latitude || longitude) && (
          <div>
            {latitude && <div>Lat: {latitude}</div>}
            {longitude && <div>Long: {longitude}</div>}
          </div>
        )}

        {dateTaken && (
          <div className="noc-components-noc-uploaded-document--style-4">
            <span>Date Taken: {dateTaken}</span>
          </div>
        )}
      </div>

      {zoomUrl && <ImageViewer imageSrc={zoomUrl} onClose={onCloseZoom} />}
    </div>
  );
};

export default NocUploadedDocument;
