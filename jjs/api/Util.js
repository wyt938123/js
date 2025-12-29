export function getFormatDate(exp = "-") {
  let date = new Date();
  return `${date.getFullYear()}${exp}${
    date.getMonth() + 1
  }${exp}${date.getDate()}`;
}