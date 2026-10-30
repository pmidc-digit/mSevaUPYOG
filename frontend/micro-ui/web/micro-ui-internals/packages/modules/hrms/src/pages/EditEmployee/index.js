import React from "react";
import { useParams } from "react-router-dom";
import EditForm from "./EditForm";
import { Loader, Header } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const EditEmpolyee = () => {
  const { t } = useTranslation();
  const isupdate = Digit.SessionStorage.get("isupdate");
  const { id: employeeId, tenantId } = useParams();
  const { isLoading, isError, data } = Digit.Hooks.hrms.useHRMSSearch({ codes: employeeId }, tenantId, null, isupdate);

  if (isLoading) {
    return <Loader />;
  }

  const employee = data?.Employees?.[0];
  if (isError || !employee) {
    return (
      <div className="hrms-emp-mapping__no-data">
        <Header>{t("HR_NO_EMPLOYEE_FOUND")}</Header>
      </div>
    );
  }

  return <EditForm data={employee} tenantId={tenantId} />;
};

export default EditEmpolyee;
