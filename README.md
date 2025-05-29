# LTooL-Enhancer
*** Coding by Gemini 2.5 pro ***

## 概要 (Overview)

LTool Enhancer は、プレゼンテーションツール LTool ([https://ltool.gachal.net/](https://ltool.gachal.net/)) の閲覧体験を向上させるための非公式Chrome拡張機能です。
LTool上のテキストを自動的に解析し、https://www.google.com/search?q=URLのリンク化や、YouTube動画の埋め込み、Scrapbox風のテキスト装飾を適用します。

This is an unofficial Chrome extension designed to enhance the viewing experience of the presentation tool LTool ([https://ltool.gachal.net/](https://ltool.gachal.net/)).
It automatically analyzes text on LTool, linkifies https://www.google.com/search?q=URLs, embeds YouTube videos, and applies Scrapbox-like text decorations.

## 主な機能 (Features)

  * **https://www.google.com/search?q=URL自動リンク化:** テキスト内の `http://` や `https://` で始まるhttps://www.google.com/search?q=URLを自動的にクリック可能なリンクに変換します。
  * **YouTube埋め込み:** YouTubeの動画リンクを、その場で再生できる埋め込みプレイヤーに変換します。
  * **Scrapbox風テキスト装飾:** 以下のScrapbox記法を解釈し、テキストを装飾します。
      * **太字:** `[* テキスト]` ( `[** ...]` , `[*** ...]` , `[**** ...]` のレベル指定に対応)
      * **斜体:** `[/ テキスト]`
      * **打ち消し線:** `[- テキスト]`
      * **組み合わせ:** `[/* テキスト]` , `[-* テキスト]` など
      * **インラインコード:** `` `コード` ``
      * **外部リンク:** `[テキスト URL]` , `https://e-words.jp/w/%E3%83%86%E3%82%AD%E3%82%B9%E3%83%88.html` , `[URL]`
      * **Scrapbox内部リンク:** `[/プロジェクト名/ページ名]` を `https://scrapbox.io/プロジェクト名/ページ名` へのリンクに変換し、`/プロジェクト名/ページ名` と表示します。
      * **ハッシュタグ:** `[ハッシュタグ]` (特別なスタイルで表示)
      * **画像:** `[画像URL.png]` (画像をページ内に表示)
  * **スタイル維持:** テキスト装飾を適用する際、元のテキストの色を維持します（リンクとハッシュタグを除く、CSSで調整可能）。

## 対象サイト (Target Site)

  * [https://ltool.gachal.net/](https://ltool.gachal.net/)

## インストール方法 (Installation)

この拡張機能はChromeウェブストアには公開されていません。以下の手順で手動でインストールしてください。

1.  **ファイルを準備:** この拡張機能のファイル (`manifest.json`, `content.js`, `styles.css`) を1つのフォルダに保存します。
2.  **Chrome拡張機能ページを開く:** Chromeブラウザのアドレスバーに `chrome://extensions/` と入力し、拡張機能管理ページを開きます。
3.  **デベロッパーモードを有効化:** ページの右上にある「デベロッパー モード」のスイッチをオンにします。
4.  **拡張機能を読み込む:** 左上に表示される「パッケージ化されていない拡張機能を読み込む」ボタンをクリックします。
5.  **フォルダを選択:** 手順1で作成したフォルダを選択します。
6.  **インストール完了:** 拡張機能がリストに追加されれば、インストールは完了です。LTool Enhancer が有効になっていることを確認してください。

## 使い方 (Usage)

拡張機能をインストールし、有効化されていれば、`https://ltool.gachal.net/` にアクセスするだけで自動的に機能が適用されます。
LToolのテキストエリアや表示エリアに以下のScrapbox記法を使って書き込むと、リアルタイム（またはページの読み込み/更新時）にテキストが装飾されます。

### 対応Scrapbox記法 (Supported Syntax)

| 記法 (Syntax) | 説明 (Description) | 表示例 (Example) |
| :--- | :--- | :--- |
| `[* Text]` | 太字 (レベル1) | **Text** |
| `[** Text]` | 太字 (レベル2) | **Text** |
| `[*** Text]` | 太字 (レベル3) | **Text** |
| `[**** Text]` | 太字 (レベル4) | **Text** |
| `[/ Text]` | 斜体 | *Text* |
| `[- Text]` | 打ち消し線 | \~\~Text\~\~ |
| `[/* Text]` | 太字 + 斜体 | ***Text*** |
| `` `code` `` | インラインコード | `code` |
| `[Name URL]` | 外部リンク | [Name](https://www.google.com/search?q=URL) |
| `https://www.name.com/` | 外部リンク | [Name](https://www.google.com/search?q=URL) |
| `[URL]` | 外部リンク | [URL](https://www.google.com/search?q=URL) |
| `[/Proj/Page]`| Scrapbox内部リンク | /Proj/Page |
| `[Tag]` | ハッシュタグ | [Tag] |
| `[ImageURL]` | 画像表示 | (Image) |
| `YouTubeURL` | YouTube埋め込み | (Player) |

*(表示は `styles.css` の内容に依存します)*

## 注意点・制限事項 (Notes & Limitations)

  * **非公式:** この拡張機能はLToolの公式なものではありません。自己責任でご利用ください。
  * **サイト変更への影響:** LToolのウェブサイトのHTML構造や仕様が変更された場合、この拡張機能は正しく動作しなくなる可能性があります。
  * **Scrapbox記法の互換性:** Scrapboxの一部の記法（特に箇条書き、引用、テーブル、コードブロックなどのブロックレベル要素や数式）には対応していません。これらは技術的な制約から実装が困難なためです。
  * **PDF化機能:** 現在、スライドをPDFとして保存する機能は実装されていません。これは技術的なハードルが非常に高いためです。
  * **パフォーマンス:** ページのコンテンツ量によっては、若干のパフォーマンスへの影響があるかもしれません。
  * **正規表現の限界:** テキストの解析には正規表現を使用しており、非常に複雑なテキストや予期しない記法の組み合わせでは、意図通りに動作しない場合があります。

## ライセンス (License)

このプロジェクトは特定のライセンスの下では公開されていません。個人利用の範囲でご自由にお使いください。
