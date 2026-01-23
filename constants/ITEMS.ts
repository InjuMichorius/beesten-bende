export interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const ITEMS: Record<string, InventoryItem> = {
  landmine: {
    id: "landmine",
    name: "Landmijn",
    icon: "land-mine-on",
    color: "#e74c3c",
  },
  // Hier kun je later makkelijk items toevoegen:
  // shield: { id: "shield", name: "Schild", icon: "shield-halved", color: "#3498db" },
};
