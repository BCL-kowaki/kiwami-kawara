"use client";

import { ListedStocksData, ListedStockDetail } from "@/types/portfolio";
import DetailRow from "./DetailRow";

interface ListedStocksCategoryProps {
  data: ListedStocksData;
  onChange: (data: ListedStocksData) => void;
}

export default function ListedStocksCategory({
  data,
  onChange,
}: ListedStocksCategoryProps) {
  const addDetailRow = () => {
    if (data.details.length >= 20) return;
    onChange({
      ...data,
      details: [
        ...data.details,
        { sizeMode: "percentage", name: "", amount: undefined },
      ],
    });
  };

  const updateDetailRow = (index: number, row: ListedStockDetail) => {
    const newDetails = [...data.details];
    newDetails[index] = row;
    onChange({ ...data, details: newDetails });
  };

  const deleteDetailRow = (index: number) => {
    onChange({
      ...data,
      details: data.details.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold mb-2" style={{ color: '#a0a0a0' }}>詳細（任意）</h4>
        {data.details.map((row, index) => (
          <DetailRow
            key={index}
            row={row}
            onChange={(updatedRow) => updateDetailRow(index, updatedRow)}
            onDelete={() => deleteDetailRow(index)}
            rowIndex={index}
            namePlaceholder="例: AAPL, 7203"
          />
        ))}

        {data.details.length < 20 && (
          <button
            type="button"
            onClick={addDetailRow}
            className="mt-2 px-4 py-2 rounded-full transition-colors text-sm font-medium"
            style={{ background: 'linear-gradient(135deg, #2db8f9 0%, #aa30ff 100%)', color: '#ffffff' }}
          >
            + 詳細行を追加
          </button>
        )}
        {data.details.length >= 20 && (
          <p className="mt-2 text-sm" style={{ color: '#666666' }}>
            最大20行まで追加できます
          </p>
        )}
      </div>
    </div>
  );
}
