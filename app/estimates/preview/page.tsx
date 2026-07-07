"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/AppShell";
import { ChevronLeft, Printer, Mail, Save } from "lucide-react";
import { StoredEstimate, saveEstimate } from "@/lib/estimateStorage";
import { CompanyInfo, getCompanyInfo } from "@/lib/companyStorage";

export default function EstimatePreviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [estimate, setEstimate] = useState<StoredEstimate | null>(null);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    const draft = localStorage.getItem("estimate_draft");
    if (draft) setEstimate(JSON.parse(draft));
    else router.replace("/estimates/new");
    setCompany(getCompanyInfo());
  }, [user, router]);

  if (!estimate) return null;

  const handleSave = () => {
    saveEstimate({ ...estimate, status: "未確定" });
    localStorage.removeItem("estimate_draft");
    setSaved(true);
    setTimeout(() => router.push("/estimates"), 800);
  };

  const emailBody = encodeURIComponent(
    `${estimate.customerName} 御中\n\nいつもお世話になっております。\n見積書をお送りいたします。\n\n【見積番号】${estimate.no}\n【件名】${estimate.name}\n【見積金額】¥${estimate.total.toLocaleString()}（税込）\n【見積日】${estimate.date}\n\nご確認のほど、よろしくお願いいたします。`
  );
  const mailtoLink = `mailto:${estimate.customerEmail}?subject=${encodeURIComponent(`見積書送付のご連絡【${estimate.no}】${estimate.name}`)}&body=${emailBody}`;

  const discount = estimate.discount ?? 0;
  const rawSubtotal = estimate.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  return (
    <>
      <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>
      <AppShell>
        <div className="px-6 py-8 max-w-3xl mx-auto">
          <div className="no-print flex items-center justify-between mb-6">
            <button onClick={() => router.back()} className="flex items-center gap-1 text-blue-600 hover:underline">
              <ChevronLeft size={18} />戻る
            </button>
            <div className="flex gap-2">
              <button onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
                <Printer size={16} />印刷・PDF
              </button>
              <a href={mailtoLink}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
                <Mail size={16} />メール送信
              </a>
              <button onClick={handleSave} disabled={saved}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-green-500 text-white text-sm font-medium rounded-xl transition-colors">
                <Save size={16} />{saved ? "保存済み" : "保存"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800 tracking-widest">見　積　書</h1>
            </div>

            <div className="flex justify-between mb-8">
              <div>
                <p className="text-lg font-semibold text-gray-800 border-b-2 border-gray-800 pb-1 mb-1">
                  {estimate.customerName} 御中
                </p>
                <p className="text-xs text-gray-400">メール: {estimate.customerEmail}</p>
              </div>
              <div className="text-right text-sm text-gray-600 space-y-1">
                <p>見積番号: <span className="font-medium">{estimate.no}</span></p>
                <p>見積日: <span className="font-medium">{estimate.date}</span></p>
                {estimate.validityDays && (
                  <p>有効期間: <span className="font-medium">{estimate.validityDays}日間</span></p>
                )}
                {estimate.paymentMethod && (
                  <p>お支払方法: <span className="font-medium">{estimate.paymentMethod}</span></p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">件名</p>
              <p className="text-lg font-semibold text-gray-800">{estimate.name}</p>
            </div>

            <table className="w-full mb-6 text-sm">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">品目</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600 w-16">数量</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-600 w-14">単位</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600 w-28">単価</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600 w-28">金額</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {estimate.items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-3 px-4 text-gray-800">{item.description}</td>
                    <td className="py-3 px-4 text-right text-gray-600">{item.quantity}</td>
                    <td className="py-3 px-2 text-center text-gray-500 text-xs">{item.unit ?? "式"}</td>
                    <td className="py-3 px-4 text-right text-gray-600">¥{item.unitPrice.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-800">
                      ¥{(item.quantity * item.unitPrice).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-6">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>小計</span><span>¥{rawSubtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>出精値引き</span><span>- ¥{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>消費税（10%）</span><span>¥{estimate.taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-800 text-base pt-2 border-t-2 border-gray-800">
                  <span>合計金額</span><span>¥{estimate.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {estimate.notes && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-600 mb-1">備考</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{estimate.notes}</p>
              </div>
            )}

            {/* Company Info */}
            {company && (company.name || company.tel) && (
              <div className="mt-6 pt-4 border-t border-gray-100 text-right text-xs text-gray-500 space-y-0.5">
                {company.name && <p className="font-medium text-gray-700 text-sm">{company.name}</p>}
                {company.address && <p>{company.address}</p>}
                {company.tel && <p>TEL: {company.tel}{company.fax ? `　FAX: ${company.fax}` : ""}</p>}
                {company.email && <p>{company.email}</p>}
                {company.personInCharge && <p>担当: {company.personInCharge}</p>}
              </div>
            )}
          </div>

          <div className="no-print mt-4 bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 text-sm text-blue-700">
            <p className="font-medium mb-0.5">メール送信について</p>
            <p className="text-xs text-blue-600">
              「メール送信」ボタンを押すと、{estimate.customerName}（{estimate.customerEmail}）宛のメールが自動作成されます。印刷/PDFで見積書をPDF保存してから添付してください。
            </p>
          </div>
        </div>
      </AppShell>
    </>
  );
}
