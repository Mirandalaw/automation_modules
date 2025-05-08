import { AppDataSource } from '../configs/data-source';
import { EntityTarget, Repository } from 'typeorm';

export const getRepo = <T>(entity: EntityTarget<T>): Repository<T> => {
  return AppDataSource.getRepository(entity);
};