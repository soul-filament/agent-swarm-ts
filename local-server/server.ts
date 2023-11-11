Bun.serve({
  fetch: (req) => {
    return new Response('Hello World!')
  }
})