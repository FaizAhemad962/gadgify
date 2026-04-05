-- CreateTable
CREATE TABLE "role_change_permissions" (
    "id" TEXT NOT NULL,
    "grantedById" TEXT NOT NULL,
    "grantedToId" TEXT NOT NULL,
    "canChangeRoles" BOOLEAN NOT NULL DEFAULT true,
    "canRemovePermission" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "role_change_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "role_change_permissions_grantedById_idx" ON "role_change_permissions"("grantedById");

-- CreateIndex
CREATE INDEX "role_change_permissions_isActive_idx" ON "role_change_permissions"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "role_change_permissions_grantedToId_key" ON "role_change_permissions"("grantedToId");

-- AddForeignKey
ALTER TABLE "role_change_permissions" ADD CONSTRAINT "role_change_permissions_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_change_permissions" ADD CONSTRAINT "role_change_permissions_grantedToId_fkey" FOREIGN KEY ("grantedToId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
