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
  let title = url

  try {
    // 1️⃣ YouTube優先
    if (url.includes("youtube.com/watch")) {
      const videoId = new URL(url).searchParams.get("v")

      if (videoId) {
        const ytRes = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
        )
        const ytData = await ytRes.json()

        if (ytData?.title) {
          return ytData.title
        }
      }
    }

    // 2️⃣ X専用処理
    if (url.includes("x.com") || url.includes("twitter.com")) {
      const match = url.match(/(?:x\.com|twitter\.com)\/([^\/]+)\//)
      const username = match ? match[1] : "X投稿"
      return `@${username} の投稿`
    }

    // 3️⃣ 通常サイト（OG取得）
    const { result } = await ogs({
      url,
      timeout: 5000,
      fetchOptions: {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      }
    })

    title =
      result.ogTitle ||
      result.twitterTitle ||
      result.ogSiteName ||
      url

  } catch (e) {
    console.log("TITLE RESOLVE ERROR:", e)
  }

  // 最終保証
  if (!title || typeof title !== "string" || title.trim() === "") {
    return url
  }

  return title.trim()
}

/* =========================================
   POST /bookmark
========================================= */

app.post('/bookmark', async (c) => {
  console.log("BOOKMARK HIT")

  const body = await c.req.json()
  const { url, reason } = body

  if (!url) {
    return c.json({ error: "URL required" }, 400)
  }

  const user_id = "00000000-0000-0000-0000-000000000001"

  const title = await resolveTitle(url)

  const safeReason =
    typeof reason === "string" && reason.trim() !== ""
      ? reason.trim()
      : ""

  console.log("FINAL TITLE:", title)

  const { data, error } = await supabase
    .from('bookmarks')
    .insert({
      user_id,
      url,
      title,
      reason: safeReason
    })
    .select()

  console.log("INSERT RESULT:", { data, error })

  if (error) {
    return c.json({ error }, 400)
  }

  return c.json({ data })
})

/* =========================================
   GET /api/next
========================================= */

app.get('/api/next', async (c) => {
  const user_id = "00000000-0000-0000-0000-000000000001"

  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user_id)
    .eq('done', false)
    .order('created_at', { ascending: true })
    .limit(3)

  if (error) {
    return c.json({ error }, 400)
  }

  return c.json(data)
})

/* =========================================
   POST /done/:id
========================================= */

app.post('/done/:id', async (c) => {
  const id = c.req.param('id')

  const { error } = await supabase
    .from('bookmarks')
    .update({
      done: true,
      done_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    return c.json({ error }, 400)
  }

  return c.json({ status: 'ok' })
})

/* =========================================
   Server Start
========================================= */

serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) || 8000,
})

console.log(`atode running on port ${process.env.PORT || 8000}`)
