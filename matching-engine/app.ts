import express from "express";
import matchingRouter from "./routes/matching";

const app = express();

// Allows the route to read JSON from request bodies
app.use(express.json());

// Registers matching route under /api
// This makes the full endpoint: POST /api/run-matching
app.use("/api", matchingRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Matching engine running on port ${PORT}`);
});