import { http, HttpResponse } from 'msw'

let coupons = [
  {
    id: 1,
    code: 'WELCOME2024',
    description: 'Welcome discount for new customers',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    createdBy: 1,
    createdAt: '2024-03-20T10:00:00Z',
    expiryDate: '2024-12-31T23:59:59Z',
    allowMultipleDiscounts: false,
    maxUsageCount: 100,
    currentUsageCount: 0,
    isActive: true
  }
];

export const couponHandlers = [
  // Get all coupons
  http.get('/api/coupons', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return HttpResponse.json(coupons);
  }),

  // Get single coupon
  http.get('/api/coupons/:id', ({ params }) => {
    const coupon = coupons.find(c => c.id === parseInt(params.id));
    if (!coupon) {
      return HttpResponse.json({ message: 'Coupon not found' }, { status: 404 });
    }
    return HttpResponse.json(coupon);
  }),

  // Create coupon
  http.post('/api/coupons', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const newCoupon = {
      id: coupons.length + 1,
      ...data,
      createdAt: new Date().toISOString(),
      currentUsageCount: 0,
      isActive: true
    };

    coupons.push(newCoupon);
    return HttpResponse.json(newCoupon, { status: 201 });
  }),

  // Update coupon
  http.put('/api/coupons/:id', async ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const index = coupons.findIndex(c => c.id === parseInt(params.id));
    
    if (index === -1) {
      return HttpResponse.json({ message: 'Coupon not found' }, { status: 404 });
    }

    coupons[index] = { ...coupons[index], ...data };
    return HttpResponse.json(coupons[index]);
  }),

  // Delete coupon
  http.delete('/api/coupons/:id', ({ params }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const index = coupons.findIndex(c => c.id === parseInt(params.id));
    if (index === -1) {
      return HttpResponse.json({ message: 'Coupon not found' }, { status: 404 });
    }

    coupons = coupons.filter(c => c.id !== parseInt(params.id));
    return HttpResponse.json({ message: 'Coupon deleted successfully' });
  })
];
