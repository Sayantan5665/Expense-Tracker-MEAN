export interface IUser {
  _id?: string,
  name: string,
  email: string,
  image: string
  password?: string,
  role?: any,
  createdAt?: string,
}


export interface ILogin {
  email: string,
  password: string,
  rememberMe?: boolean
}

export interface IRegister {
  name: string,
  email: string,
  password: string,
  confirm_password?: string,
}
