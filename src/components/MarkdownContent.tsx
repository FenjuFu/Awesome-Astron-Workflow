import React from 'react';

interface MarkdownContentProps {
  content?: string;
  className?: string;
}

const DATA_IMAGE_URL_REGEX = /^data:image\/[a-zA-Z0-9.+-]+;base64,[a-zA-Z0-9+/=]+$/;

const isSafeImageUrl = (rawUrl: string) => {
  const url = rawUrl.trim();
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') || DATA_IMAGE_URL_REGEX.test(url);
};

const splitTableCells = (line: string) => {
  const normalized = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return normalized.split('|').map((cell) => cell.trim());
};

const isMarkdownTableSeparator = (line: string) => {
  const cells = splitTableCells(line);
  if (!cells.length) return false;
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell));
};

const isPotentialTableRow = (line: string) => {
  const trimmed = line.trim();
  if (!trimmed || !trimmed.includes('|')) return false;
  return splitTableCells(trimmed).length > 1;
};

const renderInlineMarkdown = (text: string, keyPrefix: string): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];

  const tokenRegex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))|(!\[([^\]]*)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match = tokenRegex.exec(text);

  while (match) {
    const raw = match[0];
    const start = match.index;

    if (start > lastIndex) {
      nodes.push(<React.Fragment key={`${keyPrefix}-text-${lastIndex}`}>{text.slice(lastIndex, start)}</React.Fragment>);
    }

    if (match[10] !== undefined && match[12] !== undefined) {
      const alt = match[11] || 'image';
      const imageUrl = match[12].trim();

      nodes.push(
        isSafeImageUrl(imageUrl) ? (
          <img
            key={`${keyPrefix}-img-${start}`}
            src={imageUrl}
            alt={alt}
            className="my-3 max-w-full rounded-md border border-gray-200"
            loading="lazy"
          />
        ) : (
          <React.Fragment key={`${keyPrefix}-raw-${start}`}>{raw}</React.Fragment>
        ),
      );
    } else if (match[7] !== undefined && match[8] !== undefined && match[9] !== undefined) {
      const label = match[8];
      const url = match[9].trim();

      nodes.push(
        /^https?:\/\//.test(url) || url.startsWith('/') ? (
          <a
            key={`${keyPrefix}-link-${start}`}
            href={url}
            className="text-blue-600 hover:text-blue-700 underline"
            target="_blank"
            rel="noreferrer"
          >
            {label}
          </a>
        ) : (
          <React.Fragment key={`${keyPrefix}-raw-${start}`}>{raw}</React.Fragment>
        ),
      );
    } else if (match[5] !== undefined) {
      nodes.push(
        <code key={`${keyPrefix}-code-${start}`} className="px-1 py-0.5 rounded bg-gray-100 text-gray-800">
          {match[5]}
        </code>,
      );
    } else if (match[1] !== undefined) {
      nodes.push(
        <strong key={`${keyPrefix}-bold-${start}`} className="font-semibold">
          {match[2]}
        </strong>,
      );
    } else if (match[3] !== undefined) {
      nodes.push(
        <em key={`${keyPrefix}-italic-${start}`} className="italic">
          {match[4]}
        </em>,
      );
    } else {
      nodes.push(<React.Fragment key={`${keyPrefix}-raw-${start}`}>{raw}</React.Fragment>);
    }

    lastIndex = start + raw.length;
    match = tokenRegex.exec(text);
  }

  if (lastIndex < text.length) {
    nodes.push(<React.Fragment key={`${keyPrefix}-tail`}>{text.slice(lastIndex)}</React.Fragment>);
  }

  return nodes.length ? nodes : [<React.Fragment key={`${keyPrefix}-empty`}>{text}</React.Fragment>];
};

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className }) => {
  if (!content) {
    return null;
  }

  const lines = content.replace(/\]\s*\n\s*\(/g, '](').split('\n');
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (index: number) => {
    if (!listItems.length) return;
    blocks.push(
      <ul key={`list-${index}`} className="list-disc pl-5 space-y-1 my-2">
        {listItems.map((item, i) => (
          <li key={`list-item-${index}-${i}`}>{renderInlineMarkdown(item, `list-${index}-${i}`)}</li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex].trimEnd();
    const trimmed = line.trim();

    const listMatch = /^[-*+]\s+(.+)$/.exec(trimmed);
    if (listMatch) {
      listItems.push(listMatch[1]);
      continue;
    }

    flushList(lineIndex);

    if (!trimmed) {
      blocks.push(<div key={`spacer-${lineIndex}`} className="h-2" />);
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const headingClassNames = ['text-2xl font-bold', 'text-xl font-bold', 'text-lg font-semibold', 'text-base font-semibold', 'text-sm font-semibold', 'text-sm font-medium'];
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      blocks.push(
        <Tag key={`h-${lineIndex}`} className={`${headingClassNames[level - 1]} mt-3 mb-2`}>
          {renderInlineMarkdown(text, `h-${lineIndex}`)}
        </Tag>,
      );
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      blocks.push(<hr key={`hr-${lineIndex}`} className="my-3 border-gray-200" />);
      continue;
    }

    if (isPotentialTableRow(trimmed) && lineIndex + 1 < lines.length && isMarkdownTableSeparator(lines[lineIndex + 1].trim())) {
      const headerCells = splitTableCells(trimmed);
      const bodyRows: string[][] = [];

      lineIndex += 2;

      while (lineIndex < lines.length && isPotentialTableRow(lines[lineIndex])) {
        bodyRows.push(splitTableCells(lines[lineIndex]));
        lineIndex += 1;
      }

      lineIndex -= 1;

      blocks.push(
        <div key={`table-wrap-${lineIndex}`} className="my-3 overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {headerCells.map((cell, cellIndex) => (
                  <th key={`th-${lineIndex}-${cellIndex}`} className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">
                    {renderInlineMarkdown(cell, `th-${lineIndex}-${cellIndex}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, rowIndex) => (
                <tr key={`tr-${lineIndex}-${rowIndex}`} className="odd:bg-white even:bg-gray-50/40">
                  {headerCells.map((_, cellIndex) => (
                    <td key={`td-${lineIndex}-${rowIndex}-${cellIndex}`} className="border border-gray-200 px-3 py-2 align-top text-gray-700">
                      {renderInlineMarkdown(row[cellIndex] || '', `td-${lineIndex}-${rowIndex}-${cellIndex}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (trimmed.startsWith('>')) {
      const quoteText = trimmed.replace(/^>\s?/, '');
      blocks.push(
        <blockquote key={`q-${lineIndex}`} className="border-l-4 border-gray-300 pl-3 text-gray-600 my-2">
          {renderInlineMarkdown(quoteText, `q-${lineIndex}`)}
        </blockquote>,
      );
      continue;
    }

    blocks.push(
      <p key={`p-${lineIndex}`} className="my-1 leading-7">
        {renderInlineMarkdown(line, `p-${lineIndex}`)}
      </p>,
    );
  }

  flushList(lines.length);

  return <div className={className}>{blocks}</div>;
};

export default MarkdownContent;
