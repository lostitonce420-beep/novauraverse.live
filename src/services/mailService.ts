import { kernelStorage } from '@/kernel/kernelStorage.js';
export interface MailAccount {
  id: string;
  email: string;
  provider: 'titan' | 'gmail' | 'custom';
  smtpHost?: string;
  smtpPort?: number;
  isCompanyAccount: boolean;
}

export interface EmailMessage {
  id: string;
  accountId: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  status: 'draft' | 'sent' | 'received';
  isAgentic?: boolean; // If true, Aura sent this autonomously
  createdAt: string;
}

const STORAGE_KEYS = {
  mailAccounts: 'novaura_mail_accounts_', 
  emails: 'novaura_emails_',
};

class MailService {
  private getAccountKey(userId: string) { return `${STORAGE_KEYS.mailAccounts}${userId}`; }
  private getEmailKey(userId: string) { return `${STORAGE_KEYS.emails}${userId}`; }

  getAccounts(userId: string): MailAccount[] {
    const data = kernelStorage.getItem(this.getAccountKey(userId));
    return data ? JSON.parse(data) : [{
      id: 'acc-1',
      email: 'ambassador@novaura.life',
      provider: 'titan',
      isCompanyAccount: true
    }];
  }

  getEmails(userId: string): EmailMessage[] {
    const data = kernelStorage.getItem(this.getEmailKey(userId));
    return data ? JSON.parse(data) : [];
  }

  saveAccount(userId: string, account: MailAccount) {
    const accounts = this.getAccounts(userId);
    const existingIndex = accounts.findIndex(a => a.id === account.id);
    if (existingIndex >= 0) accounts[existingIndex] = account;
    else accounts.push(account);
    kernelStorage.setItem(this.getAccountKey(userId), JSON.stringify(accounts));
  }

  sendEmail(userId: string, email: Omit<EmailMessage, 'id' | 'createdAt'>): EmailMessage {
    const emails = this.getEmails(userId);
    const newEmail: EmailMessage = {
      ...email,
      id: `mail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    emails.push(newEmail);
    kernelStorage.setItem(this.getEmailKey(userId), JSON.stringify(emails));
    
    // In a real production app, this would call an API or SMTP relay
    console.log('EMAIL SENT:', newEmail);
    return newEmail;
  }

  // Agentic Outreach Logic
  async runOutreachChain(userId: string, accountId: string, campaignData: { targets: string[], goal: string }) {
    const account = this.getAccounts(userId).find(a => a.id === accountId);
    if (!account) throw new Error("Mail account not found");

    for (const target of campaignData.targets) {
      // Aura drafting logic would go here
      const subject = `Collaborating on ${campaignData.goal}`;
      const body = `Hello, I'm Aura, the Digital Ambassador for NovAura platfrom. We saw your impressive projects...`;
      
      this.sendEmail(userId, {
        accountId,
        from: account.email,
        to: target,
        subject,
        body,
        status: 'sent',
        isAgentic: true
      });
    }
  }
}

export const mailService = new MailService();
