import humps from "humps";
import { CareTeam, CareTeamMember } from "../models/careTeam";
import { AxiosInstance } from "axios";

export async function getUserCareTeams(axios: AxiosInstance): Promise<CareTeam[]> {
  return axios
    .get(`/api/care-teams`, { params: {} })
    .then((res: any) => (humps.camelizeKeys(res.data) as CareTeam[]))
}

export async function getCareTeam(axios: AxiosInstance, careTeamId: string): Promise<CareTeam> {
  return axios
    .get(`/api/care-teams/${careTeamId}`, { params: {} })
    .then((res: any) => (humps.camelizeKeys(res.data)) as CareTeam)
}

/* Update, delete, and create care Team methods */

export async function createCareTeam(axios: AxiosInstance, careTeam: CareTeam): Promise<CareTeam> {
  return axios
    .post(`/api/care-teams/`, humps.decamelizeKeys(careTeam))
    .then((res: any) => (humps.camelizeKeys(res.data) as CareTeam))
}

export async function deleteCareTeam(axios: AxiosInstance, careTeamId: string): Promise<CareTeam> {
  return axios
    .delete(`/api/care-teams/${careTeamId}/delete`)
    .then((res: any) => (humps.camelizeKeys(res.data) as CareTeam))
}

export async function updateCareTeam(axios: AxiosInstance, careTeamId: number, careTeamName: string): Promise<CareTeam> {
  return axios
    .patch(`/api/care-teams/${careTeamId}/update`, { name: careTeamName })
    .then((res: any) => (humps.camelizeKeys(res.data) as CareTeam))
}

export async function updateCareTeamMember(axios: AxiosInstance, careTeamMember: CareTeamMember): Promise<CareTeam> {
  return axios
    .patch(
      `/api/care-teams/${careTeamMember.teamId}/members/${careTeamMember.memberId}/update`,
      humps.decamelizeKeys(careTeamMember)
    )
    .then((res: any) => (humps.camelizeKeys(res.data) as CareTeam))
}

export async function removeCareTeamMember(axios: AxiosInstance, careTeamMember: CareTeamMember): Promise<CareTeam> {
  return axios
    .delete(
      `/api/care-teams/${careTeamMember.teamId}/members/${careTeamMember.memberId}/remove`,
      humps.decamelizeKeys(careTeamMember)
    )
    .then((res: any) => (humps.camelizeKeys(res.data) as CareTeam))
}

export async function addCareTeamMember(axios: AxiosInstance, careTeamMember: CareTeamMember): Promise<CareTeam> {
  return axios
    .put(`/api/care-teams/${careTeamMember.teamId}/members`, humps.decamelizeKeys(careTeamMember))
    .then((res: any) => (humps.camelizeKeys(res.data) as CareTeam))
}

export async function careTeamMemberNotified(axios: AxiosInstance, teamId: number): Promise<CareTeam> {
  return axios
    .put(`/api/care-teams/${teamId}/members/notified`)
    .then((res: any) => (humps.camelizeKeys(res.data) as CareTeam))
}
