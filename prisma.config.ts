import { defineConfig } from "prisma/config"

export default defineConfig({
  seed: {
    script: "tsx prisma/seed.ts",
  },
})

