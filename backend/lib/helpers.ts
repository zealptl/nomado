export function getAuthToken(req: any): string | null {
  const auth = req.headers['authorization'];
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7);
}
