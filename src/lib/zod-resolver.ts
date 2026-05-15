import { z } from "zod";
import type { FormErrors } from "@mantine/form";

export function zodResolver<T>(schema: z.ZodTypeAny) {
  return (values: T): FormErrors => {
    const result = schema.safeParse(values);
    if (result.success) return {};

    return result.error.issues.reduce<FormErrors>((acc, issue) => {
      const key = issue.path.join(".");
      if (key) acc[key] = issue.message;
      return acc;
    }, {});
  };
}
