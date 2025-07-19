import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

interface UserProfile {
  name: string;
  email: string;
  bio: string;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'Content creator and video enthusiast',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleProfileUpdate = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleVideoUpload = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const videoAsset = result.assets[0];
        
        // Validate file size (50MB limit)
        if (videoAsset.fileSize && videoAsset.fileSize > 50 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select a video smaller than 50MB');
          return;
        }

        setUploading(true);
        setUploadProgress(0);

        // Simulate upload progress
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 95) {
              clearInterval(interval);
              return 95;
            }
            return prev + Math.random() * 15;
          });
        }, 200);

        try {
          // Create form data
          const formData = new FormData();
          formData.append('video', {
            uri: videoAsset.uri,
            name: 'uploaded_video.mp4',
            type: 'video/mp4',
          } as any);

          // Make API call (replace with your actual endpoint)
          const response = await fetch('http://localhost:8000/api/upload', {
            method: 'POST',
            body: formData,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          const result = await response.json();
          setUploadProgress(100);

          if (result.success) {
            Alert.alert('Success', 'Video uploaded successfully!');
          } else {
            Alert.alert('Upload Failed', result.error || 'Please try again');
          }
        } catch (error) {
          Alert.alert('Upload Failed', 'Please check your connection and try again');
        } finally {
          setUploading(false);
          setUploadProgress(0);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity
              style={[styles.editButton, isEditing && styles.editButtonActive]}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Text style={[styles.editButtonText, isEditing && styles.editButtonTextActive]}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Profile Avatar */}
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <View style={styles.avatarInner} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={profile.name}
                onChangeText={(text: string) => setProfile({...profile, name: text})}
                placeholder="Enter your full name"
              />
            ) : (
              <View style={styles.textDisplay}>
                <Text style={styles.textDisplayText}>{profile.name}</Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={profile.email}
                onChangeText={(text: string) => setProfile({...profile, email: text})}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <View style={styles.textDisplay}>
                <Text style={styles.textDisplayText}>{profile.email}</Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bio</Text>
            {isEditing ? (
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={profile.bio}
                onChangeText={(text: string) => setProfile({...profile, bio: text})}
                placeholder="Tell us about yourself"
                multiline
                numberOfLines={3}
              />
            ) : (
              <View style={styles.textDisplay}>
                <Text style={styles.textDisplayText}>{profile.bio}</Text>
              </View>
            )}
          </View>

          {isEditing && (
            <TouchableOpacity style={styles.saveButton} onPress={handleProfileUpdate}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Video Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add New Video</Text>
          
          {uploading ? (
            <View style={styles.uploadProgress}>
              <View style={styles.uploadIcon}>
                <View style={styles.uploadIconInner} />
              </View>
              <Text style={styles.uploadTitle}>Uploading your video...</Text>
              <Text style={styles.uploadSubtitle}>Please don't close this screen</Text>
              
              <View style={styles.progressBar}>
                <View 
                  style={[styles.progressFill, { width: `${Math.min(uploadProgress, 100)}%` }]}
                />
              </View>
              
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>{Math.round(uploadProgress)}% complete</Text>
                <Text style={styles.progressText}>
                  {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.uploadSection}>
              <View style={styles.uploadArea}>
                <View style={styles.uploadAreaIcon}>
                  <View style={styles.uploadAreaIconInner} />
                </View>
                <Text style={styles.uploadAreaTitle}>Upload your video</Text>
                <Text style={styles.uploadAreaSubtitle}>
                  Choose a video file to add to your collection
                </Text>
                
                <TouchableOpacity style={styles.uploadButton} onPress={handleVideoUpload}>
                  <Text style={styles.uploadButtonText}>Choose Video File</Text>
                </TouchableOpacity>
                
                <Text style={styles.uploadInfo}>
                  Supported formats: MP4, MOV, AVI • Max size: 50MB
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingTop: 60,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  editButton: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  editButtonActive: {
    backgroundColor: '#F3F4F6',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  editButtonTextActive: {
    color: '#374151',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    backgroundColor: '#000',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarInner: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  textDisplay: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textDisplayText: {
    fontSize: 16,
    color: '#111827',
  },
  saveButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  uploadSection: {
    marginTop: 8,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  uploadAreaIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadAreaIconInner: {
    width: 32,
    height: 32,
    backgroundColor: '#9CA3AF',
    borderRadius: 8,
  },
  uploadAreaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  uploadAreaSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadInfo: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  uploadProgress: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  uploadIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#000',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadIconInner: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 6,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
