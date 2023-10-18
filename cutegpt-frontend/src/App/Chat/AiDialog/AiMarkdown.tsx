import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Markdown.css';
import {DetailedHTMLProps, HTMLAttributes} from "react";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, vs, materialLight, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';


export default function AiMarkdown(props: AiMarkdownProps): JSX.Element {

  const source = oneLight
  const myCodeTheme = {
    ...source,
    'code[class*="language-"]': {
      ...source['code[class*="language-"]'],
      background: '#fdfaff',
      border: 'none',
    },
    'pre[class*="language-"]': {
      ...source['pre[class*="language-"]'],
      background: '#fdfaff',
      border: 'none',
    }
  };

  // 设置css light主题
  return <ReactMarkdown
    className="markdown-body"
    remarkPlugins={[[remarkGfm, {singleTilde: false}]]}
    rehypePlugins={[rehypeRaw]}
    components={{
      code({ node, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '');
        return match ? (
          // @ts-ignore
          <SyntaxHighlighter
            style={myCodeTheme as any}
            language={match[1]}
            PreTag="div"
            children={String(children).replace(/\n$/, '')}
            {...props}
          />
        ) : (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
    }}
  >{props.children as string}</ReactMarkdown>

}

export interface AiMarkdownProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
}
