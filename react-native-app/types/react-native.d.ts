declare module 'react-native' {
  export interface ViewStyle {
    [key: string]: any;
  }
  
  export interface TextStyle {
    [key: string]: any;
  }
  
  export interface ImageStyle {
    [key: string]: any;
  }
  
  export interface StyleProp<T> {
    [key: string]: any;
  }
  
  export interface Dimensions {
    get(dimension: 'window' | 'screen'): { width: number; height: number };
  }
  
  export const Dimensions: Dimensions;
  
  export interface StyleSheet {
    create<T>(styles: T): T;
  }
  
  export const StyleSheet: StyleSheet;
  
  export interface ViewProps {
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export interface TextProps {
    style?: StyleProp<TextStyle>;
    children?: React.ReactNode;
    numberOfLines?: number;
    [key: string]: any;
  }
  
  export interface TextInputProps {
    style?: StyleProp<TextStyle>;
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    multiline?: boolean;
    numberOfLines?: number;
    keyboardType?: string;
    autoCapitalize?: string;
    [key: string]: any;
  }
  
  export interface TouchableOpacityProps {
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
    children?: React.ReactNode;
    disabled?: boolean;
    [key: string]: any;
  }
  
  export interface ScrollViewProps {
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
    showsVerticalScrollIndicator?: boolean;
    [key: string]: any;
  }
  
  export interface FlatListProps<T> {
    data: T[];
    keyExtractor: (item: T) => string;
    renderItem: ({ item }: { item: T }) => React.ReactElement;
    contentContainerStyle?: StyleProp<ViewStyle>;
    showsVerticalScrollIndicator?: boolean;
    refreshControl?: React.ReactElement;
    [key: string]: any;
  }
  
  export interface ActivityIndicatorProps {
    size?: 'small' | 'large';
    color?: string;
    [key: string]: any;
  }
  
  export interface RefreshControlProps {
    refreshing: boolean;
    onRefresh: () => void;
    [key: string]: any;
  }
  
  export interface AlertStatic {
    alert(title: string, message?: string, buttons?: any[]): void;
  }
  
  export const View: React.ComponentType<ViewProps>;
  export const Text: React.ComponentType<TextProps>;
  export const TextInput: React.ComponentType<TextInputProps>;
  export const TouchableOpacity: React.ComponentType<TouchableOpacityProps>;
  export const ScrollView: React.ComponentType<ScrollViewProps>;
  export const FlatList: React.ComponentType<FlatListProps<any>>;
  export const ActivityIndicator: React.ComponentType<ActivityIndicatorProps>;
  export const RefreshControl: React.ComponentType<RefreshControlProps>;
  export const Alert: AlertStatic;
}

declare module '@react-navigation/native' {
  export interface NavigationContainerProps {
    children: React.ReactNode;
  }
  
  export const NavigationContainer: React.ComponentType<NavigationContainerProps>;
}

declare module '@react-navigation/bottom-tabs' {
  export interface BottomTabNavigatorProps {
    screenOptions?: any;
    children: React.ReactNode;
  }
  
  export interface TabScreenProps {
    name: string;
    component: React.ComponentType<any>;
    options?: any;
  }
  
  export interface BottomTabNavigator {
    Navigator: React.ComponentType<BottomTabNavigatorProps>;
    Screen: React.ComponentType<TabScreenProps>;
  }
  
  export function createBottomTabNavigator(): BottomTabNavigator;
}

declare module 'expo-status-bar' {
  export interface StatusBarProps {
    style?: 'auto' | 'inverted' | 'light' | 'dark';
  }
  
  export const StatusBar: React.ComponentType<StatusBarProps>;
}

declare module 'expo-av' {
  export interface VideoProps {
    source: { uri: string };
    style?: any;
    useNativeControls?: boolean;
    resizeMode?: string;
    shouldPlay?: boolean;
    onPlaybackStatusUpdate?: (status: any) => void;
    onError?: () => void;
  }
  
  export const Video: React.ComponentType<VideoProps>;
}

declare module 'expo-image-picker' {
  export interface MediaTypeOptions {
    All: string;
    Videos: string;
    Images: string;
  }
  
  export const MediaTypeOptions: MediaTypeOptions;
  
  export interface ImagePickerResult {
    canceled: boolean;
    assets?: Array<{
      uri: string;
      fileSize?: number;
      [key: string]: any;
    }>;
  }
  
  export interface PermissionResponse {
    granted: boolean;
  }
  
  export function requestMediaLibraryPermissionsAsync(): Promise<PermissionResponse>;
  export function launchImageLibraryAsync(options: any): Promise<ImagePickerResult>;
}
