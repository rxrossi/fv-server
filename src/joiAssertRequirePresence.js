export default (joiObj, obj) => {
  const result = joiObj.validate(obj, { presence: 'required' });
  if (!result.error) {
    return null;
  }
  return JSON.stringify(result.error.details, undefined, 2);
};
