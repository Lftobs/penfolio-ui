import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, confirmPassword } = await request.json()

    // Validate input
    if (!username || !password || !confirmPassword) {
      return NextResponse.json(
        { message: 'Username, password, and confirm password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { message: 'Please enter a valid email address' },
          { status: 400 }
        )
      }
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: 'Passwords do not match' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' },
        { status: 400 }
      )
    }
    console.log(username, email, password)

    try {
      const apiUrl = `${process.env.BASE_URL}/api/auth/register`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return NextResponse.json(
          { message: errorData.message || 'Signup failed' },
          { status: response.status }
        )
      }

      // Redirect to login page after successful signup
      return NextResponse.redirect(new URL('/signin', request.url))
    } catch (err) {
      return NextResponse.json(
        { 
          message: 'Something went wrong while signing up',
        },
        { status: 400 }
      )
    } 
    
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}