import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  console.log('Token:', token);  

  const { pathname } = request.nextUrl;
  console.log('Pathname:', pathname);  

  if (token) {
    if (pathname === "/" || pathname.toLowerCase() === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } else {
    if (pathname.toLowerCase().startsWith("/dashboard") ||
        pathname.toLowerCase().startsWith("/medicine") ||
        pathname.toLowerCase().startsWith("/history") ||
        pathname.toLowerCase().startsWith("/ticket")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/medicine/:path*', '/history/:path*', '/ticket/:path*'],
};