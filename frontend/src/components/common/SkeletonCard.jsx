const SkeletonCard = ({ height = 120 }) => {
  return (
    <div
      style={{
        height,
        background: "linear-gradient(90deg, #eee, #f5f5f5, #eee)",
        backgroundSize: "200% 100%",
        animation: "skeleton 1.5s infinite",
        borderRadius: 8,
      }}
    />
  );
};

export default SkeletonCard;
