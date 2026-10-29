import {
  parseVoiceCommand,
  voiceCommandResponseSpeech,
  type VoiceCommand,
} from '../../src/domain/coach/voiceCommands';

describe('Voice Commands Engine', () => {
  it('correctly parses common workout commands', () => {
    expect(parseVoiceCommand('pause')).toBe('pause');
    expect(parseVoiceCommand('pause workout')).toBe('pause');
    expect(parseVoiceCommand('stop')).toBe('pause');
    expect(parseVoiceCommand('hold on')).toBe('pause');

    expect(parseVoiceCommand('resume')).toBe('resume');
    expect(parseVoiceCommand('continue')).toBe('resume');
    expect(parseVoiceCommand("let's go")).toBe('resume');
    expect(parseVoiceCommand("i'm ready")).toBe('resume');

    expect(parseVoiceCommand('next')).toBe('next_set');
    expect(parseVoiceCommand('done')).toBe('next_set');
    expect(parseVoiceCommand('skip')).toBe('next_set');
    expect(parseVoiceCommand('finish')).toBe('next_set');

    expect(parseVoiceCommand('add rest')).toBe('add_rest');
    expect(parseVoiceCommand('give me thirty seconds')).toBe('add_rest');
    expect(parseVoiceCommand('more time')).toBe('add_rest');

    expect(parseVoiceCommand('previous')).toBe('previous');
    expect(parseVoiceCommand('go back')).toBe('previous');

    expect(parseVoiceCommand('toggle video')).toBe('toggle_video');
    expect(parseVoiceCommand('pause video')).toBe('toggle_video');

    expect(parseVoiceCommand('help')).toBe('help');
    expect(parseVoiceCommand('what can i say')).toBe('help');
  });

  it('returns null for unrecognized chatter and casual sentences', () => {
    expect(parseVoiceCommand('')).toBeNull();
    expect(parseVoiceCommand('what is the weather today')).toBeNull();
    expect(parseVoiceCommand('random noise')).toBeNull();
    expect(parseVoiceCommand('the next thing is my tripod setup')).toBeNull();
    expect(parseVoiceCommand('I am almost done with my positioning')).toBeNull();
    expect(parseVoiceCommand('stop talking please')).toBeNull();
  });

  it('supports coach wake phrases and command prefixes', () => {
    expect(parseVoiceCommand('hey coach, pause')).toBe('pause');
    expect(parseVoiceCommand('coach next set')).toBe('next_set');
    expect(parseVoiceCommand('please resume')).toBe('resume');
  });

  it('respects allowedCommands allowlist per workout state', () => {
    // During positioning, next_set is not allowed
    expect(
      parseVoiceCommand('next set', {
        allowedCommands: ['help', 'toggle_video', 'resume'],
      }),
    ).toBeNull();

    // But resume or help is allowed
    expect(
      parseVoiceCommand('resume', {
        allowedCommands: ['help', 'toggle_video', 'resume'],
      }),
    ).toBe('resume');
  });

  it('generates natural coaching voice response for recognized commands', () => {
    expect(voiceCommandResponseSpeech('pause')).toMatch(/Workout paused/);
    expect(voiceCommandResponseSpeech('resume')).toMatch(/Resuming/);
    expect(voiceCommandResponseSpeech('next_set', { rest: true })).toMatch(/Skipping rest/);
    expect(voiceCommandResponseSpeech('next_set', { rest: false })).toMatch(/Set completed/);
    expect(voiceCommandResponseSpeech('add_rest')).toMatch(/thirty seconds/);
    expect(voiceCommandResponseSpeech('previous', { itemIdx: 1 })).toMatch(/previous exercise/);
    expect(voiceCommandResponseSpeech('previous', { itemIdx: 0 })).toMatch(/first exercise/);
    expect(voiceCommandResponseSpeech('toggle_video', { videoPlaying: true })).toMatch(/Pausing/);
    expect(voiceCommandResponseSpeech('help')).toMatch(/pause, resume, next/);
  });
});
