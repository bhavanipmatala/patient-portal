import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool } from '../config/database';
import { AuthRequest, Patient } from '../types';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
      return;
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('email', email.toLowerCase())
      .query(`
        SELECT PatientId, FirstName, LastName, Email, PasswordHash, 
               DateOfBirth, PhoneNumber, Address, ProfileImage, 
               CreatedAt, UpdatedAt, IsActive
        FROM PQE_Patients 
        WHERE LOWER(Email) = @email AND IsActive = 1
      `);

    if (result.recordset.length === 0) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
      return;
    }

    const patient = result.recordset[0] as Patient;
    
    // For demo purposes, accept 'password123' as the password
    // In production, use proper bcrypt comparison
    const isValidPassword = password === 'password123' || 
      await bcrypt.compare(password, patient.PasswordHash || '');

    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'default_secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    const token = jwt.sign(
      { patientId: patient.PatientId, email: patient.Email },
      jwtSecret,
      { expiresIn: expiresIn as any }
    );

    // Remove password hash from response
    const { PasswordHash, ...patientData } = patient;

    res.json({
      success: true,
      data: {
        token,
        patient: patientData,
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.',
    });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.patient) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    res.json({
      success: true,
      data: req.patient,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile',
    });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, dateOfBirth, phoneNumber, address } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({
        success: false,
        error: 'First name, last name, email, and password are required',
      });
      return;
    }

    const pool = await getPool();
    
    // Check if email already exists
    const existingUser = await pool
      .request()
      .input('email', email.toLowerCase())
      .query('SELECT PatientId FROM PQE_Patients WHERE LOWER(Email) = @email');

    if (existingUser.recordset.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Email already registered',
      });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new patient
    const result = await pool
      .request()
      .input('firstName', firstName)
      .input('lastName', lastName)
      .input('email', email.toLowerCase())
      .input('passwordHash', passwordHash)
      .input('dateOfBirth', dateOfBirth || null)
      .input('phoneNumber', phoneNumber || null)
      .input('address', address || null)
      .query(`
        INSERT INTO PQE_Patients (FirstName, LastName, Email, PasswordHash, DateOfBirth, PhoneNumber, Address)
        OUTPUT INSERTED.PatientId, INSERTED.FirstName, INSERTED.LastName, INSERTED.Email, 
               INSERTED.DateOfBirth, INSERTED.PhoneNumber, INSERTED.Address, 
               INSERTED.CreatedAt, INSERTED.UpdatedAt, INSERTED.IsActive
        VALUES (@firstName, @lastName, @email, @passwordHash, @dateOfBirth, @phoneNumber, @address)
      `);

    const newPatient = result.recordset[0];

    const jwtSecret = process.env.JWT_SECRET || 'default_secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    const token = jwt.sign(
      { patientId: newPatient.PatientId, email: newPatient.Email },
      jwtSecret,
      { expiresIn: expiresIn as any }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        patient: newPatient,
      },
      message: 'Registration successful',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.',
    });
  }
};
