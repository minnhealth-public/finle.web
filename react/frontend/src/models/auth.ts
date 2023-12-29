export interface UserLogin {
    email: string,
    password: string
}

export interface UserLoginResp {
    access: string,
    refresh: string
}
