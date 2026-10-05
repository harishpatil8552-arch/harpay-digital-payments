import type { Transaction } from "./types"

const API_BASE_URL = "http://localhost:4000/api"

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,

    headers: {
      "Content-Type": "application/json",

      ...options?.headers,
    },
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string
    } | null

    throw new Error(
      body?.error ?? `API request failed with status ${response.status}`,
    )
  }

  return response.json() as Promise<T>
}

export async function requestOtp(phone: string) {
  return request<{
    requestId: string
    expiresInSeconds: number
    demoOtp: string
  }>("/auth/request-otp", {
    method: "POST",

    body: JSON.stringify({ phone }),
  })
}

export async function verifyOtp(phone: string, requestId: string, otp: string) {
  return request<{
    token: string

    user: { id: string name: string phone: string upiId: string }

    balance: number
  }>("/auth/verify-otp", {
    method: "POST",

    body: JSON.stringify({ phone, requestId, otp }),
  })
}

export async function createPayment(
  payment: Omit<Transaction, "id" | "date">,

  phone: string,

  token: string,
) {
  return request<{
    transaction: Transaction

    account: { balance: number currency: string }
  }>("/payments", {
    method: "POST",

    headers: { Authorization: `Bearer ${token}` },

    body: JSON.stringify({ ...payment, phone }),
  })
}
