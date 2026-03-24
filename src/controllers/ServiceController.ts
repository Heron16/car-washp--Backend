import { Request, Response } from 'express';
import { ServiceService } from '../services/ServiceService';
import { AuthRequest } from '../middlewares/auth';
import { VehicleType } from '../types';

const serviceService = new ServiceService();

export class ServiceController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, description, price, duration, vehicleTypes } = req.body;
      if (!name || !description || !price || !duration || !vehicleTypes) {
        res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        return;
      }
      const service = await serviceService.create(name, description, Number(price), Number(duration), vehicleTypes as VehicleType[]);
      res.status(201).json(service);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar serviço';
      res.status(400).json({ message });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await serviceService.findAll({ page: Number(req.query.page), limit: Number(req.query.limit) });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar serviços' });
    }
  }

  async findAllAdmin(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await serviceService.findAllAdmin({ page: Number(req.query.page), limit: Number(req.query.limit) });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar serviços' });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const service = await serviceService.update(req.params.id, req.body);
      res.status(200).json(service);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar';
      res.status(400).json({ message });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      await serviceService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar';
      res.status(404).json({ message });
    }
  }
}
