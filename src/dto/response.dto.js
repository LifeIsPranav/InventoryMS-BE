class ApiResponse {
    constructor(success, message, data, error) {
        this.success = success
        this.message = message
        this.data = data
        this.error = error
    }

    static success(message, data) {
        return new ApiResponse(true, message, data, null)
    }

    static error(message, error) {
        return new ApiResponse(false, message, null, error)
    }
}

module.exports = ApiResponse