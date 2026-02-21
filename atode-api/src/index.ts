import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { supabase } from './supabase'
import ogs from 'open-graph-scraper'
import 'dotenv/config'

const app = new Hono()

app.use('/api/*', cors())

app.use('*', async (c, next) => {
  console.log('REQ', c.req.method, c.req.url)
  await next()
})

/* =========================================
   Utility: Title Resolver
========================================= */

async function resolveTitle(url: string): Promise<string> {
  try {
    // ① YouTube優先
    if (url.includes("youtube.com/watch")) {
      const videoId = new URL(url).searchParams.get("v")
      if (videoId) {
        const ytRes = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
        )
        const ytData = await ytRes.json()
        if (ytData?.title) return ytData.title
      }
    }

    // ② X専用
    if (url.includes("x.com") || url.includes("twitter.com")) {
      const match = url.match(/(?:x\.com|twitter\.com)\/([^\/]+)\//)
      const username = match ? match[1] : "X投稿"
      return `@${username} の投稿`
    }

    // ③ OG取得
    const { result } = await ogs({
      url,
      timeout: 5000,
      fetchOptions: {
        headers: { "User-Agent": "Mozilla/5.0" }
      }
    })

    return (
      result.ogTitle ||
      result.twitterTitle ||
      result.ogSiteName ||
      url
    )

  } catch (e) {
    console.log("TITLE ERROR:", e)
    return url
  }
}

/* =========================================
   POST /bookmark
========================================= */

app.post('/bookmark', async (c) => {
  const { url } = await c.req.json()

  if (!url) {
    return c.json({ error: "URL required" }, 400)
  }

  const user_id = "00000000-0000-0000-0000-000000000001"

  const title = await resolveTitle(url)

  const { data, error } = await supabase
    .from('bookmarks')
    .insert({
      user_id,
      url,
      title,
      viewed: false,
      is_favorite: false
    })
    .select()

  if (error) return c.json({ error }, 400)

  return c.json({ data })
})

/* =========================================
   GET /api/home
   未viewedからランダム3
========================================= */

app.get('/api/home', async (c) => {
  const user_id = "00000000-0000-0000-0000-000000000001"

  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user_id)
    .eq('viewed', false)

  if (error) return c.json({ error }, 400)

  const shuffled = (data || []).sort(() => 0.5 - Math.random())
  return c.json(shuffled.slice(0, 3))
})

/* =========================================
   GET /api/stock
   全保存一覧（削除なし）
========================================= */

app.get('/api/stock', async (c) => {
  const user_id = "00000000-0000-0000-0000-000000000001"

  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })

  if (error) return c.json({ error }, 400)

  return c.json(data)
})

/* =========================================
   POST /viewed/:id
========================================= */

app.post('/viewed/:id', async (c) => {
  const id = c.req.param('id')

  const { error } = await supabase
    .from('bookmarks')
    .update({ viewed: true })
    .eq('id', id)

  if (error) return c.json({ error }, 400)

  return c.json({ status: 'ok' })
})

/* =========================================
   POST /favorite/:id
========================================= */

app.post('/favorite/:id', async (c) => {
  const id = c.req.param('id')
  const { folder_id } = await c.req.json()

  const { error } = await supabase
    .from('bookmarks')
    .update({
      is_favorite: true,
      viewed: true,
      favorite_folder_id: folder_id
    })
    .eq('id', id)

  if (error) return c.json({ error }, 400)

  return c.json({ status: 'ok' })
})



/* =========================================
   GET /api/folders
========================================= */

app.get('/folders', async (c) => {
  const user_id = "00000000-0000-0000-0000-000000000001"

  const { data, error } = await supabase
    .from('favorite_folders')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: true })

  if (error) return c.json({ error }, 400)

  return c.json(data)
})


/* =========================================
   POST /folders
========================================= */

app.post('/folders', async (c) => {
  const { name } = await c.req.json()
  const user_id = "00000000-0000-0000-0000-000000000001"

  const { data, error } = await supabase
    .from('favorite_folders')
    .insert({ user_id, name })
    .select()

  if (error) return c.json({ error }, 400)

  return c.json(data)
})



/* =========================================
   Server Start
========================================= */

serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) || 8000,
})

console.log(`atode running on port ${process.env.PORT || 8000}`)
