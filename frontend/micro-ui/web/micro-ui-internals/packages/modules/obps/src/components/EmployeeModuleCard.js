

// import React from "react";
// import { Link } from "react-router-dom"

// export const EmployeeModuleCard = ({
//   Icon,
//   moduleName,
//   kpis = [],
//   links = [],
//   isCitizen = false,
//   className,
//   styles,
//   FsmHideCount,
// }) => {
//   const parentClassName = "employeeCard card-home customEmployeeCard"

//   return (
//     <div className={parentClassName} style={className ? {} : styles}>
//       <div className="employeeCustomCard inbox-card-container">
//         <span className="inbox-text-employee-card">{moduleName}</span>
//         <div className="employee-card-banner">
//           <div className="body inbox-card-body">
//             <div className="inbox-outer-flex-column">
//               <div className="inbox-inner-flex-row">
//                 <div className="inbox-icon-container">
//                   <span className="icon-banner-employee inbox-icon-banner-style">{Icon}</span>
//                 </div>

//                 <div className="inbox-kpi-container">
//                   {kpis.length !== 0 && (
//                     <div className={`flex-fit ${isCitizen ? "inbox-flex-fit-citizen" : ""}`}>
//                       {kpis.map(({ count, label, link }, index) => (
//                         <div className="card-count inbox-card-count-style" key={index}>
//                           <div className="inbox-count-wrapper">
//                             <div className="inbox-label-text">
//                               {link ? (
//                                 <Link to={link} className="employeeTotalLink">
//                                   {label}
//                                 </Link>
//                               ) : null}
//                             </div>
//                             <div className="inbox-count-text">
//                               <span className="inbox-count-value">{count || "-"}</span>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div>
//                 <div className="links-wrapper inbox-links-wrapper-style">
//                   {links.map(({ count, label, link }, index) => (
//                     <div className="link inbox-link-item" key={index}>
//                       {link ? (
//                         <div className="inbox-link-flex">
//                           <Link to={link}>{label}</Link>
//                           {index != links.length - 1 && <div>|</div>}
//                         </div>
//                       ) : null}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div></div>
//     </div>
//   )
// }





import React from "react"
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
  const [isHovered, setIsHovered] = React.useState(false)
  const [hoveredKpi, setHoveredKpi] = React.useState(null)

  const cardContainerStyle = {
    background: "#ffffff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: isHovered
      ? "0 20px 48px rgba(79, 101, 216, 0.2), 0 8px 20px rgba(0, 0, 0, 0.08)"
      : "0 8px 24px rgba(30, 58, 138, 0.1), 0 2px 8px rgba(0, 0, 0, 0.04)",
    transition: "all 0.3s ease",
    transform: isHovered ? "translateY(-8px)" : "translateY(0)",
    cursor: "pointer",
    margin: "24px 0",
    ...styles,
  }

  const headerStyle = {
    background: "linear-gradient(135deg, rgb(79, 101, 216) 0%, rgb(0, 21, 122) 100%)",
    padding: "60px 40px",
    textAlign: "center",
    color: "rgb(255, 255, 255)",
  }

  const titleStyle = {
    fontSize: "40px",
    fontWeight: "700",
    color: "white",
    margin: "0 0 12px",
    lineHeight: "1.2",
    textAlign: "center",
  }

  const subtitleStyle = {
    fontSize: "16px",
    color: "rgba(255, 255, 255, 0.95)",
    margin: "0",
    fontWeight: "400",
    lineHeight: "1.5",
    textAlign: "center",
  }

  const bodyStyle = {
    padding: "32px",
  }

  const contentWrapperStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  }

  const kpiContainerStyle = {
    display: "grid",
    gridTemplateColumns: isCitizen ? "1fr" : "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "20px",
  }

  const getKpiItemStyle = (index) => ({
    background: hoveredKpi === index ? "#f8fafc" : "#ffffff",
    padding: "20px 16px",
    borderRadius: "12px",
    border: hoveredKpi === index ? "2px solid rgb(79, 101, 216)" : "2px solid #e2e8f0",
    textAlign: "center",
    transition: "all 0.3s ease",
    cursor: "pointer",
    boxShadow: hoveredKpi === index ? "0 8px 20px rgba(79, 101, 216, 0.15)" : "0 2px 8px rgba(0, 0, 0, 0.04)",
    transform: hoveredKpi === index ? "translateY(-4px)" : "translateY(0)",
  })

  const kpiLabelStyle = {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "8px",
    display: "block",
  }

  const kpiValueStyle = {
    fontSize: "32px",
    fontWeight: "800",
    color: "rgb(79, 101, 216)",
  }

  const linksWrapperStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    paddingTop: "24px",
    borderTop: "2px solid #e2e8f0",
    justifyContent:"center",
  }

  const linkItemStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  }

  const linkStyle = {
    color: "rgb(79, 101, 216)",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "14px",
    padding: "10px 20px",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    background: "rgba(79, 101, 216, 0.08)",
    border: "1px solid rgba(79, 101, 216, 0.2)",
    cursor: "pointer",
    display: "inline-block",
  }

  const dividerStyle = {
    color: "#cbd5e1",
    fontWeight: "400",
    fontSize: "16px",
  }

  return (
    <div style={cardContainerStyle} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>{moduleName}</h1>
        {/* <p style={subtitleStyle}>{moduleName.toUpperCase()}_SUBTITLE</p> */}
      </div>

      {/* Body */}
      <div style={bodyStyle}>
        <div style={contentWrapperStyle}>
          {kpis.length !== 0 && (
            <div style={kpiContainerStyle}>
              {kpis.map(({ count, label, link }, index) => (
                <div
                  key={index}
                  style={getKpiItemStyle(index)}
                  onMouseEnter={() => setHoveredKpi(index)}
                  onMouseLeave={() => setHoveredKpi(null)}
                >
                  <span style={kpiLabelStyle}>
                    {link ? (
                      <Link to={link} style={{ color: "inherit", textDecoration: "none" }}>
                        {label}
                      </Link>
                    ) : (
                      label
                    )}
                  </span>
                  <span style={kpiValueStyle}>{count || "-"}</span>
                </div>
              ))}
            </div>
          )}

          {/* Links Section */}
          {links.length > 0 && (
            <div style={linksWrapperStyle}>
              {links.map(({ count, label, link }, index) => (
                <div key={index} style={linkItemStyle}>
                  {link ? (
                    <React.Fragment>
                      <Link to={link} style={linkStyle}>
                        {label}
                      </Link>
                      {index !== links.length - 1 && <span style={dividerStyle}>|</span>}
                    </React.Fragment>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}