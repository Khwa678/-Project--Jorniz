import type { ExploreSearchResults, ExploreSearchScope } from "../types";

export interface ExploreResultsProps { results: ExploreSearchResults; scope: ExploreSearchScope; onOpenMember?: (memberId: string) => void; onOpenPost?: (postId: string) => void; onOpenJob?: (jobId: string) => void; onOpenProduct?: (productId: string) => void; }

export function ExploreResults({ results, scope, onOpenMember, onOpenPost, onOpenJob, onOpenProduct }: ExploreResultsProps) {
  const people = scope === "all" || scope === "people" ? results.people ?? [] : [];
  const posts = scope === "all" || scope === "posts" ? results.posts ?? [] : [];
  const jobs = scope === "all" || scope === "jobs" ? results.jobs ?? [] : [];
  const products = scope === "all" || scope === "products" ? results.products ?? [] : [];
  if (people.length + posts.length + jobs.length + products.length === 0) return <p className="explore-state">No matching results were returned.</p>;
  return <div className="explore-result-groups">
    {people.length ? <section><h2>People</h2><div className="explore-result-grid">{people.map((person) => <button key={person.id} className="explore-result-card" type="button" onClick={() => onOpenMember?.(person.id)} disabled={!onOpenMember}><strong>{person.name ?? person.email ?? "Account"}</strong><span>{person.specialty ?? person.user_type ?? person.role ?? "Jorniz member"}</span>{person.hospital ? <small>{person.hospital}</small> : null}</button>)}</div></section> : null}
    {posts.length ? <section><h2>Posts</h2><div className="explore-result-grid">{posts.map((post) => <button key={post.id} className="explore-result-card" type="button" onClick={() => onOpenPost?.(post.id)} disabled={!onOpenPost}><strong>{post.author_name ?? post.category ?? "Post"}</strong><span>{post.content ?? "No text content"}</span></button>)}</div></section> : null}
    {jobs.length ? <section><h2>Jobs</h2><div className="explore-result-grid">{jobs.map((job) => <button key={job.id} className="explore-result-card" type="button" onClick={() => onOpenJob?.(job.id)} disabled={!onOpenJob}><strong>{job.title ?? "Untitled job"}</strong><span>{job.company ?? "Company not supplied"}</span>{job.location ? <small>{job.location}</small> : null}</button>)}</div></section> : null}
    {products.length ? <section><h2>Products</h2><div className="explore-result-grid">{products.map((product) => <button key={product.id} className="explore-result-card" type="button" onClick={() => onOpenProduct?.(product.id)} disabled={!onOpenProduct}><strong>{product.name ?? "Unnamed product"}</strong><span>{product.description ?? "No description supplied"}</span>{typeof product.price === "number" ? <small>Price: {product.price}</small> : null}</button>)}</div></section> : null}
  </div>;
}
