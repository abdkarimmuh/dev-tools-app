import { useToolStatesStore } from "@/stores/tool-states";

export function useToolState<T>(
  toolId: string,
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  const value = useToolStatesStore(
    (s) => (s.data[toolId]?.[key] as T) ?? defaultValue
  );
  const setFn = useToolStatesStore((s) => s.set);
  return [value, (v: T) => setFn(toolId, key, v)];
}
