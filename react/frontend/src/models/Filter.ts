export interface Filter {
  id: number
  name: string
  tasks: Task[]
}

export interface Task {
  id: number
  title: string
  tags: Tag[]
}

export interface Tag {
  id: number
  name: string
}
