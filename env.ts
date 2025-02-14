import z from "zod";

const schema = z.object({ NODE_ENV: z.string().optional() });

export const env = schema.parse(process.env);
