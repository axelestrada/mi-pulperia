/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: <explanation> */
import DOMPurify from 'dompurify'

export const HtmlMessage = ({ html }: { html: string }) => {
  const safe = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'br'],
    ALLOWED_ATTR: [],
  })

  return <div dangerouslySetInnerHTML={{ __html: safe }} />
}
