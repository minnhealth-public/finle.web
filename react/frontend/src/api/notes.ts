import humps from "humps";
import { CareTeam } from "../models/careTeam";
import { Note } from "../models/note";

export interface PostNote {
  userId: number
  teamId: number
  clipId?: number
  glossaryId?: number
  resourceId?: number
  taskId?: number
  text: string
}

export interface PatchNote {
  noteId: number
  teamId: number
  pinned: boolean
}

export interface PaginatedNoteResponse {
  count: number
  next: string
  previous: string
  results: Note[]
}

export async function getCareTeamNotes(axios: any, careTeam: CareTeam): Promise<PaginatedNoteResponse> {
  return axios
    .get(`/api/care-teams/${careTeam.id}/notes`)
    .then((res: any) => humps.camelizeKeys(res.data))
}

export async function getCareTeamNotesForClip(axios: any, careTeam: CareTeam, clipId: Number): Promise<PaginatedNoteResponse> {
  return axios
    .get(`/api/care-teams/${careTeam.id}/notes?clip=${clipId}`)
    .then((res: any) => humps.camelizeKeys(res.data))
}

export async function getCareTeamNotesForGlossaryTerm(axios: any, careTeam: CareTeam, termId: Number): Promise<PaginatedNoteResponse> {
  return axios
    .get(`/api/care-teams/${careTeam.id}/notes?term=${termId}`)
    .then((res: any) => humps.camelizeKeys(res.data))
}

export async function getCareTeamNotesForTodo(axios: any, careTeam: CareTeam, todoId: Number): Promise<PaginatedNoteResponse> {
  return axios
    .get(`/api/care-teams/${careTeam.id}/notes?task=${todoId}`)
    .then((res: any) => humps.camelizeKeys(res.data))
}

export async function getCareTeamNotesForResource(axios: any, careTeam: CareTeam, resourceId: Number): Promise<PaginatedNoteResponse> {
  return axios
    .get(`/api/care-teams/${careTeam.id}/notes?resource=${resourceId}`)
    .then((res: any) => humps.camelizeKeys(res.data))
}

export async function createCareTeamNote(axios: any, postNote: PostNote): Promise<Note[]> {
  return axios
    .post(`/api/care-teams/${postNote.teamId}/notes/create`, humps.decamelizeKeys(postNote))
    .then((res: any) => humps.camelizeKeys(res.data))
}

export async function updateCareTeamNote(axios: any, patchNote: PatchNote): Promise<Note[]> {
  return axios
    .patch(
      `/api/care-teams/${patchNote.teamId}/notes/${patchNote.noteId}`,
      humps.decamelizeKeys(patchNote)
    )
    .then((res: any) => humps.camelizeKeys(res.data))
}
