import React,{useState} from "react";
import { useTranslation } from "react-i18next";
import { TelePhone, DisplayPhotos } from "@mseva/digit-ui-react-components";
import BPAReason from "./BPAReason";

const BPACaption = ({ data,OpenImage }) => {
  const { t } = useTranslation();
  const [viewMore, setviewMore] = useState(false);
  return (
    <div>
      {data.date && <p>{data.date}</p>}
      <p>{data.name}</p>
      {data.mobileNumber && <TelePhone mobile={data.mobileNumber} />}
      {data.source && <p>{t("ES_APPLICATION_DETAILS_APPLICATION_CHANNEL_" + data.source.toUpperCase())}</p>}
      {/* //TODO: please find a better way to display in checkpoints */}
      {data.comment && <BPAReason otherComment={data?.otherComment} headComment={data?.comment}></BPAReason>}
      {data?.wfComment ? <div>{data?.wfComment?.map( e =>
      <div className="TLComments">
        <h3>{t("WF_COMMON_COMMENTS")}</h3>
        {!viewMore && (
        <div>
         <p className="obps-pages-citizen-bpa-application-detail-bpacaption--style-1">{e}</p>
          {e.length>36?(<button
            type="button"
            onClick={() => {
              setviewMore(true);
            }}
            className="obps-pages-citizen-bpa-application-detail-bpacaption--style-2"
          >
            {t("View More")}
          </button>):null}
        </div>
      )}
      {viewMore && (
        <div >
          <p className="obps-pages-citizen-bpa-application-detail-bpacaption--style-3">{e}</p>
          <button
            type="button"
            onClick={() => {
              setviewMore(false);
            }}
            className="obps-pages-citizen-bpa-application-detail-bpacaption--style-4"
          >
            {t("View Less")}
          </button>
        </div>
      )}
      </div>
      )}</div> : null}
      {data?.thumbnailsToShow?.thumbs?.length > 0 ? <div className="TLComments">
      <h3>{t("CS_COMMON_ATTACHMENTS")}</h3>
      <DisplayPhotos srcs={data?.thumbnailsToShow.thumbs} onClick={(src, index) => {OpenImage(src, index,data?.thumbnailsToShow)}} />
    </div> : null}
    </div>
  );
}

export default BPACaption;