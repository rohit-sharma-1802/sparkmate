const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth || dateOfBirth.split("-").length < 3) return "";

  const formattedDOB = new Date(dateOfBirth);
  const today = new Date();

  let years = today.getFullYear() - formattedDOB.getFullYear();

  if (
    today.getMonth() < formattedDOB.getMonth() ||
    (today.getMonth() === formattedDOB.getMonth() &&
      today.getDate() < formattedDOB.getDate())
  )
    years--;

  return years;
};

export default calculateAge;
