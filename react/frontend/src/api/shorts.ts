import humps from "humps";
import { Video } from "../models";
import { AxiosInstance } from "axios";
import axios from "./axios";
import { logEventWithTimestamp } from "../lib/analytics";

export interface ShortPagination {
  count: number
  next: string
  previous: string
  results: Video[]
}

export async function getShorts(privateAxios: AxiosInstance, careTeamId: number, filters: string): Promise<ShortPagination> {

  return privateAxios
    .get(`/api/shorts?team_id=${careTeamId}&${filters}`)
    .then((res: any) => (humps.camelizeKeys(res.data)) as ShortPagination)
}

export async function getRelatedClips(privateAxios: AxiosInstance, clipId: number): Promise<Video[]> {
  return privateAxios
    .get(`/api/shorts/${clipId}/related`, { params: {} })
    .then((res: any) => (humps.camelizeKeys(res.data)) as Video[])
}

export async function getFeaturedShorts(): Promise<Video[]> {
  return axios
    .get(`/api/shorts/featured`, { params: {} })
    .then((res: any) => (humps.camelizeKeys(res.data)) as Video[])
}

export async function putWatched(privateAxios: AxiosInstance, clipIds: number[]): Promise<any> {
  return privateAxios
    .put(`/api/shorts/watch`, { clip_ids: clipIds })
    .then((res: any) => (humps.camelizeKeys(res.data)))
}

export async function putSaved(privateAxios: AxiosInstance, clipId: number): Promise<any> {
  logEventWithTimestamp('video_save', {'clip_id': clipId})
  return privateAxios
    .put(`/api/shorts/${clipId}/save`)
    .then((res: any) => (humps.camelizeKeys(res.data)))
}

export async function putUnsaved(privateAxios: AxiosInstance, clipId: number): Promise<any> {
  logEventWithTimestamp('video_unsave', {'clip_id': clipId})
  return privateAxios
    .put(`/api/shorts/${clipId}/unsave`)
    .then((res: any) => (humps.camelizeKeys(res.data)))
}

export async function putRating(privateAxios: AxiosInstance, clipId: number, rating: number): Promise<any> {
  logEventWithTimestamp('video_rating', {'clip_id': clipId, 'rating': rating})
  return privateAxios
    .put(`/api/shorts/${clipId}/rating`, { 'rating': rating })
    .then((res: any) => (humps.camelizeKeys(res.data)))
}
