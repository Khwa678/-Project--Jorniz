import { useEffect, useState } from "react";
import type { SignedInAccount } from "../../lib/auth/accountTypes";
import { FeedAudienceTabs } from "./components/FeedAudienceTabs";
import { PostTimeline } from "./components/PostTimeline";
import { loadForYouPosts } from "./api/loadForYouPosts";
import { loadFollowingPosts } from "./api/loadFollowingPosts";
import { loadTrendingPosts } from "./api/loadTrendingPosts";
import type { FeedAudience, HealthPost } from "./types";
import "./styles.css";

export interface HomeFeedPageProps {
  signedInAccount: SignedInAccount;
  onOpenCreatePost: () => void;
  onOpenMember?: (memberId: string) => void;
  onEditPost?: (post: HealthPost) => void;
  onDeletePost?: (post: HealthPost) => void;
}

function describeFeedFailure(error: unknown) {
  return error instanceof Error ? error.message : "The feed could not be loaded.";
}

export function HomeFeedPage({ signedInAccount, onOpenCreatePost, onOpenMember, onEditPost, onDeletePost }: HomeFeedPageProps) {
  const [audience, setAudience] = useState<FeedAudience>("for-you");
  const [posts, setPosts] = useState<HealthPost[]>([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadNumber, setReloadNumber] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(""); setNotice(""); setPosts([]);
    const loader = audience === "following" ? loadFollowingPosts : audience === "trending" ? loadTrendingPosts : loadForYouPosts;
    loader(controller.signal)
      .then((result) => { setPosts(result.posts); setNotice(result.notice ?? ""); })
      .catch((loadError: unknown) => { if (!controller.signal.aborted) setError(describeFeedFailure(loadError)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [audience, reloadNumber]);

  const emptyMessage = audience === "following" ? "No posts from followed accounts are available." : audience === "trending" ? "No posts have engagement data yet." : "No posts have been published yet.";

  return (
    <main className="home-feed-page">
      <header className="home-feed-heading">
        <div><p>Home</p><h1>Your health network</h1></div>
        <button type="button" onClick={onOpenCreatePost}>Create post</button>
      </header>
      <FeedAudienceTabs selectedAudience={audience} onAudienceChange={setAudience} />
      {notice ? <p className="feed-notice">{notice}</p> : null}
      <PostTimeline posts={posts} loading={loading} error={error} emptyMessage={emptyMessage} currentAccountId={String(signedInAccount.id)} onRetry={() => setReloadNumber((value) => value + 1)} onOpenMember={onOpenMember} onEditPost={onEditPost} onDeletePost={onDeletePost} />
    </main>
  );
}
