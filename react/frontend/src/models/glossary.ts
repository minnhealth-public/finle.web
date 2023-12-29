interface GlossaryItem {
    id: number;
    term: string;
    definition: string;
    source: string;
    related_terms: number[];
    related_clips: number[];
}

export default GlossaryItem;
