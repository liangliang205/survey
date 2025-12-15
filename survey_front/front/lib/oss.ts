import OSS from 'ali-oss';

export function getOSSClient() {
  if (
    !process.env.OSS_REGION ||
    !process.env.OSS_ACCESS_KEY_ID ||
    !process.env.OSS_ACCESS_KEY_SECRET ||
    !process.env.OSS_BUCKET
  ) {
    return null;
  }

  return new OSS({
    region: process.env.OSS_REGION,
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    bucket: process.env.OSS_BUCKET,
    secure: true, // 使用 HTTPS
  });
}
