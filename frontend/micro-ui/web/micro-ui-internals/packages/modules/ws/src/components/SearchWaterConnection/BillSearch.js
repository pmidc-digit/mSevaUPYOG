import React, { Fragment, useState } from "react";
import { SearchForm, Table, Card, CardText, Loader, Header, Toast, DownloadBtnCommon, UploadFile, SubmitBar, Modal } from "@upyog/digit-ui-react-components";
import { useForm, Controller } from "react-hook-form";
import BillSearchFields from "./BillSearchFields";
import { useTranslation } from "react-i18next";
const BillSearch = ({ tenantId, onSubmit, OnresData,onSearch }) => {
  console.log("Bill Search")
  const { t } = useTranslation();
  const { register, control, handleSubmit, setValue, getValues, reset } = useForm({
    defaultValues: {
      offset: 0,
      limit: 10,
      sortBy: "consumerNo",
      sortOrder: "DESC",
      searchType: "CONNECTION",
      locality: "",
      tenantId: ""
    },
  });
  const handleResSubmit=(data)=>{
    OnresData(data)
    console.log("in handle res data")
  }
  console.log("setResData 2", OnresData)
  return (
    <Fragment>
      <Header styles={{ fontSize: "32px" }}>
        Generate Bill
      </Header>
      <SearchForm className="ws-custom-wrapper" onSubmit={onSubmit} handleSubmit={handleSubmit}>
        <BillSearchFields OnresData={OnresData} handleResSubmit={handleResSubmit} onSearch={onSearch} {...{ register, control, reset, tenantId, t, setValue }} />
      </SearchForm>

    </Fragment>
  )
}
export default BillSearch;