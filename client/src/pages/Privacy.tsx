import React from 'react';
import { LegalBackLink, LegalLayout, LegalSection } from '@/components/LegalLayout';
import { PageShell } from '@/components/PageShell';

export const PrivacyPage: React.FC = () => (
  <LegalLayout>
    <PageShell width="narrow">
      <header className="mb-12">
        <h1 className="text-4xl font-normal text-ink mb-4 tracking-tight">隐私政策</h1>
        <p className="text-muted font-light">我们如何收集、使用与保护您的信息</p>
      </header>

      <LegalSection title="收集的信息">
        <p>为提供阅读记录与排行功能，我们会保存您的账号信息（用户名、显示名称、邮箱）以及您在应用内的圣经阅读进度与统计数据。</p>
      </LegalSection>

      <LegalSection title="信息用途">
        <p>上述数据仅用于个人进度追踪、好友与群组排行、以及改善产品体验，不会出售给第三方。</p>
      </LegalSection>

      <LegalSection title="第三方服务">
        <p>登录通过 Google 账号完成，相关认证由 Supabase 处理。使用 Google 登录时，亦受其隐私条款约束。</p>
      </LegalSection>

      <LegalSection title="数据安全">
        <p>我们采取合理的技术与管理措施保护数据。您可在设置中更新个人资料；如需删除账号或导出数据，请通过意见反馈联系我们。</p>
      </LegalSection>

      <LegalSection title="政策更新">
        <p>本政策可能随产品调整而更新，重大变更将在应用内提示。继续使用即表示您接受修订后的政策。</p>
      </LegalSection>

      <div className="mt-12 pt-8 border-t border-border-warm">
        <LegalBackLink />
      </div>
    </PageShell>
  </LegalLayout>
);
