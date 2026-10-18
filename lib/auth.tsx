"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { mapAccount } from "@/lib/db/mappers"
import type { Account } from "@/lib/types"

interface AuthUser {
  id: string
  email: string
  name: string
  phone: string
}

interface AuthContextValue {
  /** 로그인 여부를 확인하는 중인지 */
  ready: boolean
  authUser: AuthUser | null
}

const AuthContext = createContext<AuthContextValue>({ ready: false, authUser: null })

function toAuthUser(user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null | undefined): AuthUser | null {
  if (!user) return null
  const meta = user.user_metadata ?? {}
  return {
    id: user.id,
    email: user.email ?? "",
    name: typeof meta.name === "string" ? meta.name : "",
    phone: typeof meta.phone === "string" ? meta.phone : "",
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  // 서버에 연결되지 않은 상태에서는 확인할 로그인이 없으니 처음부터 "확인 끝"으로 둡니다.
  const [state, setState] = useState<AuthContextValue>({ ready: !isSupabaseConfigured, authUser: null })

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return

    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (active) setState({ ready: true, authUser: toAuthUser(data.session?.user) })
    })

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      const next = toAuthUser(session?.user)
      setState((prev) => (prev.authUser?.id === next?.id && prev.ready ? prev : { ready: true, authUser: next }))
      // 사용자가 바뀌면 이전 사람의 데이터가 남지 않도록 비웁니다.
      if (event === "SIGNED_OUT") queryClient.clear()
      if (event === "SIGNED_IN") queryClient.invalidateQueries()
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [queryClient])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useAuthState() {
  return useContext(AuthContext)
}

/** 현재 로그인한 회원 정보 (프로필). 확인이 끝나기 전에는 hydrated 가 false 입니다. */
export function useUser(): { hydrated: boolean; user: Account | null } {
  const { ready, authUser } = useContext(AuthContext)

  const profile = useQuery({
    queryKey: ["profile", authUser?.id],
    enabled: authUser !== null,
    staleTime: 60_000,
    queryFn: async () => {
      const supabase = createClient()
      if (!supabase || !authUser) return null
      const { data, error } = await supabase.from("profiles").select("*").eq("id", authUser.id).maybeSingle()
      if (error) throw error
      return data ? mapAccount(data) : null
    },
  })

  const hydrated = ready && (authUser === null || !profile.isPending)

  const user = useMemo<Account | null>(() => {
    if (!authUser) return null
    if (profile.data) return profile.data
    // 프로필 행을 아직 못 읽었을 때는 로그인 정보로 최소한의 값을 채웁니다.
    return {
      id: authUser.id,
      email: authUser.email,
      name: authUser.name,
      phone: authUser.phone,
      marketingConsent: false,
      role: "customer",
      createdAt: "",
    }
  }, [authUser, profile.data])

  return { hydrated, user: hydrated ? user : null }
}
