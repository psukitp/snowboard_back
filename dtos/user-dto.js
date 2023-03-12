module.exports = class UserDto {
    name;
    email;
    id;
    isActivated;

    constructor(name, email, id, isActivated){
        this.name = name
        this.email = email;
        this.id = id;
        this.isActivated = isActivated;
    }
}