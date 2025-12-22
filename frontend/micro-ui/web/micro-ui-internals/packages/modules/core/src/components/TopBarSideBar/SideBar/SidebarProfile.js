

import React from "react"


const defaultImage =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png"

const SidebarProfile = ({ info, stateName, t }) => {
  const [profilePic, setProfilePic] = React.useState(info?.photo || null)
  const [email, setEmail] = React.useState(info?.emailId || null)

  React.useEffect(() => {
    const fetchProfileDetails = async () => {
      const tenant = Digit.ULBService.getCurrentTenantId()
      const uuid = info?.uuid
      if (uuid) {
        const usersResponse = await Digit.UserService.userSearch(tenant, { uuid: [uuid] }, {})
        if (usersResponse?.user?.length) {
          const userDetails = usersResponse.user[0]
          setProfilePic(userDetails?.photo || null)
          setEmail(userDetails?.emailId || null)
        }
      }
    }
    fetchProfileDetails()
  }, [info?.uuid])

  return (
    <div
      className="profile-section"
      style={{
        padding: "1.25rem 1rem",
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
        border:"1px solid grey",
        marginTop:"4vh",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.875rem",
        }}
      >
        <div
          className="imageloader imageloader-loaded"
          style={{
            flexShrink: 0,
          }}
        >
          <img
            className="img-responsive img-circle img-Profile"
            src={profilePic || defaultImage}
            alt="Profile"
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              objectFit: "cover",
              objectPosition: "center",
              border: "2px solid #e5e7eb",
            }}
            onError={(e) => (e.currentTarget.src = defaultImage)}
          />
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "0.125rem",
          }}
        >
          <div
            id="profile-name"
            className="label-container name-Profile"
            style={{
              fontSize: "1rem",
              fontWeight: "600",
              color: "#111827",
              lineHeight: "1.3",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {info?.name}
          </div>
          <div
            id="profile-location"
            className="label-container loc-Profile"
            style={{
              fontSize: "0.875rem",
              color: "#6b7280",
              lineHeight: "1.3",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {info?.mobileNumber}
          </div>
          {email && (
            <div
              id="profile-emailid"
              className="label-container loc-Profile"
              style={{
                fontSize: "0.75rem",
                color: "#9ca3af",
                lineHeight: "1.3",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {email}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SidebarProfile
