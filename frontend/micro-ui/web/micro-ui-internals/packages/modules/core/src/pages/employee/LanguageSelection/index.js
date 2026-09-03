import { Card, CustomButton, SubmitBar } from "@mseva/digit-ui-react-components";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import Background from "../../../components/Background";

const LanguageSelection = () => {
  const { data: storeData, isLoading } = Digit.Hooks.useStore.getInitData();
  const { t } = useTranslation();
  const history = useHistory();
  const { languages, stateInfo } = storeData || {};
  const selectedLanguage = Digit.StoreData.getCurrentLanguage();
  const [selected, setselected] = useState(selectedLanguage);
  const handleChangeLanguage = (language) => {
    setselected(language.value);
    Digit.LocalizationService.changeLanguage(language.value, stateInfo.code);
  };

  const handleSubmit = () => {
    history.push("/digit-ui/employee/user/login");
  };

  if (isLoading) return null;

  return (
    <Background className="mseva-employee-background">
      <div className="mseva-employee-entry">
        <header className="mseva-entry-header">
          <button type="button" className="mseva-entry-brand" onClick={() => history.push("/digit-ui/employee")}>
            <img src="/digit-ui/mseva-punjab-logo.jpeg" alt="mSeva Punjab Local Government" />
          </button>
          <div className="mseva-entry-civic-title" aria-label="mSeva">mSeva</div>
          <nav className="mseva-entry-nav mseva-entry-nav--home" aria-label="Portal navigation">
            <span className="is-active">Home</span>
          </nav>
        </header>

        <main className="mseva-employee-entry__content">
          <section className="mseva-employee-entry__hero">
            <p className="mseva-entry-eyebrow">Punjab Local Government</p>
            <h1>Welcome to <span>mSeva</span></h1>
            <p>Manage municipal services and citizen applications through one secure, accessible platform.</p>
            <div className="mseva-employee-entry__features">
              <span>Secure access</span>
              <span>Real-time updates</span>
              <span>Citizen centric</span>
            </div>
          </section>

          <Card className="langSelection mseva-entry-language-card">
            <div className="mseva-entry-language-card__header">
              <span>Employee Portal</span>
              <h1>Select your language</h1>
              <p>Choose a language before signing in to your employee account.</p>
            </div>
            <div className="language-selector">
              {languages.map((language, index) => (
                <div className="language-button-container" key={index}>
                  <CustomButton
                    selected={language.value === selected}
                    text={language.label}
                    onClick={() => handleChangeLanguage(language)}
                  />
                </div>
              ))}
            </div>
            <SubmitBar label={t(`CORE_COMMON_CONTINUE`)} onSubmit={handleSubmit} />
          </Card>
        </main>
      </div>

      <div style={{ display:"none",width: '100%', position: 'fixed', bottom: 0,backgroundColor:"#152265",textAlign:"center" }}>
      <div style={{backgroundColor:'#F5FBFF', width:'100%',minHeight:'100px'}}></div>
      <div style={{backgroundColor:'#294A97', width:'100%',minHeight:'200px'}}>
   </div>
        <div style={{ display: 'flex', justifyContent: 'center', color:"white" }}>
          <span style={{ cursor: "pointer", fontSize: window.Digit.Utils.browser.isMobile()?"12px":"14px", fontWeight: "400"}} onClick={() => { window.open('https://www.digit.org/', '_blank').focus();}} >Powered by DIGIT</span>
          <span style={{ margin: "0 10px" ,fontSize: window.Digit.Utils.browser.isMobile()?"12px":"14px"}}>|</span>
          <a style={{ cursor: "pointer", fontSize: window.Digit.Utils.browser.isMobile()?"12px":"14px", fontWeight: "400"}} href="#" target='_blank'>UPYOG License</a>

          <span  className="upyog-copyright-footer" style={{ margin: "0 10px",fontSize: window.Digit.Utils.browser.isMobile()?"12px":"14px" }} >|</span>
          <span  className="upyog-copyright-footer" style={{ cursor: "pointer", fontSize: window.Digit.Utils.browser.isMobile()?"12px":"14px", fontWeight: "400"}} onClick={() => { window.open('', '_blank').focus();}} >Copyright © {new Date().getFullYear()}</span>
          
          {/* <a style={{ cursor: "pointer", fontSize: "16px", fontWeight: "400"}} href="#" target='_blank'>UPYOG License</a> */}
        </div>
        <div className="upyog-copyright-footer-web">
          <span className="" style={{ cursor: "pointer", fontSize:  window.Digit.Utils.browser.isMobile()?"12px":"14px", fontWeight: "400"}} onClick={() => { window.open('', '_blank').focus();}} >Copyright © {new Date().getFullYear()}</span>
          </div>
       
      </div>

{/* 
      <div style={{ width: '100%', position: 'fixed', bottom: 0,backgroundColor:"white",textAlign:"center" }}>
        <div style={{ display: 'flex', justifyContent: 'center', color:"black" }}>
          <span style={{ cursor: "pointer", fontSize: window.Digit.Utils.browser.isMobile()?"12px":"12px", fontWeight: "400"}} onClick={() => { window.open('https://www.digit.org/', '_blank').focus();}} >Powered by DIGIT</span>
          <span style={{ margin: "0 10px" ,fontSize: window.Digit.Utils.browser.isMobile()?"12px":"12px"}}>|</span>
          <a style={{ cursor: "pointer", fontSize: window.Digit.Utils.browser.isMobile()?"12px":"12px", fontWeight: "400"}} href="#" target='_blank'>UPYOG License</a>

          <span  className="upyog-copyright-footer" style={{ margin: "0 10px",fontSize:"12px" }} >|</span>
          <span  className="upyog-copyright-footer" style={{ cursor: "pointer", fontSize: window.Digit.Utils.browser.isMobile()?"12px":"12px", fontWeight: "400"}} onClick={() => { window.open('', '_blank').focus();}} >Copyright © {new Date().getFullYear()} -</span>
          
          {/* <a style={{ cursor: "pointer", fontSize: "16px", fontWeight: "400"}} href="#" target='_blank'>UPYOG License</a> */}

        {/* </div>
        <div className="upyog-copyright-footer-web">
          <span className="" style={{ cursor: "pointer", fontSize:  window.Digit.Utils.browser.isMobile()?"14px":"16px", fontWeight: "400"}} onClick={() => { window.open('', '_blank').focus();}} >Copyright © {new Date().getFullYear()} -</span>
          </div>
      </div> */}
    </Background>
  );
};

export default LanguageSelection;
