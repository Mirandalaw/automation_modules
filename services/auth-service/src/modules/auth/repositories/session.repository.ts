import { getRepo } from '../../../utils/getRepository';
import { Session } from '../../../entities/Session';

export const sessionRepository = () => getRepo(Session);