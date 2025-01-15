export interface CareTeam {
  id?: number;
  name: string;
  members: CareTeamMember[]
}

export interface CareTeamMember {
  id?: number
  teamId?: number
  memberId?: number
  relation: string
  firstName?: string
  lastName?: string
  email: string
  notificationCount: number
  isCareteamAdmin?: boolean
  isCaree?: boolean
}
