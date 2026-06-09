jest.mock('../../lib/sequelize', () => ({ __esModule: true, default: { authenticate: jest.fn() } }));
jest.mock('../../models/UserModel', () => ({ UserModel: {} }));
jest.mock('../../models/ServiceModel', () => ({ ServiceModel: {} }));
jest.mock('../../models/VehicleModel', () => ({ VehicleModel: {} }));
jest.mock('../../models/AppointmentModel', () => ({ AppointmentModel: {} }));

const mockListar = jest.fn();
const mockListarAdmin = jest.fn();
const mockCriar = jest.fn();
const mockExcluir = jest.fn();

jest.mock('../../services/ServicoService', () => ({
  ServicoService: jest.fn().mockImplementation(() => ({
    listar: mockListar,
    listarAdmin: mockListarAdmin,
    criar: mockCriar,
    excluir: mockExcluir,
  })),
}));

import request from 'supertest';
import app from '../../app';
import jwt from 'jsonwebtoken';

const token = (perfil: 'admin' | 'cliente') =>
  jwt.sign({ usuarioId: 'u1', perfil }, process.env.JWT_SECRET || 'test-secret');

const fakeList = { dados: [], total: 0, pagina: 1, totalPaginas: 0 };

describe('Rotas /api/services', () => {
  it('200 — GET / público sem token', async () => {
    mockListar.mockResolvedValue(fakeList);
    const res = await request(app).get('/api/services');
    expect(res.status).toBe(200);
  });

  it('401 — GET /admin/todos sem token', async () => {
    const res = await request(app).get('/api/services/admin/todos');
    expect(res.status).toBe(401);
  });

  it('403 — GET /admin/todos com token de cliente', async () => {
    const res = await request(app).get('/api/services/admin/todos').set('Authorization', `Bearer ${token('cliente')}`);
    expect(res.status).toBe(403);
  });

  it('200 — GET /admin/todos com token de admin', async () => {
    mockListarAdmin.mockResolvedValue(fakeList);
    const res = await request(app).get('/api/services/admin/todos').set('Authorization', `Bearer ${token('admin')}`);
    expect(res.status).toBe(200);
  });

  it('400 — POST / campos ausentes', async () => {
    const res = await request(app).post('/api/services')
      .set('Authorization', `Bearer ${token('admin')}`).send({ nome: 'X' });
    expect(res.status).toBe(400);
  });

  it('201 — POST / criar serviço', async () => {
    mockCriar.mockResolvedValue({ id: 's1', nome: 'Lavagem', tiposVeiculo: ['carro'] });
    const res = await request(app).post('/api/services')
      .set('Authorization', `Bearer ${token('admin')}`)
      .send({ nome: 'Lavagem', descricao: 'Básica', preco: 50, duracao: 30, tiposVeiculo: ['carro'] });
    expect(res.status).toBe(201);
  });

  it('401 — DELETE / sem token', async () => {
    const res = await request(app).delete('/api/services/s1');
    expect(res.status).toBe(401);
  });

  it('204 — DELETE / admin exclui serviço', async () => {
    mockExcluir.mockResolvedValue(undefined);
    const res = await request(app).delete('/api/services/s1').set('Authorization', `Bearer ${token('admin')}`);
    expect(res.status).toBe(204);
  });
});
