import React from 'react';
import { useTranslation } from "react-i18next";

export const CustomLoader = ({ message }) => {
    const { t } = useTranslation();
    
    return (
        <div className="loader-message">
            <div className="body">
                <span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
                <div className="base">
                    <span></span>
                    <div className="face"></div>
                </div>
            </div>

            <div className="longfazers">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <div className="message">{t(message)}</div>
        </div>
    );
};