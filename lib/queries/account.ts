"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { requireClient } from "@/lib/supabase/client"
import { useAuthState } from "@/lib/auth"
import { mapAddress, mapOrder } from "@/lib/db/mappers"
import type { Address, AddressInput, Order } from "@/lib/types"

/* ---------------- 찜 목록 ---------------- */

export function useWishlistIds() {
  const { authUser } = useAuthState()
  return useQuery({
    queryKey: ["wishlist", authUser?.id],
    enabled: authUser !== null,
    queryFn: async () => {
      const { data, error } = await requireClient().from("wishlist").select("product_id").order("created_at", { ascending: false })
      if (error) throw error
      return (data as { product_id: string }[]).map((r) => r.product_id)
    },
  })
}

export function useToggleWish() {
  const { authUser } = useAuthState()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ productId, wished }: { productId: string; wished: boolean }) => {
      const supabase = requireClient()
      if (!authUser) throw new Error("not_authenticated")
      if (wished) {
        const { error } = await supabase.from("wishlist").delete().eq("user_id", authUser.id).eq("product_id", productId)
        if (error) throw error
      } else {
        const { error } = await supabase.from("wishlist").insert({ user_id: authUser.id, product_id: productId })
        if (error) throw error
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  })
}

/* ---------------- 배송지 ---------------- */

export function useAddresses() {
  const { authUser } = useAuthState()
  return useQuery({
    queryKey: ["addresses", authUser?.id],
    enabled: authUser !== null,
    queryFn: async (): Promise<Address[]> => {
      const { data, error } = await requireClient().from("addresses").select("*").order("created_at", { ascending: true })
      if (error) throw error
      return (data as Parameters<typeof mapAddress>[0][]).map(mapAddress)
    },
  })
}

function toAddressRow(input: AddressInput) {
  return {
    label: input.label,
    recipient: input.recipient,
    phone: input.phone,
    zip: input.zip,
    address1: input.address1,
    address2: input.address2,
  }
}

export function useAddressMutations() {
  const queryClient = useQueryClient()
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["addresses"] })

  const add = useMutation({
    mutationFn: async ({ input, makeDefault }: { input: AddressInput; makeDefault?: boolean }): Promise<Address> => {
      const { data, error } = await requireClient()
        .from("addresses")
        .insert({ ...toAddressRow(input), is_default: makeDefault ?? false })
        .select("*")
        .single()
      if (error) throw error
      return mapAddress(data)
    },
    onSuccess: refresh,
  })

  const update = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: AddressInput }) => {
      const { error } = await requireClient().from("addresses").update(toAddressRow(input)).eq("id", id)
      if (error) throw error
    },
    onSuccess: refresh,
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await requireClient().from("addresses").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: refresh,
  })

  const setDefault = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await requireClient().from("addresses").update({ is_default: true }).eq("id", id)
      if (error) throw error
    },
    onSuccess: refresh,
  })

  return { add, update, remove, setDefault }
}

/* ---------------- 주문 ---------------- */

export function useMyOrders() {
  const { authUser } = useAuthState()
  return useQuery({
    queryKey: ["orders", authUser?.id],
    enabled: authUser !== null,
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await requireClient()
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", authUser!.id)
        .order("created_at", { ascending: false })
      if (error) throw error
      return (data as Parameters<typeof mapOrder>[0][]).map(mapOrder)
    },
  })
}

export interface PlaceOrderInput {
  items: { productId: string; quantity: number; color?: string; size?: string }[]
  address: AddressInput
  memo: string
}

/** 주문 만들기. 가격·재고·배송비는 서버(place_order 함수)가 다시 계산합니다. */
export function usePlaceOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ items, address, memo }: PlaceOrderInput): Promise<{ id: string; amount: number }> => {
      const { data, error } = await requireClient().rpc("place_order", {
        p_items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity, color: i.color ?? null, size: i.size ?? null })),
        p_address: {
          recipient: address.recipient,
          phone: address.phone,
          zip: address.zip,
          address1: address.address1,
          address2: address.address2,
        },
        p_memo: memo,
      })
      if (error) throw error
      const order = data as { id: string; amount: number }
      return { id: order.id, amount: order.amount }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  })
}
