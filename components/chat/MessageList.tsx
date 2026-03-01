"use client";

import { useTranslations } from "next-intl";
import { MessageBubble } from "./MessageBubble";

export function MessageList() {
  const t = useTranslations("chat");
  const messages = [
    {
      id: "1",
      content: t("message1Content"),
      sender: "Marcus Chen",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD_MupO0T-LVQSQWPF2S3Om_hBOKQdyjKo1wiZptsDQjYTnkoHbvRrzBX8NlaCBIUFMlQRtqKirLigM5rC7UGubrJTFl5igL8TlbIL70ErsIZbgxIYkXW-nmu07RFrcBhyUJ0OfgcjWW20kHudzE7JnUJR2BSopqUAnDjZN-oTanUtcgtfyTkEAffEX2_xzZ-AZTgw_pF1VKlz0ddysFnLbZpLrMZd74nuGiRwXH0Gi77JliV4-Ru6Q97GI5jHipn85L2-_uTUmvnU",
      isOwn: false,
    },
    {
      id: "2",
      content: t("message2Content"),
      sender: t("you"),
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCzycphTgA6oThAOkTbMV-PSuMrZASmVHMuU9TiI4CD2C-CaJoCIysm-0uUkCCL9CGnGNI1dcBfouvscpXI1nYrAzIalyjEmpXra41apx8DXHgSzbAaH4PE0zUGxu1SJlHka_FN7RFsyfxjgCvDsHLtgc-JeLjU2_6lTBb88M1uSudfmt0i8rRApKl_AyYlGf8ThzQy3D9Gmso0WPyiXK9FkjVR5fF-ZCZg9Xm1fKmXeRH0RwoH82s-hDfrleKSrJVC1z23pCxeUD4",
      isOwn: true,
      time: "14:21",
      read: true,
    },
    {
      id: "3",
      content: t("message3Content"),
      sender: "Marcus Chen",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD7e5i3i8_oweUCe6WpJNMZvE7udzIyYdgZ_Kre627rB268staRqYJwFfJvqgoLh_Ka4d-J-_EeEIQkhjaLLB1JQIKJw3dGdSUjHp8yfNF3IjAoLduHrr_yoBAu6Z8c07Czr8dJuwrVNwBqxlanAhhiYLLRNx8lOrZ0XIcqhVenlwu14DHvJwAtSjxj437I-Ggy9L3XdvW2RQu-XH2N4GNTqXIVdiHc-tjnUSzRUPImdoedavEVBPGEztGyXuHz7rGzqNV3QWBGIOk",
      isOwn: false,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar min-h-0">
      <div className="flex justify-center">
        <div className="bg-slate-200/50 dark:bg-slate-800/50 px-3 py-1 rounded-full text-[10px] font-medium text-slate-500 uppercase tracking-widest">
          {t("today")}
        </div>
      </div>
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          content={msg.content}
          sender={msg.sender}
          avatar={msg.avatar}
          isOwn={msg.isOwn}
          time={msg.time}
          read={msg.read}
        />
      ))}
    </div>
  );
}
