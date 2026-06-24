-- CreateTable
CREATE TABLE "book_reading_resets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "book_id" INTEGER NOT NULL,
    "reset_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_reading_resets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "book_reading_resets_user_id_book_id_key" ON "book_reading_resets"("user_id", "book_id");

-- AddForeignKey
ALTER TABLE "book_reading_resets" ADD CONSTRAINT "book_reading_resets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_reading_resets" ADD CONSTRAINT "book_reading_resets_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "bible_books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
