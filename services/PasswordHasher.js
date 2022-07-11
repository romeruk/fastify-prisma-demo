const crypto = require("crypto");
const { promisify } = require("util");

const randomBytesAsync = promisify(crypto.randomBytes);
const pbkdf2Async = promisify(crypto.pbkdf2);

class PasswordHasher {
  #separator = "$";

  #options = {
    iterations: 12000,
    keylen: 64,
    digest: "sha512",
    saltlen: 64,
  };

  async hash(password, salt) {
    if (!password) {
      throw new Error("Password is required");
    }

    if (!salt) {
      salt = await randomBytesAsync(16);
      salt = salt.toString("base64");
    }

    const { iterations, keylen, digest } = this.#options;
    let hash = await pbkdf2Async(password, salt, iterations, keylen, digest);
    hash = hash.toString("base64");

    const pass = [salt, hash].join(this.#separator);
    return pass;
  }

  async compare(password, passwordHash) {
    if (!password) {
      throw new Error("Password is required");
    }

    if (!passwordHash) {
      throw new Error("Password Hash is required");
    }

    const [salt] = passwordHash.split(this.#separator);
    const hash = await this.hash(password, salt);
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(passwordHash));
  }
}

module.exports = PasswordHasher;
