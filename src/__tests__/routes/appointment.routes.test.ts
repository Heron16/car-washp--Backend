jest.mock('../../lib/sequelize', () => ({ __esModule: true, default: { authenticate: jest.fn() } }));
jest.mock('../../models/UserModel', () => ({ UserModel: {} }));
jest.mock('../../models/ServiceModel', () => ({ ServiceModel: {} }));
jest.mock('../../models/VehicleModel', () => ({ VehicleModel: {} }));
jest.mock('../../models/AppointmentModel', () => ({ AppointmentModel: {} }));

const mockCriar = jest.fn();
const mockListarPorUsuario = jest.fn();
const mockListarTodos = jest.fn();
const mockAtualizarStatus = jest.fn();
const mockExcluir = jest.fn();

jest.mock('../../services/AgendamentoService', () => ({
  AgendamentoService: jest.fn().mockImplementation(() => ({
    criar: mockCriar,
    listarPorUsuario: mockListarPorUsuario,
    listarTodos: mockListarTodos,
    atualizarStatus: mockAtualizarStatus,
    excluir: mockExcluir,
  })),
}));

import request from 'supertest';
import app from '../../app';
import jwt from 'jsonwebtoken';

const token = (perfil: 'admin' | 'cliente') =>
  jwt.sign({ usuarioId: 'u1', perfil }, process.env.JWT_SECRET || 'test-secret');

const fakeList = { dados: [], total: 0, pagina: 1, totalPaginas: 0 };

describe('Rotas /api/appointments', () => {
  it('401 — GET /meus sem token', async () => {
    const res = await request(app).get('/api/appointments/meus');
    expect(res.status).toBe(401);
  });

  it('200 — GET /meus com token', async () => {
    mockListarPorUsuario.mockResolvedValue(fakeList);
    const res = await request(app).get('/api/appointments/meus').set('Authorization', `Bearer ${token('cliente')}`);
    expect(res.status).toBe(200);
  });

  it('403 — GET / cliente não pode listar todos', async () => {
    const res = await request(app).get('/api/appointments').set('Authorization', `Bearer ${token('cliente')}`);
    expect(res.status).toBe(403);
  });

  it('200 — GET / admin lista todos', async () => {
    mockListarTodos.mockResolvedValue(fakeList);
    const res = await request(app).get('/api/appointments').set('Authorization', `Bearer ${token('admin')}`);
    expect(res.status).toBe(200);
  });

  it('400 — POST / campos ausentes', async () => {
    const res = await request(app).post('/api/appointments')
      .set('Authorization', `Bearer ${token('cliente')}`).send({ veiculoId: 'v1' });
    expect(res.status).toBe(400);
  });

  it('400 — POST / conflito de horário', async () => {
    mockCriar.mockRejectedValue(new Error('Já existe um agendamento neste horário. Escolha outro horário.'));
    const res = await request(app).post('/api/appointments')
      .set('Authorization', `Bearer ${token('cliente')}`)
      .send({ veiculoId: 'v1', servicoId: 's1', agendadoPara: '2026-05-11T10:00:00' });
    expect(res.status).toBe(400);
    expect(res.body.mensagem).toContain('Já existe um agendamento');
  });

  it('201 — POST / criar agendamento', async () => {
    mockCriar.mockResolvedValue({ id: 'a1', status: 'pendente', precoTotal: 80 });
    const res = await request(app).post('/api/appointments')
      .set('Authorization', `Bearer ${token('cliente')}`)
      .send({ veiculoId: 'v1', servicoId: 's1', agendadoPara: '2026-06-09T10:00:00' });
    expect(res.status).toBe(201);
  });

  it('400 — PATCH /status sem status no body', async () => {
    const res = await request(app).patch('/api/appointments/a1/status')
      .set('Authorization', `Bearer ${token('cliente')}`).send({});
    expect(res.status).toBe(400);
  });

  it('200 — PATCH /status atualizar para cancelado', async () => {
    mockAtualizarStatus.mockResolvedValue({ id: 'a1', status: 'cancelado' });
    const res = await request(app).patch('/api/appointments/a1/status')
      .set('Authorization', `Bearer ${token('cliente')}`).send({ status: 'cancelado' });
    expect(res.status).toBe(200);
  });

  it('401 — DELETE / sem token', async () => {
    const res = await request(app).delete('/api/appointments/a1');
    expect(res.status).toBe(401);
  });

  it('204 — DELETE / excluir agendamento', async () => {
    mockExcluir.mockResolvedValue(undefined);
    const res = await request(app).delete('/api/appointments/a1').set('Authorization', `Bearer ${token('cliente')}`);
    expect(res.status).toBe(204);
  });
});
