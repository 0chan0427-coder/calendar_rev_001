export type WorldView = 'home' | 'friends' | 'plaza' | 'shop' | 'ranking' | 'guestbook';
export type WorldSceneType = 'interior' | 'exterior';

export interface WorldItem {
  id: string;
  name: string;
  type: string;
  image: string;
  price: number;
  description?: string;
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
