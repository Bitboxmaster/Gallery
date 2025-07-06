import { NextRequest, NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

// Мапа: название бакета -> публичная ссылка

const bucketPublicUrls: Record<string, string> = {
  "room": "https://f0a57fb1-3b64-43b2-bd47-85de037b07f1.selstorage.ru",
  "room2": "https://c38134a5-ecc4-45b9-8a61-442070e6acc3.selstorage.ru",
  "room3": "https://13f0f9c6-66c2-4c35-b122-3ce2da99189a.selstorage.ru",
  "room4": "https://692dac40-bdb6-4640-ac04-0ee96b052615.selstorage.ru",
};

const s3 = new S3Client({
  region: "ru-7",
  endpoint: "https://s3.ru-7.storage.selcloud.ru",
  credentials: {
    accessKeyId: "ccfeb9f847834dec8e72b1d7872c0757",
    secretAccessKey: "660c90ad53174207bcfeb69ff5aa4a34",
  },
  forcePathStyle: true,
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bucket = searchParams.get("bucket");
    if (!bucket) {
      return NextResponse.json({ error: "Bucket is required" }, { status: 400 });
    }
    // Получаем публичный URL для этого бакета
    const publicUrl = bucketPublicUrls[bucket];
    if (!publicUrl) {
      return NextResponse.json({ error: "Unknown bucket" }, { status: 400 });
    }

    const command = new ListObjectsV2Command({ Bucket: bucket });
    const data = await s3.send(command);

    const files = (data.Contents || []).filter(
      (file) =>
        file.Key &&
        (
          file.Key.endsWith(".jpg") ||
          file.Key.endsWith(".jpeg") ||
          file.Key.endsWith(".png") ||
          file.Key.endsWith(".gif") ||
          file.Key.endsWith(".svg") ||
          file.Key.endsWith(".webp")
        )
    ).map((file) => ({
      id: file.ETag || file.Key || "",
      name: file.Key ? file.Key.split(".")[0] : "",
      url: `${publicUrl}/${file.Key}`,
      category: bucket,
    }));

    return NextResponse.json({ files });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}