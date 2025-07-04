import Router from "express";
import authRouter from "../../auth/router/auth.router";
import userRouter from "../../user/router/user.router";

const router = Router();

// Auth routes
router.use("/auth", authRouter);

// User routes
router.use("/users", userRouter);

// Catch-all for 404 errors (if no route matches)
router.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default router;
