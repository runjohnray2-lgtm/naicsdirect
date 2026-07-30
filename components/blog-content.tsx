import type { BlogBlock } from "@/lib/blog-posts"

function renderInline(text: string) {
  // Minimal **bold** support without pulling in a markdown dependency.
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export function BlogContent({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={i} className="text-2xl font-bold text-white pt-4">
                {block.text}
              </h2>
            )
          case "h3":
            return (
              <h3 key={i} className="text-xl font-bold text-white pt-2">
                {block.text}
              </h3>
            )
          case "p":
            return (
              <p key={i} className="text-slate-300 leading-relaxed">
                {renderInline(block.text)}
              </p>
            )
          case "ul":
            return (
              <ul key={i} className="space-y-2 list-disc list-outside pl-5">
                {block.items.map((item, j) => (
                  <li key={j} className="text-slate-300 leading-relaxed">
                    {renderInline(item)}
                  </li>
                ))}
              </ul>
            )
          case "ol":
            return (
              <ol key={i} className="space-y-3 list-decimal list-outside pl-5">
                {block.items.map((item, j) => (
                  <li key={j} className="text-slate-300 leading-relaxed">
                    {renderInline(item)}
                  </li>
                ))}
              </ol>
            )
          case "callout":
            return (
              <div
                key={i}
                className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 text-amber-200 leading-relaxed"
              >
                {renderInline(block.text)}
              </div>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
