import { NextResponse } from 'next/server';

export function ok(message: string, data: any = null, status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function fail(message: string, status = 500, data: any = null) {
  return NextResponse.json(
    {
      success: false,
      message,
      data,
    },
    { status }
  );
}