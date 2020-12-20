export const faunaErrorHandler = error => {
  console.error('error', error);
  if (error.requestResult) {
    if (error.requestResult.statusCode === 404) {
      return { statusCode: 404, body: JSON.stringify(error) };
    } else if (error.requestResult.statusCode < 500) {
      return { statusCode: 400, body: JSON.stringify(error) };
    }
  } else {
    return { statusCode: 500, body: JSON.stringify(error) };
  }
};
