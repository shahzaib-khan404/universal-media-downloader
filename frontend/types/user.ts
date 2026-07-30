export interface UserProfile {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
}
