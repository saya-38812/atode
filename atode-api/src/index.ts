import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import Database from 'better-sqlite3'
import { cors } from 'hono/cors'
import { supabase } from './supabase'
import 'dotenv/config'

import ogs from 'open-graph-scraper'

const app = new Hono()
app.use('/api/*', cors())


app.use('*', async (c, next) => {
  console.log('REQ', c.req.method, c.req.url)
  await next()
})

    
app.post('/bookmark', async (c) => {
  console.log("BOOKMARK HIT")

  const body = await c.req.json()
  const { url, reason } = body

  console.log("URL:", url)

  const user_id = "00000000-0000-0000-0000-000000000001"

  let title = url

  try {
    console.log("OG FETCH START")

    const { result } = await ogs({
      url,
      timeout: 5000,
      fetchOptions: {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      }
    })

    console.log("OG RESULT:", result)

    title =
      result.ogTitle ||
      result.twitterTitle ||
      result.ogSiteName ||
      url

  } catch (e) {
    console.log("OG ERROR:", e)
  }

  if (url.includes("x.com") || url.includes("twitter.com")) {
    const match = url.match(/x\.com\/([^\/]+)\//)
    const username = match ? match[1] : "X投稿"
  
    title = `@${username} の投稿`
  }
  
  
  
  if (url.includes("youtube.com/watch")) {
    const videoId = new URL(url).searchParams.get("v")
  
    if (videoId) {
      try {
        const ytRes = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
        )
        const ytData = await ytRes.json()
        title = ytData.title
      } catch (e) {
        console.log("YouTube title fetch failed")
      }
    }
  }

  // ここまでで title いろいろ処理

if (!title || typeof title !== "string" || title.trim() === "") {
  title = url
}

  

  console.log("FINAL TITLE:", title)

  const { data, error } = await supabase
    .from('bookmarks')
    .insert({
      user_id,
      url,
      title,
      reason
    })
    .select()

  console.log("INSERT RESULT:", { data, error })

  return c.json({ data, error })
})


    
    
    
    

app.get('/api/next', async (c) => {
  const user_id = "00000000-0000-0000-0000-000000000001"

  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user_id)
    .eq('done', false)
    .order('created_at', { ascending: true })
    .limit(3)

  if (error) return c.json({ error }, 400)

  return c.json(data)
})



app.post('/done/:id', async (c) => {
  const id = c.req.param('id')

  const { error } = await supabase
    .from('bookmarks')
    .update({
      done: true,
      done_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) return c.json({ error }, 400)

  return c.json({ status: 'ok' })
})


    

serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) || 8000,
})

console.log(`atode running http://localhost:${process.env.PORT || 8000}`)
