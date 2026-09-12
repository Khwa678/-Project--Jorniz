import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../components/ui/Button";
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
      <header className="home-feed-heading workspace-page-heading">
        <div>
          <h1>Home Feed</h1>
          <p className="workspace-page-tagline">Read and share health posts from across the Jorniz community.</p>
        </div>
      </header>
      <FeedAudienceTabs
        selectedAudience={audience}
        onAudienceChange={setAudience}
        action={(
          <Button className="home-create-post-button" onClick={onOpenCreatePost}>
          <Plus size={16} aria-hidden="true" />
          Create post
          </Button>
        )}
      >
        {notice ? <p className="feed-notice">{notice}</p> : null}
        <PostTimeline posts={posts} loading={loading} error={error} emptyMessage={emptyMessage} currentAccountId={String(signedInAccount.id)} onRetry={() => setReloadNumber((value) => value + 1)} onOpenMember={onOpenMember} onEditPost={onEditPost} onDeletePost={onDeletePost} />
      </FeedAudienceTabs>
    </main>
  );
}
