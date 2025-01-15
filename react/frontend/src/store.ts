import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User } from './models/user';
import { CareTeam } from './models/careTeam';
import Topic from './models/topic';
import Todo, { VideoClip } from './models/todo';
import Tutorial from './models/tutorial';
import UserSession from './models/userSession';

type State = {
  showTutorial: boolean
  zoom: number | null
  token: string | null
  user: User | null
  careTeam: CareTeam | null
  tutorial: Tutorial
  careTeams: CareTeam[]
  topics: Topic[]
  clips: VideoClip[]
  todos: Todo[]
  session: UserSession
}

type Actions = {
  reset: () => void
  setUser: (user: User) => void
  setToken: (jwtToken: string) => void
  setCareTeam: (careTeam: CareTeam) => void
  setCareTeams: (careTeams: CareTeam[]) => void
  setTopics: (topics: Topic[]) => void
  setClips: (videoClips: VideoClip[]) => void
  setTodos: (todos: Todo[]) => void
  setZoom: (zoom: number) => void
  setTutorial: (tutorial: Tutorial) => void
  setShowTutorial: (showTutorial: boolean) => void
  setSession: (session: UserSession) => void
}

// define the initial state
const initialState: State = {
  user: null,
  zoom: 0,
  token: null,
  careTeam: null,
  session: null,
  tutorial: { run: false, stepIndex: 0 },
  showTutorial: false,
  careTeams: [],
  topics: [],
  clips: [],
  todos: []
}


export const useStore = create<State & Actions>()(
  persist((set, get) => ({

    zoom: null,
    setZoom: (zoom: number) => set(() => ({ zoom })),

    token: null,
    setToken: (token: string) => set(() => ({ token })),

    user: null,
    setUser: (user: User) => set(() => ({ user })),

    session: null,
    setSession: (session: UserSession) => set(() => ({ session })),

    careTeam: null,
    setCareTeam: (careTeam: CareTeam) => set(() => ({ careTeam })),

    tutorial: { run: false, stepIndex: 0 },
    setTutorial: (tutorial: Tutorial) => set(() => ({ tutorial })),

    careTeams: [],
    setCareTeams: (careTeams: CareTeam[]) => set(() => ({ careTeams })),

    topics: [],
    setTopics: (topics: Topic[]) => set(() => ({ topics })),

    clips: [],
    setClips: (clips: VideoClip[]) => set(() => ({ clips })),

    todos: [],
    setTodos: (todos: Todo[]) => set(() => ({ todos })),

    showTutorial: false,
    setShowTutorial: (showTutorial: boolean) => set(() => ({ showTutorial })),

    reset: () => {
      set(initialState)
    },
  }),
    {
      name: "mem-care",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
