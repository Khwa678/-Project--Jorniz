import { Button } from "../../../components/ui/Button";
import { FollowButton } from "../../../components/follow/FollowButton";
import type { ExploreSearchResults, ExploreSearchScope } from "../types";

export interface ExploreResultsProps { results: ExploreSearchResults; scope: ExploreSearchScope; onOpenMember?: (memberId: string) => void; onOpenPost?: (postId: string) => void; onOpenJob?: (jobId: string) => void; onOpenProduct?: (productId: string) => void; }

export function ExploreResults({ results, scope, onOpenMember, onOpenPost, onOpenJob, onOpenProduct }: ExploreResultsProps) {
  const people = scope === "all" || scope === "people" ? results.people ?? [] : [];
  const posts = scope === "all" || scope === "posts" ? results.posts ?? [] : [];
  const jobs = scope === "all" || scope === "jobs" ? results.jobs ?? [] : [];
  const products = scope === "all" || scope === "products" ? results.products ?? [] : [];
  if (people.length + posts.length + jobs.length + products.length === 0) return <p className="explore-state">No matching results were returned.</p>;

  const groups = [
    { title: "Posts", items: posts.map((post) => ({ id: post.id, title: post.author_name ?? post.category ?? "Post", description: post.content ?? "No text content", onOpen: onOpenPost ? () => onOpenPost(post.id) : undefined })) },
    { title: "Jobs", items: jobs.map((job) => ({ id: job.id, title: job.title ?? "Untitled job", description: job.company ?? "Company not supplied", detail: job.location, onOpen: onOpenJob ? () => onOpenJob(job.id) : undefined })) },
    { title: "Products", items: products.map((product) => ({ id: product.id, title: product.name ?? "Unnamed product", description: product.description ?? "No description supplied", detail: typeof product.price === "number" ? `Price: ${product.price}` : undefined, onOpen: onOpenProduct ? () => onOpenProduct(product.id) : undefined })) },
  ];

  return <div className="explore-result-groups">
    {people.length ? <section><h2>People</h2><div className="explore-result-grid">{people.map((person) => <article className="explore-person-card" key={person.id}><Button className="explore-person-open" variant="ghost" onClick={() => onOpenMember?.(person.id)} disabled={!onOpenMember}><strong>{person.name ?? "Jorniz member"}</strong><span>{person.specialty ?? person.user_type ?? person.role ?? "Member"}</span>{person.hospital ? <small>{person.hospital}</small> : null}</Button><FollowButton memberId={person.id} initiallyFollowing={person.is_following} /></article>)}</div></section> : null}
    {groups.filter((group) => group.items.length).map((group) => <section key={group.title}><h2>{group.title}</h2><div className="explore-result-grid">{group.items.map((item) => <Button key={item.id} className="explore-result-card" variant="ghost" onClick={item.onOpen} disabled={!item.onOpen}><strong>{item.title}</strong><span>{item.description}</span>{"detail" in item && item.detail ? <small>{item.detail}</small> : null}</Button>)}</div></section>)}
  </div>;
}
