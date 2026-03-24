import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { AuthRequest } from '../middlewares/auth';
import { UserUpdateData } from '../types';

const userService = new UserService();

export class UserController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, cpf } = req.body;
      if (!name || !email || !password || !cpf) {
        res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        return;
      }
      const user = await userService.create(name, email, password, cpf);
      res.status(201).json(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao cadastrar';
      res.status(400).json({ message });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, password, cpf, phone } = req.body;
      if (!name) {
        res.status(400).json({ message: 'Nome é obrigatório' });
        return;
      }
      const data: UserUpdateData = { name, password, cpf, phone };
      const user = await userService.update(id, req.user!.userId, data);
      res.status(200).json(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar';
      res.status(400).json({ message });
    }
  }

  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await userService.findAll({ page: Number(req.query.page), limit: Number(req.query.limit) });
      res.status(200).json(result);
    } catch {
      res.status(500).json({ message: 'Erro ao buscar usuários' });
    }
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await userService.findById(req.params.id);
      res.status(200).json(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar usuário';
      res.status(404).json({ message });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      await userService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar';
      res.status(404).json({ message });
    }
  }
}
