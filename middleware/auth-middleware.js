const ApiError = require('../exceptions/api-error');
const tokenService = require('../service/token-service');

module.exports = function(req, res, next){
    try{
        const authHeader = req.header.authorization;
        if (!authHeader){
            throw ApiError.UnauthorizedError();
        }
        const accessToken = authHeader.split(' ')[1];
        if (!accessToken){
            throw ApiError.UnauthorizedError();
        }
        const userData = tokenService.validateAccessToken(accessToken);
        if (!userData){
            throw ApiError.UnauthorizedError();
        }

        req.user = userData;
        next();
    } catch (e){
        throw ApiError.UnauthorizedError();
    }
}