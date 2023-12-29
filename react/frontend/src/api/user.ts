
export async function getUserCareTeams(axios: any): Promise<any[]> {
    return axios
        .get(`/api/user/care-teams`, {params: {}})
        .then((res:any) => res.data)
}
