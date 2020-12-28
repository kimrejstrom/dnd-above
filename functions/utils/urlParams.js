export const parseURL = path => {
  if (path.includes('.netlify/functions/')) {
    const pathParams = path.split('.netlify/functions/')[1].split('/');
    return pathParams.splice(1);
  } else {
    const pathParams = path.split('/');
    return pathParams.splice(2);
  }
};
