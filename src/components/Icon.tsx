import {
  ArrowRight,
  ChevronDown,
  ClipboardList,
  LogOut,
  Minus,
  PackageOpen,
  Mail,
  Truck,
  Trash2,
  Check,
  Heart,
  Menu,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";

const icons = {
  chevron: ChevronDown,
  orders: ClipboardList,
  logout: LogOut,
  minus: Minus,
  empty: PackageOpen,
  mail: Mail,
  truck: Truck,
  trash: Trash2,
  search: Search,
  bag: ShoppingBag,
  cart: ShoppingCart,
  arrow: ArrowRight,
  close: X,
  plus: Plus,
  check: Check,
  menu: Menu,
  user: UserRound,
  heart: Heart,
} satisfies Record<string, LucideIcon>;

export default function Icon({
  kind,
  size = 20,
}: {
  kind: keyof typeof icons;
  size?: number;
}) {
  const Component = icons[kind];
  return <Component size={size} strokeWidth={1.8} aria-hidden="true" />;
}
