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
            showName={false}
            categorySpecificFields={
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1" style={{ color: '#a0a0a0' }}>
                  種類（任意）
                </label>
                <select
                  value={row.commodityType || ""}
                  onChange={(e) =>
                    updateDetailRow(index, {
                      ...row,
                      commodityType: e.target.value as
                        | "GOLD"
                        | "SILVER"
                        | "PLATINUM"
                        | "OTHER"
                        | undefined,
                    })
                  }
                  className="w-full px-3 py-2 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                  style={{ background: '#2a2a2a', border: '1px solid #4a4a4a', color: row.commodityType ? 'white' : '#9ca3af' }}
                >
                  <option value="" style={{ background: '#2a2a2a', color: '#9ca3af' }}>選択してください</option>
                  <option value="GOLD" style={{ background: '#2a2a2a', color: 'white' }}>金</option>
                  <option value="SILVER" style={{ background: '#2a2a2a', color: 'white' }}>銀</option>
                  <option value="PLATINUM" style={{ background: '#2a2a2a', color: 'white' }}>プラチナ</option>
                  <option value="OTHER" style={{ background: '#2a2a2a', color: 'white' }}>その他</option>
                </select>
              </div>
            }
          />
        ))}

        {data.details.length < 20 && (
          <button
            type="button"
            onClick={addDetailRow}
            className="mt-2 px-4 py-2 rounded-[2px] transition-colors text-sm font-medium"
            style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)', color: '#1a1a1a' }}
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
