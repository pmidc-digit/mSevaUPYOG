import React from "react";
import { useTranslation } from "react-i18next";
import { Loader } from "@upyog/digit-ui-react-components"

const Header = () => {
  const { data: storeData, isLoading } = Digit.Hooks.useStore.getInitData();
  const { stateInfo } = storeData || {};
  const { t } = useTranslation()

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
                    <li>FAQ</li>
                    <li>Contact</li>
                  </ul>
              </div>
              <div className="topHeader-box-right">
                  <div className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">Login</div>
              </div>
            </div>
         </div>
        <div className="heroSection"> 
            <img src="https://s3-alpha-sig.figma.com/img/edaf/850b/1cace0150346b2e2f5989aaaf63b8e26?Expires=1737331200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=WYPvQJ9~Ss01sRPmILdD3Vvi910Suin6VisIj5H4usV-NWPfgn9U1C4sG4ULFcRBcuWwsWVBMMhWjoG2aitBdP4sZEreQ8xCWOM-YI-wMbUbQnyQcU7DcvGhesHhEtrlA3DSVJ3glxEERKPtdZrFXw8w1P5cpctl3Ox4efJ7z77XGtyOIN7eEqCzuDg8iRmHCYSEbxD~q0YL7AEeAgqB9Eb0YVYFvJz7FZaoPA3fR94JAZ~Ay9dXo5XsqDO1R8TKX2kM5ADNozJJh2TLsr2CNXtYSpfOmUkbwuUj8t24rP-qvNhEoaJEG7iUYgt2OYuLyEGuliw4I2kRKbH~kRLyEA__"
              alt="banner Image" />
        </div>
    </div>
  );
}

export default Header;