import {Request, Response, NextFunction} from 'express';

export const authorize = (allowedRoles : string[]) =>{
  return (req: Request, res:Response, next : NextFunction) =>{
    const userRole = req.headers['x-role'];
    if(!allowedRoles.includes(userRole as string)){
      return res.status(403).json({message : "Forbidden : Insufficient role"});
    }
    next();
  }
}