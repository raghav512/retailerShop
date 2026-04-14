
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
  Platform,
  ActivityIndicator,
  PermissionsAndroid,
} from "react-native";
import { showAlert } from "../../../common/reusableComponent/CustomAlert";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { launchImageLibrary } from "react-native-image-picker";
import Icon from "react-native-vector-icons/Ionicons";
import { API_BASE_URL } from "../../../config";
import { getAccessToken } from "../../../Redux/Storage";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { STAFF_COLORS } from '../../../colorsList/ColorList';

// Default avatar - replace with your actual default image
const DEFAULT_AVATAR = require("../../../assets/Images/default_img.jpg");

// ==================== UTILITY FUNCTIONS ====================
/**
 * Request camera/gallery permissions for Android
 */
const requestStoragePermission = async () => {
  if (Platform.OS === "android") {
    try {
      if (Platform.Version >= 33) {
        // Android 13+ doesn't need storage permission for image picker
        return true;
      }
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: "Storage Permission",
          message: "App needs access to your photos",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};

const getAvatarSource = (avatar) => {
  if (!avatar) return DEFAULT_AVATAR;
  
  if (typeof avatar === "object" && avatar.url) {
    const imageUrl = avatar.url.startsWith('http') 
      ? avatar.url 
      : `${API_BASE_URL}${avatar.url}`;
    return { uri: imageUrl };
  }
  
  if (typeof avatar === "string" && avatar !== "null" && avatar !== "undefined") {
    if (avatar.startsWith("http") || avatar.startsWith("file://")) {
      return { uri: avatar };
    } else {
      return { uri: `${API_BASE_URL}${avatar}` };
    }
  }
  
  return DEFAULT_AVATAR;
};
// ==================== CUSTOM TOAST COMPONENT ====================
const Toast = ({ message, visible }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && message) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, message, fadeAnim]);

  if (!message) return null;

  return (
    <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};



// ==================== POST CARD COMPONENT ====================
const PostCard = React.memo(({
  post,
  userId,
  selectedMenu,
  onToggleMenu,
  onEdit,
  onDelete,
  t,
}) => {
  return (
    <View style={styles.cardWrapper}>
      <View style={styles.card}>
        {post.post_image && (
          <Image
            source={{ uri: post.post_image }}
            style={styles.postImage}
            resizeMode="cover"
            onError={(error) => console.log('MyPosts Image load error:', error.nativeEvent.error)}
          />
        )}

        {/* User Info & Menu */}
        <View style={styles.cardContent}>
          <View style={styles.postHeader}>
            <View style={styles.userInfo}>
              <Image
                source={getAvatarSource(post.avatar)}
                style={styles.avatarSmall}
                resizeMode="cover"
              />
              <View>
                <Text style={styles.userName}>{post.user}</Text>
                <Text style={styles.time}>{post.time}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => onToggleMenu(post.id)}
              style={styles.menuButton}
              activeOpacity={0.7}
            >
              <Icon name="ellipsis-vertical" size={20} color="#555" />
            </TouchableOpacity>
          </View>

          {/* Post Content */}
          {post.title && <Text style={styles.postDesc}>{post.title}</Text>}
        </View>
      </View>

      {/* Menu positioned relative to card wrapper */}
      {selectedMenu === post.id && (
        <View style={styles.menuOverlay}>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              onPress={() => onEdit(post)}
              style={styles.menuItem}
              activeOpacity={0.7}>
              <Icon name="create-outline" size={18} color="#333" style={styles.menuIcon} />
              <Text style={styles.menuText}>{t('community_screen.edit_post')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDelete(post.id)}
              style={styles.menuItem}
              activeOpacity={0.7}>
              <Icon name="trash-outline" size={18} color="#d32f2f" style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: "#d32f2f" }]}>{t('community_screen.delete_post')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onToggleMenu(null)}
              style={styles.menuItem}
              activeOpacity={0.7}>
              <Icon name="close-outline" size={18} color="#666" style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: "#666" }]}>{t('community_screen.cancel_btn')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
});

// ==================== POST EDITOR COMPONENT ====================
const PostEditor = React.memo(({
  isEditing,
  text,
  onChangeText,
  image,
  onPickImage,
  onSubmit,
  onCancel,
  loading,
  avatar,
  placeholder,
  t,
}) => {
  const [inputHeight, setInputHeight] = useState(40);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Image
          source={getAvatarSource(avatar)}
          style={styles.avatar}
          resizeMode="cover"
        />
        <TextInput
          style={[styles.input, { height: Math.max(40, inputHeight) }]}
          placeholder={placeholder}
          value={text}
          onChangeText={onChangeText}
          multiline
          onContentSizeChange={(e) =>
            setInputHeight(e.nativeEvent.contentSize.height + 16)
          }
          placeholderTextColor="#999"
        />
      </View>

      {image && (
        <Image
          source={{ uri: image }}
          style={styles.previewImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.bottomRow}>
        <TouchableOpacity onPress={onPickImage} style={styles.actionButton}>
          <Icon name="image-outline" size={24} color={STAFF_COLORS.primary} />
          <Text style={styles.actionText}>{t('community_screen.photo')}</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="small" color={STAFF_COLORS.primary} />
        ) : (
          <TouchableOpacity
            onPress={onSubmit}
            style={[styles.submitButton, (!text.trim() && !image) && styles.submitButtonDisabled]}
            disabled={!text.trim() && !image}
          >
            <Text style={styles.submitButtonText}>
              {isEditing ? t('community_screen.update_btn') : t('community_screen.post_btn')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isEditing && (
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>{t('community_screen.cancel_btn')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

// ==================== MAIN COMPONENT ====================
export default function StaffPosts() {
  const { t } = useTranslation();
  // State
  const [userId, setUserId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Create Post State
  const [postText, setPostText] = useState("");
  const [image, setImage] = useState(null);

  // Edit Post State
  const [editingPost, setEditingPost] = useState(null);
  const [editText, setEditText] = useState("");
  const [editImage, setEditImage] = useState(null);

  // UI State
  const [selectedPostMenu, setSelectedPostMenu] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Refs
  const scrollRef = useRef();

  // ==================== UTILITY FUNCTIONS ====================
  const displayToast = useCallback((message) => {
    setToastMsg(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  }, []);

  // ==================== IMAGE PICKER ====================
  const pickImage = useCallback(async (isEdit = false) => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      showAlert({ type: 'warning', title: t('community_screen.permission_title'), message: t('community_screen.permission_msg') });
      return;
    }

    const options = {
      mediaType: "photo",
      quality: 0.7,
      maxWidth: 1200,
      maxHeight: 1200,
      includeBase64: false,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.error("ImagePicker Error:", response.error);
        showAlert({ type: 'error', title: t('error'), message: t('community_screen.image_error') });
      } else if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0].uri;
        if (isEdit) {
          setEditImage(selectedImage);
        } else {
          setImage(selectedImage);
        }
      }
    });
  }, []);

  // ==================== API CALLS ====================
  /**
   * Fetch user posts - USING useCallback to fix hooks order
   */
  const fetchUserPosts = useCallback(async (uid) => {
  if (!uid) return;
  
  try {
    const url = `${API_BASE_URL}/api/posts/getPostsByUserId/${uid}`;
    console.log("Fetching posts from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.status === "success" && data.data) {
      const formattedPosts = data.data.map((post) => {
        // Handle post image URL - check both post_image and postImage fields
        let postImageUrl = null;
        if (post.postImage && post.postImage.url) {
          postImageUrl = post.postImage.url;
        } else if (post.post_image) {
          postImageUrl = post.post_image.startsWith('http')
            ? post.post_image
            : `${API_BASE_URL}${post.post_image}`;
        }

        // Use post's avatar and user name directly from the API response
        return {
          id: post._id,
          avatar: post.avatar,  // Use avatar from post data
          user: post.user || "You",  // Use user from post data
          time: new Date(post.createdAt).toLocaleString(),
          title: post.caption || "",
          desc: post.caption || "",
          post_image: postImageUrl,
          likes: post.likes || [],
          dislikes: post.dislikes || [],
          shares: post.shares || [],
          comments: post.comments || [],
        };
      });
      setPosts(formattedPosts);
    }
  } catch (error) {
    console.error("Fetch Posts Error:", error);
    displayToast(t('community_screen.load_posts_failed'));
  } finally {
    setRefreshing(false);
  }
}, [displayToast]);

  // ==================== EFFECTS ====================
  // Load user data on mount
  useEffect(() => {
    const initializeData = async () => {
      const userIdFromStorage = await AsyncStorage.getItem("userId");
      const userData = await AsyncStorage.getItem("userData");
      let id = null;
      if (userIdFromStorage) {
        id = userIdFromStorage;
      } else if (userData) {
        const user = JSON.parse(userData);
        id = user._id || user.id;
      }
      if (id) {
        setUserId(id);
      }
    };
    initializeData();
  }, []);

  // Fetch posts when userId changes
  useEffect(() => {
    if (userId) {
      fetchUserPosts(userId);
    }
  }, [userId, fetchUserPosts]);

  // Refresh posts when tab becomes active
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchUserPosts(userId);
      }
    }, [userId, fetchUserPosts])
  );

  /**
   * Submit new post
   */
  const submitPost = useCallback(async () => {
    if (!postText.trim() && !image) {
      showAlert({ type: 'warning', title: t('error'), message: t('community_screen.create_post_error') });
      return;
    }
    if (!userId) {
      showAlert({ type: 'error', title: t('error'), message: t('community_screen.user_not_found') });
      return;
    }

    const tempText = postText;
    const tempImage = image;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("caption", tempText);
      formData.append("userId", userId);

      if (tempImage) {
        const filename = tempImage.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("postImage", {
          uri: Platform.OS === "android" ? tempImage : tempImage.replace("file://", ""),
          name: filename,
          type,
        });
      }

      const token = await getAccessToken();
      const response = await fetch(`${API_BASE_URL}/api/posts/createPost`, {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Server response:", JSON.stringify(data, null, 2));

      // Check for various success status formats
      const isSuccess =
        data.status === "success" ||
        data.status === "Success" ||
        data.status === "ok" ||
        data.status === 200 ||
        data.success === true;

      if (isSuccess) {
        // Clear inputs AFTER success
        setPostText("");
        setImage(null);

        // Re-fetch posts after successful creation
        await fetchUserPosts(userId);
        
        console.log("Post created successfully");
        displayToast(t('community_screen.post_created'));
      } else {
        console.log("Post creation failed. Status:", data.status, "Message:", data.message);
        showAlert({ type: 'error', title: t('error'), message: data.message || 'Server error' });
      }
    } catch (error) {
      console.error("Create Post Error:", error);
      showAlert({ type: 'error', title: t('error'), message: error.message || t('community_screen.load_posts_failed') });
    } finally {
      setLoading(false);
    }
  }, [postText, image, userId, fetchUserPosts, displayToast]);

  /**
   * Submit edited post
   */
  const submitEditPost = useCallback(async () => {
    if (!editingPost || !userId) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("caption", editText);
      formData.append("userId", userId);

      if (editImage && editImage !== editingPost.post_image) {
        const filename = editImage.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("postImage", {
          uri: Platform.OS === "android" ? editImage : editImage.replace("file://", ""),
          name: filename,
          type,
        });
      }

      const token = await getAccessToken();
      const response = await fetch(
        `${API_BASE_URL}/api/posts/updatePost/${editingPost.id}`,
        {
          method: "PUT",
          body: formData,
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.status === "success") {
        await fetchUserPosts(userId);
        displayToast(t('community_screen.post_updated'));
        setEditingPost(null);
        setEditText("");
        setEditImage(null);
      } else {
        showAlert({ type: 'error', title: t('error'), message: data.message || 'Failed to update post' });
      }
    } catch (error) {
      console.error("Update Post Error:", error);
      showAlert({ type: 'error', title: t('error'), message: error.message || t('community_screen.load_posts_failed') });
    } finally {
      setLoading(false);
    }
  }, [editingPost, editText, editImage, userId, fetchUserPosts, displayToast]);

  /**
   * Delete post - WITH OPTIMISTIC UPDATE
   */
  const deletePost = useCallback(async (postId) => {
    if (!userId) return;

    showAlert({
      type: 'confirm',
      title: t('community_screen.delete_post_title'),
      message: t('community_screen.delete_post_msg'),
      buttons: [
        { text: t('community_screen.cancel_btn'), style: 'cancel' },
        {
          text: t('community_screen.delete_btn'),
          style: 'destructive',
          onPress: async () => {
            setSelectedPostMenu(null);
            
            // OPTIMISTIC UPDATE: Remove post from UI immediately
            setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
            
            try {
              const token = await getAccessToken();
              const response = await fetch(
                `${API_BASE_URL}/api/posts/deletePost/${postId}`,
                {
                  method: "DELETE",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ userId }),
                }
              );

              if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
              }

              const data = await response.json();
              if (data.status === "success") {
                displayToast(t('community_screen.post_deleted'));
                await fetchUserPosts(userId);
              } else {
                await fetchUserPosts(userId);
                displayToast(data.message || t('community_screen.load_posts_failed'));
              }
            } catch (error) {
              console.error("Delete Error:", error);
              await fetchUserPosts(userId);
              displayToast(t('community_screen.load_posts_failed'));
            }
          },
        },
      ],
    });
  }, [userId, fetchUserPosts, displayToast, t]);

  // ==================== UI HANDLERS ====================
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (userId) {
      await fetchUserPosts(userId);
    } else {
      setRefreshing(false);
    }
  }, [userId, fetchUserPosts]);

  const openEditPost = useCallback((post) => {
    setEditingPost(post);
    setEditText(post.title);
    setEditImage(post.post_image);
    setSelectedPostMenu(null);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingPost(null);
    setEditText("");
    setEditImage(null);
  }, []);

  const toggleMenu = useCallback((postId) => {
    setSelectedPostMenu((prev) => (prev === postId ? null : postId));
  }, []);

  // ==================== RENDER ====================
  return (
    <View style={styles.mainContainer}>
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Edit Post */}
        {editingPost && (
          <PostEditor
            isEditing={true}
            text={editText}
            onChangeText={setEditText}
            image={editImage}
            onPickImage={() => pickImage(true)}
            onSubmit={submitEditPost}
            onCancel={cancelEdit}
            loading={loading}
            avatar={editingPost.avatar}
            placeholder={t('community_screen.edit_post_placeholder')}
            t={t}
          />
        )}

        {/* Create Post */}
        {!editingPost && (
          <PostEditor
            isEditing={false}
            text={postText}
            onChangeText={setPostText}
            image={image}
            onPickImage={() => pickImage(false)}
            onSubmit={submitPost}
            loading={loading}
            avatar={posts.length > 0 ? posts[0].avatar : null}
            placeholder={t('community_screen.my_posts_placeholder')}
            t={t}
          />
        )}

        {/* Posts List */}
        {posts.length === 0 && !refreshing ? (
          <View style={styles.emptyContainer}>
            <Icon name="chatbubbles-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>{t('community_screen.no_posts_title')}</Text>
            <Text style={styles.emptySubtext}>{t('community_screen.no_posts_sub')}</Text>
          </View>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              userId={userId}
              selectedMenu={selectedPostMenu}
              onToggleMenu={toggleMenu}
              onEdit={openEditPost}
              onDelete={deletePost}
              t={t}
            />
          ))
        )}
      </ScrollView>

      {/* Toast - Fixed Position */}
      <Toast message={toastMsg} visible={showToast} />
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 24,
  },
  cardWrapper: {
    position: 'relative',
    marginTop: 16,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 10,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    marginTop: 4,
    backgroundColor: "#eee",
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: "#eee",
  },
  input: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    textAlignVertical: "top",
    marginTop: 4,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 5,
    marginTop: 8,
  },
  postImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#eee",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  submitButton: {
    backgroundColor: STAFF_COLORS.primary,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
    minHeight: 40,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 12,
    marginBottom: 9,
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: "#ffe6e6",
    borderWidth: 1,
    borderColor: "#9b2114ff",
    flexDirection: "row",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#9b2114ff",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  cardContent: {
    padding: 12,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userName: {
    fontWeight: "800",
    color: STAFF_COLORS.primary,
    fontSize: 15,
  },
  time: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  postDesc: {
    fontSize: 13,
    color: "#444",
    marginVertical: 4,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
    paddingVertical: 4,
  },
  actionTextSmall: {
    fontSize: 14,
    marginLeft: 6,
    color: "#333",
    fontWeight: "600",
  },
  menuOverlay: {
    position: "absolute",
    right: 16,
    top: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 4,
    minWidth: 150,
    zIndex: 999999,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  menuButton: {
    padding: 4,
    zIndex: 1,
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 4,
    minWidth: 150,
  },
  menuArrow: {
    position: "absolute",
    backgroundColor: "#fff",
    transform: [{ rotate: "45deg" }],
    top: -2,
    right: 20,
    width: 12,
    height: 12,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#bbb",
    marginTop: 8,
  },
  toast: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: "#333",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999999,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  toastText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});