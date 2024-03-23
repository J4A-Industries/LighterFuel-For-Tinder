export const checkDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  if (year === 2024 && month === 3 && day === 1) {
    return true;
  }
  return false;
};
