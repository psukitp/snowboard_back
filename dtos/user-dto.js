module.exports = class UserDto {
    login;
    name;
    email;
    id;
    isActivated;
    user_image_path;

    constructor(login, name, email, id, isActivated, user_image_path){
        this.login = login;
        this.name = name
        this.email = email;
        this.id = id;
        this.isActivated = isActivated;
        this.user_image_path = user_image_path
    }
}