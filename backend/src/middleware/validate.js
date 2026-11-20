// Usage: router.post('/x', validate(z.object({ body: ..., query: ..., params: ... })), handler)
// Parsed values are available on req.validated (Express 5's req.query is read-only).
export function validate(schema) {
  return (req, res, next) => {
    req.validated = schema.parse({ body: req.body, query: req.query, params: req.params })
    next()
  }
}
