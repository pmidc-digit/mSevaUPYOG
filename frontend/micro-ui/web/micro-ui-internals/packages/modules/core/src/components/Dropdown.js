import React, { useState, useEffect, useRef, useCallback } from "react";

var dropdownData = [
  {
    name: "VIDEO",
    code: "VIDEO",
    links: [
      {
        name: "BPA_CITIZEN_HOME_01_OBPS_VIDEO",
        code: "VIDEO_1",
        displayName: "How To Register",
        sectionCode: "VIDEO",
        link: "https://youtu.be/hA8Tu3M45fg",
        isSubsection: false,
        subsection: []
      }
    ]
  },
  {
    name: "OTHERS",
    code: "OTHERS",
    links: [
      {
        name: "LIST_OF_APPROVED",
        code: "LIST_OF_APPROVED",
        displayName: "List of approved professional",
        sectionCode: "OTHERS",
        link: "",
        isSubsection: true,
        subsection: [
          {
            name: "BPA_OTHERS_ARCHITECT",
            code: "OTHERS_1",
            displayName: "Architect",
            sectionCode: "OTHERS",
            link: "https://enaksha.lgpunjab.gov.in/list_professional.php?dsfXX=Mg=="
          },
          {
            name: "BPA_OTHERS_BUILDING_DESIGNER_SUPERVISOR",
            code: "OTHERS_2",
            displayName: "Building designer and supervisor",
            sectionCode: "OTHERS",
            link: "https://enaksha.lgpunjab.gov.in/list_professional.php?dsfXX=MTQ="
          },
          {
            name: "BPA_OTHERS_ENGINEER",
            code: "OTHERS_3",
            displayName: "Engineer",
            sectionCode: "OTHERS",
            link: "https://enaksha.lgpunjab.gov.in/list_professional.php?dsfXX=MTI="
          },
          {
            name: "BPA_OTHERS_EMPANELED_ARCHITECT_LIST",
            code: "OTHERS_4",
            displayName: "Empaneled Architect List",
            sectionCode: "OTHERS",
            link: "https://enaksha.lgpunjab.gov.in/architect_sc_p.php?dsfXX=MTI="
          }
        ]
      }
    ]
  },
  {
    name: "USER_MANUALS",
    code: "USERMANUALS",
    links: [
      {
        name: "BPA_CITIZEN_HOME_ARCHITECT_USER_MANUAL_LABEL",
        code: "USERMANUALS_1",
        displayName: "Professional User manual",
        sectionCode: "USERMANUALS",
        link: "https://sdc-uat.lgpunjab.gov.in/filestore/v1/files/viewfile/?name=pb%2FBPA%2FMarch%2F13%2F1773381471615HJwwGxBMja.pdf",
        isSubsection: false,
        subsection: []
      },
      {
        name: "BPA_CITIZEN_HOME_SCRUTINY_USER_MANUAL_LABEL",
        code: "USERMANUALS_2",
        displayName: "Scrutiny User manual",
        sectionCode: "USERMANUALS",
        link: "https://sdc-uat.lgpunjab.gov.in/filestore/v1/files/viewfile/?name=pb%2FBPA%2FMarch%2F13%2F1773381813315LWyyZgRJkC.pdf",
        isSubsection: false,
        subsection: []
      }
    ]
  },
  {
    name: "SAMPLE_FILES",
    code: "SAMPLEFILES",
    links: [
      {
        name: "BPA_CITIZEN_HOME_01_AMRITTSAR_SAMPLE_DXF",
        code: "SAMPLEFILES_1",
        displayName: "Sample File 01 - Amritsar",
        sectionCode: "SAMPLEFILES",
        link: "https://sdc-uat.lgpunjab.gov.in/edcr/rest/dcr/downloadfile?tenantId=amritsar&fileStoreId=cec63f19-d800-4fb9-9cd6-a97a55da6c8c",
        isSubsection: false,
        subsection: []
      },
      {
        name: "BPA_CITIZEN_HOME_02_AMRITTSAR_SAMPLE_DXF",
        code: "SAMPLEFILES_2",
        displayName: "Sample File 02 - Amritsar",
        sectionCode: "SAMPLEFILES",
        link: "https://sdc-uat.lgpunjab.gov.in/edcr/rest/dcr/downloadfile?tenantId=amritsar&fileStoreId=3834dfdd-04e6-40f8-848c-182fe82d0d48",
        isSubsection: false,
        subsection: []
      },
      {
        name: "BPA_CITIZEN_HOME_01_TESTING_SAMPLE_DXF",
        code: "SAMPLEFILES_3",
        displayName: "Sample File 01 - Testing",
        sectionCode: "SAMPLEFILES",
        link: "https://mseva-dev.lgpunjab.gov.in/edcr/rest/dcr/downloadfile?tenantId=testing&fileStoreId=ba8183a1-dcc6-4aa8-8f4d-75d525bf12e4",
        isSubsection: false,
        subsection: []
      },
      {
        name: "BPA_CITIZEN_HOME_02_TESTING_SAMPLE_DXF",
        code: "SAMPLEFILES_4",
        displayName: "Sample File 02 - Testing",
        sectionCode: "SAMPLEFILES",
        link: "https://mseva-dev.lgpunjab.gov.in/edcr/rest/dcr/downloadfile?tenantId=testing&fileStoreId=ee19e32b-a3e3-4c13-86c8-e5c7cbb3993f",
        isSubsection: false,
        subsection: []
      },
      {
        name: "BPA_CITIZEN_HOME_03_TESTING_SAMPLE_DXF",
        code: "SAMPLEFILES_5",
        displayName: "Sample File 03 - Testing",
        sectionCode: "SAMPLEFILES",
        link: "https://mseva-dev.lgpunjab.gov.in/edcr/rest/dcr/downloadfile?tenantId=testing&fileStoreId=edfb9c3c-4ffb-4fa2-8609-23a9ba5aff43",
        isSubsection: false,
        subsection: []
      }
    ]
  }
];

function SubsectionMenu(props) {
  var items = props.items;
  var onClose = props.onClose;

  return React.createElement(
    "ul",
    { className: "dropdown-submenu" },
    items.map(function (sub) {
      return React.createElement(
        "li",
        { key: sub.code, className: "dropdown-item" },
        React.createElement(
          "a",
          {
            href: sub.link,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "dropdown-link dropdown-link--nested",
            onClick: function () { onClose(); }
          },
          sub.displayName
        )
      );
    })
  );
}

function DropdownItem(props) {
  var linkItem = props.linkItem;
  var onClose = props.onClose;
  var expandState = useState(false);
  var isExpanded = expandState[0];
  var setIsExpanded = expandState[1];

  if (linkItem.isSubsection) {
    return React.createElement(
      "li",
      { className: "dropdown-item dropdown-item--has-sub" },
      React.createElement(
        "button",
        {
          className: "dropdown-link dropdown-link--sub",
          onClick: function () { setIsExpanded(!isExpanded); },
          type: "button"
        },
        React.createElement("span", null, linkItem.displayName),
        React.createElement("span", { className: "dropdown-arrow" + (isExpanded ? " dropdown-arrow--open" : "") }, "\u25B6")
      ),
      isExpanded && React.createElement(SubsectionMenu, {
        items: linkItem.subsection,
        onClose: onClose
      })
    );
  }

  return React.createElement(
    "li",
    { className: "dropdown-item" },
    React.createElement(
      "a",
      {
        href: linkItem.link,
        target: "_blank",
        rel: "noopener noreferrer",
        className: "dropdown-link",
        onClick: function () { onClose(); }
      },
      linkItem.displayName
    )
  );
}

function Dropdown() {
  var openState = useState(false);
  var isOpen = openState[0];
  var setIsOpen = openState[1];
  var containerRef = useRef(null);

  var handleClickOutside = useCallback(function (e) {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(function () {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return function () {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [handleClickOutside]);

  function handleClose() {
    setIsOpen(false);
  }

  return React.createElement(
    "div",
    { className: "dropdown-container", ref: containerRef },
    React.createElement(
      "button",
      {
        className: "dropdown-trigger",
        onClick: function () { setIsOpen(!isOpen); },
        type: "button"
      },
      React.createElement("span", null, "Resources"),
      React.createElement("span", { className: "dropdown-caret" + (isOpen ? " dropdown-caret--open" : "") }, "\u25BC")
    ),
    isOpen && React.createElement(
      "div",
      { className: "dropdown-menu" },
      dropdownData.map(function (section) {
        return React.createElement(
          "div",
          { key: section.code, className: "dropdown-section" },
          React.createElement(
            "div",
            { className: "dropdown-section-title" },
            section.name.replace(/_/g, " ")
          ),
          React.createElement(
            "ul",
            { className: "dropdown-list" },
            section.links.map(function (linkItem) {
              return React.createElement(DropdownItem, {
                key: linkItem.code,
                linkItem: linkItem,
                onClose: handleClose
              });
            })
          )
        );
      })
    )
  );
}

export default Dropdown;