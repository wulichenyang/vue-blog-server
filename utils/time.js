
// 本地时间，换算对应格林威治时间
const localDate = (date) => {
  const targetDate = new Date(date || Date.now());
  targetDate.setMinutes(targetDate.getMinutes() - targetDate.getTimezoneOffset());
  return targetDate;
}

exports.localDate = localDate