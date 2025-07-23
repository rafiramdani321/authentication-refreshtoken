export const buildErrorMap = <T extends string>(
  errors: { field: string; message: string }[]
): Partial<Record<T, string[]>> => {
  const errorMap: Partial<Record<T, string[]>> = {};
  errors.forEach((err) => {
    const key = err.field as T;
    if (!errorMap[key]) errorMap[key] = [];
    errorMap[key]!.push(err.message);
  });
  return errorMap;
};
