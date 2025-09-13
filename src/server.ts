import { app } from "./app";

const PORT = process.env.PORT ? Number(process.env.PORT) : 5174;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
