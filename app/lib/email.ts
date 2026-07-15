// メール送信ユーティリティ（Outlook / Office365 などの SMTP を利用）。
// 認証情報（SMTP_USER / SMTP_PASS）が未設定のときは、実送信せず内容をログ出力する
// ドライラン動作にフォールバックする（設定前でも機能を試せるようにするため）。
import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST ?? "smtp.office365.com";
const port = Number(process.env.SMTP_PORT ?? 587);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

// 送信元。未指定なら SMTP_USER を使う。
const from =
  process.env.SMTP_FROM ?? (user ? `業務改善提案 <${user}>` : undefined);

// 認証情報が揃っていれば実 SMTP、なければドライラン（jsonTransport）。
const isConfigured = Boolean(user && pass);

const transporter = isConfigured
  ? nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // 465=SMTPS, それ以外(587)=STARTTLS
      auth: { user, pass },
    })
  : nodemailer.createTransport({ jsonTransport: true });

export type QuestionMail = {
  to: string; // 提案者のメールアドレス
  replyTo?: string; // 返信先（質問した管理者）
  proposalTitle: string;
  proposalUrl: string;
  question: string;
  askerName: string;
};

// 提案者へ「管理者からの質問」メールを送る。
export async function sendQuestionEmail(mail: QuestionMail) {
  const subject = `【業務改善提案】ご質問：${mail.proposalTitle}`;
  const text = [
    `あなたが投稿した改善提案について、管理者（${mail.askerName}）から質問があります。`,
    "",
    `提案：${mail.proposalTitle}`,
    "",
    "----- 質問 -----",
    mail.question,
    "----------------",
    "",
    `このメールに返信するか、提案ページからご確認ください：`,
    mail.proposalUrl,
  ].join("\n");

  await transporter.sendMail({
    from,
    to: mail.to,
    replyTo: mail.replyTo,
    subject,
    text,
  });

  if (!isConfigured) {
    // ドライラン時は実際には送信していないことを警告として残す。
    console.warn(
      `[email] SMTP 未設定のため実送信していません（ドライラン）。宛先=${mail.to} 件名=${subject}。SMTP_USER / SMTP_PASS を設定すると実送信されます。`,
    );
  }

  return { sent: isConfigured };
}
