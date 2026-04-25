import { useState } from "react";
import "./BottomNav.css";

type NavItem = {
  key: string;
  icon: React.ReactNode;
  label?: string;
};

type BottomNavProps = {
  items?: NavItem[];
  activeItem?: string;
  onItemClick?: (key: string) => void;
  fixed?: boolean;
};

// Default navigation items for FitForge
const defaultItems: NavItem[] = [
  {
    key: "recommendation",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Sparkles / AI recommendation icon */}
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="m5 3 1 1" />
        <path d="m19 3-1 1" />
        <path d="m5 21 1-1" />
        <path d="m19 21-1-1" />
      </svg>
    ),
  },
  {
    key: "dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Chart / Dashboard icon */}
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
  },
  {
    key: "battle",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Globe icon for matchmaking / global rivals */}
        <circle cx="12" cy="12" r="7" />
        {/* Meridians */}
        <path d="M12 5a9.5 9.5 0 0 1 3 7 9.5 9.5 0 0 1-3 7" />
        <path d="M12 5a9.5 9.5 0 0 0-3 7 9.5 9.5 0 0 0 3 7" />
        {/* Parallels */}
        <path d="M5 12h14" />
        <path d="M6.5 8.5h11" />
        <path d="M6.5 15.5h11" />
      </svg>
    ),
  },
  {
    key: "coach",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {/* Robot head */}
        <rect x="7" y="7" width="10" height="8" rx="2" ry="2"></rect>
        {/* Antenna */}
        <line x1="12" y1="4" x2="12" y2="7"></line>
        <circle cx="12" cy="3" r="1"></circle>
        {/* Eyes */}
        <circle cx="10" cy="10" r="1"></circle>
        <circle cx="14" cy="10" r="1"></circle>
        {/* Mouth */}
        <line x1="9" y1="13" x2="15" y2="13"></line>
      </svg>
    ),
  },
  {
    key: "profile",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
  },
];

export function BottomNav({
  items = defaultItems,
  activeItem: controlledActive,
  onItemClick,
  fixed = true,
}: BottomNavProps) {
  const [activeItem, setActiveItem] = useState(controlledActive || items[0]?.key || "battle");

  const handleItemClick = (itemKey: string) => {
    setActiveItem(itemKey);

    // Haptic feedback on mobile
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }

    // Call parent callback if provided
    if (onItemClick) {
      onItemClick(itemKey);
    }
  };

  const currentActive = controlledActive !== undefined ? controlledActive : activeItem;

  return (
    <nav className={`bottom-nav ${fixed ? "fixed" : ""}`}>
      <div className="nav-items">
        {items.map((item) => (
          <div
            key={item.key}
            className={`nav-item ${currentActive === item.key ? "active" : ""}`}
            onClick={() => handleItemClick(item.key)}
            data-page={item.key}
          >
            <div className="nav-icon">{item.icon}</div>
            <div className="nav-indicator"></div>
          </div>
        ))}
      </div>
    </nav>
  );
}

