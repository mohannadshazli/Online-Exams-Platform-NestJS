import * as bcrypt from 'bcrypt';

export async function hash(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(plain, salt);
}

export async function compare(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
