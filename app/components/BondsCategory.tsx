"use client";

import { BondsData, BondDetail } from "@/types/portfolio";
import DetailRow from "./DetailRow";
import { useTheme, getThemeStyles } from "./ThemeContext";

interface BondsCategoryProps {
  data: BondsData;
  onChange: (data: BondsData) => void;
}

export default function BondsCategory({ data, onChange }: BondsCategoryProps) {
  const theme = useTheme();
  const s = getThemeStyles(theme);

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

  const updateDetailRow = (index: number, row: BondDetail) => {
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
        <h4 className="text-sm font-semibold mb-2" style={s.labelColor}>詳細（任意）</h4>
        {data.details.map((row, index) => (
          <DetailRow
            key={index}
            row={row}
            onChange={(updatedRow) => updateDetailRow(index, updatedRow)}
            onDelete={() => deleteDetailRow(index)}
            rowIndex={index}
            namePlaceholder="例: 米国債10年, 日本国債, 社債（トヨタ）"
          />
        ))}

        {data.details.length < 20 && (
          <button
            type="button"
            onClick={addDetailRow}
            className="mt-2 px-4 py-2 rounded-full transition-colors text-sm font-medium"
            style={s.addBtnBg}
          >
            + 銘柄・商品名を追加
          </button>
        )}
        {data.details.length >= 20 && (
          <p className="mt-2 text-sm" style={s.maxTextColor}>
            最大20行まで追加できます
          </p>
        )}
      </div>
    </div>
  );
}
