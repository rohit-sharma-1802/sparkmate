//valid date and user above 18
function isValidDate(day, month, year) {
    const date = new Date(year, month - 1, day);
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

    return (
        !isNaN(date.getTime()) &&
        date.getDate() === Number(day) &&
        date.getMonth() === Number(month - 1) &&
        date.getFullYear() === Number(year) &&
        date <= eighteenYearsAgo
    );
}

module.exports = isValidDate;