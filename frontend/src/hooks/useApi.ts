import { useState, useEffect, useCallback } from 'react'
import { healthCheck, getDatasetStats, getMetrics, getModels } from '../services/api'
import type { HealthStatus, DatasetStats, ModelMetrics } from '../types'

// ─── Health Check Hook ───────────────────────────────────────────────────────

export function useHealthCheck(pollInterval = 30000) {
  const [status, setStatus] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const check = useCallback(async () => {
    try {
      const res = await healthCheck()
      setStatus(res.data)
      setError(null)
    } catch (err) {
      setError('API unreachable')
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    check()
    if (pollInterval > 0) {
      const timer = setInterval(check, pollInterval)
      return () => clearInterval(timer)
    }
  }, [check, pollInterval])

  return { status, loading, error, refetch: check }
}

// ─── Dataset Stats Hook ──────────────────────────────────────────────────────

export function useDatasetStats() {
  const [stats, setStats] = useState<DatasetStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getDatasetStats()
      setStats(res.data)
      setError(null)
    } catch {
      setError('Failed to load dataset statistics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { stats, loading, error, refetch: fetch }
}

// ─── Metrics Hook ────────────────────────────────────────────────────────────

export function useMetrics() {
  const [metrics, setMetrics] = useState<Record<string, ModelMetrics> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMetrics()
      setMetrics(res.data)
      setError(null)
    } catch {
      setError('Failed to load model metrics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { metrics, loading, error, refetch: fetch }
}

// ─── Models Hook ─────────────────────────────────────────────────────────────

export function useModels() {
  const [models, setModels] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getModels()
      setModels(res.data?.models || [])
      setError(null)
    } catch {
      setError('Failed to load models')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { models, loading, error, refetch: fetch }
}

// ─── Countdown / Debounce Hook ───────────────────────────────────────────────

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

// ─── Local Storage Hook ──────────────────────────────────────────────────────

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }, [key, storedValue])

  return [storedValue, setValue] as const
}

// ─── Intersection Observer Hook ──────────────────────────────────────────────

export function useInView(threshold = 0.1) {
  const [ref, setRef] = useState<Element | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!ref) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(ref)
    return () => observer.disconnect()
  }, [ref, threshold])

  return [setRef, inView] as const
}
