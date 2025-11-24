export const runtime = "nodejs";

import crypto from "crypto";

function parseCloudinaryUrl(url) {
  // cloudinary://<api_key>:<api_secret>@<cloud_name>
  const m = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/.exec(url || "");
  if (!m) return null;
  const [, api_key, api_secret, cloud_name] = m;
  return { api_key, api_secret, cloud_name };
}

function signParams(params, api_secret) {
  // Create signature by sorting params alphabetically and concatenating key=value joined by &
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto.createHash("sha1").update(toSign + api_secret).digest("hex");
}

export async function POST(req) {
  try {
    const cfg = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
    if (!cfg) {
      return new Response(
        JSON.stringify({ error: "CLOUDINARY_URL missing or invalid" }),
        { status: 500 }
      );
    }

    const form = await req.formData();
    const file = form.get("file");
    const folder = form.get("folder") || process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || "qreturn";

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = { folder, timestamp };
    const signature = signParams(paramsToSign, cfg.api_secret);

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cfg.cloud_name}/image/upload`;
    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("api_key", cfg.api_key);
    uploadForm.append("timestamp", String(timestamp));
    uploadForm.append("signature", signature);
    if (folder) uploadForm.append("folder", folder);

    const res = await fetch(cloudinaryUrl, { method: "POST", body: uploadForm });
    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({ error: "Cloudinary upload failed", detail: errText }), { status: 502 });
    }
    const data = await res.json();

    const normalized = {
      url: data.secure_url || data.url,
      public_id: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      bytes: data.bytes,
      resource_type: data.resource_type,
    };

    return new Response(JSON.stringify(normalized), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Image upload error:", e);
    return new Response(JSON.stringify({ error: "Server error during upload" }), { status: 500 });
  }
}
