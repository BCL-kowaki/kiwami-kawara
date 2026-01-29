"use client";

import { CommoditiesData, CommodityDetail } from "@/types/portfolio";
import DetailRow from "./DetailRow";

interface CommoditiesCategoryProps {
  data: CommoditiesData;
  onChange: (data: CommoditiesData) => void;
}

export default function CommoditiesCategory({
  data,
  onChange,
}: CommoditiesCategoryProps) {
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

  const updateDetailRow = (index: number, row: CommodityDetail) => {
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
            showName={true}
            nameLabel="種類（例：金、銀、プラチナ）"
            namePlaceholder="例：金、銀、プラチナ"
          />
        ))}

        {data.details.length < 20 && (
          <button
            type="button"
            onClick={addDetailRow}
            className="mt-2 px-4 py-2 rounded-[2px] transition-colors text-sm font-medium"
            style={{ background: 'linear-gradient(135deg, #1be7f5 0%, #2483f8 100%)', color: '#ffffff' }}
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
