class ExpressError extends Error {
    constructor(status, message, details = null) {
      super(message); // Set message properly on the parent
      this.status = status;
      this.details = details;
      Error.captureStackTrace(this, this.constructor); // Optional: cleaner stack
    }
  }
  
  module.exports = ExpressError;
  