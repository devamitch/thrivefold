import { bestFileLines, scoreFileLines } from '../../src/domain/ai/fileEvidence';

const stored =
  '[blood-report.pdf, page 1]\nBlood test report\nVitamin D: 18 ng/mL (low; normal 30 to 100)\n' +
  '[blood-report.pdf, page 2]\nAdvice: Discuss vitamin D with your doctor. Repeat test in 3 months.';

describe('file evidence', () => {
  it('keeps the page of each line', () => {
    const lines = scoreFileLines('blood-report.pdf', stored, 'when should I repeat the test');
    expect(lines[0]).toMatchObject({ page: 2, line: 'Advice: Discuss vitamin D with your doctor. Repeat test in 3 months.' });
  });

  it('answers a question that names the file and ignores weak matches', () => {
    const files = [{ name: 'blood-report.pdf', text: stored }];
    expect(bestFileLines(files, 'according to my blood report when should I repeat the test')[0].page).toBe(2);
    expect(bestFileLines(files, 'what should I eat tonight')).toEqual([]);
  });
});
