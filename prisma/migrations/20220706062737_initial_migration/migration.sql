-- CreateEnum
CREATE TYPE "USER_STATUS" AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED', 'DELETED');

-- CreateTable
CREATE TABLE "users" (
    "user_name" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" "USER_STATUS" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "authors" (
    "identity_code" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "books" (
    "isbn" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "authors_on_books" (
    "book_isbn" TEXT NOT NULL,
    "author_identity_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authors_on_books_pkey" PRIMARY KEY ("book_isbn","author_identity_code")
);

-- CreateTable
CREATE TABLE "favorite_books" (
    "user_name" TEXT NOT NULL,
    "book_isbn" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "favorite_books_pkey" PRIMARY KEY ("user_name","book_isbn")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_user_name_key" ON "users"("user_name");

-- CreateIndex
CREATE UNIQUE INDEX "authors_identity_code_key" ON "authors"("identity_code");

-- CreateIndex
CREATE UNIQUE INDEX "books_isbn_key" ON "books"("isbn");

-- AddForeignKey
ALTER TABLE "authors_on_books" ADD CONSTRAINT "authors_on_books_author_identity_code_fkey" FOREIGN KEY ("author_identity_code") REFERENCES "authors"("identity_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authors_on_books" ADD CONSTRAINT "authors_on_books_book_isbn_fkey" FOREIGN KEY ("book_isbn") REFERENCES "books"("isbn") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_books" ADD CONSTRAINT "favorite_books_user_name_fkey" FOREIGN KEY ("user_name") REFERENCES "users"("user_name") ON DELETE RESTRICT ON UPDATE CASCADE;
