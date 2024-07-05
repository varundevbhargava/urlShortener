/*
  Warnings:

  - A unique constraint covering the columns `[shorturl]` on the table `Url` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Url_shorturl_key" ON "Url"("shorturl");
