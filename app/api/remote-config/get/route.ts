// api/remote-config/get/route.ts
import { NextResponse } from 'next/server';
import { adminRemoteConfig } from '@/lib/firebase-admin';

// GET method to fetch Remote Config template
export async function GET() {
  try {
    const template = await adminRemoteConfig.getTemplate();
    
    return NextResponse.json(template);
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to fetch Remote Config template',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}