/**
 * Custom Error Classes for Persistence Operations
 */

/**
 * Error during schema migration
 */
export class MigrationError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'MigrationError';
    Object.setPrototypeOf(this, MigrationError.prototype);
  }

  toString(): string {
    return `${this.name}: ${this.message}${this.cause ? ` (Caused by: ${this.cause.message})` : ''}`;
  }
}

/**
 * Error during persistence operations (localStorage/Firestore)
 */
export class PersistenceError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'PersistenceError';
    Object.setPrototypeOf(this, PersistenceError.prototype);
  }

  toString(): string {
    return `${this.name}: ${this.message}${this.cause ? ` (Caused by: ${this.cause.message})` : ''}`;
  }
}

/**
 * Error when schema version is unsupported
 */
export class UnsupportedSchemaVersionError extends Error {
  constructor(version: number, minSupported: number, maxSupported: number) {
    const message = `Schema version ${version} is not supported. Supported versions: ${minSupported}-${maxSupported}`;
    super(message);
    this.name = 'UnsupportedSchemaVersionError';
    Object.setPrototypeOf(this, UnsupportedSchemaVersionError.prototype);
  }
}

/**
 * Error when data validation fails during migration
 */
export class ValidationError extends Error {
  constructor(public migration: string, message: string) {
    super(`Validation error in migration '${migration}': ${message}`);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
