import {
  BrushIcon,
  Building2Icon,
  CakeIcon,
  CameraIcon,
  CarIcon,
  ChurchIcon,
  Flower2Icon,
  GemIcon,
  GiftIcon,
  HeartIcon,
  HotelIcon,
  LandmarkIcon,
  type LucideIcon,
  MailIcon,
  MicIcon,
  MusicIcon,
  PlaneIcon,
  ShieldIcon,
  ShirtIcon,
  SparklesIcon,
  UtensilsIcon,
  VideoIcon,
  WineIcon,
} from "lucide-react";

export const categoryIcons = {
  building: Building2Icon,
  utensils: UtensilsIcon,
  wine: WineIcon,
  camera: CameraIcon,
  video: VideoIcon,
  flower: Flower2Icon,
  sparkles: SparklesIcon,
  music: MusicIcon,
  mic: MicIcon,
  shirt: ShirtIcon,
  brush: BrushIcon,
  cake: CakeIcon,
  gem: GemIcon,
  mail: MailIcon,
  church: ChurchIcon,
  landmark: LandmarkIcon,
  car: CarIcon,
  plane: PlaneIcon,
  hotel: HotelIcon,
  gift: GiftIcon,
  heart: HeartIcon,
  shield: ShieldIcon,
} satisfies Record<string, LucideIcon>;

export type CategoryIconKey = keyof typeof categoryIcons;

export const categoryIconKeys = Object.keys(categoryIcons) as [
  CategoryIconKey,
  ...CategoryIconKey[],
];

export function categoryIcon(key: string): LucideIcon {
  return categoryIcons[key as CategoryIconKey] ?? HeartIcon;
}
