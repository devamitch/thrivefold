import { parseCommand, splitSteps } from '../../src/domain/assistant/commands';

describe('assistant commands', () => {
  it('understands export requests', () => {
    expect(parseCommand('export all my metrics')).toEqual({ kind: 'export', format: 'spreadsheet' });
    expect(parseCommand('back up everything before I uninstall')).toEqual({ kind: 'export', format: 'backup' });
  });

  it('remembers what the person asks it to', () => {
    expect(parseCommand('Remember that I train at 7 am')).toEqual({ kind: 'remember', note: 'I train at 7 am' });
  });

  it('splits several requests into steps only when each is understood', () => {
    expect(splitSteps('log two glasses of water and then open sleep')).toEqual(['log two glasses of water', 'open sleep']);
    expect(splitSteps('log a glass of water and open my journal')).toEqual(['log a glass of water', 'open my journal']);
    expect(splitSteps('why do I feel tired and then sleepy')).toEqual(['why do I feel tired and then sleepy']);
  });
});

describe('heart-rate questions', () => {
  it('routes heart-rate questions to the heart metric', () => {
    expect(parseCommand("what's my heart rate")).toEqual({ kind: 'ask', metric: 'heart' });
    expect(parseCommand('how is my pulse today')).toEqual({ kind: 'ask', metric: 'heart' });
  });
});
