import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import Database from 'better-sqlite3'
import { cors } from 'hono/cors'
import { supabase } from './supabase'
import 'dotenv/config'


const app = new Hono()
app.use('/api/*', cors())


app.use('*', async (c, next) => {
  console.log('REQ', c.req.method, c.req.url)
  await next()
})


db.exec(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT,
      reason TEXT,
      created_at TEXT,
      done INTEGER DEFAULT 0
    )
    `)
    
app.post('/bookmark', async (c) => {
      const body = await c.req.json()
      const { url, reason } = body
    
      const user_id = "00000000-0000-0000-0000-000000000001"
    
      let title = url
    
      try {
        const res = await fetch(url)
        const html = await res.text()
        const match = html.match(/<title>(.*?)<\/title>/i)
        if (match && match[1]) {
          title = match[1]
        }
      } catch (e) {
        console.log("title fetch failed")
      }
    
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
    
      if (error) return c.json({ error }, 400)
    
      return c.json({ status: 'ok' })
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
