import { Response } from 'express';
import { VehicleService } from '../services/VehicleService';
import { AuthRequest } from '../middlewares/auth';
import { VehicleType } from '../types';

const vehicleService = new VehicleService();

export class VehicleController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { brand, model, year, plate, color, type } = req.body;
      if (!brand || !model || !year || !plate || !color || !type) {
        res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        return;
      }
      const vehicle = await vehicleService.create(req.user!.userId, brand, model, Number(year), plate, color, type as VehicleType);
      res.status(201).json(vehicle);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar veículo';
      res.status(400).json({ message });
    }
  }

  async findMine(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await vehicleService.findByUser(req.user!.userId, { page: Number(req.query.page), limit: Number(req.query.limit) });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar veículos' });
    }
  }

  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await vehicleService.findAll({ page: Number(req.query.page), limit: Number(req.query.limit) });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar veículos' });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const vehicle = await vehicleService.update(req.params.id, req.user!.userId, req.body);
      res.status(200).json(vehicle);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar';
      res.status(400).json({ message });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const isAdmin = req.user!.role === 'admin';
      await vehicleService.delete(req.params.id, req.user!.userId, isAdmin);
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar';
      res.status(404).json({ message });
    }
  }
}
