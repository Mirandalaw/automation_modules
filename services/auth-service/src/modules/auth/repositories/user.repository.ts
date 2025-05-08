import { getRepo } from '../../../utils/getRepository';
import { User } from '../../../entities/User';

export const userRepository = () => getRepo(User);