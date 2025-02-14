import React from "react";
import { useTranslation } from "react-i18next";
import { Loader } from "@mseva/digit-ui-react-components"
import { Redirect, Route, Switch, useLocation, useRouteMatch, useHistory } from "react-router-dom";
const Header = () => {
  const { data: storeData, isLoading } = Digit.Hooks.useStore.getInitData();
  const { path } = useRouteMatch();
  const { stateInfo } = storeData || {};
  const { t } = useTranslation()
 console.log("header path",path)
  if (isLoading) return <Loader/>;

  return (
    <div className="bannerHeader">
       <div className="appbar">
           <div className="appbar-container">
             <div className="appbar-box-left">
                   Government of India
               </div>
               <div className="appbar-box-right">
                   <span>Skip to Main Content</span>
               </div>
           </div>
         </div>
         <div className="topHeader">
            <div className="topHeader-container">
              <div className="topHeader-box-left">PMIDC</div>
              <div className="topHeader-box-center">
                  <ul>
                    <li>Home</li>
                    <li>Quick Pay</li>
                   
                    <li>Contact</li>
                    <li><a href={`/digit-ui/faqss`} >FAQ</a></li>
                  </ul>
              </div>
              <div className="topHeader-box-right">
                  <div className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">Login</div>
              </div>
            </div>
         </div>
        <div className="heroSection"> 
            <img src="https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/1cace0150346b2e2f5989aaaf63b8e26.jpeg"
              alt="banner Image" />
        </div>
    </div>
  );
}

export default Header;