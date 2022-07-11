class BookRepository {
  constructor({ prisma }) {
    this.prisma = prisma;
  }

  async findBook({ isbn, select, include }) {
    const findUnique = {
      where: {
        isbn,
      },
    };

    if (select) {
      findUnique.select = select;
    }

    if (include) {
      findUnique.include = include;
    }

    const user = await this.prisma.books.findUnique(findUnique);

    return user;
  }

  async createBook({ data, select, include }) {
    const create = {
      data,
    };

    if (select) {
      create.select = select;
    }

    if (include) {
      create.include = include;
    }

    const createBook = await this.prisma.books.create(create);

    return createBook;
  }

  async updateBook({ isbn, data, select, include }) {
    const update = {
      where: {
        isbn,
      },
      data,
    };

    if (select) {
      update.select = select;
    }

    if (include) {
      update.include = include;
    }

    const book = await this.prisma.books.update(update);

    return book;
  }

  async deleteBook({ isbn, select, include }) {
    const deleteBook = {
      where: {
        isbn,
      },
    };

    if (select) {
      deleteBook.select = select;
    }

    if (include) {
      deleteBook.include = include;
    }

    const book = await this.prisma.books.delete(deleteBook);

    return book;
  }

	async countBooks(where) {
		const count = await this.prisma.books.count({
      where,
    });

		return count;
	}

  async findBooks({ skip, take, where, orderBy, select, include }) {
    const find = {
			skip,
      take,
      where,
      orderBy,
		};

    if (select) {
      find.select = select;
    }

    if (include) {
      find.include = include;
    }

		const books = await this.prisma.books.findMany(find);

		return books;
  }
}

module.exports = BookRepository;
