import 'dotenv/config';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export type OrderConfirmationItemPayload = {
  readonly skuId?: number | null;
  readonly name: string;
  readonly quantity: number;
  readonly unitPrice: string;
  readonly netAmount: string;
};

export type OrderConfirmationEmailPayload = {
  readonly orderCode: string;
  readonly receiverName: string;
  readonly receiverEmail: string;
  readonly receiverPhone: string;
  readonly fulfillmentMethod: 'PICKUP' | 'DELIVERY' | string;
  readonly deliveryAddress?: string | null;
  readonly branchName?: string | null;
  readonly branchAddress?: string | null;
  readonly paymentMethod: 'QR' | 'COD' | string;
  readonly grandTotal: string;
  readonly items: readonly OrderConfirmationItemPayload[];
  readonly lookupUrl?: string;
};

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpSecure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465' || smtpPort === 465;
const smtpUser = process.env.SMTP_USER || '';
const rawSmtpPass = process.env.STMP_PASS || process.env.SMTP_PASS || '';
const smtpPass = rawSmtpPass.trim();

const mailFrom = smtpUser ? `"EL-TECH PC Store" <${smtpUser}>` : '"EL-TECH PC Store" <noreply@eltech.vn>';
const frontendBaseUrl = process.env.FRONTEND_URL || process.env.APP_BASE_URL || 'http://localhost:4200';

let transporterInstance: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!smtpUser || !smtpPass) {
    return null;
  }

  if (!transporterInstance) {
    transporterInstance = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
  }

  return transporterInstance;
}

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatVnd(amount: string | number): string {
  const numeric = typeof amount === 'string' ? Number(amount) : amount;
  if (Number.isNaN(numeric)) {
    return '0 VND';
  }
  return `${numeric.toLocaleString('vi-VN')} VND`;
}

function formatFulfillmentMethod(method: string): string {
  if (method === 'PICKUP') {
    return 'Nhan tai showroom';
  }
  if (method === 'DELIVERY') {
    return 'Giao hang tan noi';
  }
  return method;
}

function formatPaymentMethod(method: string): string {
  if (method === 'QR') {
    return 'Chuyen khoan qua ma VietQR';
  }
  if (method === 'COD') {
    return 'Thanh toan khi nhan hang (COD)';
  }
  return method;
}

export async function verifyMailerConnection(): Promise<boolean> {
  const mailer = getTransporter();
  if (!mailer) {
    console.error('Cau hinh SMTP_USER hoac STMP_PASS chua duoc thiet lap.');
    return false;
  }
  try {
    await mailer.verify();
    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Loi ket noi SMTP';
    console.error('Kiem tra ket noi SMTP that bai:', message);
    return false;
  }
}

export async function sendLookupOtpEmail(toEmail: string, otp: string): Promise<boolean> {
  const mailer = getTransporter();
  if (!mailer) {
    console.error('Khong the gui OTP tra cuu: Cau hinh SMTP chua hoan tat.');
    return false;
  }

  const recipient = toEmail.trim().toLowerCase();
  const subject = `[EL-TECH] Ma xac thuc tra cuu don hang: ${otp}`;

  const textContent = [
    'EL-TECH PC STORE - HE THONG LINH KIEN VA MAY TINH CHUYEN NGHIEP',
    '',
    'Kinh chao quy khach,',
    '',
    'Quy khach vua yeu cau ma xac thuc (OTP) de tra cuu don hang tren he thong EL-TECH PC Store.',
    `Ma xac thuc cua quy khach la: ${otp}`,
    '',
    'Luu y quan trong:',
    '- Ma xac thuc co hieu luc trong vong 5 phut ke tu thoi diem nhan thu.',
    '- Vi ly do an toan thong tin, tuyet doi khong chia se ma xac thuc nay cho bat ky ai, ke ca nhan vien ho tro.',
    '- Neu quy khach khong thuc hien yeu cau nay, vui long bo qua email nay.',
    '',
    'Doi ngu Cham soc Khach hang EL-TECH PC Store',
    'Website: ' + frontendBaseUrl,
  ].join('\n');

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ma xac thuc tra cuu don hang</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="background-color: #0f172a; padding: 24px 32px; text-align: center;">
              <h1 style="margin: 0; color: #38bdf8; font-size: 24px; font-weight: 800; letter-spacing: 1px;">EL-TECH PC STORE</h1>
              <p style="margin: 4px 0 0; color: #94a3b8; font-size: 13px;">Chuyen gia linh kien va may tinh cao cap</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 32px 24px;">
              <h2 style="margin: 0 0 16px; color: #0f172a; font-size: 20px; font-weight: 700;">Xac thuc tra cuu don hang</h2>
              <p style="margin: 0 0 16px; font-size: 15px; color: #334155;">Kinh chao quy khach,</p>
              <p style="margin: 0 0 24px; font-size: 15px; color: #334155;">
                Quy khach vua yeu cau ma xac thuc (OTP) de tra cuu thong tin don hang tai he thong EL-TECH PC Store. Vui long su dung ma ben duoi de tiep tuc:
              </p>
              <div style="background-color: #f0fdf4; border: 2px dashed #16a34a; border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 24px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #15803d; display: inline-block;">
                  ${otp}
                </span>
              </div>
              <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 14px 16px; border-radius: 4px; margin: 0 0 24px;">
                <p style="margin: 0 0 6px; font-size: 13px; font-weight: 600; color: #0f172a;">Luu y bao mat:</p>
                <p style="margin: 0 0 4px; font-size: 13px; color: #475569;">- Ma xac thuc co hieu luc trong vong <strong>5 phut</strong> ke tu thoi diem gui.</p>
                <p style="margin: 0; font-size: 13px; color: #475569;">- Tuyet doi <strong>khong chia se</strong> ma nay cho bat ky ai nham bao ve quyen rieng tu cua don hang.</p>
              </div>
              <p style="margin: 0; font-size: 14px; color: #64748b;">
                Neu quy khach khong thuc hien yeu cau nay, vui long bo qua email hoac lien he doi ngu ho tro cua chung toi de duoc ho tro.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #0f172a;">EL-TECH PC Store Support Team</p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">Email nay duoc gui tu he thong tu dong. Vui long khong phan hoi truc tiep.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    await mailer.sendMail({
      from: mailFrom,
      to: recipient,
      subject,
      text: textContent,
      html: htmlContent,
    });
    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Loi gui thu qua SMTP';
    console.error(`Gui email OTP tra cuu that bai toi ${recipient}:`, message);
    return false;
  }
}

export async function sendOrderConfirmationEmail(payload: OrderConfirmationEmailPayload): Promise<boolean> {
  const mailer = getTransporter();
  if (!mailer) {
    console.error('Khong the gui email xac nhan don hang: Cau hinh SMTP chua hoan tat.');
    return false;
  }

  const recipient = payload.receiverEmail.trim().toLowerCase();
  const subject = `[EL-TECH] Xac nhan don hang #${payload.orderCode} - Dat hang thanh cong`;

  const fulfillmentText = formatFulfillmentMethod(payload.fulfillmentMethod);
  const paymentText = formatPaymentMethod(payload.paymentMethod);
  const destinationAddress =
    payload.fulfillmentMethod === 'PICKUP'
      ? payload.branchAddress || payload.branchName || 'Showroom EL-TECH'
      : payload.deliveryAddress || 'Dia chi giao hang theo ho so';

  const lookupLink = payload.lookupUrl || `${frontendBaseUrl}/tra-cuu-don?code=${encodeURIComponent(payload.orderCode)}`;

  const itemRowsText = payload.items
    .map((item) => `- ${item.name} x${item.quantity}: ${formatVnd(item.netAmount)}`)
    .join('\n');

  const textContent = [
    'EL-TECH PC STORE - XAC NHAN DAT HANG THANH CONG',
    '',
    `Kinh chao quy khach ${payload.receiverName},`,
    '',
    `Cam on quy khach da tin tuong va dat hang tai EL-TECH PC Store. Don hang #${payload.orderCode} cua quy khach da duoc ghi nhan vao he thong.`,
    '',
    'THONG TIN DON HANG:',
    `- Ma don hang: #${payload.orderCode}`,
    `- Nguoi nhan: ${payload.receiverName}`,
    `- So dien thoai: ${payload.receiverPhone}`,
    `- Email: ${payload.receiverEmail}`,
    `- Hinh thuc: ${fulfillmentText}`,
    `- Dia diem: ${destinationAddress}`,
    `- Thanh toan: ${paymentText}`,
    `- Tong thanh toan: ${formatVnd(payload.grandTotal)}`,
    '',
    'DANH SACH SAN PHAM:',
    itemRowsText,
    '',
    `Tra cuu don hang truc tuyen: ${lookupLink}`,
    '',
    'Doi ngu EL-TECH PC Store',
    'Website: ' + frontendBaseUrl,
  ].join('\n');

  const itemRowsHtml = payload.items
    .map(
      (item) => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 8px; font-size: 14px; color: #1e293b; font-weight: 500;">
            ${escapeHtml(item.name)}
          </td>
          <td style="padding: 12px 8px; font-size: 14px; color: #475569; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 12px 8px; font-size: 14px; color: #475569; text-align: right;">
            ${formatVnd(item.unitPrice)}
          </td>
          <td style="padding: 12px 8px; font-size: 14px; color: #0f172a; font-weight: 600; text-align: right;">
            ${formatVnd(item.netAmount)}
          </td>
        </tr>
      `,
    )
    .join('');

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xac nhan don hang</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 640px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="background-color: #0f172a; padding: 24px 32px; text-align: center;">
              <h1 style="margin: 0; color: #38bdf8; font-size: 24px; font-weight: 800; letter-spacing: 1px;">EL-TECH PC STORE</h1>
              <p style="margin: 4px 0 0; color: #94a3b8; font-size: 13px;">Chuyen gia linh kien va may tinh cao cap</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 8px; color: #0f172a; font-size: 20px; font-weight: 700;">Dat hang thanh cong!</h2>
              <p style="margin: 0 0 20px; font-size: 15px; color: #475569;">
                Kinh chao <strong>${escapeHtml(payload.receiverName)}</strong>, don hang <strong>#${escapeHtml(payload.orderCode)}</strong> cua quy khach da duoc he thong ghi nhan thanh cong.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 0 0 24px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #64748b; width: 35%;">Ma don hang:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 700;">#${escapeHtml(payload.orderCode)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #64748b;">Nguoi nhan:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 500;">${escapeHtml(payload.receiverName)} (${escapeHtml(payload.receiverPhone)})</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #64748b;">Hinh thuc:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 500;">${escapeHtml(fulfillmentText)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #64748b;">Dia diem:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 500;">${escapeHtml(destinationAddress)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #64748b;">Thanh toan:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 500;">${escapeHtml(paymentText)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #64748b;">Tong thanh toan:</td>
                  <td style="padding: 6px 0; font-size: 16px; color: #0284c7; font-weight: 800;">${formatVnd(payload.grandTotal)}</td>
                </tr>
              </table>

              <h3 style="margin: 0 0 12px; color: #0f172a; font-size: 16px; font-weight: 700;">Chi tiet san pham</h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 24px; border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 2px solid #e2e8f0; background-color: #f8fafc;">
                    <th style="padding: 10px 8px; font-size: 13px; font-weight: 600; color: #475569; text-align: left;">San pham</th>
                    <th style="padding: 10px 8px; font-size: 13px; font-weight: 600; color: #475569; text-align: center; width: 60px;">SL</th>
                    <th style="padding: 10px 8px; font-size: 13px; font-weight: 600; color: #475569; text-align: right; width: 100px;">Don gia</th>
                    <th style="padding: 10px 8px; font-size: 13px; font-weight: 600; color: #475569; text-align: right; width: 120px;">Thanh tien</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRowsHtml}
                </tbody>
                <tfoot>
                  <tr style="border-top: 2px solid #0f172a;">
                    <td colspan="3" style="padding: 14px 8px; font-size: 15px; font-weight: 700; color: #0f172a; text-align: right;">
                      Tong thanh toan:
                    </td>
                    <td style="padding: 14px 8px; font-size: 16px; font-weight: 800; color: #0284c7; text-align: right;">
                      ${formatVnd(payload.grandTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div style="text-align: center; margin: 0 0 24px;">
                <a href="${lookupLink}" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 15px; font-weight: 700; letter-spacing: 0.5px;">
                  Tra cuu trang thai don hang
                </a>
              </div>

              <div style="background-color: #f8fafc; border-radius: 6px; padding: 14px 16px; font-size: 13px; color: #64748b;">
                <p style="margin: 0 0 4px; font-weight: 600; color: #334155;">Luu y tiep theo:</p>
                <p style="margin: 0 0 4px;">- Don hang thanh toan VietQR se tu dong chuyen sang trang thai da xac nhan khi he thong ghi nhan thanh toan.</p>
                <p style="margin: 0;">- Don hang COD se duoc doi ngu EL-TECH kiem tra va xac nhan som nhat de tien hanh dong goi.</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #0f172a;">EL-TECH PC Store</p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">Cam on quy khach da dong hanh cung EL-TECH PC Store.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    await mailer.sendMail({
      from: mailFrom,
      to: recipient,
      subject,
      text: textContent,
      html: htmlContent,
    });
    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Loi gui thu qua SMTP';
    console.error(`Gui email xac nhan don hang that bai toi ${recipient}:`, message);
    return false;
  }
}
