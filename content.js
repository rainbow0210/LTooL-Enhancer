/* Coding by Gemini 2.5 pro */
/**
 * Scrapboxの `[...]` の中身を解析して適切なHTML要素を返します。
 * (Scrapbox内部リンクとYouTubeリンクは、processNodeで先に処理される前提)
 * @param {string} content - `[` と `]` の中身のテキスト。
 * @returns {Node | null} - 変換後のDOMノード（要素またはフラグメント）、またはnull。
 */
function parseScrapboxBracket(content) {
    content = content.trim();
    const imgRegex = /^(https?:\/\/[^\s]+\.(?:png|jpe?g|gif|webp|svg))$/i;
    const urlRegex = /https?:\/\/[^\s<>\]]+/;
    const decorationRegex = /^([*\/\-]+)\s(.+)$/;
    const youtubeRegex = /^(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11}))$/;

    // 1. YouTubeチェック ([URL] 形式のみ)
    let match = content.match(youtubeRegex);
    if (match) {
        const videoId = match[2];
        const div = document.createElement('div');
        div.className = 'youtube-embed-container';
        div.style.textAlign = 'center';
        div.style.margin = '1em 0';
        const iframe = document.createElement('iframe');
        iframe.style.width = '80vw'; iframe.style.maxWidth = '800px';
        iframe.style.aspectRatio = '16 / 9'; iframe.style.border = 'none';
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.title = "YouTube video player";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        div.appendChild(iframe);
        return div;
    }
    
    // 2. 文字修飾チェック
    match = content.match(decorationRegex);
    if (match) {
        const symbols = match[1];
        const text = match[2];
        const span = document.createElement('span');
        span.appendChild(document.createTextNode(text));
        
        const stars = (symbols.match(/\*/g) || []).length;
        const slashes = (symbols.match(/\//g) || []).length;
        const hyphens = (symbols.match(/-/g) || []).length;

        if (stars > 0) span.classList.add(`scrapbox-bold-${Math.min(stars, 4)}`);
        if (slashes > 0) span.classList.add('scrapbox-italic');
        if (hyphens > 0) span.classList.add('scrapbox-strike');
        
        return span;
    }

    const parts = content.split(/\s+/);
    const urls = parts.filter(p => p.match(urlRegex));
    const imgs = urls.filter(u => u.match(imgRegex));
    const links = urls.filter(u => !u.match(imgRegex) && !u.match(youtubeRegex));
    const names = parts.filter(p => !p.match(urlRegex));

    // 3. 画像チェック
    if (imgs.length > 0) {
        const img = document.createElement('img');
        img.src = imgs[0];
        img.alt = content;
        img.className = 'scrapbox-image';

        if (links.length > 0) { // 画像 + リンク
            const a = document.createElement('a');
            a.href = links[0];
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.appendChild(img);
            return a;
        } else { // 画像のみ
            return img;
        }
    }

    // 4. リンクチェック
    if (links.length === 1) {
        const a = document.createElement('a');
        a.href = links[0];
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'scrapbox-link';
        const linkName = names.join(' ') || links[0];
        a.appendChild(document.createTextNode(linkName));
        return a;
    }
    
    // 5. ハッシュタグ
    if (parts.length >= 1 && !urlRegex.test(content) && !content.startsWith('/') && !content.match(decorationRegex)) {
        const a = document.createElement('a');
        a.href = `#${encodeURIComponent(content)}`;
        a.className = 'scrapbox-hashtag';
        a.onclick = (e) => e.preventDefault();
        a.appendChild(document.createTextNode(`[${content}]`));
        return a;
    }

    // 6. どれにも当てはまらない場合は、元のテキストを [ ] 付きで返す
    return document.createTextNode(`[${content}]`);
}


/**
 * 指定されたノード内のテキストを処理し、URL/YouTube/Scrapbox記法を変換します。
 * @param {Node} node - 処理対象のDOMノード。
 */
function processNode(node) {
  const excludedTags = ['A', 'IFRAME', 'SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE', 'B', 'I', 'S'];

  if (node.nodeType === Node.ELEMENT_NODE) {
    if (excludedTags.includes(node.nodeName.toUpperCase()) || node.classList.contains('youtube-embed-container')) {
      return;
    }
    Array.from(node.childNodes).forEach(processNode);
    return;
  }

  if (node.nodeType !== Node.TEXT_NODE || !node.isConnected) {
    return;
  }

  const text = node.nodeValue;
  const parent = node.parentNode;

  if (!parent || excludedTags.includes(parent.nodeName.toUpperCase())) {
    return;
  }

  // --- 正規表現の定義 ---
  const sbInternalLink = '(\\[\\/([^\/\\s\\]]+)\\/(.+?)\\])'; // 1(Full), 2(Proj), 3(Page)
  const youtube = '(https?:\\/\\/(?:www\\.)?(?:youtube\\.com\\/(?:watch\\?v=|embed\\/|v\\/)|youtu\\.be\\/)([a-zA-Z0-9_-]{11}))'; // 4(Full), 5(ID)
  const code = '(`[^`]+`)'; // 6(Full), 7(Content: `含む) -> `([^`]+)` に修正 6(Full), 7(Content: `含まない)
  const bracket = '(\\[([^\\]]+)\\])'; // 8(Full), 9(Content)
  const url = '(https?:\\/\\/[^\\s<>]+)'; // 10(Full)

  const code_fixed = '`([^`]+)`'; // 6(Full), 7(Content)
  const bracket_fixed = '\\[([^\\]]+)\\]'; // 8(Full), 9(Content)


  const combinedRegex = new RegExp(
      `${sbInternalLink}|` + // 1, 2, 3
      `(${youtube})|` +   // 4(Full), 5(URL), 6(ID)
      `(${code_fixed})|` +  // 7(Full), 8(Content)
      `(${bracket_fixed})|` +// 9(Full), 10(Content)
      `(${url})`,        // 11(Full)
      'g'
  );

  let lastIndex = 0;
  let match;
  const fragment = document.createDocumentFragment();
  let changed = false;

  while ((match = combinedRegex.exec(text)) !== null) {
      // --- マッチしたグループを取得 ---
      const sbInternalLinkFull = match[1];
      const sbProj = match[2];
      const sbPage = match[3];
      const ytFull = match[4]; 
      const videoId = match[6]; 
      const codeFull = match[7];
      const codeContent = match[8];
      const bracketFull = match[9];
      const bracketContent = match[10];
      const urlMatch = match[11];

      // マッチ前テキストを追加
      fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      let element = null;

      // ★ 判定順序: SB内部リンク -> YouTube -> Code -> Bracket -> URL
      if (sbProj) { // Scrapbox内部リンク
          const proj = encodeURIComponent(sbProj);
          const page = encodeURIComponent(sbPage).replace(/%20/g, '_');
          element = document.createElement('a');
          element.href = `https://scrapbox.io/${proj}/${page}`;
          element.target = '_blank';
          element.rel = 'noopener noreferrer';
          element.className = 'scrapbox-link'; // ★ 通常リンクと同じクラスに変更
          element.appendChild(document.createTextNode(`/${sbProj}/${sbPage}`)); // ★ 表示テキスト変更
      } else if (videoId) { // YouTube
          const div = document.createElement('div');
          div.className = 'youtube-embed-container';
          div.style.textAlign = 'center';
          div.style.margin = '1em 0';
          const iframe = document.createElement('iframe');
          iframe.style.width = '80vw'; iframe.style.maxWidth = '800px';
          iframe.style.aspectRatio = '16 / 9'; iframe.style.border = 'none';
          iframe.src = `https://www.youtube.com/embed/${videoId}`;
          iframe.title = "YouTube video player";
          iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
          iframe.allowFullscreen = true;
          div.appendChild(iframe);
          element = div;
      } else if (codeContent) { // Code
          element = document.createElement('code');
          element.className = 'scrapbox-code';
          element.appendChild(document.createTextNode(codeContent)); // ★ codeContent を使う
      } else if (bracketContent) { // [...]
          element = parseScrapboxBracket(bracketContent);
      } else if (urlMatch) { // URL
          if (urlMatch.match(/youtube\.com|youtu\.be/)) {
              element = document.createTextNode(urlMatch);
          } else {
              let cleanUrl = urlMatch;
              const trailingChars = /[.,;:!?)」』。]$/;
              let trailingPart = '';
              if (trailingChars.test(cleanUrl) && !cleanUrl.endsWith('://')) {
                  trailingPart = cleanUrl.slice(-1);
                  cleanUrl = cleanUrl.slice(0, -1);
              }
              element = document.createElement('a');
              element.href = cleanUrl;
              element.target = '_blank';
              element.rel = 'noopener noreferrer';
              element.className = 'scrapbox-link';
              element.appendChild(document.createTextNode(cleanUrl));
              if (trailingPart) {
                  const linkFragment = document.createDocumentFragment();
                  linkFragment.appendChild(element);
                  linkFragment.appendChild(document.createTextNode(trailingPart));
                  element = linkFragment;
              }
          }
      }

      if (element) {
          fragment.appendChild(element);
          changed = true;
      } else if(match[0]) {
          fragment.appendChild(document.createTextNode(match[0]));
      }
      
      lastIndex = combinedRegex.lastIndex;
  }

  if (changed) {
    const remainingText = text.slice(lastIndex);
    if (remainingText) {
        fragment.appendChild(document.createTextNode(remainingText));
    }
    if (parent && node.parentNode === parent) {
        parent.replaceChild(fragment, node);
    }
  }
}

/**
 * DOMの変更を監視し、新しいノードが追加/変更されたら処理を実行します。
 */
function observeDOMChanges() {
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(addedNode => {
            processNode(addedNode);
        });
      } else if (mutation.type === 'characterData') {
          processNode(mutation.target);
      }
    }
  });

  observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      characterData: true
  });
}

// ページ読み込み完了時の処理
window.addEventListener('load', () => {
    setTimeout(() => {
        console.log("LTool Enhancer (v1.2): Processing initial content...");
        processNode(document.body);
        console.log("LTool Enhancer (v1.2): Starting DOM observer...");
        observeDOMChanges();
        console.log("LTool Enhancer (v1.2): Ready.");
    }, 500);
});