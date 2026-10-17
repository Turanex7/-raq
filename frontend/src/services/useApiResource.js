import { useCallback, useEffect, useState } from "react";
import { apiRequest, useMocks } from "./api";

export default function useApiResource(path, enabled = true) {
  const [state, setState] = useState({ path: "", data: null, loading: true, error: "" });
  const [revision, setRevision] = useState(0);
  const retry = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    if (!enabled || useMocks) return undefined;
    let cancelled = false;
    apiRequest(path).then((result) => {
      if (!cancelled) setState({ path, data: result, loading: false, error: "" });
    }).catch((requestError) => {
      if (!cancelled) setState({ path, data: null, loading: false, error: requestError.message || "Məlumat yüklənmədi." });
    });
    return () => { cancelled = true; };
  }, [enabled, path, revision]);
  const current = state.path === path;
  return { data: current ? state.data : null, loading: enabled && !useMocks && (!current || state.loading), error: current ? state.error : "", retry, setData: (data) => setState({ path, data, loading: false, error: "" }) };
}
