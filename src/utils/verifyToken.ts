// FORMAT OF TOKEN
// Authorization: Bearer <access_token>
import jwt from "jsonwebtoken";

const verifyToken = async (req: any, res: any, next: any): Promise<any> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  const jwt_secret: any = process.env.JWT_SECRET;

  jwt.verify(token, jwt_secret, (err: any, user: any) => {
    if (err) {
      return res.sendStatus(401); // Unauthorized
    }
    req.user = user;
    req.token = token;
    next();
  });
};

export default verifyToken;
