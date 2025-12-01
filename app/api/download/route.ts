import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(request: NextRequest) {
  // For demo, serve a static file from public folder
  const filePath = path.join(process.cwd(), 'public', 'dummy-presentation.txt');
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
  const fileBuffer = fs.readFileSync(filePath);
  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Content-Disposition': 'attachment; filename="dummy-presentation.txt"'
    }
  });
}
