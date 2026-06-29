import { useCallback, useState } from "react"

type StorageType = "local" | "session"

export function useStorage<T>(
  key: string,
  defaultValue: T,
  type: StorageType = "session"
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue
    try {
      const raw = (type === "local" ? localStorage : sessionStorage).getItem(
        key
      )
      return raw !== null ? (JSON.parse(raw) as T) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const set = useCallback(
    (value: T) => {
      setState(value)
      try {
        ;(type === "local" ? localStorage : sessionStorage).setItem(
          key,
          JSON.stringify(value)
        )
      } catch {}
    },
    [key, type]
  )

  return [state, set]
}
