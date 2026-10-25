import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { buildXlsx, crc32, toBase64 } from '../../src/services/privacy/xlsx';

describe('xlsx export writer', () => {
  it('computes standard CRC-32', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
  });
  it('base64 matches Node for awkward lengths', () => {
    for (const n of [0, 1, 2, 3, 4, 5, 257]) {
      const b = Uint8Array.from({ length: n }, (_, i) => (i * 37) & 255);
      expect(toBase64(b)).toBe(Buffer.from(b).toString('base64'));
    }
  });
  it('produces a valid workbook zip with one sheet per category, escaping text', () => {
    const bytes = buildXlsx([
      { name: 'About this export', rows: [['Sheet', 'Rows'], ['Check-ins', 2]] },
      { name: 'Check-ins', rows: [['Date', 'Notes'], ['2026-10-25', 'tired & <sore> "legs"'], ['2026-10-24', null]] },
      { name: 'Bad/name:*?', rows: [['x']] },
    ]);
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'xlsx-')), 'export.xlsx');
    fs.writeFileSync(file, bytes);
    const listing = execFileSync('unzip', ['-l', file]).toString();
    for (const part of ['[Content_Types].xml', 'xl/workbook.xml', 'xl/worksheets/sheet1.xml', 'xl/worksheets/sheet3.xml', 'xl/styles.xml']) {
      expect(listing).toContain(part);
    }
    execFileSync('unzip', ['-tq', file]); // CRCs check out
    const sheet2 = execFileSync('unzip', ['-p', file, 'xl/worksheets/sheet2.xml']).toString();
    expect(sheet2).toContain('tired &amp; &lt;sore&gt; &quot;legs&quot;');
    const wb = execFileSync('unzip', ['-p', file, 'xl/workbook.xml']).toString();
    expect(wb).toContain('name="Bad name"');
  });
});
