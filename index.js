addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  try {
    // 只接受 POST
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Only POST allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" }
      })
    }

    // 解析 URL path，預設模型
    const url = new URL(request.url)
    const model = url.pathname.slice(1) || "gemini-2.5-pro"

    // 解析 JSON body
    let body = {}
    try {
      body = await request.json()
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { 
        status: 400, 
        headers: { "Content-Type": "application/json" }
      })
    }

    const prompt = body.prompt
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing 'prompt' in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    }

    // 呼叫 Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Authorization": "AIzaSyCxO6fzWuvl9RKhth89kqU_QshJIdjmEec",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: {
            text: prompt
          },
          // 可加上其他選項，例如 maxOutputTokens、temperature 等
        })
      }
    )

    // API 回傳狀態檢查
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      return new Response(JSON.stringify({ error: "Gemini API error", details: errorText }), {
        status: geminiResponse.status,
        headers: { "Content-Type": "application/json" }
      })
    }

    const data = await geminiResponse.json()

    // 回傳 JSON 給前端
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
