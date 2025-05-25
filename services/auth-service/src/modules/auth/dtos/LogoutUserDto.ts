/**
 * @swagger
 * components:
 *   schemas:
 *     LogoutUserDto:
 *       type: object
 *       required:
 *         - userId
 *         - sessionId
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           example: f23a3b2a-22c1-4aa9-98d1-f1a5ce10b6a6
 *         sessionId:
 *           type: string
 *           format: uuid
 *           example: 3f10e25c-5db2-4e28-b6b5-8b35555c9ac1
 */
import { IsUUID } from 'class-validator';

export class LogoutUserDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  sessionId: string;
}