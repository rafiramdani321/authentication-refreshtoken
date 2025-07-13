import { createRotatingLogger } from "./create-rotating-logger";

export const cleanTokenLogger = createRotatingLogger("clean-tokens");
export const registerLogger = createRotatingLogger("register");
