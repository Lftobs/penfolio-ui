import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /create, /note/123)
  const { pathname } = request.nextUrl

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/auth/signin',
    '/auth/signup',
    '/api/auth/signin',
    '/api/auth/signup'
  ]

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check for user authentication token in cookies
  const userCookie = cookies().get('user')
  const accessTokenCookie = cookies().get('accessToken')
  console.log('User Cookie:', userCookie)
  console.log('Access Token Cookie:', accessTokenCookie)
  
  // If no user cookie is found, redirect to signin
  if (accessTokenCookie?.value === undefined) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/signin'
    return NextResponse.redirect(url)
  }

  // Try to parse the user data from cookie
  // try {
  //   const userData = JSON.parse(userCookie?.value)
    
  //   // Check if user data has required fields
  //   if (!userData.id || !userData.email) {
  //     const url = request.nextUrl.clone()
  //     url.pathname = '/auth/signin'
  //     return NextResponse.redirect(url)
  //   }
  // } catch (error) {
  //   // If cookie is malformed, redirect to signin
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/auth/signin'
  //   return NextResponse.redirect(url)
  // }

  // If authenticated, allow access
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}