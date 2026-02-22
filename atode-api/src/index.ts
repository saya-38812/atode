import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { supabase } from './supabase'
import ogs from 'open-graph-scraper'
import 'dotenv/config'

const app = new Hono()

app.use('*', cors())

app.use('*', async (c, next) => {
  console.log('REQ', c.req.method, c.req.url)
  await next()
})

/* =========================================
   Utility: Metadata Resolver
========================================= */

async function resolveMetadata(url: string): Promise<{ title: string, thumbnail_url: string | null, description: string | null }> {
  try {
    // ① YouTube優先
    if (url.includes("youtube.com/watch") || url.includes("youtu.be/")) {
      const videoId = url.includes("youtu.be/")
        ? url.split("youtu.be/")[1]?.split("?")[0]
        : new URL(url).searchParams.get("v")

      if (videoId) {
        const ytRes = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
        )
        const ytData = await ytRes.json()
        if (ytData?.title) {
          return {
            title: ytData.title,
            thumbnail_url: ytData.thumbnail_url || null,
            description: null
          }
        }
      }
    }

    // ② X専用
    if (url.includes("x.com/") || url.includes("twitter.com/")) {
      const match = url.match(/(?:x\.com|twitter\.com)\/([^\/]+)\//)
      const username = match ? match[1] : "X投稿"
      let description = null

      try {
        const vxUrl = url.replace("x.com", "api.vxtwitter.com").replace("twitter.com", "api.vxtwitter.com")
        const vxRes = await fetch(vxUrl)
        const vxData = await vxRes.json()
        if (vxData?.text) description = vxData.text
      } catch (e) { }

      return {
        title: `@${username} の投稿`,
        thumbnail_url: null,
        description
      }
    }

    // ③ OG取得
    const { result } = await ogs({
      url,
      timeout: 5000,
      fetchOptions: {
        headers: { "User-Agent": "Mozilla/5.0" }
      }
    })

    return {
      title: result.ogTitle || result.twitterTitle || result.ogSiteName || url,
      thumbnail_url: null,
      description: null
    }

  } catch (e) {
    console.log("TITLE ERROR:", e)
    return { title: url, thumbnail_url: null, description: null }
  }
}

/* =========================================
   POST /bookmark
========================================= */

app.post('/bookmark', async (c) => {
  try {
    const { url } = await c.req.json()

    if (!url) {
      return c.json({ error: "URL required" }, 400)
    }

    const user_id = "00000000-0000-0000-0000-000000000001"

    const { title, thumbnail_url, description } = await resolveMetadata(url)

    console.log("BOOKMARK INSERT:", { url, title, thumbnail_url, description })

    // まずthumbnail_url, descriptionを含めて試行
    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id,
        url,
        title,
        thumbnail_url,
        description,
        viewed: false,
        is_favorite: false
      })
      .select()

    if (error) {
      console.log("INSERT ERROR (with extras):", JSON.stringify(error))

      // カラムが存在しない場合、thumbnail_url/descriptionなしでリトライ
      const { data: data2, error: error2 } = await supabase
        .from('bookmarks')
        .insert({
          user_id,
          url,
          title,
          viewed: false,
          is_favorite: false
        })
        .select()

      if (error2) {
        console.log("INSERT ERROR (fallback):", JSON.stringify(error2))
        return c.json({ error: error2 }, 400)
      }

      return c.json({ data: data2 })
    }

    return c.json({ data })
  } catch (e) {
    console.log("BOOKMARK EXCEPTION:", e)
    return c.json({ error: "Internal server error" }, 500)
  }
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
    .eq('is_favorite', false)

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
    .eq('viewed', false)
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
    .update({ viewed: true, done_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return c.json({ error }, 400)

  return c.json({ status: 'ok' })
})

/* =========================================
   POST /favorite/:id
========================================= */

app.post('/favorite/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()

  if (body.remove) {
    const { error } = await supabase
      .from('bookmarks')
      .update({
        is_favorite: false,
        favorite_folder_id: null
      })
      .eq('id', id)

    if (error) return c.json({ error }, 400)
    return c.json({ status: 'ok' })
  }

  const { folder_id } = body
  const { error } = await supabase
    .from('bookmarks')
    .update({
      is_favorite: true,
      viewed: true,
      favorite_folder_id: folder_id,
      done_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) return c.json({ error }, 400)

  return c.json({ status: 'ok' })
})



/* =========================================
   GET /api/folders
========================================= */

app.get('/api/folders', async (c) => {
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
   GET /api/favorites
   お気に入り一覧 (フォルダごと)
========================================= */

app.get('/api/favorites', async (c) => {
  const user_id = "00000000-0000-0000-0000-000000000001"

  // Fetch all folders
  const { data: foldersData, error: foldersError } = await supabase
    .from('favorite_folders')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: true })

  if (foldersError) return c.json({ error: foldersError }, 400)

  // Fetch all favorite bookmarks
  const { data: bookmarksData, error: bookmarksError } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user_id)
    .eq('is_favorite', true)
    .order('created_at', { ascending: false })

  if (bookmarksError) return c.json({ error: bookmarksError }, 400)

  // Group by folder
  const groupedFolderDict: Record<string, { folder: any, items: any[] }> = {}
  for (const f of foldersData || []) {
    groupedFolderDict[f.id] = { folder: f, items: [] }
  }

  // Also handle items without a folder, or unknown folders
  const unassigned = { folder: { id: 'unassigned', name: '未分類' }, items: [] as any[] }

  for (const bm of bookmarksData || []) {
    if (bm.favorite_folder_id && groupedFolderDict[bm.favorite_folder_id]) {
      groupedFolderDict[bm.favorite_folder_id].items.push(bm)
    } else {
      unassigned.items.push(bm)
    }
  }

  const result = Object.values(groupedFolderDict)
  if (unassigned.items.length > 0) {
    result.push(unassigned)
  }

  return c.json(result)
})

/* =========================================
   Server Start
========================================= */

serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) || 8000,
})

console.log(`atode running on port ${process.env.PORT || 8000}`)
