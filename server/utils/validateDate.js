function isValidDate(dob) {
  const currentDate = new Date();
  const inputDate = new Date(dob);

  if (isNaN(inputDate.getTime())) {
    return false;
  }

  const ageDifferenceMilliseconds = currentDate - inputDate;
  const ageInYears = ageDifferenceMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
  console.log(ageInYears);
  if (ageInYears >= 18) {
    return true;
  } else {
    return false;
  }
}

module.exports = {
  isValidDate,
};
