

import React from "react";
import { Link } from "react-router-dom"

export const EmployeeModuleCard = ({
  Icon,
  moduleName,
  kpis = [],
  links = [],
  isCitizen = false,
  className,
  styles,
  FsmHideCount,
}) => {
  const parentClassName = "employeeCard card-home customEmployeeCard"

  return (
    <div className={parentClassName} style={className ? {} : styles}>
      <div className="employeeCustomCard inbox-card-container">
        <span className="inbox-text-employee-card">{moduleName}</span>
        <div className="employee-card-banner">
          <div className="body inbox-card-body">
            <div className="inbox-outer-flex-column">
              <div className="inbox-inner-flex-row">
                <div className="inbox-icon-container">
                  <span className="icon-banner-employee inbox-icon-banner-style">{Icon}</span>
                </div>

                <div className="inbox-kpi-container">
                  {kpis.length !== 0 && (
                    <div className={`flex-fit ${isCitizen ? "inbox-flex-fit-citizen" : ""}`}>
                      {kpis.map(({ count, label, link }, index) => (
                        <div className="card-count inbox-card-count-style" key={index}>
                          <div className="inbox-count-wrapper">
                            <div className="inbox-label-text">
                              {link ? (
                                <Link to={link} className="employeeTotalLink">
                                  {label}
                                </Link>
                              ) : null}
                            </div>
                            <div className="inbox-count-text">
                              <span className="inbox-count-value">{count || "-"}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="links-wrapper inbox-links-wrapper-style">
                  {links.map(({ count, label, link }, index) => (
                    <div className="link inbox-link-item" key={index}>
                      {link ? (
                        <div className="inbox-link-flex">
                          <Link to={link}>{label}</Link>
                          {index != links.length - 1 && <div>|</div>}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div></div>
    </div>
  )
}
