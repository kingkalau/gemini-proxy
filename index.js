addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  try {
    // 只接受 POST 請求
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Only POST allowed" }), { status: 405 })
    }

    // 從 URL path 取得模型名稱，例如 /gemini-2.5-pro
    const url = new URL(request.url)
    const pathModel = url.pathname.slice(1) || "gemini-2.5-pro" // 去掉開頭的 /

    // 取得 prompt
    const body = await request.json()
    const prompt = body.prompt || ""

    // 呼叫 Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${pathModel}:generateContent`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GEMINI_API_KEY}`, // 在 Worker Secret 設定
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )

    const data = await geminiResponse.json()

    // 回傳 JSON 給 App
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
