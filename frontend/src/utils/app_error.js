export class AppError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
    this.isAppError = true
  }
}

module.exports = AppError;