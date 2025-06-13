import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useHistory, useParams } from "react-router-dom";
import { BackButton, Card, CardHeader, CardLabelError, CardText, RadioButtons, SubmitBar } from "@mseva/digit-ui-react-components";

import { LOCALIZATION_KEY } from "../../../constants/Localization";
import { getRoute, PgrRoutes, PGR_BASE } from "../../../constants/Routes";

const ReasonPage = (props) => {
  const history = useHistory();
  const { t } = useTranslation();
  const { id } = useParams();
  const [selected, setSelected] = useState(null);
  const [valid, setValid] = useState(true);

  const onRadioChange = (value) => {
    let reopenDetails = Digit.SessionStorage.get(`reopen.${id}`);
    Digit.SessionStorage.set(`reopen.${id}`, { ...reopenDetails, reason: value });
    setSelected(value);
  };

  function onSave() {
    if (selected === null) {
      setValid(false);
    } else 
    // {
    //   history.push(`${props.match.path}/upload-photo/${id}`);
    // }
  //   {
  //   const basePath = props.match.path.split("/:id")[0];
  //   history.push(`${basePath}/upload-photo/${id}`);
  // }
  // {
  //   // Extract the current complaint ID and navigate to upload-photo step
  //   const currentUrlParts = window.location.pathname.split('/');
  //   const basePathParts = currentUrlParts.slice(0, currentUrlParts.indexOf('reopen') + 1);
  //   const complaintIdParts = currentUrlParts.slice(currentUrlParts.indexOf('reopen') + 1);
    
  //   const newPath = [...basePathParts, 'upload-photo', ...complaintIdParts].join('/');
  //   history.push(newPath);
  // }
  {
    const basePath = window.location.pathname.split('/reopen/')[0];
    const complaintId = id; // from useParams()
    
    const newURL = `${basePath}/reopen/upload-photo/${complaintId}`;
    console.log("Navigating to:", newURL);
    history.push(newURL);
    console.log("History after push:");
  }
  }

  return (
    <Card>
      <CardHeader>{t(`${LOCALIZATION_KEY.CS_REOPEN}_COMPLAINT`)}</CardHeader>
      <CardText>
        {/* Select the option related to your complaint from the list given below.
        If the complaint type you are looking for is not listed select others.{" "} */}
        {/* {t(`${TRANSLATION_KEY}_OPTION_ONE`)} */}
      </CardText>
      {valid ? null : <CardLabelError>{t(`${LOCALIZATION_KEY.CS_ADDCOMPLAINT}_ERROR_REOPEN_REASON`)}</CardLabelError>}
      <RadioButtons
        // handleChange={onRadioChange}
        onSelect={onRadioChange}
        selectedOption={selected}
        // selected={(value) => setSelected(value)}
        options={[
          t(`${LOCALIZATION_KEY.CS_REOPEN}_OPTION_ONE`),
          t(`${LOCALIZATION_KEY.CS_REOPEN}_OPTION_TWO`),
          t(`${LOCALIZATION_KEY.CS_REOPEN}_OPTION_THREE`),
          t(`${LOCALIZATION_KEY.CS_REOPEN}_OPTION_FOUR`),
        ]}
      />

      <SubmitBar label={t(`CS_COMMON_NEXT`)} onSubmit={onSave} />
    </Card>
  );
};

export default ReasonPage;
