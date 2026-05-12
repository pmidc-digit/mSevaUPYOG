import React from "react"

const defaultImage = "https://cdn-icons-png.flaticon.com/512/149/149071.png"

const getInitials = (name) => {
  if (!name) return "?"
  const parts = name.trim().split(" ").filter(Boolean)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const PhoneIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 012 2.18 2 2 0 014 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
)

const MailIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

const UserBadgeIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const VerifiedCheck = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const SidebarProfile = ({ info, stateName, t }) => {
  const [profilePic, setProfilePic] = React.useState(info?.photo || null)
  const [email, setEmail] = React.useState(info?.emailId || null)
  const [imgError, setImgError] = React.useState(false)

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

  const showInitials = !profilePic || imgError

  return (
    <div
      style={{
        background: "linear-gradient(140deg, #003C71 0%, #1A5CA8 100%)",
        padding: "1.5rem 1.25rem 1.125rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background circles */}
      <div style={{
        position: "absolute", top: "-24px", right: "-18px",
        width: "110px", height: "110px", borderRadius: "50%",
        background: "rgba(255,255,255,0.06)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-28px", right: "28px",
        width: "72px", height: "72px", borderRadius: "50%",
        background: "rgba(255,255,255,0.04)", pointerEvents: "none",
      }} />

      {/* Avatar + Info row */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", position: "relative" }}>

        {/* Avatar */}
        <div style={{ flexShrink: 0, position: "relative" }}>
          {showInitials ? (
            <div style={{
              width: "58px", height: "58px", borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              border: "2.5px solid rgba(255,255,255,0.55)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.25rem", fontWeight: "700", color: "#ffffff",
              letterSpacing: "0.05em", userSelect: "none",
            }}>
              {getInitials(info?.name)}
            </div>
          ) : (
            <img
              src={profilePic}
              alt="Profile"
              onError={() => setImgError(true)}
              style={{
                width: "58px", height: "58px", borderRadius: "50%",
                objectFit: "cover",
                border: "2.5px solid rgba(255,255,255,0.55)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              }}
            />
          )}
          {/* Verified badge */}
          <div style={{
            position: "absolute", bottom: "1px", right: "1px",
            width: "18px", height: "18px", borderRadius: "50%",
            background: "#00703C", border: "2px solid #ffffff",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <VerifiedCheck />
          </div>
        </div>

        {/* Name / phone / email */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: "0.9375rem", fontWeight: "700",
            color: "#ffffff", lineHeight: "1.3",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {info?.name || "Citizen"}
          </div>

          {info?.mobileNumber && (
            <div style={{
              display: "flex", alignItems: "center", gap: "4px",
              marginTop: "4px", fontSize: "0.75rem",
              color: "rgba(255,255,255,0.8)",
            }}>
              <PhoneIcon />
              {info.mobileNumber}
            </div>
          )}

          {email && (
            <div style={{
              display: "flex", alignItems: "center", gap: "4px",
              marginTop: "2px", fontSize: "0.6875rem",
              color: "rgba(255,255,255,0.65)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              <MailIcon />
              {email}
            </div>
          )}
        </div>
      </div>

      {/* Citizen pill badge */}
      <div style={{ marginTop: "0.875rem", position: "relative" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "5px",
          background: "rgba(255,255,255,0.14)",
          border: "1px solid rgba(255,255,255,0.28)",
          borderRadius: "20px", padding: "3px 10px",
          fontSize: "0.6875rem", fontWeight: "500",
          color: "rgba(255,255,255,0.92)", letterSpacing: "0.03em",
        }}>
          <UserBadgeIcon />
          {stateName ? `${stateName} — Registered Citizen` : "Registered Citizen"}
        </span>
      </div>
    </div>
  )
}

export default SidebarProfile
