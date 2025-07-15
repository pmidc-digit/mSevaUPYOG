import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import Stepper from "../../../../../../react-components/src/customComponents/Stepper";
import { CardHeader, Toast } from "@mseva/digit-ui-react-components";
import { useLocation } from "react-router-dom/cjs/react-router-dom";

export const GISIntegration = () => {
    return (
    <React.Fragment>
        <div>
            GIS Values
        </div>
    </React.Fragment>
    );
}