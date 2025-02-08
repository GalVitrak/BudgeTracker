export function getCategoryEmoji(
  category: string
): string {
  const emojiMap: { [key: string]: string } = {
    אוכל: "🍽️",
    קניות: "🛒",
    תחבורה: "🚗",
    "בילויים ותחביבים": "🎉",
    חשבונות: "📄",
    בית: "🏠",
    בריאות: "⚕️",
    לימודים: "📚",
    אחר: "📌",
  };
  return emojiMap[category] || "📌";
}
