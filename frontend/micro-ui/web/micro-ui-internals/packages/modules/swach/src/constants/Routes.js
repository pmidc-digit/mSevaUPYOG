export const SWACH_BASE = "/digit-ui/swach/citizen/";
export const PGR_BASE = "/digit-ui/pgr/citizen/";
export const PgrRoutes = {
    ComplaintsPage: "/complaints",
    RatingAndFeedBack: "/rate/:id*",
    ComplaintDetailsPage: "/complaint/details/:id",
    ReasonPage: "/reopen/:id",
};
export const SwachRoutes = {
    ComplaintsPage: "/complaints",
    RatingAndFeedBack: "/rate/:id*",
    ComplaintDetailsPage: "/complaint/details/:id",
    ReasonPage: "/reopen/:id",
};
export const getRoute = (match, route) => `${match.path}${route}`;
export const Employee = {
  Inbox: "/inbox",
  Home: "/digit-ui/employee",
};
