module.exports = class UserDto {
    name;
    s_name;
    email;
    id;
    isActivated;

    constructor(name, s_name, email, id, isActivated){
        this.name = name
        this.s_name = s_name
        this.email = email;
        this.id = id;
        this.isActivated = isActivated;
    }
}