import { parseCommand } from '../../src/domain/assistant/commands';

describe('assistant commands', () => {
  it.each([
    ['Start breathing', '/(app)/beta-lab/breathing'],
    ['open the eye studio', '/(app)/beta-lab/eye-tracking'],
    ['face exercises', '/(app)/beta-lab/face-exercises'],
    ['I want to log my lunch', '/(app)/health/meal-log'],
    ['take me to my treadmill session', '/(app)/health/activity'],
    ['what glasses suit my face shape', '/(app)/beta-lab/body-style'],
    ['open face shape', '/(app)/beta-lab/body-style'],
    ['show my bmi', '/(app)/beta-lab/body-style'],
  ])('%s opens the right screen', (input, route) => {
    expect(parseCommand(input)).toMatchObject({ kind: 'open', route });
  });

  it('logs water with a count', () => {
    expect(parseCommand('log two glasses of water')).toEqual({ kind: 'log_water', glasses: 2 });
    expect(parseCommand('I had 3 cups')).toEqual({ kind: 'log_water', glasses: 3 });
    expect(parseCommand('add water')).toEqual({ kind: 'log_water', glasses: 1 });
  });

  it('answers questions about today', () => {
    expect(parseCommand('How many steps today?')).toEqual({ kind: 'ask', metric: 'steps' });
    expect(parseCommand('how much water did I drink')).toEqual({ kind: 'ask', metric: 'water' });
    expect(parseCommand('what quests are left')).toEqual({ kind: 'ask', metric: 'quests' });
  });

  it('puts support first when someone mentions harming themselves', () => {
    expect(parseCommand('I want to die')).toEqual({ kind: 'crisis' });
    expect(parseCommand('thinking about suicide')).toEqual({ kind: 'crisis' });
    expect(parseCommand("I don't want to live anymore")).toEqual({ kind: 'crisis' });
    expect(parseCommand('open breathing')).toMatchObject({ kind: 'open' });
  });

  it('passes anything else on as a question', () => {
    expect(parseCommand('why do I feel tired after lunch and coffee every afternoon')).toMatchObject({ kind: 'unknown' });
  });
});
