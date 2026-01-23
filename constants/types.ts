export type Player = {
  id: string;
  name: string;
  pos: number;
  sips: number;
  inventory: string[];
};

export type ActionType = "self" | "give" | "everyone" | "info" | "modal";

export type Tile = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  actionType?: ActionType;
  sipCount?: number;
  sipsPerPlayer?: number;
  moveAmount?: number;
};
