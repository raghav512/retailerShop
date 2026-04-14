import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ReactNativeBlobUtil from 'react-native-blob-util';

class ImagePickerService {
  /**
   * Request Camera Permission
   */
  async requestCameraPermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera access to take photos',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Camera permission error:', err);
        return false;
      }
    }
    return true;
  }

  /**
   * Request Storage Permission
   */
  async requestStoragePermission() {
    if (Platform.OS === 'android' && Platform.Version < 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs storage access to select photos',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Storage permission error:', err);
        return false;
      }
    }
    return true;
  }

  /**
   * Open Camera
   */
  async openCamera(options = {}) {
    const hasPermission = await this.requestCameraPermission();
    
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required');
      return null;
    }

    const config = {
      mediaType: 'photo',
      quality: 0.7,
      maxWidth: 800,
      maxHeight: 800,
      includeBase64: true,
      saveToPhotos: true,
      ...options,
    };

    try {
      const result = await launchCamera(config);
      
      if (result.didCancel || result.errorCode) {
        return null;
      }
      
      return result.assets?.[0] || null;
    } catch (error) {
      console.error('Camera error:', error);
      return null;
    }
  }

  /**
   * Open Gallery
   */
  async openGallery(options = {}) {
    const hasPermission = await this.requestStoragePermission();
    
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Storage permission is required');
      return null;
    }

    const config = {
      mediaType: 'photo',
      quality: 0.7,
      maxWidth: 800,
      maxHeight: 800,
      includeBase64: true,
      selectionLimit: 1,
      ...options,
    };

    try {
      const result = await launchImageLibrary(config);
      
      if (result.didCancel || result.errorCode) {
        return null;
      }
      
      return result.assets?.[0] || null;
    } catch (error) {
      console.error('Gallery error:', error);
      return null;
    }
  }

  /**
   * Open Video Gallery
   */
  async openVideoGallery(options = {}) {
    const hasPermission = await this.requestStoragePermission();

    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Storage permission is required');
      return null;
    }

    const config = {
      mediaType: 'video',
      selectionLimit: 1,
      includeBase64: false,
      ...options,
    };

    try {
      const result = await launchImageLibrary(config);

      if (result.didCancel || result.errorCode) {
        return null;
      }

      return result.assets?.[0] || null;
    } catch (error) {
      console.error('Video gallery error:', error);
      return null;
    }
  }

  /**
   * Convert image to base64
   */
  toBase64(image) {
    if (!image?.base64) return null;
    return `data:${image.type || 'image/jpeg'};base64,${image.base64}`;
  }

  /**
   * Convert multiple images to base64
   */
  toBase64Array(images) {
    if (!Array.isArray(images)) return [];
    return images.map(img => this.toBase64(img)).filter(Boolean);
  }

  /**
   * Read a single video file from its URI and return as base64 string.
   * react-native-image-picker does NOT support includeBase64 for videos,
   * so we read the file manually using react-native-blob-util.
   */
  async readVideoAsBase64(video) {
    if (!video?.uri) return null;
    try {
      // Strip the file:// prefix so blob-util can read the path
      const filePath = video.uri.replace('file://', '');
      const base64Data = await ReactNativeBlobUtil.fs.readFile(filePath, 'base64');
      const mimeType = video.type || 'video/mp4';
      return `data:${mimeType};base64,${base64Data}`;
    } catch (err) {
      console.error('❌ readVideoAsBase64 error:', err);
      return null;
    }
  }

  /**
   * Convert multiple video objects to base64 strings.
   */
  async toBase64VideoArray(videos) {
    if (!Array.isArray(videos)) return [];
    const results = await Promise.all(videos.map(v => this.readVideoAsBase64(v)));
    return results.filter(Boolean);
  }
}

export default new ImagePickerService();
