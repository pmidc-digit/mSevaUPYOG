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
    }
    else {
      const basePath = window.location.pathname.split("/reopen/")[0];
      const complaintId = id; 

      const newURL = `${basePath}/reopen/upload-photo/${complaintId}`;
      history.push(newURL);
    }
  }

  return (
    <Card>
      <CardHeader>{t(`${LOCALIZATION_KEY.CS_REOPEN}_COMPLAINT`)}</CardHeader>
      <CardText>
      </CardText>
      {valid ? null : <CardLabelError>{t(`${LOCALIZATION_KEY.CS_ADDCOMPLAINT}_ERROR_REOPEN_REASON`)}</CardLabelError>}
      <RadioButtons
        // handleChange={onRadioChange}
        onSelect={onRadioChange}
        selectedOption={selected}
        // selected={(value) => setSelected(value)}
        options={[
          t(`${LOCALIZATION_KEY.CS_REOPEN}_NO_ACTION_TAKEN`),
          t(`${LOCALIZATION_KEY.CS_REOPEN}_ISSUE_NOT_RESOLVED`),
          t(`${LOCALIZATION_KEY.CS_REOPEN}_PARTIAL_RESOLUTION`),
          t(`${LOCALIZATION_KEY.CS_REOPEN}_PROBLEM_RECURRED`),
        ]}
      />

      <SubmitBar label={t(`CS_COMMON_NEXT`)} onSubmit={onSave} />
    </Card>
  );
};

export default ReasonPage;
