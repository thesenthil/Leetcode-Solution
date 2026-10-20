export const getInitials = (firstName, lastName) => {
  const first = firstName?.[0] || '';
  const last = lastName?.[0] || '';
  return (first + last).toUpperCase() || '?';
};

export const getChatRoomId = (userId1, userId2) =>
  [userId1, userId2].sort().join('_');
