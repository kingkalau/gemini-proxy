addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  try {
    let prompt

    if (request.method === "GET") {
      const url = new URL(request.url)
      prompt = url.searchParams.get("prompt")
      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "Missing 'prompt' in query string" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        )
      }
    } else if (request.method === "POST") {
      let body
      try { body = await request.json() } 
      catch { body = {} }

      prompt = body.prompt
      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "Missing 'prompt' in request body" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        )
      }
    } else {
      return new Response(
        JSON.stringify({ error: "Only GET or POST allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      )
    }

    const model = (request.method === "POST" && body.model) || "gemini-2.5-pro"
    const API_KEY = await SECRET_API_KEY // Cloudflare Secret

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
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
