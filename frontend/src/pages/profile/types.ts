export interface MemberPost {
  id: string;
  user_id?: string;
  content: string;
  category?: string;
  media_url?: string;
  media_type?: string;
  likes?: number;
  comments?: number;
  comments_count?: number;
  created_at?: string;
}

export interface ProfessionalExperience {
  id: string;
  user_id?: string;
  title: string;
  company: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  created_at?: string;
}

export interface ProfessionalExperienceInput {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface SkillEndorsement {
  skill_name: string;
  endorsement_count: number;
}
