/**
 * Request Logger Middleware
 */

import { NextRequest, NextResponse } from 'next/server';

export async function requestLoggerMiddleware(request: NextRequest) {
  const start = Date.now();
  const response = NextResponse.next();
  const duration = Date.now() - start;

  console.log({
    method: request.method,
    url: request.url,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
  });

  return response;
}

