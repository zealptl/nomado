import { Response, NextFunction } from 'express';
import { createUserClient } from '../lib/supabase';
import { getAuthToken } from '../lib/helpers';
import { AuthenticatedRequest } from '../types';

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const token = getAuthToken(req);
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const { data: { user } } = await createUserClient(token).auth.getUser();
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  req.user = user;
  next();
}
