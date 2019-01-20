/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

// Hook that allows the use of "$search" (regex) in find()
// it replaces the $search by a real regex for mongoose
exports.searchRegex = (context) => {
  const newContext = context;
  const { query } = context.params;
  if (query) {
    Object.keys(query).forEach((field) => {
      if (query[field].$search && field.indexOf('$') === -1) {
        query[field] = { $regex: new RegExp(query[field].$search, 'i') };
      }
    });
  }
  newContext.params.query = query;
  return newContext;
};
