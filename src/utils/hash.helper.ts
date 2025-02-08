import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const saltRounds = parseInt(process.env.SALT_ROUNDS as string); // Default to 10 if not provided

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, saltRounds);
}

export async function comparePasswords(plainText: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainText, hashedPassword);
}
