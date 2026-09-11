"use client";

import { useState } from "react";

type Column<T> = {
  key: keyof T;
  label: string;
};

type TableProps<T> = {
  data: T[];
  columns: Column<T>[];
};

export default function Table<T extends Record<string, unknown>>({
  data,
  columns,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDirection((currentDirection) =>
        currentDirection === "asc" ? "desc" : "asc",
      );
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (sortKey === null) {
      return 0;
    }

    const firstValue = a[sortKey];
    const secondValue = b[sortKey];

    if (firstValue === secondValue) {
      return 0;
    }

    if (firstValue === null || firstValue === undefined) {
      return -1;
    }

    if (secondValue === null || secondValue === undefined) {
      return 1;
    }

    const comparison = String(firstValue).localeCompare(
      String(secondValue),
      undefined,
      {
        numeric: true,
        sensitivity: "base",
      },
    );

    return sortDirection === "asc" ? comparison : -comparison;
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                scope="col"
                className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
              >
                <button
                  type="button"
                  onClick={() => handleSort(column.key)}
                  className="inline-flex items-center gap-2 hover:text-blue-600"
                >
                  {column.label}

                  {sortKey === column.key && (
                    <span aria-hidden="true">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 bg-white">
          {sortedData.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className="whitespace-nowrap px-6 py-4 text-sm text-gray-700"
                >
                  {String(row[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}