import React, { useEffect, useState } from "react";
import { Link, useHistory, useParams,useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Card, SubmitBar, BackButton, ImageUploadHandler, CardLabelError, LinkButton } from "@mseva/digit-ui-react-components";

import { LOCALIZATION_KEY } from "../../../constants/Localization";

const UploadPhoto = (props) => {
  const { t } = useTranslation();
  const history = useHistory();
  let { id } = useParams();
  const [verificationDocuments, setVerificationDocuments] = useState(null);
  const [valid, setValid] = useState(true);

  const handleUpload = (ids) => {
    setDocState(ids);
  };
  const location = useLocation();
const tenantId = Digit.SessionStorage.get("CITIZEN.COMMON.HOME.CITY")?.code || Digit.ULBService.getCurrentTenantId();
const complaintDetails = location.state?.complaintDetails || Digit.Hooks.swach.useComplaintDetails({ tenantId, id }).complaintDetails;
 const cities = Digit.Hooks.swach.useTenants();
  const getCities = () => cities || [];
  const [selectedCity, setSelectedCity] = useState(getCities()[0] ? getCities()[0] : null);
  const selectCity = async (city) => {
    // if (selectedCity?.code !== city.code) {}
    setSelectedCity(city);

    return;
  };
  const setDocState = (ids) => {
    if (ids?.length) {
      const documents = ids.map((id) => ({
        documentType: "PHOTO",
        fileStoreId: id,
        documentUid: "",
        additionalDetails: {},
      }));
      setVerificationDocuments(documents);
    }
  };

  function save() {
    if (verificationDocuments === null) {
      setValid(false);
    } else {
       const parts = window.location.pathname.split("/");
      const uploadIndex = parts.indexOf("upload-photo");
      const newParts = [...parts.slice(0, uploadIndex), "addional-details", ...parts.slice(uploadIndex + 1)];
      // history.push(newParts.join("/"));
      history.push({
      pathname: newParts.join("/"),
      state: { complaintDetails }
    });
    }
  }

  function skip() {
    history.push(`${props.match.path}/addional-details/${id}`);
  }

  useEffect(() => {
    let reopenDetails = Digit.SessionStorage.get(`reopen.${id}`);
    Digit.SessionStorage.set(`reopen.${id}`, { ...reopenDetails, verificationDocuments });
  }, [verificationDocuments, id]);

  return (
    <React.Fragment>
      <Card>
        <ImageUploadHandler
          header={t(`${LOCALIZATION_KEY.CS_ADDCOMPLAINT}_UPLOAD_PHOTO`)}
           tenantId={selectCity ? selectedCity.code : "pb"}
          cardText=""
          onPhotoChange={handleUpload}
          uploadedImages={null}
        />
        {/* <Link to={`${props.match.path}/addional-details/${id}`}>
          <SubmitBar label={t(`${LOCALIZATION_KEY.PT_COMMONS}_NEXT`)} />
        </Link> */}

        {valid ? null : <CardLabelError>{t(`${LOCALIZATION_KEY.CS_ADDCOMPLAINT}_UPLOAD_ERROR_MESSAGE`)}</CardLabelError>}
        <SubmitBar label={t(`${LOCALIZATION_KEY.PT_COMMONS}_NEXT`)} onSubmit={save} />
        {/* {props.skip ? <LinkButton label={t(`${LOCALIZATION_KEY.CORE_COMMON}_SKIP_CONTINUE`)} onClick={skip} /> : null} */}
      </Card>
    </React.Fragment>
  );
};

export default UploadPhoto;
