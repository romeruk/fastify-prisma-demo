class BookService {
  constructor({ bookRepository }) {
    this.prisma = null;
    this.bookRepository = bookRepository;
  }

  async createBook({ isbn, title, year, authors }) {
    const book = await this.bookRepository.findBook({
      isbn,
    });

    if (book) {
      return {
        succes: false,
        message: "book already exists",
        code: 400,
      };
    }

    const data = {
      isbn,
      title,
      year,
    };

    if (authors?.length) {
      data.authors = {
        create: authors.map((author) => {
          return {
            author: {
              connect: { identity_code: author.identityCode },
            },
          };
        }),
      };
    }

    const createBook = await this.bookRepository.createBook({
      data,
      include: {
        authors: {
          select: {
            author: true,
          },
        },
      },
    });

    return {
      succes: true,
      book: createBook,
      code: 200,
    };
  }

  async getSingleBook(isbn) {
    const book = await this.bookRepository.findBook({
      isbn,
      include: {
        authors: {
          select: {
            author: true,
          },
        },
      },
    });

    if (!book) {
      return {
        succes: false,
        message: "Book not found",
        code: 404,
      };
    }

    return {
      succes: true,
      book,
      code: 200,
    };
  }

  async updateSingleBook({ isbn, title, year, authors }) {
    const book = await this.bookRepository.findBook({
      isbn,
    });

    if (!book) {
      return {
        succes: false,
        message: "Book not found",
        code: 404,
      };
    }

    const data = {
      title,
      year,
      authors: {},
    };

    if (authors?.connect) {
      data.authors.create = authors.connect.map((author) => {
        return {
          author: {
            connect: { identity_code: author.identityCode },
          },
        };
      });
    }

    if (authors?.delete) {
      data.authors.deleteMany = authors.delete.map((author) => {
        return {
          author_identity_code: author.identityCode,
        };
      });
    }

    const updatedBook = await this.bookRepository.updateBook({
      isbn,
      data,
      include: {
        authors: {
          select: {
            author: true,
          },
        },
      },
    });

    return {
      succes: true,
      updatedBook,
      code: 200,
    };
  }

  async deleteSingleBook(isbn) {
    const book = await this.bookRepository.findBook({
      isbn,
    });

    if (!book) {
      return {
        succes: false,
        message: "Book not found",
        code: 404,
      };
    }

    const bookDelete = await this.bookRepository.deleteBook({ isbn });

    return {
      succes: true,
      message: "Book has been deleted",
      book: bookDelete,
      code: 200,
    };
  }

  async getBooks({ limit, page, authors, orderBy, sort, title, isbn }) {
    const skip = limit * (page - 1);
    const take = limit;

    const where = {};
    let orderByQuery = {};

    if (title) {
      where.title = title;
    }

    if (isbn) {
      where.isbn = isbn;
    }

    if (authors) {
      const splitAuthors = authors.split(",");

      const firstNames = [];
      const lastNames = [];

      for (const author of splitAuthors) {
        const [firstName, lastName] = author.split(" ");
        firstNames.push(firstName);
        lastNames.push(lastName);
      }

      where.authors = {
        some: {
          author: {
            first_name: { in: firstNames },
            last_name: { in: lastNames },
          },
        },
      };
    }

    if (orderBy && sort) {
      orderByQuery[orderBy] = sort;
    }

    const totalDocuments = await this.bookRepository.countBooks(where);

    const books = await this.bookRepository.findBooks({
      skip,
      take,
      where,
      orderBy: orderByQuery,
      include: {
        authors: {
          include: {
            author: true,
          },
        },
      },
    });

    return {
      succes: true,
      books,
      totalDocuments,
      totalPages: Math.ceil(totalDocuments / limit),
      perPage: limit,
      currentPage: page,
      code: 200,
    };
  }
}

module.exports = BookService;
