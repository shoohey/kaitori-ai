import { NotificationPayload } from "@/types";

export function buildNotificationEmail(payload: NotificationPayload): string {
  const propertyRows = payload.properties
    .map(
      (prop) => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px;">
          ${prop.sourceUrl ? `<a href="${prop.sourceUrl}" style="color: #2563eb; text-decoration: none;">${escapeHtml(prop.title)}</a>` : escapeHtml(prop.title)}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; text-align: right; white-space: nowrap;">
          ${prop.price ? `${formatPrice(prop.price)}万円` : "-"}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px;">
          ${prop.area ? escapeHtml(prop.area) : "-"}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; text-align: right; white-space: nowrap;">
          ${Math.round(prop.totalScore * 100)}%
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; text-align: center;">
          ${prop.sourceUrl ? `<a href="${prop.sourceUrl}" style="color: #2563eb; text-decoration: none;">詳細</a>` : "-"}
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1e40af; padding: 24px 32px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">
                買取AI 新着マッチ物件
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">条件名</p>
              <p style="margin: 0 0 24px 0; font-size: 18px; font-weight: 600; color: #111827;">
                ${escapeHtml(payload.conditionName)}
              </p>

              <p style="margin: 0 0 16px 0; font-size: 14px; color: #374151;">
                ${payload.properties.length}件の新着マッチ物件が見つかりました。
              </p>

              <!-- Properties Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 6px; border-collapse: collapse; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">物件名</th>
                    <th style="padding: 12px 16px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">価格</th>
                    <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">エリア</th>
                    <th style="padding: 12px 16px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">スコア</th>
                    <th style="padding: 12px 16px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">リンク</th>
                  </tr>
                </thead>
                <tbody>
                  ${propertyRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 32px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                このメールは買取AIから自動送信されています
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatPrice(priceInYen: number): string {
  const inMan = Math.round(priceInYen / 10000);
  return inMan.toLocaleString();
}
