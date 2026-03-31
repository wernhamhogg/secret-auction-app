type Props = {
  status: "open" | "closed" | "result";
};

export default function AuctionStatusBadge({ status }: Props) {
  const config = {
    open: {
      label: "🟢 Open",
      bg: "#dcfce7",
      color: "#065f46"
    },
    closed: {
      label: "🔒 Closed",
      bg: "#e5e7eb",
      color: "#374151"
    },
    result: {
      label: "🏁 Result available",
      bg: "#e0e7ff",
      color: "#3730a3"
    }
  }[status];

  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: "999px",
        fontSize: "0.8rem",
        fontWeight: 600,
        backgroundColor: config.bg,
        color: config.color
      }}
    >
      {config.label}
    </span>
  );
}