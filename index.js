addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  try {
    // GET 測試用
    if (request.method === "GET") {
      return new Response(
        JSON.stringify({ message: "Worker is running. Use POST with JSON body." }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    }

    // 僅接受 POST
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Only POST allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      )
    }

    // 解析 JSON body
    let body
    try {
      body = await request.json()
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const prompt = body.prompt
    const model = body.model || "gemini-2.5-pro"

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing 'prompt' in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // 讀 Cloudflare Secret
    const API_KEY = await SECRET_API_KEY // 你必須在 Cloudflare Worker 設定 secret

    // 呼叫 Gemini API
    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Authorization": 'Bearer ${API_KEY}',
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: { text: prompt } })
      }
    )

    const data = await apiResponse.json()

    // 模擬 OpenRouter API 回傳格式
    const responsePayload = {
      id: data.name || "response-id",
      object: "text_completion",
      choices: [
        { text: data.candidates?.[0]?.content?.text || "" }
      ]
    }

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
