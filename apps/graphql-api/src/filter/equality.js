const type = "equality";
const filter = (attribute, value, negation = false) => ({
  type,
  attribute,
  value,
  negation,
});

export { type, filter };
