import { readFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';
import { stat } from 'fs';

export async function GET(
  request: Request,
  { params }: { params: { lng: string; ns: string } }
) {
  try {
    // 兼容处理：如果请求的是 zh，映射到 zh-CN
    const lng = params.lng === 'zh' ? 'zh-CN' : params.lng;
    const filePath = join(process.cwd(), 'app/api/locales', lng, `${params.ns}.json`);
    const fileContents = await readFile(filePath, 'utf8');
    const jsonData = JSON.parse(fileContents);
    
    return NextResponse.json(jsonData);
  } catch (error) {
    console.error('Error loading locale file:', error);
    return NextResponse.json({ error: 'Locale not found' }, { status: 404 });
  }
}