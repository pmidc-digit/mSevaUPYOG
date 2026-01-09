import { Loader, NavBar } from "@mseva/digit-ui-react-components";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import SideBarMenu from "../../../config/sidebar-menu";
import ChangeCity from "../../ChangeCity";
import StaticCitizenSideBar from "./StaticCitizenSideBar";
import SidebarProfile from "./SidebarProfile";

const defaultImage = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const Profile = ({ info, stateName, t }) => {
  const [profilePic, setProfilePic] = React.useState(info?.photo || null);
  const [email, setEmail] = React.useState(info?.emailId || null);

  React.useEffect(() => {
    const fetchProfileDetails = async () => {
      // const tenant = Digit.ULBService.getCurrentTenantId();
      const tenantId = window.location.href.includes("employee")
        ? Digit.ULBService.getCurrentPermanentCity()
        : localStorage.getItem("Citizen.tenant-id");
      const uuid = info?.uuid;
      if (uuid) {
        const usersResponse = await Digit.UserService.userSearch(tenantId, { uuid: [uuid] }, {});
        console.log("coming here 1");
        if (usersResponse?.user?.length) {
          const userDetails = usersResponse.user[0];
          sessionStorage.setItem("userInfoData", JSON.stringify(userDetails));
          setProfilePic(userDetails?.photo || null);
          setEmail(userDetails?.emailId || null);
        }
      }
    };

    fetchProfileDetails();
  }, [info?.uuid]);

  return (
    <div className="profile-section">
      <div className="imageloader imageloader-loaded">
        <img
          className="img-responsive img-circle img-Profile"
          src={profilePic || defaultImage}
          alt="Profile"
          style={{ objectFit: "contain", objectPosition: "center" }}
          onError={(e) => (e.currentTarget.src = defaultImage)}
        />
      </div>
      <div id="profile-name" className="label-container name-Profile">
        <div className="label-text">{info?.name}</div>
      </div>
      <div id="profile-location" className="label-container loc-Profile">
        <div className="label-text">{info?.mobileNumber}</div>
      </div>
      {email && (
        <div id="profile-emailid" className="label-container loc-Profile">
          <div className="label-text">{email}</div>
        </div>
      )}
      <div id="profile-links">Edit</div>
      <div className="profile-divider"></div>
      {window.location.href.includes("/employee") &&
        !window.location.href.includes("/employee/user/login") &&
        !window.location.href.includes("employee/user/language-selection") && <ChangeCity t={t} mobileView={true} />}
    </div>
  );
};
const PoweredBy = () => <div className="digit-footer" style={{ marginBottom: 0 }}></div>;

/* 
Feature :: Citizen Webview sidebar
*/
export const CitizenSideBar = ({
  isOpen,
  isMobile = false,
  toggleSidebar,
  onLogout,
  isEmployee = false,
  linkData,
  islinkDataLoading,
  isSideBarScroll,
}) => {
  const { data: storeData, isFetched } = Digit.Hooks.useStore.getInitData();
  const { stateInfo } = storeData || {};
  const user = Digit.UserService.getUser();
  const [search, setSearch] = useState("");

  const { t } = useTranslation();
  const history = useHistory();
  const closeSidebar = () => {
    Digit.clikOusideFired = true;
    toggleSidebar(false);
  };

  const { isLoading, data } = Digit.Hooks.useAccessControl();
  const tenantId = Digit.ULBService.getCitizenCurrentTenant();
  const showProfilePage = () => {
    const redirectUrl = isEmployee ? "/digit-ui/employee/user/profile" : "/digit-ui/citizen/user/profile";
    history.push(redirectUrl);
    closeSidebar();
  };
  const redirectToLoginPage = () => {
    // localStorage.clear();
    // sessionStorage.clear();
    history.push("/digit-ui/citizen/login");
    closeSidebar();
  };

  const redirectToScrutinyPage = () => {
    // localStorage.clear();
    // sessionStorage.clear();
    history.push("/digit-ui/citizen/core/edcr/scrutiny");
  };
  if (islinkDataLoading || isLoading || !isFetched) {
    return <Loader />;
  }
  const filteredTenantContact = storeData?.tenants.filter((e) => e.code === tenantId)[0]?.contactNumber || storeData?.tenants[0]?.contactNumber;

  let menuItems = [...SideBarMenu(t, closeSidebar, redirectToLoginPage, redirectToScrutinyPage, isEmployee, storeData, tenantId)];
  let profileItem;
  if (isFetched && user && user.access_token) {
    profileItem = <SidebarProfile info={user?.info} stateName={stateInfo?.name} t={t} />;
    menuItems = menuItems.filter((item) => item?.id !== "login-btn" && item?.id !== "help-line");
    menuItems = [
      ...menuItems,
      {
        text: t("EDIT_PROFILE"),
        element: "PROFILE",
        icon: "EditPencilIcon",
        populators: {
          onClick: showProfilePage,
        },
      },
      {
        text: t("CORE_COMMON_LOGOUT"),
        element: "LOGOUT",
        icon: "LogoutIcon",
        populators: {
          onClick: onLogout,
        },
      },
      {
        text: (
          <React.Fragment>
            {t("CS_COMMON_HELPLINE")}
            <div className="telephone" >
              <div className="link">
                <a href={`tel:${filteredTenantContact}`}>{filteredTenantContact}</a>
              </div>
            </div>
          </React.Fragment>
        ),
        element: "Helpline",
        icon: "Phone",
      },
    ];
  }

  let configEmployeeSideBar = {};

  if (!isEmployee) {
    if (linkData && linkData.FSM) {
      let FSM = [];
      linkData.FSM.map((ele) => {
        ele.id && ele.link && FSM.push(ele);
      });
      linkData.FSM = FSM;
    }
    Object.keys(linkData)
      ?.sort((x, y) => y.localeCompare(x))
      ?.map((key) => {
        if (linkData[key][0]?.sidebar === "digit-ui-links")
          menuItems.splice(1, 0, {
            type: linkData[key][0]?.sidebarURL?.includes("digit-ui") ? "link" : "external-link",
            text: t(`ACTION_TEST_${Digit.Utils.locale.getTransformedLocale(key)}`),
            links: linkData[key],
            icon: linkData[key][0]?.leftIcon,
            link: linkData[key][0]?.sidebarURL,
          });
      });
  } else {
    data?.actions
      .filter((e) => e.url === "url" && e.displayName !== "Home")
      .forEach((item) => {
        if (search == "" && item.path !== "") {
          let index = item.path.split(".")[0];
          if (index === "TradeLicense") index = "Trade License";
          if (!configEmployeeSideBar[index]) {
            configEmployeeSideBar[index] = [item];
          } else {
            configEmployeeSideBar[index].push(item);
          }
        } else if (item.path !== "" && item?.displayName?.toLowerCase().includes(search.toLowerCase())) {
          let index = item.path.split(".")[0];
          if (index === "TradeLicense") index = "Trade License";
          if (!configEmployeeSideBar[index]) {
            configEmployeeSideBar[index] = [item];
          } else {
            configEmployeeSideBar[index].push(item);
          }
        }
      });
    const keys = Object.keys(configEmployeeSideBar);
    for (let i = 0; i < keys.length; i++) {
      const getSingleDisplayName = configEmployeeSideBar[keys[i]][0]?.displayName?.toUpperCase()?.replace(/[ -]/g, "_");
      const getParentDisplayName = keys[i]?.toUpperCase()?.replace(/[ -]/g, "_");

      if (configEmployeeSideBar[keys[i]][0].path.indexOf(".") === -1) {
        menuItems.splice(1, 0, {
          type: "link",
          text: t(`ACTION_TEST_${getSingleDisplayName}`),
          link: configEmployeeSideBar[keys[i]][0]?.navigationURL,
          icon: configEmployeeSideBar[keys[i]][0]?.leftIcon?.split?.(":")[1],
          populators: {
            onClick: () => {
              history.push(configEmployeeSideBar[keys[i]][0]?.navigationURL);
              closeSidebar();
            },
          },
        });
      } else {
        menuItems.splice(1, 0, {
          type: "dynamic",
          moduleName: t(`ACTION_TEST_${getParentDisplayName}`),
          links: configEmployeeSideBar[keys[i]]?.map((ob) => {
            return { ...ob, displayName: t(`ACTION_TEST_${ob?.displayName?.toUpperCase()?.replace(/[ -]/g, "_")}`) };
          }),
          icon: configEmployeeSideBar[keys[i]][1]?.leftIcon,
        });
      }
    }
    const indx = menuItems.findIndex((a) => a.element === "HOME");
    const home = menuItems.splice(indx, 1);
    const comp = menuItems.findIndex((a) => a.element === "LANGUAGE");
    const part = menuItems.splice(comp, menuItems?.length - comp);
    menuItems.sort((a, b) => {
      let c1 = a?.type === "dynamic" ? a?.moduleName : a?.text;
      let c2 = b?.type === "dynamic" ? b?.moduleName : b?.text;
      return c1.localeCompare(c2);
    });
    home?.[0] && menuItems.splice(0, 0, home[0]);
    menuItems = part?.length > 0 ? menuItems.concat(part) : menuItems;
  }

  /*  URL with openlink wont have sidebar and actions    */
  if (history.location.pathname.includes("/openlink")) {
    profileItem = <span></span>;
    menuItems = menuItems.filter((ele) => ele.element === "LANGUAGE");
  }
  return isMobile ? (
    <NavBar
      open={isOpen}
      toggleSidebar={toggleSidebar}
      profileItem={profileItem}
      onClose={closeSidebar}
      isSideBarScroll={isSideBarScroll}
      menuItems={menuItems}
      Footer={<PoweredBy />}
      isEmployee={isEmployee}
      search={search}
      setSearch={setSearch}
    />
  ) : (
    <StaticCitizenSideBar logout={onLogout} />
  );
};
