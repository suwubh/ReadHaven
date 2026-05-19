jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/recommendations', () => ({
  recommendSimilarToBook: jest.fn(),
  recommendForQuery: jest.fn(),
  recommendForUser: jest.fn(),
}));

import { GET } from '@/app/api/recommendations/route';
import * as rec from '@/lib/recommendations';
import { mockRequest, setSession } from '../../helpers';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/recommendations', () => {
  it('similar mode when bookId given', async () => {
    (rec.recommendSimilarToBook as jest.Mock).mockResolvedValue([{ id: 'b' }]);
    const res = await GET(mockRequest('http://t/?bookId=b-1'));
    expect(res.status).toBe(200);
    expect((await res.json()).mode).toBe('similar');
  });

  it('query mode when q given', async () => {
    (rec.recommendForQuery as jest.Mock).mockResolvedValue([]);
    const res = await GET(mockRequest('http://t/?q=dragons'));
    expect((await res.json()).mode).toBe('query');
  });

  it('user mode when authenticated and no params', async () => {
    setSession('user-1');
    (rec.recommendForUser as jest.Mock).mockResolvedValue([]);
    const res = await GET(mockRequest('http://t/'));
    expect((await res.json()).mode).toBe('user');
  });

  it('400 when no params and unauthenticated', async () => {
    setSession(null);
    const res = await GET(mockRequest('http://t/'));
    expect(res.status).toBe(400);
  });

  it('honours limit (clamps to max 20)', async () => {
    (rec.recommendForQuery as jest.Mock).mockResolvedValue([]);
    await GET(mockRequest('http://t/?q=hi&limit=9999'));
    const limitArg = (rec.recommendForQuery as jest.Mock).mock.calls[0][1];
    expect(limitArg).toBeLessThanOrEqual(20);
  });
});
