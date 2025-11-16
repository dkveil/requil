/**
 * CSS Reset inspired by Tailwind for better email client compatibility
 * This reset ensures consistent rendering across different email clients
 */
export function getCssReset(): string {
	return `
  /* CSS Reset inspired by Tailwind for better email client compatibility */
  body { margin: 0; padding: 0; }
  * { box-sizing: border-box; }
  p, h1, h2, h3, h4, h5, h6 { margin: 0; }
  blockquote { margin: 0; padding: 0; }
  ul, ol { margin: 0; padding: 0; list-style-position: inside; }
  a { color: inherit; text-decoration: none; }
  img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; max-width: 100%; }
  table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
`.trim();
}
