import express, {
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import cors from "cors";
import "dotenv/config";
import path from "path";

import { errorHandler } from "./middleware/errorHandler.js";
import taskRoutes from "./routes/taskRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

const app = express();
const PORT = 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(
  "/uploads",
  express.static(path.resolve("uploads")),
);

app.get(
  "/health",
  (req: Request, res: Response) => {
    res.json({ status: "API is running" });
  },
);

app.use("/", taskRoutes);

app.use("/auth", authRoutes);

app.use("/", projectRoutes);

// The error handler MUST be the last middleware used in the pipeline
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(
    `Server is running on http://localhost:${PORT}`,
  );
});