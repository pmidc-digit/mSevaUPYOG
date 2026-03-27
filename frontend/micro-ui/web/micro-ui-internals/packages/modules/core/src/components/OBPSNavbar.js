import React, { useState } from "react";
import { LoaderNew } from "../../../templates/ApplicationDetails/components/LoaderNew";

const Section = ({ item }) => {
  const [open, setOpen] = useState(false);
  return (
    <li className="obps-nav-section" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="section-btn"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
      >
        {item.name}
      </button>
      <ul className={"dropdown " + (open ? "open" : "")}>
        {item.links && item.links.map((ln) => (
          <LinkItem key={ln.code} link={ln} />
        ))}
      </ul>
    </li>
  );
};

const LinkItem = ({ link }) => {
  const [open, setOpen] = useState(false);
  if (link.isSubsection && Array.isArray(link.subsection) && link.subsection.length) {
    return (
      <li className="has-subsection">
        <button
          type="button"
          className="subsection-btn"
          aria-haspopup="true"
          aria-expanded={open}
          onClick={() => setOpen((s) => !s)}
        >
          {link.displayName}
        </button>
        <ul className={"sub-dropdown " + (open ? "open" : "")}>
          {link.subsection.map((s) => (
            <li key={s.code}>
              <a href={s.link || "#"} target="_blank" rel="noopener noreferrer">{s.displayName || s.name}</a>
            </li>
          ))}
        </ul>
      </li>
    );
  }

  return (
    <li>
      <a href={link.link || "#"} target="_blank" rel="noopener noreferrer">{link.displayName || link.name}</a>
    </li>
  );
};

const OBPSNavbar = () => {
  const stateId = Digit.ULBService.getStateId();
  const { data: apiData, isLoading} = Digit.Hooks.useCustomMDMS(stateId, "common-masters", [{ name: "uiObpsHomePage" }]);
  const items = apiData?.["common-masters"]?.uiObpsHomePage?.[0]?.sectionHeaders || [];

  if(isLoading) return <LoaderNew page={true} />;

  return (
    <nav className="obps-navbar">
      <style>{`
        .obps-navbar { background: #fff; border-bottom: 1px solid #eee; font-family: inherit; }
        .obps-navbar ul { list-style: none; margin: 0; padding: 0; display: flex; gap: 8px; align-items: center; }
        .obps-navbar .obps-nav-section { position: relative; }
        .obps-navbar .section-btn { background: none; border: none; padding: 10px 12px; cursor: pointer; font-weight: 600; }
        .obps-navbar .dropdown { display: none; position: absolute; top: 100%; left: 0; background: #fff; min-width: 220px; box-shadow: 0 6px 12px rgba(0,0,0,0.08); padding: 6px 0; z-index: 1000; }
        .obps-navbar .dropdown.open { display: block; }
        .obps-navbar .dropdown li { padding: 6px 14px; white-space: nowrap; }
        .obps-navbar .dropdown a { color: #333; text-decoration: none; display: block; }
        .obps-navbar .has-subsection { position: relative; }
        .obps-navbar .subsection-btn { background: none; border: none; padding: 6px 0; width: 100%; text-align: left; cursor: pointer; }
        .obps-navbar .sub-dropdown { display: none; position: absolute; left: 100%; top: 0; background: #fff; min-width: 200px; box-shadow: 0 6px 12px rgba(0,0,0,0.08); padding: 6px 0; }
        .obps-navbar .sub-dropdown.open { display: block; }
        .obps-navbar .sub-dropdown li { padding: 6px 12px; }
        .obps-navbar a:hover, .obps-navbar button:hover { opacity: 0.9; }
      `}</style>

      <ul>
        {items.map((it) => (
          <Section key={it.code} item={it} />
        ))}
      </ul>
    </nav>
  );
};

export default OBPSNavbar;