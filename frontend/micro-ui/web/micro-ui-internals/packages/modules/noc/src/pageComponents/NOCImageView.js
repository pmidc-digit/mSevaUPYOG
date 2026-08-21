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
  <div className="noc-page-components-nocimage-view--style-1">
    <div className="noc-page-components-nocimage-view--style-2">
      <div className="noc-page-components-nocimage-view--style-3">
        <img
          src={imageCitizenZoom}
          alt="Primary Owner Photo"
          className={imageCitizenZoom ? "noc-image-view__image noc-image-view__image--clickable" : "noc-image-view__image"}
          onClick={() => imageCitizenZoom && setImageZoom(imageCitizenZoom)}
        />
        <div> <h2>{ownerName}</h2></div>
      </div>
    </div>
    {imageZoom && <ImageViewer imageSrc={imageZoom} onClose={onCloseImageZoom} />}
  </div>
);
};

export default NOCImageView;
