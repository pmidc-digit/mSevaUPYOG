import React from "react";
import { useTranslation } from "react-i18next";
import TopBarSideBar from "../../components/TopBarSideBar";
import ENakshaContent from "./ENakshaContent";

export default function ENaksha(props) {
  const { t } = useTranslation();
  return (
    <div className="citizen enaksha-shell">
      <TopBarSideBar {...props} t={t} linkData={{}} />
      <ENakshaContent />
    </div>
  );
}
