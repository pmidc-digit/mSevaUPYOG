import React, { useEffect, useState} from "react";
import {ImageViewer, Card, CardSubHeader} from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const NOCImageView = ({ownerFileStoreId, ownerName}) => {
    const stateCode = Digit.ULBService.getStateId();
    const { t } = useTranslation();
    const [imageCitizenZoom, setImageCitizenZoom] = useState(null);
    const [imageZoom, setImageZoom] = useState(null);

    const onCloseImageZoom = () => {
        setImageZoom(null);
    };

  useEffect(() => {
    (async () => {
      if (ownerFileStoreId) {
        const result = await Digit.UploadServices.Filefetch([ownerFileStoreId], stateCode);
        if (result?.data?.fileStoreIds) {
          setImageCitizenZoom(result.data.fileStoreIds[0]?.url);
        }
      }
    })();
  }, [ownerFileStoreId]);
  
return (
  <div style={{ padding: "20px 0px" }}>
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px", padding: "0px 20px" }}>
      <div style={{ textAlign: "center" }}>
        <img
          src={imageCitizenZoom}
          alt="Primary Owner Photo"
          style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "10%", cursor: imageCitizenZoom ? "pointer" : "default" }}
          onClick={() => imageCitizenZoom && setImageZoom(imageCitizenZoom)}
        />
        <div> <h2>{t("OWNER_OWNERPHOTO")} : {ownerName}</h2></div>
      </div>
    </div>
    {imageZoom && <ImageViewer imageSrc={imageZoom} onClose={onCloseImageZoom} />}
  </div>
);
};

export default NOCImageView;