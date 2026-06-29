import { v4 as uuid } from 'uuid';

export class User {
    id: string;
    mail: string;

    constructor(mail = 'test@mail.ru') {
        this.id = uuid();
        this.mail = mail;
    }
}

export default User;
