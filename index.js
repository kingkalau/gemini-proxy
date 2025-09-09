addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  try {
    const body = await request.json()
    const prompt = body.prompt || ""
    const model = body.model || "gemini-2.5-pro"

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )

    const data = await geminiResponse.json()
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
