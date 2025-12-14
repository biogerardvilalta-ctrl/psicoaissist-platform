const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3005;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());

// Test endpoint
app.get('/api/v1/payments/test', (req, res) => {
  console.log('✅ Test endpoint called');
  res.json({ 
    message: 'Payments controller working!', 
    timestamp: new Date().toISOString(),
    port: port 
  });
});

// Demo checkout endpoint
app.post('/api/v1/payments/create-checkout-session-demo', (req, res) => {
  console.log('📡 Demo checkout session requested:', req.body);
  
  // Mock Stripe response
  const mockSession = {
    sessionId: 'cs_test_' + Math.random().toString(36).substr(2, 9),
    url: 'https://checkout.stripe.com/pay/mock-session-' + Math.random().toString(36).substr(2, 5),
    status: 'open'
  };
  
  console.log('✅ Returning mock session:', mockSession);
  res.json(mockSession);
});

// Plans endpoint
app.get('/api/v1/payments/plans', (req, res) => {
  console.log('📋 Plans endpoint called');
  
  const mockPlans = [
    {
      type: 'basic',
      name: 'Basic',
      amount: 2900, // €29.00 en centavos
      currency: 'eur',
      interval: 'month',
      features: ['Hasta 25 clientes', 'Transcripción básica', 'Informes estándar'],
      priceId: 'price_basic_demo'
    },
    {
      type: 'pro', 
      name: 'Pro',
      amount: 5900, // €59.00 en centavos
      currency: 'eur',
      interval: 'month',
      features: ['Clientes ilimitados', 'IA asistente', 'Transcripción en tiempo real'],
      priceId: 'price_pro_demo'
    },
    {
      type: 'premium',
      name: 'Premium',
      amount: 9900, // €99.00 en centavos  
      currency: 'eur',
      interval: 'month',
      features: ['Todo incluido', 'Soporte prioritario', 'Analytics avanzados'],
      priceId: 'price_premium_demo'
    }
  ];
  
  res.json(mockPlans);
});

// Admin Stats endpoint
app.get('/api/v1/admin/stats', (req, res) => {
  console.log('📊 Admin stats endpoint called');
  
  const mockStats = {
    totalUsers: 156,
    activeUsers: 142,
    inactiveUsers: 14,
    totalRevenue: 15400,
    activeSubscriptions: 89,
    pendingIssues: 3,
    newUsersThisMonth: 23,
    revenueThisMonth: 2800
  };
  
  console.log('✅ Returning admin stats:', mockStats);
  res.json(mockStats);
});

// Admin Users endpoint
app.get('/api/v1/admin/users', (req, res) => {
  console.log('👥 Admin users endpoint called with query:', req.query);
  
  const { search, status, role, page = 1, limit = 10 } = req.query;
  
  let mockUsers = [
    {
      id: '1',
      email: 'dr.martinez@example.com',
      firstName: 'Ana',
      lastName: 'Martínez',
      role: 'PSYCHOLOGIST',
      status: 'ACTIVE',
      subscription: { planType: 'PRO', status: 'active', currentPeriodEnd: '2025-01-15' },
      lastLogin: '2025-12-13T10:30:00Z',
      createdAt: '2025-11-01T09:00:00Z',
      updatedAt: '2025-12-13T10:30:00Z'
    },
    {
      id: '2',
      email: 'dr.garcia@example.com',
      firstName: 'Carlos',
      lastName: 'García',
      role: 'PSYCHOLOGIST',
      status: 'ACTIVE',
      subscription: { planType: 'BASIC', status: 'active', currentPeriodEnd: '2025-01-20' },
      lastLogin: '2025-12-12T16:45:00Z',
      createdAt: '2025-10-15T14:20:00Z',
      updatedAt: '2025-12-12T16:45:00Z'
    },
    {
      id: '3',
      email: 'inactive@example.com',
      firstName: 'Luis',
      lastName: 'Rodríguez',
      role: 'PSYCHOLOGIST',
      status: 'INACTIVE',
      subscription: { planType: 'BASIC', status: 'cancelled' },
      lastLogin: '2025-11-20T08:15:00Z',
      createdAt: '2025-09-10T11:30:00Z',
      updatedAt: '2025-11-20T08:15:00Z'
    },
    {
      id: '4',
      email: 'admin@psycoai.com',
      firstName: 'Admin',
      lastName: 'PsycoAI',
      role: 'ADMIN',
      status: 'ACTIVE',
      subscription: { planType: 'PREMIUM', status: 'active' },
      lastLogin: '2025-12-13T12:00:00Z',
      createdAt: '2025-08-01T10:00:00Z',
      updatedAt: '2025-12-13T12:00:00Z'
    },
    {
      id: '5',
      email: 'dr.lopez@example.com',
      firstName: 'María',
      lastName: 'López',
      role: 'PSYCHOLOGIST',
      status: 'SUSPENDED',
      subscription: { planType: 'PRO', status: 'suspended' },
      lastLogin: '2025-12-01T14:20:00Z',
      createdAt: '2025-08-15T11:10:00Z',
      updatedAt: '2025-12-01T14:20:00Z'
    }
  ];
  
  // Apply filters
  if (search) {
    const searchLower = search.toLowerCase();
    mockUsers = mockUsers.filter(user =>
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  }
  
  if (status && status !== 'ALL') {
    mockUsers = mockUsers.filter(user => user.status === status);
  }
  
  if (role && role !== 'ALL') {
    mockUsers = mockUsers.filter(user => user.role === role);
  }
  
  const response = {
    users: mockUsers,
    total: mockUsers.length,
    page: parseInt(page),
    totalPages: Math.ceil(mockUsers.length / parseInt(limit)),
    hasNext: false,
    hasPrev: false
  };
  
  console.log('✅ Returning users:', response);
  res.json(response);
});

// Update User endpoint
app.put('/api/v1/admin/users/:id', (req, res) => {
  console.log('📝 Update user endpoint called:', req.params.id, req.body);
  
  const updatedUser = {
    id: req.params.id,
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  console.log('✅ User updated:', updatedUser);
  res.json(updatedUser);
});

// Delete User endpoint
app.delete('/api/v1/admin/users/:id', (req, res) => {
  console.log('🗑️ Delete user endpoint called:', req.params.id);
  
  console.log('✅ User deleted successfully');
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`🚀 Mock Backend running on http://localhost:${port}`);
  console.log(`📚 Test endpoint: http://localhost:${port}/api/v1/payments/test`);
  console.log(`💳 Demo checkout: http://localhost:${port}/api/v1/payments/create-checkout-session-demo`);
  console.log(`📋 Plans: http://localhost:${port}/api/v1/payments/plans`);
  console.log(`📊 Admin stats: http://localhost:${port}/api/v1/admin/stats`);
  console.log(`👥 Admin users: http://localhost:${port}/api/v1/admin/users`);
});