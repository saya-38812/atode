import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import Database from 'better-sqlite3'
import { cors } from 'hono/cors'


const app = new Hono()
app.use('/api/*', cors())

const db = new Database('db.sqlite3')

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
      try {
        const body = await c.req.json()
        const { url, reason } = body
    
        if (!url) {
          console.log('no url')
          return c.json({ status: 'ng' }, 400)
        }
    
        db.prepare(`
          INSERT INTO bookmarks (url, reason, created_at)
          VALUES (?, ?, datetime('now'))
        `).run(url, reason || '')
    
        console.log('saved:', url)
    
        return c.json({ status: 'ok' })
      } catch (e) {
        console.error('error:', e)
        return c.json({ status: 'error' }, 500)
      }
    })
    
    
app.get('/capture', (c) => {
      const url = c.req.query('url') || ''
      const reason = c.req.query('reason') || ''
    
      return c.html(`
      <html>
      <body>
      保存中...
      <script>
        fetch('/bookmark?url=' + encodeURIComponent('${url}') + '&reason=' + encodeURIComponent('${reason}'))
          .then(()=>location.href='/next')
      </script>
      </body>
      </html>
      `)
    })
       
    

app.get('/next', (c) => {
  const rows = db.prepare(`
    SELECT id, url, reason, created_at
    FROM bookmarks
    WHERE done = 0
    ORDER BY created_at ASC
    LIMIT 3
  `).all()

  const items = rows.map((r: any) => `
    <div style="margin-bottom:20px;padding:12px;border:1px solid #ccc;border-radius:12px;">
      <div style="font-size:12px;color:#666">${r.reason}</div>
      <a href="${r.url}" target="_blank" style="display:block;font-size:16px;margin:6px 0;">
        ${r.url}
      </a>
      <form method="POST" action="/done/${r.id}">
        <button style="padding:8px 14px;font-size:14px;">見た</button>
      </form>
    </div>
  `).join('')

  return c.html(`
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>あとで</title>
      </head>
      <body style="font-family:sans-serif;padding:20px;max-width:600px;margin:auto;">
        <h2>今日のあとで</h2>
        ${items || "<p>未処理はありません</p>"}
      </body>
    </html>
  `)
})

app.get('/api/next', (c) => {
  const rows = db.prepare(`
    SELECT id, url, reason, created_at
    FROM bookmarks
    WHERE done = 0
    ORDER BY created_at ASC
    LIMIT 3
  `).all()

  return c.json(rows)
})


app.post('/done/:id', (c) => {
  const id = c.req.param('id')

  db.prepare(`
    UPDATE bookmarks
    SET done = 1
    WHERE id = ?
  `).run(id)

  return c.redirect('/next')
})

    

serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) || 8000,
})

console.log(`atode running http://localhost:${process.env.PORT || 8000}`)
