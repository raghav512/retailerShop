import { NativeModules } from 'react-native';

const { SpeechModule } = NativeModules;

const SpeechService = {
    start: () => {
        if (SpeechModule) {
            SpeechModule.start();
        } else {
            console.warn('SpeechModule is not linked.');
        }
    },
    stop: () => {
        if (SpeechModule) {
            SpeechModule.stop();
        }
    },
    destroy: () => {
        if (SpeechModule) {
            SpeechModule.destroy();
        }
    }
};

export default SpeechService;
