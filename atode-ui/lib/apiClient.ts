import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'fake-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const API = process.env.NEXT_PUBLIC_API_URL || ''

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const { data: { session } } = await supabase.auth.getSession()

    const headers = new Headers(options.headers || {})
    if (session?.access_token) {
        headers.set('Authorization', `Bearer ${session.access_token}`)
    }

    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    const url = `${API}${path}`

    return fetch(url, {
        ...options,
        headers
    })
}
