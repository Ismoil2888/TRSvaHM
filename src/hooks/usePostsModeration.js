import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const usePostsModeration = () => {
  const [pendingPosts, setPendingPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPending = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_BASE}/api/posts/moderation/pending`
      );
      setPendingPosts(data);
    } catch (err) {
      console.error(err);
      toast.error("Не удалось загрузить ожидающие посты");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approvePost = useCallback(
    async (postId) => {
      try {
        await axios.put(
          `${process.env.REACT_APP_API_BASE}/api/posts/moderation/${postId}/approve`
        );
        toast.success("Публикация одобрена");
        setPendingPosts((prev) => prev.filter((p) => p.id !== postId));
      } catch {
        toast.error("Ошибка при одобрении публикации");
      }
    },
    []
  );

  const rejectPost = useCallback(
    async (postId) => {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_BASE}/api/posts/moderation/${postId}/reject`
        );
        toast.success("Публикация отклонена");
        setPendingPosts((prev) => prev.filter((p) => p.id !== postId));
      } catch {
        toast.error("Ошибка при отклонении публикации");
      }
    },
    []
  );

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  return {
    pendingPosts,
    isLoading,
    fetchPending,
    approvePost,
    rejectPost,
  };
};

export default usePostsModeration;