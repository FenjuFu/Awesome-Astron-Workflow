import React from 'react';

interface MarkdownContentProps {
  content?: string;
  className?: string;
}

const IMAGE_MARKDOWN_REGEX = /!\[([^\]]*)\]\s*\(([^)]+)\)/g;
const DATA_IMAGE_URL_REGEX = /^data:image\/[a-zA-Z0-9.+-]+;base64,[a-zA-Z0-9+/=]+$/;

const isSafeImageUrl = (rawUrl: string) => {
  const url = rawUrl.trim();
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') || DATA_IMAGE_URL_REGEX.test(url);
};

const renderMarkdownLine = (line: string, lineIndex: number) => {
  const nodes: React.ReactNode[] = [];
  const imageRegex = new RegExp(IMAGE_MARKDOWN_REGEX);
  let lastIndex = 0;
  let match = imageRegex.exec(line);

  while (match) {
    const [raw, alt, url] = match;
    const startIndex = match.index;

    if (startIndex > lastIndex) {
      nodes.push(
        <span key={`text-${lineIndex}-${lastIndex}`}>{line.slice(lastIndex, startIndex)}</span>,
      );
    }

    if (isSafeImageUrl(url)) {
      nodes.push(
        <img
          key={`image-${lineIndex}-${startIndex}`}
          src={url.trim()}
          alt={alt || 'image'}
          className="my-3 max-w-full rounded-md border border-gray-200"
          loading="lazy"
        />,
      );
    } else {
      nodes.push(<span key={`raw-${lineIndex}-${startIndex}`}>{raw}</span>);
    }

    lastIndex = startIndex + raw.length;
    match = imageRegex.exec(line);
  }

  if (lastIndex < line.length) {
    nodes.push(<span key={`text-${lineIndex}-tail`}>{line.slice(lastIndex)}</span>);
  }

  if (!nodes.length) {
    return <br key={`line-break-${lineIndex}`} />;
  }

  return (
    <React.Fragment key={`line-${lineIndex}`}>
      {nodes}
      <br />
    </React.Fragment>
  );
};

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className }) => {
  if (!content) {
    return null;
  }

  const normalizedContent = content.replace(/\]\s*\n\s*\(/g, '](');
  const lines = normalizedContent.split('\n');

  return <div className={className}>{lines.map((line, lineIndex) => renderMarkdownLine(line, lineIndex))}</div>;
};

export default MarkdownContent;
