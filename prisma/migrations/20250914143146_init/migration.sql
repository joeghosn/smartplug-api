-- CreateTable
CREATE TABLE "public"."devices" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "apiTokenHash" VARCHAR(64) NOT NULL,
    "timezone" VARCHAR(50),
    "lastSeenAt" TIMESTAMP(3),
    "lastStatusAt" TIMESTAMP(3),
    "lastStatusJson" JSONB,
    "scheduleVersion" INTEGER NOT NULL DEFAULT 0,
    "pendingRelayOn" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."schedules" (
    "id" TEXT NOT NULL,
    "deviceId" VARCHAR(36) NOT NULL,
    "version" INTEGER NOT NULL,
    "timezone" VARCHAR(50) NOT NULL,
    "rulesJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."edgelists" (
    "id" TEXT NOT NULL,
    "deviceId" VARCHAR(36) NOT NULL,
    "scheduleVersion" INTEGER NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "edgesJson" JSONB NOT NULL,

    CONSTRAINT "edgelists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "devices_apiTokenHash_key" ON "public"."devices"("apiTokenHash");

-- CreateIndex
CREATE INDEX "devices_lastSeenAt_idx" ON "public"."devices"("lastSeenAt");

-- CreateIndex
CREATE INDEX "devices_scheduleVersion_idx" ON "public"."devices"("scheduleVersion");

-- CreateIndex
CREATE INDEX "schedules_deviceId_idx" ON "public"."schedules"("deviceId");

-- CreateIndex
CREATE INDEX "schedules_createdAt_idx" ON "public"."schedules"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "schedules_deviceId_version_key" ON "public"."schedules"("deviceId", "version");

-- CreateIndex
CREATE INDEX "edgelists_deviceId_idx" ON "public"."edgelists"("deviceId");

-- CreateIndex
CREATE INDEX "edgelists_validUntil_idx" ON "public"."edgelists"("validUntil");

-- CreateIndex
CREATE INDEX "edgelists_generatedAt_idx" ON "public"."edgelists"("generatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "edgelists_deviceId_scheduleVersion_key" ON "public"."edgelists"("deviceId", "scheduleVersion");

-- AddForeignKey
ALTER TABLE "public"."schedules" ADD CONSTRAINT "schedules_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."edgelists" ADD CONSTRAINT "edgelists_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
