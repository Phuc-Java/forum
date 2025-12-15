"use client";
import React, {
  useState,
  useEffect,
  Children,
  cloneElement,
  isValidElement,
  memo,
  useCallback,
  ReactNode,
  ReactElement,
} from "react";
import {
  Monitor,
  Code as CodeIcon,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

// --- Types ---
interface TabData {
  id: number;
  title: string;
  icon: ReactNode;
  content: ReactElement;
}

interface CodeTabsProps {
  children: ReactNode;
  showReset?: boolean;
  onReset?: () => void;
}

interface PreviewProps {
  title?: string;
  children: ReactNode;
  isActive?: boolean;
}

interface CodeViewProps {
  title?: string;
  lang?: string;
  children: string;
  isActive?: boolean;
}

interface HtmlRendererProps {
  htmlContent: string;
}

interface HeaderProps {
  tabs: TabData[];
  activeTabId: number;
  onTabClick: (id: number) => void;
  onReset?: () => void;
  showReset?: boolean;
}

interface TabProps {
  id: number;
  icon: ReactNode;
  text: string;
  active: boolean;
  onClick: (id: number) => void;
}

interface CodeEditorProps {
  codeString: string;
  language: string;
}

interface HtmlCodeTabsProps {
  htmlContent: string;
  title?: string;
  fileName?: string;
  className?: string;
  previewComponent?: ReactNode;
  activeID: string;
}

// --- Main Component ---
export default function HtmlCodeTabs({
  htmlContent,
  title = "Demo",
  fileName = "index.html",
  className = "",
  previewComponent,
  activeID,
}: HtmlCodeTabsProps) {
  const [showReact, setShowReact] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.data &&
        typeof event.data === "object" &&
        event.data.type === "EXPLORE_CLICKED" &&
        event.data.id === activeID
      ) {
        setShowReact(true);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [activeID]);

  return (
    <div
      className={`font-sans w-full max-w-none p-2 sm:p-4 lg:p-8 ${className}`}
    >
      <CodeTabs onReset={() => setShowReact(false)} showReset={showReact}>
        <Preview title={title}>
          {showReact && previewComponent ? (
            // --- FIX SCROLLBAR ---
            // Thêm [&_::-webkit-scrollbar]:hidden để ẩn luôn scrollbar của các phần tử con
            <div className="w-full h-full flex items-center justify-center bg-[#0d1117] animate-in fade-in duration-500 overflow-auto [&::-webkit-scrollbar]:hidden [&_::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&_*]:[scrollbar-width:none]">
              {previewComponent}
            </div>
          ) : (
            <HtmlRenderer htmlContent={htmlContent} />
          )}
        </Preview>
        <Code title={fileName} lang="html">
          {htmlContent}
        </Code>
      </CodeTabs>
    </div>
  );
}

// --- CodeTabs Container ---
const CodeTabs = ({ children, onReset, showReset }: CodeTabsProps) => {
  const [activeTabId, setActiveTabId] = useState<number>(1);

  const handleTabClick = useCallback((id: number) => {
    setActiveTabId(id);
  }, []);

  const tabs = Children.map(children, (child, index) => {
    if (isValidElement(child)) {
      const childProps = child.props as { title?: string };
      return {
        id: index + 1,
        title: childProps.title || (child.type === Preview ? "Demo" : "Code"),
        icon:
          child.type === Preview ? (
            <Monitor size={14} />
          ) : (
            <CodeIcon size={14} />
          ),
        content: child,
      };
    }
    return null;
  })?.filter(Boolean) as TabData[];

  return (
    <div className="w-full max-w-7xl mx-auto rounded-xl shadow-2xl border overflow-hidden bg-white dark:bg-[#161b22] border-gray-200 dark:border-gray-800">
      <Header
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={handleTabClick}
        onReset={onReset}
        showReset={showReset}
      />
      <div className="h-[500px] lg:h-[600px] overflow-hidden bg-gray-50 dark:bg-[#0d1117] relative">
        {tabs.map((tab) =>
          cloneElement(tab.content, {
            key: tab.id,
            isActive: tab.id === activeTabId,
          } as { key: number; isActive: boolean })
        )}
      </div>
    </div>
  );
};

const Preview = memo(function Preview({ children, isActive }: PreviewProps) {
  return (
    <div
      className={`h-full w-full overflow-hidden relative ${
        !isActive ? "hidden" : ""
      }`}
    >
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
});

const CodeView = memo(function CodeView({
  children,
  lang,
  isActive,
}: CodeViewProps) {
  if (!isActive) return null;
  return <CodeEditor codeString={children} language={lang || "html"} />;
});
const Code = CodeView;

// --- HTML RENDERER ---
const HtmlRenderer = memo(function HtmlRenderer({
  htmlContent,
}: HtmlRendererProps) {
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  }, [htmlContent]);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  // --- STYLE ẨN SCROLLBAR CHO IFRAME ---
  const iframeSrcDoc = `
    <!DOCTYPE html>
    <html class="h-full dark">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <script>tailwind.config = { darkMode: 'class' }</script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
          html, body { 
            font-family: 'Inter', sans-serif;
            margin: 0; padding: 0;
            min-height: 100vh;
            background-color: #0d1117;
            color: white;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          ::-webkit-scrollbar {
            display: none;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `;

  return (
    <div className="h-full relative w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0d1117] z-10">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-5 h-5 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-sm">Initializing virtual DOM...</span>
          </div>
        </div>
      )}
      <iframe
        key={iframeKey}
        srcDoc={iframeSrcDoc}
        title="Demo Preview"
        sandbox="allow-scripts allow-modals allow-same-origin"
        className="w-full h-full border-0"
        onLoad={handleIframeLoad}
      />
    </div>
  );
});

// --- HEADER ---
const Header = memo(function Header({
  tabs,
  activeTabId,
  onTabClick,
  onReset,
  showReset,
}: HeaderProps) {
  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800 bg-gray-100/60 dark:bg-[#21262d]/60 backdrop-blur-sm">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 flex-shrink-0 px-2 opacity-80 hover:opacity-100 transition-opacity">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></span>
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></span>
          <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></span>
        </div>
        <div className="flex items-center ml-2 sm:ml-4 gap-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              id={tab.id}
              icon={tab.icon}
              text={tab.title}
              active={tab.id === activeTabId}
              onClick={onTabClick}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {showReset && onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 rounded-md hover:bg-cyan-400/20 transition-all"
          >
            <RotateCcw size={12} />
            <span>Reset View</span>
          </button>
        )}
        <a
          href="#"
          className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-xs text-gray-500 hover:text-white transition-colors"
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
});

const Tab = memo(function Tab({ id, icon, text, active, onClick }: TabProps) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
        active
          ? "bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-200 shadow-sm border border-gray-200 dark:border-gray-700"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
      }`}
    >
      {icon} <span>{text}</span>
    </button>
  );
});

// --- CODE EDITOR ---
const CodeEditor = memo(function CodeEditor({
  codeString,
  language,
}: CodeEditorProps) {
  // Giữ nguyên scrollbar đẹp cho phần Code Editor
  const customScrollStyle = `
    .refined-scroll::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    .refined-scroll::-webkit-scrollbar-track {
      background: #0d1117;
    }
    .refined-scroll::-webkit-scrollbar-thumb {
      background-color: #30363d;
      border: 2px solid #0d1117;
      border-radius: 999px;
    }
    .refined-scroll::-webkit-scrollbar-thumb:hover {
      background-color: #484f58;
    }
    .refined-scroll {
      scrollbar-width: thin;
      scrollbar-color: #30363d #0d1117;
    }
  `;

  return (
    <>
      <style>{customScrollStyle}</style>
      <div className="refined-scroll w-full h-full overflow-auto bg-[#0d1117] text-gray-300 relative">
        <div className="p-6 min-w-max">
          <pre
            className="font-mono text-[13px] leading-6"
            style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
          >
            <code>{codeString}</code>
          </pre>
        </div>
      </div>
    </>
  );
});
