import React, { useState, Fragment, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FormComposer, Card, CardHeader, Header, SearchField, CardText, SearchForm,Toast } from "@upyog/digit-ui-react-components";
import { wsBillGeneratedResponseConfig } from "../../config/wsBillGeneratedResponseConfig";
const BillGeneration = () => {
    const { t } = useTranslation();
    const WSBillSearch = Digit.ComponentRegistryService.getComponent("WSBillSearch");
    const tenantId = Digit.ULBService.getCurrentTenantId();
    const [showToast, setShowToast] = useState(null);
    const [resData, setResData] = useState()
    const onSubmit = (data) => {
        console.log("Data in BillGeneration: ", data)
    };
    const getResData = (data) => {
        // console.log("Res Data in Bill Generation",data)
        setResData(data)
    }

    console.log("setResData", resData)
    const formatDate = (timestamp) => {
        if (timestamp != undefined) {
            const date = new Date(timestamp);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        }
        return ''
    };

    const closeToast = () => {
        setShowToast(null);
    };
    setTimeout(() => {
        closeToast();
    }, 10000);
 const handleSearch=(errorMsg)=>{
    setShowToast(errorMsg)
 }
    return (
        <div>
            <WSBillSearch
                // t={t}
                onSubmit={onSubmit}
                tenantId={tenantId}
                OnresData={getResData}
                onSearch={handleSearch}
            />
            {/* <FormComposer
                    // defaultValues={currentStepData}
                    // //heading={t("")}
                    heading="Generate Bill Response"
                    config={wsBillGeneratedResponseConfig}
                    // onSubmit={goNext}
                    // onFormValueChange={onFormValueChange}
                    // isDisabled={!canSubmit}
                    label="Generate Bill Response"
                  /> */}

            <Card style={{ padding: '25px' }}>
                <Header styles={{ fontSize: "32px" }}>
                    Bill Generated Response
                </Header>
                <form className={`search-form-wrapper ws-custom-wrapper`} >

                    <SearchField style={{ marginBottom: '15px' }}>
                        <label style={{ fontSize: '22px', fontWeight: 'bold' }}>Transaction Type</label>
                        <CardText style={{ marginTop: '10px', fontSize: '20px', marginBottom: '10px' }}>{resData?.[0]?.transactionType}</CardText>
                    </SearchField>
                    <SearchField>
                        <label style={{ fontSize: '22px', fontWeight: 'bold' }}>Locality/Group</label>
                        <CardText style={{ marginTop: '10px', fontSize: '20px', marginBottom: '10px' }}>{resData?.[0]?.locality}</CardText>
                    </SearchField>
                    <SearchField>
                        <label style={{ fontSize: '22px', fontWeight: 'bold' }}>Billing StartDate</label>
                        <CardText style={{ marginTop: '10px', fontSize: '20px', marginBottom: '10px' }}>{formatDate(resData?.[0]?.billingcycleStartdate)}</CardText>
                    </SearchField>
                    <SearchField>
                        <label style={{ fontSize: '22px', fontWeight: 'bold' }}>Billing EndDate</label>
                        <CardText style={{ marginTop: '10px', fontSize: '20px', marginBottom: '10px' }}>{formatDate(resData?.[0]?.billingcycleEnddate)}</CardText>
                    </SearchField>
                    <SearchField>
                        <label style={{ fontSize: '22px', fontWeight: 'bold' }}>Status</label>
                        <CardText style={{ marginTop: '10px', fontSize: '20px', marginBottom: '10px' }}>{resData?.[0]?.status}</CardText>
                    </SearchField>
                    <SearchField>
                        <label style={{ fontSize: '22px', fontWeight: 'bold' }}>Tenant Id</label>
                        <CardText style={{ marginTop: '10px', fontSize: '20px', marginBottom: '10px' }}>{resData?.[0]?.tenantId}</CardText>
                    </SearchField>
                    <SearchField></SearchField>
                    <SearchField></SearchField>
                </form>

            </Card>
            {showToast && <Toast error={showToast.key} label={t(showToast.label)} onClose={closeToast} />}
        </div>
    )
}
export default BillGeneration;