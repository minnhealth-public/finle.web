import axios from "./axios";
import { Video } from "../models";
import humps from "humps";

export async function getClip(id: number): Promise<Video> {
  return axios
    .get(`/api/shorts/${id}/`, { params: {} })
    .then((res: any) => (humps.camelizeKeys(res.data)) as Video)
}
