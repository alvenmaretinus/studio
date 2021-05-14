export interface Size {
  x: number
  y: number
}

export enum AssetType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE'
}

export interface Data {
  id: number
  user_id?: number
  client_id?: number
  asset_type: AssetType
  file_name?: string
  thumbnail_url: string
  created_at?: string
  updated_at?: string
}
