export const selectComplaints = (state) => state.swach.complaints.list || [];

export const selectComplaintById = (state, id) => state.swach.complaints.list.filter((complaint) => complaint.service.serviceRequestId === id);
