export type ExploreSearchScope = "all" | "people" | "posts" | "jobs" | "products";

export interface ExplorePerson { id: string; name?: string; email?: string; user_type?: string; role?: string; specialty?: string; hospital?: string; avatar_url?: string; is_verified?: boolean; }
export interface ExplorePost { id: string; content?: string; category?: string; author_name?: string; created_at?: string; }
export interface ExploreJob { id: string; title?: string; company?: string; location?: string; job_type?: string; }
export interface ExploreProduct { id: string; name?: string; description?: string; price?: number; image_url?: string; }
export interface ExploreSearchResults { people?: ExplorePerson[]; posts?: ExplorePost[]; jobs?: ExploreJob[]; products?: ExploreProduct[]; }
export interface ExploreSearchResponse { query?: string; results: ExploreSearchResults; }
