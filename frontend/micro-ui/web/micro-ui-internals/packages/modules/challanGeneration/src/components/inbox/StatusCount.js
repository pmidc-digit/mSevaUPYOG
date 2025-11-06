import React from "react";
import { useTranslation } from "react-i18next";
import { CheckBox } from "@mseva/digit-ui-react-components";

const StatusCount = ({ status, searchParams, onAssignmentChange, businessServices, clearCheck, setclearCheck, setSearchParams, _searchParams }) => {
  const { t } = useTranslation();

  console.log("_searchParams", _searchParams);
  console.log("status", status);

  return (
    <CheckBox
      onChange={(e) => onAssignmentChange(e, status)}
      checked={(() => {
        //IIFE
        if (!clearCheck) return _searchParams?.status?.some((e) => e === status.code);
        else {
          setclearCheck(false);
          return false;
        }
      })()}
      label={`${t(status.name)}`}
    />
  );
};

export default StatusCount;
