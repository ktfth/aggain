export function generateAuthModel(options) {
    const { userFields = [] } = options;
    const additionalFields = userFields
        .map(field => `  ${field.name}: {
    type: ${field.type},
    required: ${field.required ?? false}
  }`)
        .join(',\n');
    return `import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },${additionalFields ? '\n' + additionalFields : ''}
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

export const UserModel = mongoose.model('User', userSchema);`;
}
export function generateAuthService(options) {
    const { authType } = options;
    if (authType === 'jwt') {
        return `import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export class AuthService {
  static async createToken(userId: string): Promise<string> {
    return jwt.sign({ id: userId }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });
  }

  static async verifyToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  static async authenticate(email: string, password: string): Promise<{ user: any; token: string }> {
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Senha incorreta');
    }

    const token = await this.createToken(user._id);
    user.password = undefined;

    return { user, token };
  }
}`;
    }
    return `import { UserModel } from '../models/user.model.js';

export class AuthService {
  static async authenticate(email: string, password: string): Promise<any> {
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Senha incorreta');
    }

    user.password = undefined;
    return user;
  }
}`;
}
export function generateAuthController(options, framework) {
    const { authType } = options;
    if (framework === 'express') {
        return `import { Request, Response } from 'express';
import { UserModel } from '../models/user.model.js';
import { AuthService } from '../services/auth.service.js';
import { logger } from '../utils/logger.js';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, ...rest } = req.body;
      
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      const user = await UserModel.create({ email, password, ...rest });
      user.password = undefined;

      ${authType === 'jwt' ? `
      const token = await AuthService.createToken(user._id);
      res.status(201).json({ user, token });` : `
      req.session.userId = user._id;
      res.status(201).json({ user });`}
    } catch (error) {
      logger.error('Erro no registro:', error);
      res.status(500).json({ error: 'Erro no registro' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      ${authType === 'jwt' ? `
      const { user, token } = await AuthService.authenticate(email, password);
      res.json({ user, token });` : `
      const user = await AuthService.authenticate(email, password);
      req.session.userId = user._id;
      res.json({ user });`}
    } catch (error) {
      logger.error('Erro no login:', error);
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  }

  ${authType === 'jwt' ? '' : `
  static async logout(req: Request, res: Response) {
    try {
      req.session.destroy((err) => {
        if (err) {
          logger.error('Erro no logout:', err);
          return res.status(500).json({ error: 'Erro no logout' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logout realizado com sucesso' });
      });
    } catch (error) {
      logger.error('Erro no logout:', error);
      res.status(500).json({ error: 'Erro no logout' });
    }
  }`}

  static async me(req: Request, res: Response) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      res.json({ user });
    } catch (error) {
      logger.error('Erro ao buscar usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  }
}`;
    }
    // Koa Controller
    return `import { Context } from 'koa';
import { UserModel } from '../models/user.model.js';
import { AuthService } from '../services/auth.service.js';
import { logger } from '../utils/logger.js';

export class AuthController {
  static async register(ctx: Context) {
    try {
      const { email, password, ...rest } = ctx.request.body;
      
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        ctx.throw(400, 'Email já cadastrado');
      }

      const user = await UserModel.create({ email, password, ...rest });
      user.password = undefined;

      ${authType === 'jwt' ? `
      const token = await AuthService.createToken(user._id);
      ctx.status = 201;
      ctx.body = { user, token };` : `
      ctx.session.userId = user._id;
      ctx.status = 201;
      ctx.body = { user };`}
    } catch (error) {
      logger.error('Erro no registro:', error);
      ctx.throw(500, 'Erro no registro');
    }
  }

  static async login(ctx: Context) {
    try {
      const { email, password } = ctx.request.body;
      ${authType === 'jwt' ? `
      const { user, token } = await AuthService.authenticate(email, password);
      ctx.body = { user, token };` : `
      const user = await AuthService.authenticate(email, password);
      ctx.session.userId = user._id;
      ctx.body = { user };`}
    } catch (error) {
      logger.error('Erro no login:', error);
      ctx.throw(401, 'Credenciais inválidas');
    }
  }

  ${authType === 'jwt' ? '' : `
  static async logout(ctx: Context) {
    try {
      ctx.session = null;
      ctx.body = { message: 'Logout realizado com sucesso' };
    } catch (error) {
      logger.error('Erro no logout:', error);
      ctx.throw(500, 'Erro no logout');
    }
  }`}

  static async me(ctx: Context) {
    try {
      const user = await UserModel.findById(ctx.state.user.id);
      if (!user) {
        ctx.throw(404, 'Usuário não encontrado');
      }
      ctx.body = { user };
    } catch (error) {
      logger.error('Erro ao buscar usuário:', error);
      ctx.throw(500, 'Erro ao buscar usuário');
    }
  }
}`;
}
export function generateAuthMiddleware(options, framework) {
    const { authType } = options;
    if (framework === 'express') {
        if (authType === 'jwt') {
            return `import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const [, token] = authHeader.split(' ');
    const decoded = await AuthService.verifyToken(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}`;
        }
        return `import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    req.user = { id: req.session.userId };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
}`;
    }
    // Koa Middleware
    if (authType === 'jwt') {
        return `import { Context, Next } from 'koa';
import { AuthService } from '../services/auth.service.js';

export async function authenticate(ctx: Context, next: Next) {
  try {
    const authHeader = ctx.headers.authorization;
    if (!authHeader) {
      ctx.throw(401, 'Token não fornecido');
    }

    const [, token] = authHeader.split(' ');
    const decoded = await AuthService.verifyToken(token);
    
    ctx.state.user = decoded;
    await next();
  } catch (error) {
    ctx.throw(401, 'Token inválido');
  }
}`;
    }
    return `import { Context, Next } from 'koa';

export async function authenticate(ctx: Context, next: Next) {
  try {
    if (!ctx.session || !ctx.session.userId) {
      ctx.throw(401, 'Não autorizado');
    }

    ctx.state.user = { id: ctx.session.userId };
    await next();
  } catch (error) {
    ctx.throw(401, 'Não autorizado');
  }
}`;
}
export function generateAuthRoutes(options, framework) {
    const { authType } = options;
    if (framework === 'express') {
        return `import express from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
${authType === 'jwt' ? '' : "router.post('/logout', authenticate, AuthController.logout);"}
router.get('/me', authenticate, AuthController.me);

export default router;`;
    }
    return `import Router from '@koa/router';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = new Router({
  prefix: '/auth'
});

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
${authType === 'jwt' ? '' : "router.post('/logout', authenticate, AuthController.logout);"}
router.get('/me', authenticate, AuthController.me);

export default router;`;
}
//# sourceMappingURL=auth.js.map