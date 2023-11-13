function generateRoomId(user1, user2) {
  const sortedUserIds = [user1, user2].sort();
  return `${sortedUserIds[0]}_${sortedUserIds[1]}`;
}

module.exports = {
  generateRoomId,
};
