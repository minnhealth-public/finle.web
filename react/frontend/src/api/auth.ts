import axios, { axiosPrivate } from "./axios";
import { LoginUser, LoginUserResp, RegisterUser, SSOConfig, SSOLoginRequest, SSOProvider } from "../models";
import { AxiosInstance } from "axios";
import humps from "humps";
import { User } from "../models/user";
import { getCSRFToken } from "../lib/django";

export async function loginUser(userLogin: LoginUser): Promise<LoginUserResp> {
  return axiosPrivate
    .post('/api/auth/token/', userLogin)
    .then(res => res.data)
}

export async function logoutUser(): Promise<any> {
  return axios
    .post('/api/auth/logout', {}, { headers: { 'X-CSRFToken': getCSRFToken() } })
    .then(res => res.data)
}

export async function loginUserWithToken(accessId: string): Promise<LoginUserResp> {
  return axiosPrivate
    .get(`/api/auth/token/share?access=${accessId}`)
    .then(res => res.data)
}

export async function createShareToken(userId: number, teamId: number): Promise<any> {
  return axiosPrivate
    .post('/api/auth/token/share/', { user_id: userId, team_id: teamId })
    .then(res => res.data)
}
export async function getAuthToken(): Promise<any> {
  return axiosPrivate
    .get('/api/auth/get_user_token')
    .then(res => res.data)
}

export async function recoverAccount(email: string): Promise<any> {
  return axiosPrivate
    .post('/api/auth/recover-account/', { email: email })
    .then(res => res.data)
}

export async function resetPassword(password: string, token: string): Promise<any> {
  return axios
    .post(
      '/api/auth/recover-account/reset',
      humps.decamelizeKeys({ newPassword: password }),
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    .then(res => res.data)
}

export async function refreshAuth(): Promise<LoginUserResp> {
  return axiosPrivate
    .post('/api/auth/token/refresh/')
    .then(res => res.data)
}

export async function registerUser(registerUser: RegisterUser): Promise<LoginUserResp> {
  return axios
    .post('api/auth/register', registerUser, { headers: { 'X-CSRFToken': getCSRFToken() } })
    .then(res => res.data)
}

export async function changePassword(axios: AxiosInstance, newPassword: string): Promise<any> {
  return axios
    .put(`/api/auth/change-password`, humps.decamelizeKeys({ 'newPassword': newPassword }))
    .then((res: any) => (humps.camelizeKeys(res.data)))
}

export async function updateUser(axios: AxiosInstance, userData: User): Promise<any> {
  return axios
    .put(`/api/auth/user`, humps.decamelizeKeys(userData))
    .then((res: any) => (humps.camelizeKeys(res.data)))
}

export async function getSSOConfig(): Promise<SSOProvider[]> {
  return axios
    .get('/api/auth/social/config')
    .then((res: any) => {
      return humps.camelizeKeys(res.data.data.socialaccount.providers) as SSOProvider[]
    })
}

export async function ssoLogin(payload: SSOLoginRequest): Promise<any> {
  return axios
    .post(
      //'/_allauth/browser/v1/auth/provider/redirect',
      '/auth/reroute',
      humps.decamelizeKeys(payload),
      { headers: { 'X-CSRFToken': getCSRFToken() } }

    )
    .then((res: any) => {
      res.data;
      return res.data;
    })
    .catch((error: any) => {
      console.log(error);
    })
}
