import { Response } from 'express';
import { AppointmentService } from '../services/AppointmentService';
import { AuthRequest } from '../middlewares/auth';
import { ServiceStatus } from '../types';

const appointmentService = new AppointmentService();

export class AppointmentController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { vehicleId, serviceId, scheduledAt, notes } = req.body;
      if (!vehicleId || !serviceId || !scheduledAt) {
        res.status(400).json({ message: 'Veículo, serviço e data são obrigatórios' });
        return;
      }
      const appointment = await appointmentService.create(req.user!.userId, vehicleId, serviceId, new Date(scheduledAt), notes);
      res.status(201).json(appointment);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar agendamento';
      res.status(400).json({ message });
    }
  }

  async findMine(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await appointmentService.findByUser(req.user!.userId, { page: Number(req.query.page), limit: Number(req.query.limit) });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar agendamentos' });
    }
  }

  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await appointmentService.findAll({ page: Number(req.query.page), limit: Number(req.query.limit) });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar agendamentos' });
    }
  }

  async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      if (!status) {
        res.status(400).json({ message: 'Status é obrigatório' });
        return;
      }
      const isAdmin = req.user!.role === 'admin';
      const appointment = await appointmentService.updateStatus(req.params.id, status as ServiceStatus, isAdmin, req.user!.userId);
      res.status(200).json(appointment);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar status';
      res.status(400).json({ message });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const isAdmin = req.user!.role === 'admin';
      await appointmentService.delete(req.params.id, req.user!.userId, isAdmin);
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar';
      res.status(404).json({ message });
    }
  }
}
