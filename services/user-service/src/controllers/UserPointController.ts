import { Request, Response } from 'express';
import { PointService } from '../services/point.service';

/**
 * UserPointController
 * - 사용자 포인트 관련 요청을 처리하는 컨트롤러 클래스
 * - 사용 가능 포인트 조회, 충전, 출금 엔드포인트 제공
 * - 인증 미들웨어 통과 후 req.user.id를 기준으로 사용자 식별
 */
export class UserPointController {
  constructor(private readonly pointService: PointService) {}

  /**
   * GET /users/me/points
   * - 현재 로그인된 사용자의 보유 포인트 조회
   * - 적립합 - 사용합을 기반으로 계산
   *
   * @route GET /users/me/points
   * @returns { point: number }
   */
  async getMyPoints(req: Request, res: Response) {
    const userId = req.user!.id;
    const point = await this.pointService.getAvailablePoint(userId as number);
    return res.status(200).json({ point });
  }

  /**
   * POST /users/me/points/deposit
   * - 사용자의 포인트를 충전 (적립)함
   * - 최소 금액 조건은 DTO + validateRequest 미들웨어로 처리됨
   *
   * @route POST /users/me/points/deposit
   * @body amount, description
   * @returns { message: string }
   */
  async depositPoints(req: Request, res: Response) {
    const userId = req.user!.id;
    const { amount, description } = req.body;
    await this.pointService.deposit(userId as number, amount, description);
    return res.status(201).json({ message: '충전 완료' });
  }

  /**
   * POST /users/me/points/withdraw
   * - 사용자의 포인트를 출금 (사용)함
   * - 출금 금액은 현재 잔액보다 작거나 같아야 함
   * - 유효성 검사는 미들웨어에서 완료됨
   *
   * @route POST /users/me/points/withdraw
   * @body amount, description
   * @returns { message: string }
   */
  async withdrawPoints(req: Request, res: Response) {
    const userId = req.user!.id;
    const { amount, description } = req.body;
    await this.pointService.withdraw(userId as number, amount, description);
    return res.status(201).json({ message: '출금 완료' });
  }
}