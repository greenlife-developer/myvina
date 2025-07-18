import { Request, Response, NextFunction } from "express";
const jwt = require("jsonwebtoken");
import User, { IUser } from "../model/User";

interface AuthenticatedRequest extends Request {
  user?: any;
  cookies: { [key: string]: string }; 
}

interface AuthenticatedResponse extends Response {
  user?: any;
  cookies: { [key: string]: string };
  status: (statusCode: number) => AuthenticatedResponse;
  json: (body: any) => AuthenticatedResponse;
}

const protect = async (
  req: AuthenticatedRequest,
  res: AuthenticatedResponse,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401);
      throw new Error("Not authorized, please login");
    }

    // Verify Token
    const verified = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    const user = await User.findById(verified.id);

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, please login" });
  }
};

export default protect;
