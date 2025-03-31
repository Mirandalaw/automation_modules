import {Response} from 'express';
import {CustomError} from './CustomError';
import resHandler from './resHandler';

export const handleControllerError = (res:Response, error : unknown)=>{
  if(error instanceof CustomError){
    return resHandler(res, error.statusCode, error.message);
  }
  if (error instanceof Error) {
    return resHandler(res, 500, 'Server error', error.message);
  }
  return resHandler(res, 500, 'Server error', 'Unknown error occurred');
}