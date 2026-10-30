jest.mock('expo-document-picker', () => ({}));
jest.mock('expo-file-system/legacy', () => ({ documentDirectory: 'file:///data/' }));
import { importedFileOf, isImportedId, safeModelName } from '../../src/services/ai/modelImport';

describe('model import names', () => {
  it('makes safe .gguf file names', () => {
    expect(safeModelName('Qwen3 0.6B (Q4_K_M).GGUF')).toBe('Qwen3-0.6B-Q4_K_M.gguf');
    expect(safeModelName('???')).toBe('model.gguf');
  });
  it('recognises imported ids', () => {
    expect(isImportedId('import:a.gguf')).toBe(true);
    expect(isImportedId('qwen2.5-0.5b-instruct')).toBe(false);
    expect(importedFileOf('import:a.gguf')).toBe('a.gguf');
  });
});
