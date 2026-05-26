import { activateNaariDistress } from './engine';

describe('activateNaariDistress', () => {
  it('calls speak, sms compose, and startRecording', async () => {
    const speak = jest.fn();
    const openSms = jest.fn();
    const startRecording = jest.fn();

    await activateNaariDistress(
      {
        profile: {
          mode: 'guest',
          name: 'Priya',
          gender: 'female',
          settings: { notifyEmergencyContacts: false } as never,
        },
        coords: { lat: 28.61, lng: 77.21 },
      },
      { speak, openSms, startRecording }
    );

    expect(speak).toHaveBeenCalled();
    expect(openSms).toHaveBeenCalled();
    expect(startRecording).toHaveBeenCalled();
  });

  it('notifies ICE when enabled', () => {
    const openSms = jest.fn();
    activateNaariDistress(
      {
        profile: {
          mode: 'guest',
          name: 'Priya',
          gender: 'female',
          settings: { notifyEmergencyContacts: true } as never,
          medical: {
            primaryContact: { fullName: 'Mom', relationship: 'Parent', phone: '9999999999' },
          },
        },
        coords: { lat: 28.61, lng: 77.21 },
      },
      { speak: jest.fn(), openSms, startRecording: jest.fn() }
    );
    expect(openSms).toHaveBeenCalledTimes(2);
  });
});
