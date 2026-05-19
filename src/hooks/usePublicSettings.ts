import { useQuery } from "@tanstack/react-query";
import { useSettingsStore } from "@/store";

export function usePublicSettings() {
  const setSettings = useSettingsStore((s) => s.setSettings);

  const query = useQuery({
    queryKey: ["public-settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      const data = await res.json();
      setSettings(data);
      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  return query;
}
