import { DefaultQueryCompiler } from 'kysely';

const ID_WRAP_REGEX = /"/g

export class DuckDbQueryCompiler extends DefaultQueryCompiler {
  protected getCurrentParameterPlaceholder(): string {
    return '?';
  }

  protected getLeftExplainOptionsWrapper(): string {
    return '';
  }

  protected getRightExplainOptionsWrapper(): string {
    return '';
  }

  protected getAutoIncrement(): string {
    throw new Error('DuckDB does not support auto-increment columns');
  }

  protected sanitizeIdentifier(identifier: string): string {
    return identifier.replace(ID_WRAP_REGEX, '""');
  }
}