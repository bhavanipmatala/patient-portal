import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getPool } from '../config/database';
import { AuthRequest, JwtPayload, Patient } from '../types';

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token required',
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'default_secret';
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    const pool = await getPool();
    const result = await pool
      .request()
      .input('patientId', decoded.patientId)
      .query(`
        SELECT PatientId, FirstName, LastName, Email, DateOfBirth, 
               PhoneNumber, Address, ProfileImage, CreatedAt, UpdatedAt, IsActive
        FROM PQE_Patients 
        WHERE PatientId = @patientId AND IsActive = 1
      `);

    if (result.recordset.length === 0) {
      res.status(401).json({
        success: false,
        error: 'Patient not found or inactive',
      });
      return;
    }

    req.patient = result.recordset[0] as Patient;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({
        success: false,
        error: 'Invalid or expired token',
      });
      return;
    }
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};
