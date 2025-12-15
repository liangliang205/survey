-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "loginVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Admin" ("createdAt", "id", "loginVersion", "name", "password", "username") SELECT "createdAt", "id", "loginVersion", "name", "password", "username" FROM "Admin";
DROP TABLE "Admin";
ALTER TABLE "new_Admin" RENAME TO "Admin";
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
