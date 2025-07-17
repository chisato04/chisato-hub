// client/src/types.ts
export interface Modpack {
  id: number;
  name: string;
  filename: string;
  version: string;
  minecraftVersion: string;
  loader: string;
  description: string;
  uploadDate: string;
  notes?: string;
  java_args?: string;
  modlist_file?: string; // For existing modlist filename display
  modlist?: string[];    // For the new, automatically extracted mod list
}