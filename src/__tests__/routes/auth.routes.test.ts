jest.mock('../../lib/sequelize', () => ({ __esModule: true, default: { authenticate: jest.fn() } }));
jest.mock('../../models/UserModel', () => ({ UserModel: {} }));
jest.mock('../../models/ServiceModel', () => ({ ServiceModel: {} }));
jest.mock('../../models/VehicleModel', () => ({ VehicleModel: {} }));
jest.mock('../../models/AppointmentModel', () => ({ AppointmentModel: {} }));

const mockLogin = jest.fn();
jest.mock('../../services/AuthService', () => ({
  AuthService: jest.fn().mockImplementation(() => ({ login: mockLogin })),
}));

import request from 'supertest';
import app from '../../app';

describe('POST /api/auth/login', () => {
  it('400 — email ou senha ausentes', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: '' });
    expect(res.status).toBe(400);
    expect(res.body.mensagem).toBe('E-mail e senha são obrigatórios');
  });

  it('401 — credenciais inválidas', async () => {
    mockLogin.mockRejectedValue(new Error('E-mail ou senha inválida'));
    const res = await request(app).post('/api/auth/login').send({ email: 'u@t.com', senha: 'errada' });
    expect(res.status).toBe(401);
    expect(res.body.mensagem).toBe('E-mail ou senha inválida');
  });

  it('200 — login bem-sucedido retorna token e usuario', async () => {
    mockLogin.mockResolvedValue({
      token: 'fake-jwt',
      usuario: { id: '1', email: 'admin@test.com', perfil: 'admin' },
    });
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', senha: 'Admin@123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.usuario.perfil).toBe('admin');
  });
});
