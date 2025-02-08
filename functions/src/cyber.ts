import * as jwt from "jsonwebtoken";
const jwtSecretKey = "ChicknezBudgeTracker";

// // a function to generate a new Token
function getNewToken(user: {}): string {
  const container = { user };
  const options = { expiresIn: 432000 }; // 120 hours in seconds
  const token = jwt.sign(
    container,
    jwtSecretKey,
    options
  );
  return token;
}

// // a function to verify the token
// // function verifyToken(request: Request): Promise<boolean> {
// //   return new Promise<boolean>((resolve, reject) => {
// //     try {
// //       const header = request.header("authorization");
// //       if (!header) {
// //         resolve(false);
// //         return;
// //       }
// //       const token = header.substring(7);
// //       if (!token) {
// //         resolve(false);
// //         return;
// //       }
// //       jwt.verify(token, jwtSecretKey, (err) => {
// //         if (err) {
// //           resolve(false);
// //           return;
// //         }
// //         resolve(true);
// //       });
// //     } catch (err: any) {
// //       reject(err);
// //     }
// //   });
// // }

// //for sms

// // a function to verify that the user's role is Admin
// // async function verifyAdmin(request: Request): Promise<boolean> {
// //   const isLoggedIn = await verifyToken(request);
// //   if (!isLoggedIn) return false;

// //   const header = request.header("authorization");
// //   const token = header.substring(7);

// //   const container: any = jwt.decode(token);

// //   const user: UserModel = container.user;

// //   return user.role === RoleModel.Admin;
// // }

export default {
  getNewToken,
  //   //   verifyToken,
  //   //   validateOTP,
};
