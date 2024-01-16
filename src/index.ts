import * as express from "express";
import * as cors from "cors";
import { AppDataSource } from "./data-source";
import router from "./routes/Routes";

AppDataSource.initialize()
  .then(async () => {
    const app = express();
    const port = 3000;

    app.use(cors());
    app.use(express.json());
    app.use("/api", router);

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => console.log(error));
