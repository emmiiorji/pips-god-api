const getMissingFields = (fields, data) => {
  const missingFields = [];
  fields.forEach((field) => {
    if (!data[field]) {
      missingFields.push(field);
    }
  });
  return missingFields;
};

module.exports = {
  getMissingFields,
};
