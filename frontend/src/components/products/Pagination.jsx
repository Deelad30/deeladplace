const Pagination = ({ currentPage, totalCount, onPageChange }) => {
  const totalPages = Math.ceil(totalCount / 20);
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <div className="pagination">
      {pages.map((p) => (
        <button
          key={p}
          className={p === currentPage ? 'active' : ''}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
    </div>
  );
};

export default Pagination;
