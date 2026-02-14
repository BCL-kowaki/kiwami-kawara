"use client";

import { FundsData, FundDetail } from "@/types/portfolio";
import DetailRow from "./DetailRow";

interface FundsCategoryProps {
  data: FundsData;
  onChange: (data: FundsData) => void;
}

export default function FundsCategory({ data, onChange }: FundsCategoryProps) {
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

  const updateDetailRow = (index: number, row: FundDetail) => {
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
            namePlaceholder="例: VTI, VT, eMAXIS Slim 全世界株式"
          />
        ))}

        {data.details.length < 20 && (
          <button
            type="button"
            onClick={addDetailRow}
            className="mt-2 px-4 py-2 rounded-full transition-colors text-sm font-medium"
            style={{ background: 'linear-gradient(135deg, #2db8f9 0%, #aa30ff 100%)', color: '#ffffff' }}
          >
            + 銘柄・商品名を追加
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
