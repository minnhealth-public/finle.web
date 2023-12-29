import axios, { axiosPrivate } from "./axios";
import { UserLogin, UserLoginResp } from "../models";

export async function loginUser(userLogin: UserLogin): Promise<UserLoginResp> {
    return axiosPrivate
        .post('/api/auth/token/', userLogin)
        .then(res => res.data)
}

export async function refreshAuth(): Promise<UserLoginResp> {
    return axiosPrivate
        .post('/api/auth/token/refresh/')
        .then(res => res.data)
}
