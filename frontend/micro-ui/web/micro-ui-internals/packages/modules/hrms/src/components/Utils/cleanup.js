// Recursively drops null and undefined properties. Arrays and Dates are kept as they are instead of being turned into plain objects
const cleanup = (payload) => {
  if (payload === null || payload === undefined) return undefined;
  if (typeof payload !== "object" || payload instanceof Date) return payload;
  if (Array.isArray(payload)) return payload.map(cleanup);

  return Object.keys(payload).reduce((acc, key) => {
    const value = cleanup(payload[key]);
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});
};
export default cleanup;
