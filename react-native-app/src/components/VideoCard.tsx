import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Video } from 'expo-av';

const { width } = Dimensions.get('window');

interface VideoProps {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  uploadedAt: string;
  duration?: string;
}

interface VideoCardProps {
  video: VideoProps;
}

export default function VideoCard({ video }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.card}>
      {/* Video Player Area */}
      <View style={styles.videoContainer}>
        {!error ? (
          <>
            <Video
              source={{ uri: video.url }}
              style={styles.video}
              useNativeControls={isPlaying}
              resizeMode="cover"
              shouldPlay={false}
              onPlaybackStatusUpdate={(status: any) => {
                if (status.isLoaded) {
                  setIsPlaying(status.isPlaying);
                }
              }}
              onError={() => setError(true)}
            />
            
            {!isPlaying && (
              <View style={styles.overlay}>
                <TouchableOpacity 
                  style={styles.playButton}
                  onPress={() => setIsPlaying(true)}
                >
                  <View style={styles.playIcon} />
                </TouchableOpacity>
              </View>
            )}
            
            {video.duration && (
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{video.duration}</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.errorContainer}>
            <View style={styles.errorIcon}>
              <View style={styles.errorDot} />
            </View>
            <Text style={styles.errorText}>Video unavailable</Text>
          </View>
        )}
      </View>

      {/* Video Info */}
      <View style={styles.infoContainer}>
        <View style={styles.infoContent}>
          <Text style={styles.title} numberOfLines={2}>
            {video.title}
          </Text>
          <Text style={styles.uploadDate}>
            Uploaded {formatDate(video.uploadedAt)}
          </Text>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionDot} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.menuDots}>
              <View style={styles.menuDot} />
              <View style={styles.menuDot} />
              <View style={styles.menuDot} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  videoContainer: {
    position: 'relative',
    aspectRatio: 16 / 9,
    backgroundColor: '#1F2937',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  playButton: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 16,
    borderLeftColor: '#000',
    borderTopWidth: 12,
    borderTopColor: 'transparent',
    borderBottomWidth: 12,
    borderBottomColor: 'transparent',
    marginLeft: 4,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorDot: {
    width: 24,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
  },
  infoContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 24,
  },
  uploadDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionDot: {
    width: 16,
    height: 16,
    backgroundColor: '#6B7280',
    borderRadius: 8,
  },
  menuDots: {
    flexDirection: 'row',
    gap: 2,
  },
  menuDot: {
    width: 4,
    height: 16,
    backgroundColor: '#6B7280',
    borderRadius: 2,
  },
});
