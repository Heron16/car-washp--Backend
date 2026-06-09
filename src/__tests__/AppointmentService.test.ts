import { AgendamentoService } from '../services/AgendamentoService';

const mockDestroy = jest.fn();
const mockAptUpdate = jest.fn();

jest.mock('../models/ServiceModel', () => ({
  ServiceModel: { findByPk: jest.fn() },
}));
jest.mock('../models/AppointmentModel', () => ({
  AppointmentModel: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
  },
}));
jest.mock('../models/VehicleModel', () => ({ VehicleModel: {} }));
jest.mock('../models/UserModel', () => ({ UserModel: {} }));

import { ServiceModel } from '../models/ServiceModel';
import { AppointmentModel } from '../models/AppointmentModel';

const mockServiceFindByPk = ServiceModel.findByPk as jest.Mock;
const mockAptFindAll = AppointmentModel.findAll as jest.Mock;
const mockAptFindOne = AppointmentModel.findOne as jest.Mock;
const mockAptCreate = AppointmentModel.create as jest.Mock;

const fakeServico = { id: 'svc-1', preco: 80, duracao: 60 };

// Segunda-feira às 10h — dentro do horário de funcionamento
const agendadoPara = new Date('2026-04-06T10:00:00');

describe('AgendamentoService', () => {
  const service = new AgendamentoService();

  describe('criar', () => {
    it('deve lançar erro se serviço não encontrado', async () => {
      mockServiceFindByPk.mockResolvedValue(null);
      await expect(service.criar({ usuarioId: 'user-1', veiculoId: 'veh-1', servicoId: 'svc-x', agendadoPara })).rejects.toThrow('Serviço não encontrado');
    });

    it('deve lançar erro se houver conflito de horário', async () => {
      mockServiceFindByPk.mockResolvedValue(fakeServico);
      mockAptFindAll.mockResolvedValue([
        { agendadoPara: new Date('2026-04-06T09:30:00'), servico: { duracao: 60 } },
      ]);
      await expect(service.criar({ usuarioId: 'user-1', veiculoId: 'veh-1', servicoId: 'svc-1', agendadoPara })).rejects.toThrow('Já existe um agendamento neste horário');
    });

    it('deve criar agendamento sem conflito', async () => {
      mockServiceFindByPk.mockResolvedValue(fakeServico);
      mockAptFindAll.mockResolvedValue([]);
      mockAptCreate.mockResolvedValue({ id: 'apt-1', status: 'pendente', precoTotal: 80 });
      const result = await service.criar({ usuarioId: 'user-1', veiculoId: 'veh-1', servicoId: 'svc-1', agendadoPara });
      expect(result.id).toBe('apt-1');
    });

    it('deve lançar erro para domingo', async () => {
      mockServiceFindByPk.mockResolvedValue(fakeServico);
      const domingo = new Date('2026-04-05T10:00:00');
      await expect(service.criar({ usuarioId: 'user-1', veiculoId: 'veh-1', servicoId: 'svc-1', agendadoPara: domingo })).rejects.toThrow('Não atendemos aos domingos');
    });

    it('deve lançar erro para horário fora do expediente', async () => {
      mockServiceFindByPk.mockResolvedValue(fakeServico);
      const foraDoPeriodo = new Date('2026-04-06T12:30:00');
      await expect(service.criar({ usuarioId: 'user-1', veiculoId: 'veh-1', servicoId: 'svc-1', agendadoPara: foraDoPeriodo })).rejects.toThrow('Atendemos de segunda a sexta');
    });
  });

  describe('atualizarStatus', () => {
    it('deve lançar erro se agendamento não encontrado', async () => {
      mockAptFindOne.mockResolvedValue(null);
      await expect(service.atualizarStatus('apt-1', 'cancelado', false, 'user-1')).rejects.toThrow('Agendamento não encontrado ou sem permissão');
    });

    it('deve atualizar status com sucesso', async () => {
      mockAptUpdate.mockResolvedValue(undefined);
      mockAptFindOne.mockResolvedValue({ id: 'apt-1', status: 'pendente', update: mockAptUpdate });
      const result = await service.atualizarStatus('apt-1', 'cancelado', false, 'user-1');
      expect(result).toBeTruthy();
    });
  });

  describe('excluir', () => {
    it('deve lançar erro se agendamento não encontrado', async () => {
      mockAptFindOne.mockResolvedValue(null);
      await expect(service.excluir('apt-1', 'user-1', false)).rejects.toThrow('Agendamento não encontrado ou sem permissão');
    });

    it('admin pode excluir qualquer agendamento', async () => {
      mockAptFindOne.mockResolvedValue({ id: 'apt-1', destroy: mockDestroy });
      mockDestroy.mockResolvedValue(undefined);
      await expect(service.excluir('apt-1', 'qualquer', true)).resolves.not.toThrow();
    });
  });
});
