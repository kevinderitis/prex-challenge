export const HTTP_ERRORS = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409, 
    INTERNAL_SERVER_ERROR: 500,
  };
  
  export const ERROR_MESSAGES = {
    [HTTP_ERRORS.BAD_REQUEST]: 'Bad Request: The provided data is not valid.',
    [HTTP_ERRORS.UNAUTHORIZED]: 'Unauthorized: Please log in to access this resource.',
    [HTTP_ERRORS.FORBIDDEN]: 'Forbidden: You do not have permission to access this resource.',
    [HTTP_ERRORS.NOT_FOUND]: 'Not Found: The requested route or resource does not exist.',
    [HTTP_ERRORS.CONFLICT]: 'Conflict: The resource already exists.',
    [HTTP_ERRORS.INTERNAL_SERVER_ERROR]: 'Internal Server Error: Please try again later.',
  };
  