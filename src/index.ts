import indexHtml from "./frontend/index.html"
import { getWines, getWineById, getMaxPrice } from "./api/wines"
import { getInventoryByWineId } from "./api/inventory"

const PORT = Number(Bun.env.PORT) || 4000

Bun.serve({
  port: PORT,

  // Static file serving
  async fetch(req) {
    const url = new URL(req.url)

    // Serve images from src/frontend/img/
    if (url.pathname.startsWith('/img/')) {
      const filePath = `./src/frontend${url.pathname}`
      const file = Bun.file(filePath)
      if (await file.exists()) {
        return new Response(file)
      }
      return new Response('Image not found', { status: 404 })
    }

    return new Response('Not found', { status: 404 })
  },

  routes: {
    // Frontend
    "/": indexHtml,

    // Health check
    "/api/health": {
      GET: () => new Response(JSON.stringify({ status: "ok", service: "kiosk" }), {
        headers: { "Content-Type": "application/json" }
      })
    },

    // Get max price
    "/api/wines/max-price": {
      GET: async () => {
        try {
          const maxPrice = await getMaxPrice()
          return new Response(JSON.stringify({ maxPrice }), {
            headers: { "Content-Type": "application/json" }
          })
        } catch (error: any) {
          console.error('Error fetching max price:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          })
        }
      }
    },

    // Get all wines with filters
    "/api/wines": {
      GET: async (req) => {
        try {
          const url = new URL(req.url)
          const filters = {
            type: url.searchParams.get('type') || undefined,
            country: url.searchParams.get('country') || undefined,
            variety: url.searchParams.get('variety') || undefined,
            minPrice: url.searchParams.get('minPrice') ? Number(url.searchParams.get('minPrice')) : undefined,
            maxPrice: url.searchParams.get('maxPrice') ? Number(url.searchParams.get('maxPrice')) : undefined,
            search: url.searchParams.get('search') || undefined,
          }

          const wines = await getWines(filters)

          return new Response(JSON.stringify(wines), {
            headers: { "Content-Type": "application/json" }
          })
        } catch (error: any) {
          console.error('Error fetching wines:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          })
        }
      }
    },

    // Get wine by ID
    "/api/wines/:id": {
      GET: async (req) => {
        try {
          const id = Number(req.params.id)

          if (isNaN(id)) {
            return new Response(JSON.stringify({ error: "Invalid wine ID" }), {
              status: 400,
              headers: { "Content-Type": "application/json" }
            })
          }

          const wine = await getWineById(id)

          if (!wine) {
            return new Response(JSON.stringify({ error: "Wine not found" }), {
              status: 404,
              headers: { "Content-Type": "application/json" }
            })
          }

          return new Response(JSON.stringify(wine), {
            headers: { "Content-Type": "application/json" }
          })
        } catch (error: any) {
          console.error('Error fetching wine:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          })
        }
      }
    },

    // Get inventory by wine ID
    "/api/inventory/:wine_id": {
      GET: async (req) => {
        try {
          const wineId = Number(req.params.wine_id)

          if (isNaN(wineId)) {
            return new Response(JSON.stringify({ error: "Invalid wine ID" }), {
              status: 400,
              headers: { "Content-Type": "application/json" }
            })
          }

          const inventory = await getInventoryByWineId(wineId)

          return new Response(JSON.stringify(inventory), {
            headers: { "Content-Type": "application/json" }
          })
        } catch (error: any) {
          console.error('Error fetching inventory:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          })
        }
      }
    }
  },

  development: {
    hmr: true,
    console: true,
  }
})

console.log(`🍷 Podoring Kiosk running on http://localhost:${PORT}`)
