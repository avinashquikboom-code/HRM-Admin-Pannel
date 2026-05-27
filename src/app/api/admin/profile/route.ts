import { NextResponse } from 'next/server';

// Mock data store (in a real app this would be a DB or service)
let mockProfile = {
  fullName: 'Avinash Magar',
  phone: '+91 00000 00000',
  email: 'admin@hrm.ai',
  bio: 'Admin of HRM platform',
  avatarUrl: '/default-avatar.png',
  timezoneLabel: 'Asia/Kolkata (IST)',
};

/**
 * GET /api/admin/profile
 * Returns the current admin profile and user info.
 */
export async function GET() {
  const response = {
    profile: mockProfile,
    user: { id: 'admin-1', role: 'ADMIN' },
  };
  return NextResponse.json(response);
}

/**
 * PUT /api/admin/profile
 * Update basic profile fields.
 * Expected body: { fullName, phone, bio?, email? }
 */
export async function PUT(request: Request) {
  try {
    const payload = (await request.json()) as {
      fullName: string;
      phone: string;
      bio?: string;
      email?: string;
    };
    // Merge updates into mockProfile
    mockProfile = { ...mockProfile, ...payload };
    const response = {
      message: 'Profile updated successfully',
      profile: mockProfile,
    };
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
