import handler from "./api/check_bbb_profile.js";

// Minimal mock req/res for serverless handler
function makeRes() {
  return {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(payload) {
      console.log(JSON.stringify({ status: this.statusCode, body: payload }, null, 2));
    }
  };
}

async function main() {
  const req = {
    method: "POST",
    headers: { "x-api-key": process.env.API_KEY },
    body: {
      bbb_profile_url: "https://www.bbb.org/profile/h4-enterprises-llc",
      since: "2025-10-01T00:00:00Z"
    }
  };
  const res = makeRes();

  await handler(req, res);
}

main().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
