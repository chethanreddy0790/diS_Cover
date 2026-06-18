import React, { useState } from 'react';
import { 
  Image, 
  ImageResizeMode, 
  StyleSheet, 
  View, 
  Text, 
  ViewStyle, 
  ImageStyle, 
  Dimensions, 
  Modal, 
  TouchableOpacity, 
  SafeAreaView,
  Pressable,
  Platform
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export type MediaType = 'post' | 'event' | 'gig' | 'story' | 'profile';
export type MediaMode = 'thumbnail' | 'detail' | 'fullscreen';

interface AppMediaImageProps {
  uri?: string;
  type: MediaType;
  mode?: MediaMode;
  aspectRatio?: number;
  style?: ViewStyle | ViewStyle[];
  imageStyle?: ImageStyle | ImageStyle[];
  allowFullscreen?: boolean;
}

const AppMediaImage: React.FC<AppMediaImageProps> = ({
  uri,
  type,
  mode = 'thumbnail',
  aspectRatio,
  style,
  imageStyle,
  allowFullscreen = false,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getStandardAspectRatio = () => {
    switch (type) {
      case 'story':
        return 9 / 16;
      case 'profile':
      case 'post':
      case 'event':
        return 1; // 1:1 square for feed posts and profile
      case 'gig':
        return 16 / 9;
      default:
        return 1;
    }
  };

  const finalAspectRatio = aspectRatio || getStandardAspectRatio();

  // Determine resize mode
  const getResizeMode = (): ImageResizeMode => {
    if (type === 'profile') return 'cover';
    if (type === 'story' && mode === 'detail') return 'cover'; // Stories should be immersive
    if (mode === 'detail' || isFullscreen) return 'contain';
    return 'cover';
  };

  const resizeMode = getResizeMode();

  const toggleFullscreen = () => {
    if (allowFullscreen && uri) {
      setIsFullscreen(!isFullscreen);
    }
  };

  const containerStyle = [
    styles.container,
    type !== 'story' ? { aspectRatio: finalAspectRatio } : {},
    mode === 'detail' ? { 
      width: '100%', 
      backgroundColor: '#000',
      alignSelf: 'center',
    } : {
      backgroundColor: 'transparent',
    },
    style
  ];

  if (!uri) {
    return (
      <View style={[
        styles.placeholder, 
        { aspectRatio: finalAspectRatio }, 
        mode === 'detail' ? { 
          width: '100%', 
          backgroundColor: '#000',
          alignSelf: 'center',
        } : {
          backgroundColor: '#EDF2F7',
        }, 
        style
      ]}>
        {type === 'profile' ? (
          <Feather name="user" size={40} color="#CBD5E0" />
        ) : (
          <Feather name="image" size={32} color="#CBD5E0" />
        )}
      </View>
    );
  }

  return (
    <>
      <Pressable 
        onPress={toggleFullscreen}
        disabled={!allowFullscreen}
        style={containerStyle}
      >
        <Image
          source={{ uri }}
          style={[
            styles.image,
            type === 'profile' && styles.profileImage,
            imageStyle
          ]}
          resizeMode={resizeMode}
        />
      </Pressable>

      <Modal
        visible={isFullscreen}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setIsFullscreen(false)}
      >
        <View style={styles.fullScreenContainer}>
          <SafeAreaView style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setIsFullscreen(false)}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
          </SafeAreaView>
          
          <View style={styles.fullScreenImageWrapper}>
            <Image
              source={{ uri }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  profileImage: {
    borderRadius: 999,
  },
  placeholder: {
    width: '100%',
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 20,
    right: 20,
    zIndex: 10,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  fullScreenImageWrapper: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
});

export default AppMediaImage;

