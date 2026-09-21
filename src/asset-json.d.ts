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

// Blindagem anti-regressão da logo: declarações explícitas de módulos de
// imagem para que nenhum import de asset (presente ou futuro) quebre o
// `tsc --noEmit` caso o campo `types: ["vite/client"]` do tsconfig seja
// removido ou o cache de tipos falhe no preview/CI.
declare module "*.png" {
  const src: string;
  export default src;
}
declare module "*.jpg" {
  const src: string;
  export default src;
}
declare module "*.jpeg" {
  const src: string;
  export default src;
}
declare module "*.webp" {
  const src: string;
  export default src;
}
declare module "*.svg" {
  const src: string;
  export default src;
}
