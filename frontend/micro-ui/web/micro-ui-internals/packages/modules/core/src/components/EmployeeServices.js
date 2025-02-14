import React from "react";
import { useLocation } from "react-router-dom";

const EmployeeServices = () => {
  const location = useLocation();
  const { state } = location;
  const modules = state?.modules || [];
  return (
    <div className="employee-app-container">
      <div className="ground-container moduleCardWrapper gridModuleWrapper">
        {modules.map(({ code }, index) => {
          const Card = Digit.ComponentRegistryService.getComponent(`${code}Card`) || (() => <React.Fragment />);
          return <Card key={index} />;
        })}
      </div>
    </div>
  );
};

export default EmployeeServices;
