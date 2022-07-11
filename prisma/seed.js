const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Chance = require("chance");
const chance = new Chance();
const PasswordHasher = require("../services/PasswordHasher");
const hasher = new PasswordHasher();

function getMultipleRandom(arr, num) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());

  return shuffled.slice(0, num);
}

function generateRandomIntegerInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const BOOKS_GENERATE = 50;
const USERS_GENERATE = 20;
const AUTHORS_GENERATE = 100;

async function main() {
  const authors = [];

  for (let i = 0; i < AUTHORS_GENERATE; i++) {
    authors.push({
      identityCode: chance.ssn() + chance.string({ length: 1 }),
      firstName: chance.first() + chance.string({ length: 2 }),
      lastName: chance.last() + chance.string({ length: 2 }),
    });
  }

  const booksWithAuthors = [];

  for (let i = 0; i < BOOKS_GENERATE; i++) {
    booksWithAuthors.push({
      isbn: chance.hash({ length: 10 }),
      title: chance.sentence({ words: 2 }),
      year: parseInt(chance.year({ min: 2000, max: 2022 }), 10),
      authors: {
        create: getMultipleRandom(
          authors,
          generateRandomIntegerInRange(1, 2)
        ).map((author) => {
          return {
            author: {
              connectOrCreate: {
                where: {
                  identity_code: author.identityCode,
                },
                create: {
                  identity_code: author.identityCode,
                  first_name: author.firstName,
                  last_name: author.lastName,
                },
              },
            },
          };
        }),
      },
    });
  }

  const users = [];

  for (let i = 0; i < USERS_GENERATE; i++) {
    users.push({
      user_name: chance.string({ length: 8 }),
      first_name: chance.first(),
      last_name: chance.last(),
      password: await hasher.hash("password"),
      status: "ACTIVE",
      favorite_books: {
        create: getMultipleRandom(
          booksWithAuthors,
          generateRandomIntegerInRange(1, 2)
        ).map((book) => {
          return {
            book_isbn: book.isbn,
          };
        }),
      },
    });
  }

  for (const book of booksWithAuthors) {
    await prisma.books.create({
      data: book,
    });
  }

  for (const user of users) {
    await prisma.users.create({
      data: user,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect()
  });
