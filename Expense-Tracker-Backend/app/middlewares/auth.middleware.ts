import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ITokenUser } from '../interfaces/user.interface';
import userRepositories from '../modules/user.module/repositories/user.repositories';


declare global {
  namespace Express {
    interface Request {
      user?: ITokenUser;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers["x-access-token"] || req.cookies['x-access-token'] || req.body['x-access-token'] || req.query['x-access-token'];

    if (!token) {
      res.status(401).json({ message: 'No authentication token provided. Please login first.' });
      return;
    }

    const decoded: ITokenUser = jwt.verify(token, process.env.JWT_SECRET!) as ITokenUser;
    const _user = await userRepositories.findOneBy({ email: decoded.email, isActive: true });
    if (!_user) {
      res.status(401).json({ message: 'Invalid authentication token' });
      return
    }
    req.user = { ...decoded };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid authentication token' });
  }
};

export const authorize = (...roles: Array<"admin" | "user">) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.role.role || !roles.includes(req.user.role.role)) {
      let msg: string = 'You do not have permission to perform this action';
      if (roles.length > 1) {
        msg = `only ${roles.slice(0, -1).join(', ')} and ${roles[roles.length - 1]} have access to perform this action`;
      } else {
        msg = `only ${roles[0]} have access to perform this action`;
      }
      res.status(403).json({
        status: 403,
        message: msg
      });
      return;
    }
    next();
  };
};





export const authAdminPanel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers["x-access-token"] || req.cookies['x-access-token'] || req.body['x-access-token'] || req.query['x-access-token'];

    if (!token) {
      req.flash('message', [{ msg: `Please login first!`, type: 'warning' }] as any);
      return res.redirect('/login');
    }

    const decoded: ITokenUser = jwt.verify(token, process.env.JWT_SECRET!) as ITokenUser;
    const _user = await userRepositories.findOneBy({ email: decoded.email, isActive: true });
    if (!_user || _user.role.role !== 'admin') {
      req.flash('message', [{ msg: `Invalid authentication token!`, type: 'danger' }] as any);
      return res.redirect('/login');
    }
    req.user = { ...decoded };
    next();
  } catch (error) {
    req.flash('message', [{ msg: `Invalid authentication!`, type: 'danger' }] as any);
    res.redirect('/login');
  }
};

export const loggedInGuard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers["x-access-token"] || req.cookies['x-access-token'] || req.body['x-access-token'] || req.query['x-access-token'];
    if (token) {
      const decoded: ITokenUser = jwt.verify(token, process.env.JWT_SECRET!) as ITokenUser;
      const _user = await userRepositories.findOneBy({ email: decoded.email, isActive: true });
      if (_user) {
        req.user = { ...decoded };
        req.flash('message', [{ msg: `You are already loggedin!`, type: 'warning' }] as any);
        res.redirect('/');
        return
      }
    }

    next();
  } catch (error) {
    req.flash('message', [{ msg: `Something went wrong!`, type: 'danger' }] as any);
    res.redirect('/');
  }
}