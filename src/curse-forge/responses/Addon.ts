import { Attachment } from './Attachment';
import { Author } from './Author';
import { Category } from './Category';
import { CategorySection } from './CategorySection';
import { GameVersionLatestFile } from './GameVersionLatestFile';
import { LatestFile } from './LatestFile';

export interface Addon {
  id: number;
  name: string;
  authors: Author[];
  attachments: Attachment[];
  websiteUrl: string;
  gameId: number;
  summary: string;
  defaultFileId: number;
  downloadCount: number;
  latestFiles: LatestFile[];
  categories: Category[];
  status: number;
  primaryCategoryId: number;
  categorySection: CategorySection;
  slug: string;
  gameVersionLatestFiles: GameVersionLatestFile[];
  isFeatured: boolean;
  popularityScore: number;
  gamePopularityRank: number;
  primaryLanguage: string;
  gameSlug: string;
  gameName: string;
  portalName: string;
  dateModified: Date;
  dateCreated: Date;
  dateReleased: Date;
  isAvailable: boolean;
  isExperiemental: boolean;
}

