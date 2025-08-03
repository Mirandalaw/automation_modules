import logger from '../common/logger';

export const initializeExternalServices = async () => {
  logger.info('[Loader] 외부 서비스 초기화 완료 (OAuth, Sentry 등)');
};
