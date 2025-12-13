/*
  Warnings:

  - You are about to drop the column `description` on the `Survey` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Survey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "bgImage" TEXT,
    "bgImageCover" TEXT,
    "bgImageQuestions" TEXT,
    "bgImageThanks" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "adminId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Survey_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Survey" ("adminId", "bgImage", "bgImageCover", "bgImageQuestions", "bgImageThanks", "createdAt", "id", "isActive", "title", "updatedAt") SELECT "adminId", "bgImage", "bgImageCover", "bgImageQuestions", "bgImageThanks", "createdAt", "id", "isActive", "title", "updatedAt" FROM "Survey";
DROP TABLE "Survey";
ALTER TABLE "new_Survey" RENAME TO "Survey";
CREATE INDEX "Survey_isActive_idx" ON "Survey"("isActive");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
