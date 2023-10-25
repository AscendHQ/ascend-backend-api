# ascend-backend-api

Ascend Backend API

## Usage

- Clone repository using command `git clone https://github.com/AscendHQ/ascend-backend-api.git`
- Change folder into the cloned folder using the command `cd ascend-backend-api`
- Install project dependencies using the command `yarn install`
- Run `yarn run dev` to start the development server

## How To Contribute

- Create a new branch with `git checkout -b [branch-name]`. Your branch name should describe the feature you are implementing

```bash
git checkout -b login-with-email
```

- After making changes, run `git add .` to stage all of them or `git add [filename]` to add only specific files.
- Commit your changes by running `git commit` providing a descriptive commit message. e.g

```bash
git commit -m "added login with email"
```

- Push update to remote branch with `git push origin [your-branch-name]`. e.g

```bash
git push origin login-with-email
```

## How to add new ENV variable

This env validation is done to reduce missing out adding all needed env variable.

- Add the new env variable name to the env config type file inside the `./src/config/types.d.ts`
- State the type and validation of the env variable name inside the `./src/config/env/schema/index.ts`
- Add the variable name and the value inside the `.env`
- Export and link the value from the `./src/config/env`

To use the value of the env variable in any where in the code,import the config from the `./src/config/env` file e.g.

```
import { config } from "./config/env";

const { NODE_ENV } = config;
```

## How to add new endpoint

- Create a controller file with the name of the route e.g `./src/controllers/result.controller.ts`. Define all functions for the controller in here.
- Create a router file inside the routes, with the name route. e.g `./src/routes/results`
- Import the controller function inside the router file `./src/routes/results`
- Import the router file into the `./src/app.ts`, under the import routers comment

```
import resultRouter from "./routes/result";
```

- Add the router path name to the `./src/app.ts`, under the use routers

```
app.use("/results", resultRouter);
```

## Others

- To connect to the data models, create a folder inside the `./src/services` folder with the name of the router e.g `./src/services/result.services`
- Create the data model inside the `./src/models`
- Create the interface inside the `./src/interface`
