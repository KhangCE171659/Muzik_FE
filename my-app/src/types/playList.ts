export interface Image {
  height: number;
  url: string;
  width: number;
}
export interface Tracks {
  href: string;
  total: number;
}

export interface Owner {
  display_name: string;
  external_urls: { spotify: string };
  href: string;
  id: string;
  type: string;
  uri: string;
}

export interface PlayListItem {
  collaborative: boolean;
  description: string;
  external_urls: { spotify: string };
  href: string;
  id: string;
  name: string;
  primary_color: string | null;
  public: boolean;
  snapshot_id: string;
  tracks: Tracks;
  type: string;
  uri: string;
  images: Image[];
  owner: Owner;
}

export interface PlayList {
  href: string;
  items: PlayListItem[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}

export interface PlayListResponse {
  data: PlayList;
}
