module.exports = class ApiError extends Error {
    status;
    errors;

    constructor(status, message, errors = []) {
        super(message);
        this.status = status;
        this.errors = errors;
    }

    static UnauthorizedError(){
        return new ApiError(401, 'Пользователь не авторизован')
    }

    static BadRequest(message, errors){
        return new ApiError(400, message, errors)
    }

    static LoginExist(){
        return new ApiError(406, 'Пользователь с таким логином уже существует')
    }

    static NotAllowed(){
        return new ApiError(403, 'Кажется, эти данные недоступны тебе')
    }
}