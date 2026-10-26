import { useCallback, useEffect, useRef, useState } from 'react';
import { LocalAI } from '../index';
import type {
  DeviceCapabilities,
  GenerateRequest,
  LocalAIStatus,
  ModelLoadOptions,
  ModelLoadProgressEvent,
  RuntimeStatus,
  StreamCompleteEvent,
  StructuredGenerateRequest,
  TokenEvent,
} from './types';

export interface UseLocalAIReturn {
  status: LocalAIStatus;
  isAvailable: boolean;
  isLoaded: boolean;
  isGenerating: boolean;
  runtimeStatus: RuntimeStatus | null;
  capabilities: DeviceCapabilities | null;
  loadProgress: ModelLoadProgressEvent | null;
  streamText: string;
  tokensPerSecond: number;
  lastDurationMs: number;
  error: string | null;

  loadModel: (modelPathOrAsset: string, isAsset?: boolean, options?: ModelLoadOptions) => Promise<boolean>;
  unloadModel: () => Promise<boolean>;
  generateText: (request: GenerateRequest) => Promise<string>;
  generateStream: (
    request: GenerateRequest,
    onTokenDelta?: (token: string) => void
  ) => Promise<string>;
  generateStructured: <T = unknown>(request: StructuredGenerateRequest<T>) => Promise<T>;
  embed: (text: string) => Promise<number[]>;
  stop: () => void;
  refreshStatus: () => void;
}

export function useLocalAI(): UseLocalAIReturn {
  const [status, setStatus] = useState<LocalAIStatus>('unloaded');
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus | null>(null);
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null);
  const [loadProgress, setLoadProgress] = useState<ModelLoadProgressEvent | null>(null);
  const [streamText, setStreamText] = useState('');
  const [tokensPerSecond, setTokensPerSecond] = useState(0);
  const [lastDurationMs, setLastDurationMs] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const turnIdCounter = useRef(1);
  const activeStreamResolver = useRef<{
    resolve: (val: string) => void;
    reject: (err: Error) => void;
  } | null>(null);
  const tokenCallbackRef = useRef<((t: string) => void) | null>(null);

  const refreshStatus = useCallback(() => {
    const avail = LocalAI.isAvailable();
    setIsAvailable(avail);
    if (avail) {
      const rt = LocalAI.getRuntimeStatus();
      setRuntimeStatus(rt);
      setIsLoaded(rt.isLoaded);
      setIsGenerating(rt.isGenerating);
      setStatus(rt.isGenerating ? 'generating' : rt.isLoaded ? 'ready' : 'unloaded');

      try {
        const caps = LocalAI.getDeviceCapabilities();
        setCapabilities(caps);
      } catch {}
    }
  }, []);

  useEffect(() => {
    refreshStatus();

    const tokenSub = LocalAI.onToken((ev: TokenEvent) => {
      setStreamText((prev) => prev + ev.token);
      tokenCallbackRef.current?.(ev.token);
    });

    const completeSub = LocalAI.onStreamComplete((ev: StreamCompleteEvent) => {
      setIsGenerating(false);
      setStatus('ready');
      setTokensPerSecond(ev.tokensPerSecond);
      setLastDurationMs(ev.durationMs);
      activeStreamResolver.current?.resolve(ev.fullText);
      activeStreamResolver.current = null;
    });

    const errorSub = LocalAI.onStreamError((ev) => {
      setIsGenerating(false);
      setStatus('error');
      setError(ev.error);
      activeStreamResolver.current?.reject(new Error(ev.error));
      activeStreamResolver.current = null;
    });

    const progressSub = LocalAI.onModelLoadProgress((ev) => {
      setLoadProgress(ev);
    });

    return () => {
      tokenSub.remove();
      completeSub.remove();
      errorSub.remove();
      progressSub.remove();
    };
  }, [refreshStatus]);

  const loadModel = useCallback(
    async (modelPathOrAsset: string, isAsset = false, options?: ModelLoadOptions): Promise<boolean> => {
      setError(null);
      setStatus('loading');
      try {
        await LocalAI.loadModel(modelPathOrAsset, isAsset, options);
        setIsLoaded(true);
        setStatus('ready');
        refreshStatus();
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        setStatus('error');
        return false;
      }
    },
    [refreshStatus]
  );

  const unloadModel = useCallback(async (): Promise<boolean> => {
    try {
      const ok = await LocalAI.unloadModel();
      setIsLoaded(false);
      setStatus('unloaded');
      refreshStatus();
      return ok;
    } catch {
      return false;
    }
  }, [refreshStatus]);

  const generateText = useCallback(async (request: GenerateRequest): Promise<string> => {
    setError(null);
    setIsGenerating(true);
    setStatus('generating');
    try {
      const res = await LocalAI.generateText(request);
      setStatus('ready');
      setIsGenerating(false);
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setStatus('error');
      setIsGenerating(false);
      throw err;
    }
  }, []);

  const generateStream = useCallback(
    async (request: GenerateRequest, onTokenDelta?: (token: string) => void): Promise<string> => {
      setError(null);
      setStreamText('');
      setTokensPerSecond(0);
      setIsGenerating(true);
      setStatus('generating');
      tokenCallbackRef.current = onTokenDelta ?? null;

      const turnId = `turn_${Date.now()}_${turnIdCounter.current++}`;

      return new Promise<string>((resolve, reject) => {
        activeStreamResolver.current = { resolve, reject };
        try {
          LocalAI.startStream(turnId, request.prompt, request.context, request.system);
        } catch (e: unknown) {
          activeStreamResolver.current = null;
          setIsGenerating(false);
          setStatus('error');
          const errorObj = e instanceof Error ? e : new Error(String(e));
          setError(errorObj.message);
          reject(errorObj);
        }
      });
    },
    []
  );

  const generateStructured = useCallback(
    async <T = unknown>(request: StructuredGenerateRequest<T>): Promise<T> => {
      setError(null);
      setIsGenerating(true);
      setStatus('generating');
      try {
        const res = await LocalAI.generateStructured<T>(request);
        setStatus('ready');
        setIsGenerating(false);
        return res;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        setStatus('error');
        setIsGenerating(false);
        throw err;
      }
    },
    []
  );

  const embed = useCallback(async (text: string): Promise<number[]> => {
    return LocalAI.embed(text);
  }, []);

  const stop = useCallback(() => {
    LocalAI.cancelGeneration();
    setIsGenerating(false);
    setStatus(isLoaded ? 'ready' : 'unloaded');
  }, [isLoaded]);

  return {
    status,
    isAvailable,
    isLoaded,
    isGenerating,
    runtimeStatus,
    capabilities,
    loadProgress,
    streamText,
    tokensPerSecond,
    lastDurationMs,
    error,
    loadModel,
    unloadModel,
    generateText,
    generateStream,
    generateStructured,
    embed,
    stop,
    refreshStatus,
  };
}
