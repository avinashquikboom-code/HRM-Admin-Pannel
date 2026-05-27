// No imports needed for React in this file if unused


interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

const TableSkeleton = ({ rows = 5, columns = 6 }: TableSkeletonProps) => {
  return (
    <div className="w-full animate-pulse">
      <div className="overflow-hidden glass-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-variant/50 border-b border-border/50">
                {Array.from({ length: columns }).map((_, i) => (
                  <th key={i} className="px-4 sm:px-6 py-4 sm:py-5">
                    <div className="h-4 bg-surface-variant rounded-lg w-24"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex} className="bg-transparent">
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <td key={colIndex} className="px-4 sm:px-6 py-4 sm:py-5">
                      {colIndex === 0 ? (
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-surface-variant"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-surface-variant rounded-lg w-32"></div>
                            <div className="h-3 bg-surface-variant/70 rounded-lg w-24"></div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-4 bg-surface-variant rounded-lg w-20"></div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableSkeleton;
