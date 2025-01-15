import { GlossaryItem } from "."
import Resource from "./resource"
import Todo, { VideoClip } from "./todo"

export interface Note {
  id?: number
  teamId: number
  userId: number
  text: string
  pinned: boolean
  ctime: string
  glossary: GlossaryItem
  clip: VideoClip
  resource: Resource
  task: Todo
}
