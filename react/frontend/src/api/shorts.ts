import axios from "./axios";
import { Video } from "../models";

export async function getShorts(): Promise<Video[]> {
    return axios
        .get(`${process.env.REACT_APP_BACKEND_HOST}/api/shorts`, {params: {}})
        .then(res => res.data)
}

export async function getShort(id: string): Promise<Video> {
    return axios
        .get(`/api/shorts/${id}/`, {params: {}})
        .then(res => res.data)
  };
