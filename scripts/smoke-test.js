const assert = require("node:assert/strict");
const http = require("node:http");

const request = (method, path, body) =>
  new Promise((resolve, reject) => {
    const payload = body === undefined ? undefined : JSON.stringify(body);
    const req = http.request({
      hostname: "localhost",
      port: 3000,
      path,
      method,
      headers: payload ? { "Content-Type": "application/json" } : {},
    }, (res) => {
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
  const checks = [
    ["GET", "/api/products", undefined, 200],
    ["GET", "/api/products/1", undefined, 200],
    ["GET", "/api/products/abc", undefined, 400],
    ["GET", "/api/products/99999", undefined, 404],
    ["POST", "/api/products", { name: "A", price: -1 }, 400],
    ["POST", "/api/ruta-inexistente", {}, 404],
  ];

  for (const [method, path, body, expected] of checks) {
    const result = await request(method, path, body);
    assert.equal(result.status, expected, `${method} ${path}: se esperaba ${expected}, llegó ${result.status}`);
  }

  const created = await request("POST", "/api/products", { name: "Prueba eliminar", institution: "QA", category: "Test", price: 2 });
  const id = JSON.parse(created.text).id;
  const removed = await request("DELETE", `/api/products/${id}`);
  assert.equal(removed.status, 204);
  assert.equal(removed.text, "");
  console.log(`Smoke test OK: ${checks.length + 2} escenarios verificados.`);
};

run().catch((error) => {
  console.error(`Smoke test falló: ${error.message}`);
  process.exitCode = 1;
});
