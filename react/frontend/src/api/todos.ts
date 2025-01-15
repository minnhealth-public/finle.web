import humps from "humps";
import Todo, { TeamTaskField, VideoClip } from "../models/todo";
import { AxiosInstance } from "axios";
import { logEventWithTimestamp } from "../lib/analytics";

/*
* Gets the todos for the user that is currently logged in.
*/
export async function getTodos(axios: AxiosInstance, teamId: number): Promise<Todo[]> {
  return axios
    .get(`/api/care-teams/${teamId}/tasks/`, { params: {} })
    .then((res: any) => (humps.camelizeKeys(res.data)) as Todo[])
}

/*
* Gets the todo for the user that is currently logged in.
*/
export async function getTodo(axios: AxiosInstance, teamId: number, todoId: number): Promise<Todo> {
  return axios
    .get(`/api/care-teams/${teamId}/tasks/${todoId}/`, { params: {} })
    .then((res: any) => (humps.camelizeKeys(res.data)) as Todo)
}

export async function getTodoClips(axios: AxiosInstance, teamId: number, todoId: number): Promise<VideoClip[]> {
  return axios
    .get(`/api/care-teams/${teamId}/tasks/${todoId}/clips`)
    .then((res: any) => (humps.camelizeKeys(res.data)) as VideoClip[])
}


export async function postTaskFields(axios: AxiosInstance, taskFields: TeamTaskField[], teamId: number, taskId: number): Promise<Todo> {
  logEventWithTimestamp('task_update', { 'task_id': taskId, 'team_id': teamId })
  return axios
    .post(`/api/care-teams/${teamId}/tasks/${taskId}/fields/`, humps.decamelizeKeys(taskFields))
    .then((res: any) => (humps.camelizeKeys(res.data)) as Todo)
}
