import { NextRequest, NextResponse } from 'next/server'


export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { message: 'username and password are required' },
        { status: 400 }
      )
    }

    try {
      const apiUrl = `${process.env.BASE_URL}/api/auth/login`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
         return NextResponse.json(
          { message: 'Invalid credentials' },
          { status: 400 }
        )
      }

      const data = await response.json();
      const res = NextResponse.json(
        { 
          message: 'Sign in successful',
          data: { user: data.user}
        },
        { status: 200 }
      )

      res.cookies.set('user', JSON.stringify(data.user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      })

      res.cookies.set('accessToken', data.access, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 2, // 2 hours
        path: '/'
      })

      res.cookies.set('refreshToken', data.refresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      })

      return res
    } catch (err) {
     return  NextResponse.json(
        { 
          message: 'Something went wrong while signing in',
        },
        { status: 400 }
      )
    } 
    
  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}