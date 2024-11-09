import { http, HttpResponse } from 'msw'

const users = [
  {
    id: 1,
    username: 'admin',
    password: '123456', // In a real app, passwords would be hashed
    role: 'ADMIN'
  }
];

export const authHandlers = [
  // Login handler
  http.post('/api/auth/login', async ({ request }) => {
    const { username, password } = await request.json();
    
    const user = users.find(u => u.username === username);
    
    if (!user || user.password !== password) {
      return HttpResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      id: user.id,
      username: user.username,
      role: user.role,
      token: 'mock_jwt_token'
    });
  }),

  // Create user handler (admin only)
  http.post('/api/auth/users', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { username, password } = await request.json();
    
    if (users.some(u => u.username === username)) {
      return HttpResponse.json(
        { message: 'Username already exists' },
        { status: 400 }
      );
    }

    const newUser = {
      id: users.length + 1,
      username,
      password, // In a real app, this would be hashed
      role: 'ADMIN'
    };

    users.push(newUser);

    return HttpResponse.json({
      id: newUser.id,
      username: newUser.username,
      role: newUser.role
    }, { status: 201 });
  }),

  // Logout handler
  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  // Get current user handler
  http.get('/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      id: 1,
      username: 'admin',
      role: 'ADMIN'
    });
  })
];