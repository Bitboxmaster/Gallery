import { NextRequest, NextResponse } from "next/server";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

// Креды хардкодим для теста (как в вашем питоне)
const s3 = new S3Client({
  region: "ru-7",
  endpoint: "https://s3.ru-7.storage.selcloud.ru",
  credentials: {
    accessKeyId: "ccfeb9f847834dec8e72b1d7872c0757",
    secretAccessKey: "660c90ad53174207bcfeb69ff5aa4a34",
  },
  forcePathStyle: true,
});

export async function GET(_req: NextRequest) {
  try {
    const command = new ListBucketsCommand({});
    const response = await s3.send(command);
    return NextResponse.json({ buckets: response.Buckets || [] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}