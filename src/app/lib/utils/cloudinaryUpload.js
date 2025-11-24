
export async function uploadToCloudinary(file, { folder, onProgress, forceServer } = {}) {
	const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
	const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
	const FOLDER = folder || process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || "qreturn";

	// If unsigned configuration is missing or forceServer flag is set, use server route (signed upload)
	if (forceServer || !CLOUD_NAME || !UPLOAD_PRESET) {
		const fd = new FormData();
		fd.append("file", file);
		if (FOLDER) fd.append("folder", FOLDER);
		const res = await fetch("/api/images/upload", { method: "POST", body: fd });
		if (!res.ok) {
			const msg = await res.text();
			throw new Error(msg || "Cloudinary upload failed");
		}
		const data = await res.json();
		return normalizeUploadResult(data);
	}

	const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
	const formData = new FormData();
	formData.append("file", file);
	formData.append("upload_preset", UPLOAD_PRESET);
	if (FOLDER) formData.append("folder", FOLDER);

	// Optionally support progress with XHR; fetch doesn't support progress
	if (onProgress) {
		await new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.upload.onprogress = (e) => {
				if (e.lengthComputable) {
					const pct = Math.round((e.loaded / e.total) * 100);
					onProgress(pct);
				}
			};
			xhr.onload = () => resolve();
			xhr.onerror = () => reject(new Error("Cloudinary upload failed"));
			xhr.send(formData);
		});

		// After XHR upload completes, refetch the response URL is tricky. Instead, do a fetch too.
		// We repeat using fetch to get the JSON (fast, server already received the file via prior request).
		const res = await fetch(url, { method: "POST", body: formData });
		if (!res.ok) throw new Error("Cloudinary upload failed");
		const data = await res.json();
		return normalizeUploadResult(data);
	}

	const res = await fetch(url, { method: "POST", body: formData });
	if (!res.ok) throw new Error("Cloudinary upload failed");
	const data = await res.json();
	return normalizeUploadResult(data);
}

function normalizeUploadResult(data) {
	// Return a small, consistent shape used across the app
	return {
		url: data.secure_url || data.url,
		public_id: data.public_id,
		width: data.width,
		height: data.height,
		format: data.format,
		bytes: data.bytes,
		resource_type: data.resource_type,
	};
}

