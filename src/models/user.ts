export interface User {
  id: number;
  fullname: string;
  email: string;
  password: string;
}

export class Client implements Omit<User, "id"> {
  constructor(
    public fullname: string,
    public email: string,
    public password: string,
  ) {}
}
