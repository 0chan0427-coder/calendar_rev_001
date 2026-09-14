export type UUID = string;

export interface Profile { id: UUID; email?: string | null; name?: string | null; color?: string | null; role?: string | null; status?: string | null; requested_name?: string | null; name_status?: string | null; created_at?: string; }
export interface Room { id: UUID; name: string; created_at?: string; sort_order?: number | null; }
export interface RoomMember { id: UUID; room_id: UUID; user_id: UUID; created_at?: string; }
export interface CalendarEvent { id: UUID; room_id: UUID; user_id: UUID; title: string; event_date: string; end_date?: string | null; created_at?: string; color?: string | null; content?: string | null; }
export interface Message { id: UUID; room_id?: UUID | null; user_id?: UUID | null; content: string; created_at?: string; }
export interface Vote { id: UUID; room_id?: UUID | null; title: string; user_id?: UUID | null; status?: string | null; end_date?: string | null; created_at?: string; is_multiple?: boolean; is_anonymous?: boolean; }
export interface VoteOption { id: UUID; vote_id: UUID; content: string; created_at?: string; }
export interface VoteRecord { id: UUID; vote_id: UUID; option_id: UUID; user_id: UUID; created_at?: string; }
export interface Settlement { id: UUID; room_id?: UUID | null; user_id?: UUID | null; title: string; total_amount: number; created_at?: string; }
export interface SettlementItem { id: UUID; settlement_id?: UUID | null; user_id?: UUID | null; amount: number; is_paid?: boolean | null; }
export interface Comment { id: UUID; event_id: UUID; user_id: UUID; content: string; created_at?: string; }
