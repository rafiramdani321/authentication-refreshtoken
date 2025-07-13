export type createUserParams = {
  username: string;
  email: string;
  roleId: string;
  password: string;
  confirmPassword: string;
};

export type loginParams = {
  email: string;
  password: string;
};
