import { create } from "zustand"

interface ToolStatesStore {
  data: Record<string, Record<string, unknown>>
  set: (toolId: string, key: string, value: unknown) => void
  reset: (toolId: string) => void
}

export const useToolStatesStore = create<ToolStatesStore>()((set) => ({
  data: {},
  set: (toolId, key, value) =>
    set((s) => ({
      data: {
        ...s.data,
        [toolId]: { ...s.data[toolId], [key]: value },
      },
    })),
  reset: (toolId) =>
    set((s) => {
      const next = { ...s.data }
      delete next[toolId]
      return { data: next }
    }),
}))
