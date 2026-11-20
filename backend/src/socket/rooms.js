// Every socket joins its user's room. 1:1 messages are delivered to the members' user rooms,
// so no per-conversation room bookkeeping is needed.
export const userRoom = (userId) => `user:${userId}`
