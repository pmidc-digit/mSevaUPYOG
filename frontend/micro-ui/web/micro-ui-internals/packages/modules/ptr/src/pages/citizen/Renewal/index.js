import { Card, CardHeader, CardText, Loader } from "@mseva/digit-ui-react-components";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export const PTRList = () => {
  const { t } = useTranslation();
  const userInfo = Digit.UserService.getUser();
  const tenantId = Digit.SessionStorage.get("CITIZEN.COMMON.HOME.CITY")?.code || userInfo?.info?.permanentCity;
  const { mobileNumber: mobileno, LicenseNumber: licenseno, tenantId: tenantID } = Digit.Hooks.useQueryParams();
  let filter1 = {};
  if (licenseno) filter1.licenseNumbers = licenseno;
  if (licenseno) filter1.tenantId = tenantID;
  if (!licenseno) filter1.mobileNumber = userInfo?.info?.mobileNumber;
  filter1 = { ...filter1, RenewalPending: true, tenantId: tenantId || tenantID, status: "APPROVED,CANCELLED,EXPIRED,MANUALEXPIRED" };
  //   const { isLoading, isError, error, data } = Digit.Hooks.tl.useTradeLicenseSearch({ filters: {} }, {});
  //   useEffect(() => {
  //     localStorage.setItem("TLAppSubmitEnabled", "true");
  //   }, []);
  //   if (isLoading) {
  //     return <Loader />;
  //   }
  //   let { Licenses: applicationsList } = data || {};
  //   let newapplicationlist = applicationsList;

  const { isLoading, error, data, isSuccess, revalidate } = Digit.Hooks.ptr.usePTRSearch({ tenantId, filters, auth });
  const newApplicationsList = data?.PetRegistrationApplications;

  return (
    <React.Fragment>

    </React.Fragment>);

};
