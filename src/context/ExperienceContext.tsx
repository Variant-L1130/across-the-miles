import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import type { ReactNode } from "react";
import type { ExperienceConfig } from "../lib/types";
import { defaultConfig, deepMergeConfig } from "../lib/config";
import { fetchExperience, saveExperience } from "../lib/api";

export type SaveState = "idle" | "saving" | "saved" | "error";

interface Ctx {
  config: ExperienceConfig;
  loading: boolean;
  exists: boolean;
  saveState: SaveState;
  update: (fn: (draft: ExperienceConfig) => void) => void;
  reload: () => Promise<void>;
  flush: () => Promise<void>;
}

const ExperienceContext = createContext<Ctx | null>(null);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ExperienceConfig>(() => defaultConfig());
  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const dirtyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const configRef = useRef(config);
  configRef.current = config;

  const persist = useCallback(async (cfg: ExperienceConfig) => {
    setSaveState("saving");
    try {
      await saveExperience(cfg);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const saved = await fetchExperience();
        if (saved) {
          setExists(true);
          setConfig(deepMergeConfig(saved));
        }
      } catch {
        setSaveState("error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const scheduleSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      dirtyRef.current = false;
      void persist(configRef.current);
    }, 700);
  }, [persist]);

  const update = useCallback(
    (fn: (draft: ExperienceConfig) => void) => {
      setConfig((prev) => {
        const next: ExperienceConfig = structuredClone(prev);
        fn(next);
        configRef.current = next;
        return next;
      });
      dirtyRef.current = true;
      scheduleSave();
    },
    [scheduleSave]
  );

  const reload = useCallback(async () => {
    try {
      const saved = await fetchExperience();
      if (saved) {
        setExists(true);
        const merged = deepMergeConfig(saved);
        setConfig(merged);
        configRef.current = merged;
      }
    } catch {
      /* keep current */
    }
  }, []);

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!dirtyRef.current) return;
    dirtyRef.current = false;
    await persist(configRef.current);
  }, [persist]);

  const value = useMemo(
    () => ({ config, loading, exists, saveState, update, reload, flush }),
    [config, loading, exists, saveState, update, reload, flush]
  );

  return (
    <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>
  );
}

export function useExperience(): Ctx {
  const ctx = useContext(ExperienceContext);
  if (!ctx) throw new Error("useExperience must be used inside ExperienceProvider");
  return ctx;
}
