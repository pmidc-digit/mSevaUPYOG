import React, { useEffect, useState } from "react";
import { ImageViewer, Card, CardSubHeader } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const LayoutImageView = ({ ownerFileStoreId, ownerName, documents }) => {
  const stateCode = Digit.ULBService.getStateId();
  const { t } = useTranslation();
  const [imageCitizenZoom, setImageCitizenZoom] = useState(null);
  const [imageZoom, setImageZoom] = useState(null);

  const onCloseImageZoom = () => {
    setImageZoom(null);
  };

  useEffect(() => {
    (async () => {
      // First try to use ownerFileStoreId directly
      let fileStoreId = ownerFileStoreId;
      
      // If not available, try to find from documents array
      if (!fileStoreId && documents) {
        fileStoreId = documents?.find((doc) => doc.documentType === "OWNER.OWNERPHOTO")?.documentUid || "";
      }

      if (fileStoreId) {
        const result = await Digit.UploadServices.Filefetch([fileStoreId], stateCode);
        if (result?.data?.fileStoreIds) {
          setImageCitizenZoom(result.data.fileStoreIds[0]?.url);
        }
      }
    })();
  }, [ownerFileStoreId, documents]);

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px", padding: "0px 20px" }}>
        <div style={{ textAlign: "center" }}>
          <img
            src={imageCitizenZoom}
            alt="Owner Photo"
            style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "10%", cursor: imageCitizenZoom ? "pointer" : "default" }}
            onClick={() => imageCitizenZoom && setImageZoom(imageCitizenZoom)}
          />
          <div>{ownerName || "Owner Photo"}</div>
        </div>
      </div>
      {imageZoom && <ImageViewer imageSrc={imageZoom} onClose={onCloseImageZoom} />}
    </Card>
  );
};

export default LayoutImageView;