export interface IUser {
  first_name: string,
  last_name: string,
  email: string,
  image: string
  password?: string,
}


export interface ILogin {
  email: string,
  password: string,
  rememberMe?: boolean
}

export interface IRegister {
  first_name: string,
  last_name: string,
  email: string,
  password: string,
  confirm_password?: string,
}
