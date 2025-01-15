export interface LoginUser {
  email: string,
  password: string
}

export interface RegisterUser {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface LoginUserResp {
  access: string,
  refresh: string
}

export interface SSOConfig {
  account: SSOAccount
  socialAccount: SSOSocialAccount
  usersessions: SSOUserSessions
}

export interface SSOAccount {
  authenticationMethod: string
  isOpenForSignup: boolean
}

export interface SSOSocialAccount {
  providers: SSOProvider[]
}

export interface SSOProvider {
  id: string
  name: string
  flows: string[]
  clientId: string
}

export interface SSOUserSessions {
  trackActivity: boolean
}

export interface SSOLoginRequest {
  provider: string
  process: string
  callbackUrl: string
  csrfmiddlewaretoken: string
}
