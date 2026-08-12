import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/postgres';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { AppError } from '../utils/app-error';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(input: RegisterInput) {
    const { email, password, name, role } = input;

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM "User" WHERE email = $1', [email.toLowerCase()]);

    if (existingUser.rowCount) {
      throw new AppError('Email is already registered', 409);
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Use the role provided by the user, defaulting to SALES.
    const roleToUse = role || 'SALES';

    const newUser = await pool.query(
      'INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4::"Role", NOW(), NOW()) RETURNING id, email, name, role, "createdAt", "updatedAt"',
      [email.toLowerCase(), hashedPassword, name, roleToUse]
    );

    return newUser.rows[0];
  }

  /**
   * Authenticate a user and return a JWT token
   */
  static async login(input: LoginInput) {
    const { email, password, role } = input;

    // Find user by email
    const result = await pool.query(
      'SELECT id, email, password, name, role, "createdAt", "updatedAt" FROM "User" WHERE email = $1',
      [email.toLowerCase()]
    );
    const user = result.rows[0];

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Validate role matches the user's assigned role
    if (role && user.role !== role) {
      throw new AppError(`Your account is registered as ${user.role}. Please select the correct role.`, 403);
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError('Authentication is not configured', 500);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as any }
    );

    // Return user details and token
    const { password: _, ...userWithoutPassword } = user;
    return {
      token,
      user: userWithoutPassword,
    };
  }
}
