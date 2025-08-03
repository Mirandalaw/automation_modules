import { AppDataSource } from '../configs/data-source';

// 엔티티
import { UserStats } from '../entities/UserStats';
import { Point } from '../entities/Point';
import { UserProfile } from '../entities/UserProfile';
import { User } from '../entities/User';

// 레포지토리 구현체
import { UserStatsRepository } from '../repositories/implementations/UserStatsRepository';
import { PointRepository } from '../repositories/implementations/PointRepository';
import { UserProfileRepository } from '../repositories/implementations/UserProfileRepository';
import {UserRepository} from '../repositories/implementations/UserRepository';

// 서비스
import { GradeService } from '../services/GradeService';
import { PointService } from '../services/PointService';
import { UserProfileService } from '../services/UserProfileService';
import {UserService} from '../services/UserService';

// 컨트롤러
import { UserGradeController } from './UserGradeController';
import { UserPointController } from './UserPointController';
import { UserProfileController } from './UserProfileController';
import {UserMeController}  from './UserMeController';

// ========================
// 레포지토리 인스턴스화
// ========================
const userStatsRepository = new UserStatsRepository(AppDataSource.getRepository(UserStats));
const pointRepository = new PointRepository(AppDataSource.getRepository(Point));
const userProfileRepository = new UserProfileRepository(AppDataSource.getRepository(UserProfile));
const userRepository = new UserRepository(AppDataSource.getRepository(User));
// ========================
// 서비스 인스턴스화
// ========================
const gradeService = new GradeService(userStatsRepository,userRepository);
const pointService = new PointService(pointRepository);
const userProfileService = new UserProfileService(userProfileRepository);
const userService = new UserService(userProfileRepository);
// ========================
// 컨트롤러 인스턴스화
// ========================
export const userGradeController = new UserGradeController(gradeService);
export const userPointController = new UserPointController(pointService);
export const userProfileController = new UserProfileController(userProfileService);
export const userMeController = new UserMeController(userService);
