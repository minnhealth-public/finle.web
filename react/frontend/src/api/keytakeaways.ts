import humps from "humps";
import { AxiosInstance } from "axios";
import { ClipKeyTakeaway } from "../models/keyTakeaways";

export async function getClipKeyTakeaways(axios: AxiosInstance, clipId: number): Promise<ClipKeyTakeaway[]> {
  return axios
    .get(`/api/shorts/${clipId}/key_takeaways/`, { params: {} })
    .then((res: any) => (humps.camelizeKeys(res.data)) as ClipKeyTakeaway[])
}
