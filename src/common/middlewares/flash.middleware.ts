import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class FlashMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Função para adicionar mensagens de forma flexível
    req.addFlash = (type: string, message: any) => {
      if (!req.session) req.session = {};
      if (!req.session.flash) req.session.flash = {};
      if (!req.session.flash[type]) req.session.flash[type] = [];

      if (Array.isArray(message)) {
        for (const item of message) {
          req.session.flash[type].push(item);
        }
      } else {
        req.session.flash[type].push(message);
      }
    };

    // Função para obter mensagens
    req.flash = (type: string) => {
      if (!req.session || !req.session.flash) return [];
      const msgs = req.session.flash[type] || [];
      req.session.flash[type] = [];
      return [...msgs]; // Create a safe copy
    };

    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');

    next();
  }
}
