const assert = require("node:assert/strict");
const http = require("node:http");
const PORT = Number(process.env.PORT || 3000);
const request = (method, path, body, token) => new Promise((resolve, reject) => {
  const payload = body === undefined ? undefined : JSON.stringify(body);
  const headers = payload ? { "Content-Type": "application/json" } : {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const req = http.request({ hostname: "localhost", port: PORT, path, method, headers }, (res) => {
    let text = "";
    res.setEncoding("utf8");
    res.on("data", (chunk) => { text += chunk; });
    res.on("end", () => resolve({ status: res.statusCode, text }));
  });
  req.on("error", reject);
  if (payload) req.write(payload);
  req.end();
});
const run = async () => {
  const login = await request("POST", "/api/auth/login", { email: "admin@apdafsport.com", password: "Admin123*" });
  assert.equal(login.status, 200, "Login del administrador de prueba debe responder 200");
  const adminToken = JSON.parse(login.text).token;
  assert.equal(typeof adminToken, "string", "Login debe entregar un token");

  const listed = await request("GET", "/api/products");
  assert.equal(listed.status, 200, "GET /api/products debe responder 200");
  const products = JSON.parse(listed.text);
  assert.ok(products.length > 0, "El seed debe cargar productos");
  const seedId = products[0].id;

  const checks = [
    ["GET", `/api/products/${seedId}`, undefined, 200, true],
    ["GET", "/api/products/abc", undefined, 400, true],
    ["GET", "/api/products/99999", undefined, 404, true],
    ["POST", "/api/products", { name: "A", price: -1 }, 400, true],
    ["POST", "/api/products", { name: "Sin autorización", price: 1 }, 401, false],
    ["POST", "/api/ruta-inexistente", {}, 404, false],
  ];
  for (const [method, path, body, expected, useAdmin] of checks) {
    const result = await request(method, path, body, useAdmin ? adminToken : undefined);
    assert.equal(result.status, expected, `${method} ${path}: se esperaba ${expected}, llegó ${result.status}`);
  }
  const created = await request("POST", "/api/products", { name: "Prueba eliminar", institution: "QA", category: "Uniforme diario", price: 2, stock: 1 }, adminToken);
  assert.equal(created.status, 201, "Solo ADMIN debe crear productos");
  const id = JSON.parse(created.text).id;
  const removed = await request("DELETE", `/api/products/${id}`, undefined, adminToken);
  assert.equal(removed.status, 204);
  assert.equal(removed.text, "");
  console.log(`Smoke test OK: ${checks.length + 4} escenarios verificados.`);
};
run().catch((error) => { console.error(`Smoke test falló: ${error.message}`); process.exitCode = 1; });
