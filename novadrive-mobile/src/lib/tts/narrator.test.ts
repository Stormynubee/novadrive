jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}));

jest.mock('../voice/voicePolicyBridge', () => ({
  notifyTtsPlayback: jest.fn(),
}));

import * as Speech from 'expo-speech';
import { notifyTtsPlayback } from '../voice/voicePolicyBridge';
import { speakFsmPrompt, triagePromptForLang } from './narrator';

describe('narrator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns prompt copy for ambulatory step', () => {
    const copy = triagePromptForLang('AMBULATORY', 'en');
    expect(copy?.prompt).toContain('walk');
    expect(copy?.options.length).toBeGreaterThan(0);
  });

  it('respects mute flag', () => {
    speakFsmPrompt('AMBULATORY', 'en', { ttsEnabled: false });
    expect(Speech.speak).not.toHaveBeenCalled();
    expect(notifyTtsPlayback).not.toHaveBeenCalled();
  });

  it('calls policy hooks when speaking', () => {
    speakFsmPrompt('AMBULATORY', 'en', { ttsEnabled: true });
    expect(notifyTtsPlayback).toHaveBeenCalled();
    expect(Speech.speak).toHaveBeenCalled();
  });
});
