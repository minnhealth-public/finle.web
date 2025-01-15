import { Filter } from "./Filter";

interface Resource {
  id: number,
  title: string,
  description: string,
  link: string,
  type: string,
  isFree: boolean,
  requiresAccount: boolean
  tasks: any[]
  topics: any[]
}

export interface ResourceFilter {
  topics: Filter[]
  resourceTypes: string[]
}

export default Resource;
