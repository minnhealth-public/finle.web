type KeyTakeaway = {
  id: number
  text: string
}


export type ClipKeyTakeaway = {
  id: number
  clipId: number
  clipName: string
  text: string
  startTime: number
  endTime: number
}

export default KeyTakeaway;
