declare module "*.asset.json" {
  const value: {
    url: string;
    asset_id: string;
    project_id: string;
    r2_key: string;
    original_filename: string;
    size: number;
    content_type: string;
    created_at: string;
  };
  export default value;
}
