import GlossaryItem from "./glossary"
import Resource from "./resource"
import Tag from "./tag"

export interface Topic {
  id: number,
  name: string
}

export interface TeamTaskField {
  id?: number,
  value: string,
  completedTimestamp?: string,
  teamId: number,
  taskFieldId: number,
  userId: number
}

export interface TaskField {
  id: number,
  label: string,
  description: string,
  required: boolean,
  type: string,
  teamTaskFields: TeamTaskField[]
}

interface Todo {
  id: number
  title: string
  shortDescription: string
  fullDescription: string
  ranking: number
  topic: Topic
  taskFields: TaskField[]
  relatedTerms: GlossaryItem[]
  relatedTags: Tag[]
  relatedClips?: VideoClip[]
  relatedResources: Resource[]
  status?: TeamTodo
}


interface TeamTodo {
  modifiedTimestamp: string
  completedTimestamp: string
}

export interface VideoClip {
  id: number
  startTime: number
  endTime: number
  name: string
  video: string
  videoUrl: string
  topicsAddressed?: number[]
  entireClip?: VideoClip
  saved?: boolean
  watched?: boolean
  rating?: number
}

export default Todo;
