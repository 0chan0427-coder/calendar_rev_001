export type WorldView = 'home' | 'friends' | 'plaza' | 'shop' | 'ranking' | 'guestbook' | 'notifications' | 'admin';
export type WorldSceneType = 'interior' | 'exterior';

export interface WorldItem {
  id: string;
  name: string;
  type: string;
  image: string;
  price: number;
  description?: string;
  category?: string;
  subcategory?: string;
  image_url?: string | null;
  placement_type?: string;
  min_scale?: number;
  max_scale?: number;
  default_z_index?: number;
  animation_type?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface WorldProfile {
  user_id: string;
  display_name: string;
  status_message: string;
  today_visits: number;
  total_visits: number;
  likes: number;
  world_points: number;
  scene_type: WorldSceneType;
  wallpaper_id: string;
  floor_id: string;
  window_id: string;
  my_bgm_id?: string | null;
  curtain_id?: string | null;
}

export interface WorldRankingRow {
  user_id: string;
  display_name: string;
  weekly_score: number;
  rank: number;
}

export interface WorldRoomItem {
  id: string;
  user_id: string;
  item_id: string;
  x: number;
  y: number;
  scale: number;
  z_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface WorldDailyStatus {
  attendance: boolean;
  chat: boolean;
  visitedUserIds: string[];
}

export interface WorldCompanion {
  id: string;
  user_id: string;
  item_id: string;
  name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
