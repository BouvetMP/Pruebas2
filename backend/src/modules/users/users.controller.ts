import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/index';
import { usersService } from './users.service.js';
import { updateUserStatusSchema, updateUserRoleSchema } from './users.schemas';

export const usersController = {
  async listAll(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await usersService.listAll()); } catch (error) { next(error); }
  },
  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { estado } = updateUserStatusSchema.parse(req.body);
      res.json(await usersService.updateStatus(Number(req.params.id), estado));
    } catch (error) { next(error); }
  },
  async updateRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { rol } = updateUserRoleSchema.parse(req.body);
      res.json(await usersService.updateRole(Number(req.params.id), rol));
    } catch (error) { next(error); }
  },
};