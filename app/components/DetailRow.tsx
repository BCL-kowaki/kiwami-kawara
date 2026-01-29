"use client";

import { DetailRow as DetailRowType } from "@/types/portfolio";

interface DetailRowProps<T extends DetailRowType = DetailRowType> {
  row: T;
  onChange: (row: T) => void;
  onDelete: () => void;
  rowIndex: number;
  categorySpecificFields?: React.ReactNode;
  showName?: boolean;
  nameLabel?: string;
  namePlaceholder?: string;
  amountLabel?: string;
  amountPlaceholder?: string;
}

export default function DetailRow<T extends DetailRowType = DetailRowType>({
  row,
  onChange,
  onDelete,
  rowIndex,
  categorySpecificFields,
  showName = true,
  nameLabel = "銘柄名・商品名",
  namePlaceholder = "例: 7203, VTI, BTC",
  amountLabel = "割合（%）",
  amountPlaceholder = "例: 10",
}: DetailRowProps<T>) {

  return (
    <div className="rounded-[2px] p-4 mb-3" style={{ background: '#1a1a1a', border: '1px solid #3a3a3a' }}>
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-sm" style={{ color: '#ffffff' }}>詳細 {rowIndex + 1}</h4>
        <button
          type="button"
          onClick={onDelete}
          className="text-sm font-medium hover:opacity-80"
          style={{ color: '#f87171' }}
        >
          削除
        </button>
      </div>

      {categorySpecificFields}

      {showName && (
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1" style={{ color: '#a0a0a0' }}>
            {nameLabel}
          </label>
          <input
            type="text"
            value={row.name || ""}
            onChange={(e) => onChange({ ...(row as any), name: e.target.value } as T)}
            placeholder={namePlaceholder}
            className="w-full px-3 py-2 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
            style={{ background: '#2a2a2a', border: '1px solid #4a4a4a', color: 'white' }}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: '#a0a0a0' }}>
          {amountLabel}
        </label>
        <input
          type="number"
          min="0"
          max="100"
          step="1"
          value={row.amount !== undefined && row.amount !== null ? String(row.amount) : ""}
          onChange={(e) => {
            const value = e.target.value;
            const numValue = value === "" ? undefined : Number(value);
            if (value === "" || (!isNaN(numValue!) && numValue! >= 0 && numValue! <= 100)) {
              onChange({
                ...(row as any),
                sizeMode: "percentage",
                amount: numValue,
              } as T);
            }
          }}
          placeholder={amountPlaceholder}
          className="w-full px-3 py-2 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
          style={{ background: '#2a2a2a', border: '1px solid #4a4a4a', color: 'white' }}
        />
      </div>
    </div>
  );
}
