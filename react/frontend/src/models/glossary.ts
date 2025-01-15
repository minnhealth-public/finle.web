interface GlossaryItem {
  id: number;
  term: string;
  definition: string;
  source: string;
  relatedTerms?: RelatedGlossaryItem[];
  relatedClips?: RelatedClip[];
}


export interface RelatedGlossaryItem {
  id: number
  term: string
}

export interface RelatedClip {
  id: number
  name: string
}

export default GlossaryItem;
