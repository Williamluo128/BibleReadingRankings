import React, { useState } from 'react';
import { LegalBackLink, LegalLayout, LegalSection } from '@/components/LegalLayout';
import { PageShell } from '@/components/PageShell';

const FEEDBACK_EMAIL = 'feedback@biblereading.app';

export const FeedbackPage: React.FC = () => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = message.trim() || '（请在此填写您的反馈）';
    const subject = encodeURIComponent('圣经阅读排行榜 · 用户反馈');
    const encodedBody = encodeURIComponent(body);
    window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${encodedBody}`;
  };

  return (
    <LegalLayout>
      <PageShell width="narrow">
        <header className="mb-12">
          <h1 className="text-4xl font-normal text-ink mb-4 tracking-tight">意见反馈</h1>
          <p className="text-muted font-light">遇到问题或有建议？告诉我们。</p>
        </header>

        <LegalSection title="反馈内容">
          <p>可描述 bug、功能建议或体验问题。我们会认真阅读每一条反馈。</p>
        </LegalSection>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="feedback-message" className="text-label block mb-3">
              您的留言
            </label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="请尽量描述具体操作步骤或期望效果…"
              className="w-full border border-border-warm bg-surface px-4 py-3 text-ink placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-ink resize-y min-h-[144px]"
            />
          </div>
          <button type="submit" className="btn-minimal-primary">
            发送邮件反馈
          </button>
          <p className="text-xs text-muted">
            点击后将打开您的默认邮件客户端，发送至 {FEEDBACK_EMAIL}
          </p>
        </form>

        <div className="mt-12 pt-8 border-t border-border-warm">
          <LegalBackLink />
        </div>
      </PageShell>
    </LegalLayout>
  );
};
