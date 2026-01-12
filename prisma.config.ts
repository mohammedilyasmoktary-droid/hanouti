import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  seed: {
    script: "tsx prisma/seed.ts",
  },
})

