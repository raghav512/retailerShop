import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
  ScrollView,
  Modal,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Share } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import MessageIcon from "react-native-vector-icons/Ionicons";
import { API_BASE_URL } from "../../../config";
import { useTranslation } from "react-i18next";
import { STAFF_COLORS } from '../../../colorsList/ColorList';
const { width } = Dimensions.get("window");

// Default avatar
const DEFAULT_AVATAR = require("../../../assets/Images/Google.png");

// ==================== UTILITY FUNCTIONS ====================

/**
 * Calculate time ago from date string
 */
const timeAgo = (dateString) => {
  const now = new Date();
  const commentDate = new Date(dateString);
  const diff = Math.floor((now - commentDate) / 1000);
  
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return commentDate.toLocaleDateString();
};

/**
 * Format avatar URL
 */
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

const Toast = ({ message, visible, onHide }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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
      ]).start(() => onHide());
    }
  }, [visible, fadeAnim, onHide]);

  if (!message) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

// ==================== ACTION BUTTON COMPONENT ====================

const ActionButton = ({ icon, count, isActive, onPress, activeColor = STAFF_COLORS.primary }) => (
  <TouchableOpacity onPress={onPress} style={styles.iconButton} activeOpacity={0.7}>
    <Icon
      name={icon}
      size={20}
      color={isActive ? activeColor : "#555"}
    />
    <Text style={styles.actionText}>{count || 0}</Text>
  </TouchableOpacity>
);

// ==================== COMMENT ITEM COMPONENT ====================

const CommentItem = React.memo(({ comment }) => (
  <View style={styles.commentItem}>
    <Image
      source={getAvatarSource(comment.avatar)}
      style={styles.commentAvatar}
    />
    <View style={styles.commentContent}>
      <Text style={styles.commentUser}>{comment.user || "User"}</Text>
      <Text style={styles.commentText}>{comment.comment}</Text>
      <Text style={styles.commentTime}>{timeAgo(comment.createdAt)}</Text>
    </View>
  </View>
));

// ==================== COMMENT MODAL COMPONENT ====================

const CommentModal = ({
  visible,
  post,
  commentText,
  onChangeText,
  onClose,
  onSubmit,
  t,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
  });

  if (!post) return null;

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <Animated.View
          style={[
            styles.commentDrawer,
            { transform: [{ translateY }] },
          ]}
        >
          {/* Handle */}
          <View style={styles.modalHandle} />

          {/* Title */}
          <Text style={styles.modalTitle}>
            {t('community_screen.comments_title')} ({post.comments?.length || 0})
          </Text>

          {/* Comments List */}
          <ScrollView
            style={styles.commentsScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {post.comments?.length > 0 ? (
              post.comments.map((comment, index) => (
                <CommentItem key={`${comment._id || index}`} comment={comment} />
              ))
            ) : (
              <View style={styles.emptyComments}>
                <Text style={styles.emptyCommentsText}>
                  {t('community_screen.no_comments')}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View style={styles.commentInputContainer}>
            <TextInput
              placeholder={t('community_screen.add_comment_placeholder')}
              placeholderTextColor="#999"
              value={commentText}
              onChangeText={onChangeText}
              style={styles.commentInput}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !commentText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={onSubmit}
              disabled={!commentText.trim()}
              activeOpacity={0.7}
            >
              <Icon name="send" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ==================== POST CARD COMPONENT ====================

const PostCard = React.memo(({ post, userId, onAction, onOpenComments }) => {
  const isLiked = useMemo(
    () => post.likes?.some((like) => like._id === userId),
    [post.likes, userId]
  );

  const isDisliked = useMemo(
    () => post.dislikes?.some((dislike) => dislike._id === userId),
    [post.dislikes, userId]
  );

  const isShared = useMemo(
    () => post.shares?.some((share) => share._id === userId),
    [post.shares, userId]
  );

  return (
    <View style={styles.card}>
      {/* Post Image */}
      {post.post_image && (
        <Image
          source={{ uri: post.post_image }}
          style={styles.postImage}
          resizeMode="cover"
          onError={(error) => console.log('Image load error:', error.nativeEvent.error)}
        />
      )}

      <View style={styles.cardContent}>
        {/* User Info */}
        <View style={styles.userInfo}>
          <Image source={getAvatarSource(post.avatar)} style={styles.avatar} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{post.user}</Text>
            <Text style={styles.time}>{post.time}</Text>
          </View>
        </View>

        {/* Post Title/Caption */}
        {post.title && <Text style={styles.postTitle}>{post.title}</Text>}

        {/* Actions */}
        <View style={styles.actions}>
          <ActionButton
            icon={isLiked ? "thumbs-up" : "thumbs-up-outline"}
            count={post.likes?.length}
            isActive={isLiked}
            onPress={() => onAction(post.id, "like")}
          />

          <ActionButton
            icon={isDisliked ? "thumbs-down" : "thumbs-down-outline"}
            count={post.dislikes?.length}
            isActive={isDisliked}
            activeColor="#e74c3c"
            onPress={() => onAction(post.id, "dislike")}
          />

          <TouchableOpacity
            onPress={() => onOpenComments(post)}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <MessageIcon name="chatbubble-outline" size={20} color="#555" />
            <Text style={styles.actionText}>{post.comments?.length || 0}</Text>
          </TouchableOpacity>

          <ActionButton
            icon={isShared ? "share" : "share-outline"}
            count={post.shares?.length}
            isActive={isShared}
            activeColor="#3498db"
            onPress={() => onAction(post.id, "share")}
          />
        </View>
      </View>
    </View>
  );
});

// ==================== MAIN COMPONENT ====================

const StaffAllPosts = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [toast, setToast] = useState({ visible: false, message: "" });

  // Load user data and posts on mount
  useEffect(() => {
    loadUserData();
    fetchPosts();
  }, [fetchPosts]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      const userId = await AsyncStorage.getItem("userId");
      
      console.log("userData:", userData);
      console.log("userId:", userId);
      
      if (userId) {
        console.log("setting userId to:", userId);
        setUserId(userId);
      } else if (userData) {
        const user = JSON.parse(userData);
        console.log("parsed user:", user);
        const id = user._id || user.id;
        console.log("extracted id:", id);
        setUserId(id);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/getAllPosts`);
      
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
          
          return {
            id: post._id,
            avatar: post.avatar,
            user: post.user || "User",
            time: new Date(post.createdAt).toLocaleString(),
            title: post.caption || "",
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
      console.error("Error fetching posts:", error);
      showToast(t('community_screen.failed_to_load'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleAction = async (postId, action) => {
    if (!userId) {
      showToast(t('community_screen.login_to_interact'));
      return;
    }

    try {
      const endpointMap = {
        like: "likePost",
        dislike: "dislikePost",
        share: "sharePost",
      };

      const response = await fetch(`${API_BASE_URL}/api/posts/${endpointMap[action]}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, postId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const data = await response.json();
      if (data.status === "success") {
        // Update posts state optimistically
        setPosts(prevPosts =>
          prevPosts.map(post => {
            if (post.id !== postId) return post;
            
            const newPost = { ...post };
            if (action === "like") {
              const isLiked = newPost.likes.some(like => like._id === userId);
              if (isLiked) {
                newPost.likes = newPost.likes.filter(like => like._id !== userId);
              } else {
                newPost.likes = [...newPost.likes, { _id: userId }];
                newPost.dislikes = newPost.dislikes.filter(dislike => dislike._id !== userId);
              }
            } else if (action === "dislike") {
              const isDisliked = newPost.dislikes.some(dislike => dislike._id === userId);
              if (isDisliked) {
                newPost.dislikes = newPost.dislikes.filter(dislike => dislike._id !== userId);
              } else {
                newPost.dislikes = [...newPost.dislikes, { _id: userId }];
                newPost.likes = newPost.likes.filter(like => like._id !== userId);
              }
            } else if (action === "share") {
              if (!newPost.shares.some(share => share._id === userId)) {
                newPost.shares = [...newPost.shares, { _id: userId }];
                handleShare(post);
              }
            }
            return newPost;
          })
        );
      } else {
        showToast(data.message || t('community_screen.failed_action'));
      }
    } catch (error) {
      console.error(`Error ${action}ing post:`, error);
      showToast(t('community_screen.failed_action'));
    }
  };

  const handleShare = async (post) => {
    try {
      await Share.share({
        message: `Check out this post: ${post.title || "Interesting post"}`,
        url: post.post_image || "",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleOpenComments = (post) => {
    setSelectedPost(post);
  };

  const handleCloseComments = () => {
    setSelectedPost(null);
    setCommentText("");
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !userId || !selectedPost) return;

    const tempComment = {
      _id: Date.now().toString(),
      comment: commentText.trim(),
      user: "You",
      createdAt: new Date().toISOString(),
      avatar: null
    };

    const commentToSend = commentText.trim();
    setCommentText(""); // Clear input immediately

    // Optimistic UI update
    const updatedComments = [...(selectedPost.comments || []), tempComment];
    setSelectedPost(prev => ({ ...prev, comments: updatedComments }));
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === selectedPost.id
          ? { ...post, comments: updatedComments }
          : post
      )
    );

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/commentPost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          postId: selectedPost.id,
          comment: commentToSend,
        }),
      });

      const data = await response.json();
      if (data.status !== "success") {
        // Revert on failure
        setSelectedPost(prev => ({ ...prev, comments: selectedPost.comments }));
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === selectedPost.id
              ? { ...post, comments: selectedPost.comments }
              : post
          )
        );
        showToast(data.message || t('community_screen.failed_to_comment'));
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      // Revert on failure
      setSelectedPost(prev => ({ ...prev, comments: selectedPost.comments }));
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === selectedPost.id
            ? { ...post, comments: selectedPost.comments }
            : post
        )
      );
      showToast(t('community_screen.failed_to_comment'));
    }
  };

  const showToast = (message) => {
    setToast({ visible: true, message });
  };

  const hideToast = useCallback(() => {
    setToast({ visible: false, message: "" });
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const renderPost = ({ item }) => (
    <PostCard
      post={item}
      userId={userId}
      onAction={handleAction}
      onOpenComments={handleOpenComments}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={STAFF_COLORS.primary} />
        <Text style={styles.loadingText}>{t('community_screen.all_posts_loading')}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[STAFF_COLORS.primary]}
            tintColor={STAFF_COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('community_screen.no_posts_available')}</Text>
          </View>
        }
      />

      <CommentModal
        visible={!!selectedPost}
        post={selectedPost}
        commentText={commentText}
        onChangeText={setCommentText}
        onClose={handleCloseComments}
        onSubmit={handleSubmitComment}
        t={t}
      />

      <Toast
        message={toast.message}
        visible={toast.visible}
        onHide={hideToast}
      />
    </KeyboardAvoidingView>
  );
};

// ==================== STYLES ====================

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  time: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  postTitle: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#666",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
  },
  commentDrawer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: Platform.OS === "ios" ? 34 : 0,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  commentsScroll: {
    maxHeight: 300,
    paddingHorizontal: 16,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 12,
    color: "#999",
  },
  emptyComments: {
    padding: 32,
    alignItems: "center",
  },
  emptyCommentsText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: STAFF_COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  // Toast styles
  toast: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "#333",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    zIndex: 1000,
  },
  toastText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
});

export default StaffAllPosts;