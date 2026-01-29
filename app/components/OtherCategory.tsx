"use client";

import { OtherData, OtherDetail, OtherInvestmentType } from "@/types/portfolio";
import DetailRow from "./DetailRow";

interface OtherCategoryProps {
  data: OtherData;
  onChange: (data: OtherData) => void;
}

export default function OtherCategory({ data, onChange }: OtherCategoryProps) {
  const addDetailRow = () => {
    if (data.details.length >= 20) return;
    onChange({
      ...data,
      details: [
        ...data.details,
        { sizeMode: "percentage", investmentType: undefined, name: "", amount: undefined },
      ],
    });
  };

  const updateDetailRow = (index: number, row: OtherDetail) => {
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
            nameLabel="案件名"
            namePlaceholder="例：〇〇株式会社、△△ファンド"
            amountLabel="割合（%）"
            amountPlaceholder="例：10"
            categorySpecificFields={
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1" style={{ color: '#a0a0a0' }}>
                  投資の種類（必須）
                </label>
                <select
                  value={row.investmentType || ""}
                  onChange={(e) =>
                    updateDetailRow(index, {
                      ...row,
                      investmentType: (e.target.value || undefined) as OtherInvestmentType | undefined,
                    })
                  }
                  className="w-full px-3 py-2 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  style={{ background: '#2a2a2a', border: '1px solid #4a4a4a', color: row.investmentType ? 'white' : '#9ca3af' }}
                >
                  <option value="" style={{ background: '#2a2a2a', color: '#9ca3af' }}>選択してください</option>
                  <option value="未上場株（エンジェル投資・VC投資）" style={{ background: '#2a2a2a', color: 'white' }}>未上場株（エンジェル投資・VC投資）</option>
                  <option value="事業投資（個人出資・共同事業など）" style={{ background: '#2a2a2a', color: 'white' }}>事業投資（個人出資・共同事業など）</option>
                  <option value="私募ファンド・組合出資" style={{ background: '#2a2a2a', color: 'white' }}>私募ファンド・組合出資</option>
                  <option value="貸付・社債（個人間貸付・企業向け貸付）" style={{ background: '#2a2a2a', color: 'white' }}>貸付・社債（個人間貸付・企業向け貸付）</option>
                  <option value="持分投資・権利収入型投資" style={{ background: '#2a2a2a', color: 'white' }}>持分投資・権利収入型投資</option>
                  <option value="その他（分類が分からない投資）" style={{ background: '#2a2a2a', color: 'white' }}>その他（分類が分からない投資）</option>
                </select>
              </div>
            }
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
