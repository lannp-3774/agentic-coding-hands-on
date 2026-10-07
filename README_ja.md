# Agentic Coding Hands-on

[![Vietnamese](https://img.shields.io/badge/Vietnamese-green.svg)](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/blob/main/README.md) [![Japanese](https://img.shields.io/badge/Japanese-yellow.svg)](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/blob/main/README_ja.md) [![English](https://img.shields.io/badge/English-blue.svg)](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/blob/main/README_en.md)

Sun\* 社内向け **Agentic Coding** ハンズオン研修用リポジトリです。受講者は **MoMorph + Claude Code** を使用して、Figma デザインからコードを生成します。Claude Code 以外にも、**Copilot**、**Gemini**、**Windsurf** などの AI コーディングエージェントも同様の手順で使用できます。本ハンズオンでは、**Claude Code** を使用することを前提としています。

## ブランチ

このリポジトリには以下のブランチがあります:

- [**`main`**](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/tree/main) — ドキュメントと Supabase 設定のみ。受講者はこのブランチをクローンし、自分でプロジェクト（Next.js、Android、React Native、iOS など）を初期化して作業します。
- [**`web-sample`**](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/tree/web-sample) — Web（Next.js）のサンプルリファレンス。いくつかの画面のサンプルスペックと生成済みコードが含まれた `.claude`、`.vscode`、`.momorph` ディレクトリが事前に用意されています。入力コンテキストや MoMorph の出力結果を確認する際に使用してください。

## 前提条件

- Git
- Docker（Supabase のローカル実行に必要）
- [GitHub CLI](https://cli.github.com/)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- [VSCode](https://code.visualstudio.com/) + MoMorph Extension — Figma フレーム一覧の表示やプロンプトの素早いコピーに使用します。メインの IDE（Android Studio、Xcode）が MoMorph Extension をサポートしていないモバイル開発者にとって特に便利です。

### 推奨技術スタック

技術スタックに制限はありません。お好みのフレームワークや言語を自由にご利用いただけます。ただし、MoMorph で最良の体験を得るために、以下のスタックを推奨します:

- **バックエンド（共通）:** [Supabase](https://supabase.com/) — データベース、認証、リアルタイム機能を提供する Backend-as-a-Service（BaaS）プラットフォーム
- **Web:** Next.js + Cloudflare Workers + TailwindCSS + Supabase
- **Android:** Kotlin + Jetpack Compose + Supabase
- **iOS:** Swift + SwiftUI + Supabase
- **React Native:** React Native + Expo + Supabase

## ハンズオン手順

### ステップ 0: GitHub SSO を実施する

1. https://github.com/orgs/sun-asterisk-internal/sso にアクセスします
2. SSO サインインを完了し、あなたの GitHub アカウントが `sun-asterisk-internal` organization に参加できる状態にします

### ステップ 1: プロジェクトの初期化

選択したプラットフォームに応じた適切なツールで新しいプロジェクトを作成します:

```sh
# Web (Next.js):
npx create-next-app@latest my-app
cd my-app

# Android:
# Android Studio を開く → New Project → 新しいプロジェクトを作成

# React Native (Expo):
npx create-expo-app my-app
cd my-app

# iOS (Swift):
# Xcode を開く → Create New Project → 新しいプロジェクトを作成
```

初期化完了後、以下のように git remote を設定します:

```sh
git init    # プロジェクトに git がまだない場合

# origin: あなた個人のフォーク（<your-username> をあなたの GitHub ユーザー名に置き換えてください）
git remote add origin git@github.com:<your-username>/agentic-coding-hands-on.git

# upstream: ハンズオン用の元リポジトリ
git remote add upstream git@github.com:sun-asterisk-internal/agentic-coding-hands-on.git
```

`git remote -v` で確認すると、以下のようになっていれば正しいです:

```
origin    git@github.com:<your-username>/agentic-coding-hands-on.git (fetch)
origin    git@github.com:<your-username>/agentic-coding-hands-on.git (push)
upstream  git@github.com:sun-asterisk-internal/agentic-coding-hands-on.git (fetch)
upstream  git@github.com:sun-asterisk-internal/agentic-coding-hands-on.git (push)
```

> **なぜ remote を設定するのか？** MoMorph VSCode Extension がリポジトリを識別し、連携済みの Figma ファイルを表示するために必要です。`upstream` を `sun-asterisk-internal/agentic-coding-hands-on` に向けることで MoMorph が正しく動作し、`origin` は個人のフォークに向けることで自分のコードを push できます。

### ステップ 2: MoMorph Web へのサインインと GitHub アカウントの連携

> **注意:** この MoMorph 演習はすでに `sun-asterisk-internal/agentic-coding-hands-on` リポジトリと連携されています。個人の GitHub アカウントを MoMorph に連携するだけで使用できます。ステップ 4 では、**Select Repository** フィールドが空に見えても絶対に更新しないでください。変更すると他のメンバーが演習にアクセスできなくなります。

1. [MoMorph Web](https://momorph.ai/) にアクセスし、Figma アカウント（`*@sun-asterisk.com` メール）でサインインします。
2. 次の Figma ファイルリンクを入力して続行します: https://www.figma.com/design/9ypp4enmFmdK3YAFJLIu6C/SAA-2025---Internal-Live-Coding
3. 次のステップに進む前に、自分の GitHub アカウントが `sun-asterisk-internal` organization のメンバーであること（[ステップ 0](#ステップ-0-github-sso-を実施する) の結果）を再確認してください。まだメンバーでない場合は、Infra に organization への参加をリクエストしてください。
4. MoMorph で **Settings → GitHub → Connect** を開き、GitHub アカウントを MoMorph に連携します。**Select Repository フィールドは絶対に更新しないでください**。

> **重要:** `sun-asterisk-internal` organization のメンバーでない場合、**MoMorph MCP にアクセスできず** Spec/デザインデータを取得できません。また、後続のステップで **MoMorph VSCode Extension 上の Figma データも表示されません**。次に進む前にこのステップを必ず完了してください。
>
> 連携が成功した後、MoMorph Web の **Settings ページをリフレッシュ** すると、**Select Repository** フィールドに `sun-asterisk-internal/agentic-coding-hands-on` が表示され、**disable** 状態になっているのが確認できます。これは正しい・通常の状態です。

### ステップ 3: GitHub CLI のインストールとサインイン

以下のいずれかの方法を選択してインストールしてください:

```sh
# macOS / Linux (Homebrew):
brew install gh

# Windows (winget):
winget install --id GitHub.cli

# Linux (Debian/Ubuntu):
sudo apt install gh

# Windows / macOS / Linux (Conda):
conda install gh --channel conda-forge
```

インストールの確認:

```sh
gh --version
```

GitHub CLI にサインイン:

```sh
gh auth login
```

CLI のガイダンスに従い、`GitHub.com` を選択、`HTTPS` または `SSH` プロトコルを選択し、ブラウザで認証を完了してください。

認証状態の確認:

```sh
gh auth status
```

### ステップ 4: Takumi CLI のインストール

npm 経由で Takumi CLI をインストール:

```sh
npm install -g @sunasteriskrnd/takumi
```

期待される出力:

```
Installed takumi@0.1.0
```

現在のプロジェクトで Takumi を初期化:

```sh
tkm init
```

期待される出力:

```
Initialized — 16 agents, 75+ skills ready
```

環境を検証:

```sh
tkm doctor
```

期待される出力:

```
All checks passed
```

### ステップ 5: MCP サーバーの登録

Claude Code に 2 つの MCP サーバーを登録します: **MoMorph**（Takumi が MCP 経由でスペックとデザインにアクセスするため）と **Playwright**（視覚検証 / UI テスト時のブラウザ自動化のため）:

```sh
claude mcp add --transport http momorph https://mcp.momorph.ai/mcp --header "x-github-token: $(gh auth token)"
claude mcp add playwright npx @playwright/mcp@latest
```

> **注意:** `momorph` MCP サーバーのコマンドは、ステップ 3 でログインした GitHub トークンを取得するために `gh auth token` を使用します。GitHub CLI のサインインが成功していない場合、このコマンドは失敗します。

### ステップ 6: MoMorph VSCode Extension のインストール

`resources/` ディレクトリに含まれる VSIX ファイルから MoMorph VSCode Extension をインストールしてください:

```sh
code --install-extension resources/vscode-momorph-0.13.0.vsix
```

インストール後、VSCode でリポジトリのソースコードを開き → コマンドパレットを開く（macOS は `Cmd+Shift+P`、Windows/Linux は `Ctrl+Shift+P`）→ **「MoMorph: Sign In」** コマンドを実行 → サイドバーの MoMorph アイコンをクリック → 連携済み Figma ファイルのフレーム一覧が表示されます。

> 詳細なガイドはこちらを参照してください: https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F094K2LTV71?focus_section_id=temp:C:USe2e5a076e79fd458c9b713260c

### ステップ 7: MoMorph VSCode Extension を使用する

MoMorph VSCode Extension は連携済み Figma ファイルの Figma Tree を表示します。これにより、開発中にフレーム情報（リンク、ID、プロンプトなど）を簡単に参照・取得できます。

Figma Tree を見やすくするために、実習しているプラットフォームでフィルタリングしてください:

1. コマンドパレットを開く: `Ctrl+Shift+P`（Windows/Linux）または `Cmd+Shift+P`（macOS）
2. 実行: **MoMorph: Filter Screens**
3. Filter by: **Figma Pages**
   - **モバイル**（Android / iOS / React Native）の場合: **「Mobile」**を選択
   - **Web** の場合: **「Website」**を選択
4. Filter by: **Spec Status** → **「Done」**を選択

これにより、Figma Tree が現在のプラットフォームでスペックが完成した画面のみを表示するようになり、ワークフローがより迅速で集中的になります。

> **ヒント:** Figma Tree では、`Cmd`（macOS）/ `Ctrl`（Windows/Linux）を押しながら各画面を左クリックすることで複数の画面を同時に選択できます。その後、右クリック → **Copy Screen Information** を選択すると、選択したすべての画面の情報を一度にコピーできます。複数の画面のコードを同時に生成したいときに非常に便利です。

### ステップ 8: コード生成の開始

Figma プロジェクトを使って実践します:

**Figma ファイル:** [SAA 2025 - Internal Live Coding](https://www.figma.com/design/9ypp4enmFmdK3YAFJLIu6C/SAA-2025---Internal-Live-Coding)

#### コンテキストの準備: MoMorph Web での Screen Spec 作成

通常、コード生成を開始する前に MoMorph 上で *Screen Specifications* を準備する必要があります。Screen Specifications は手動で記述するか、MoMorph Web の機能、MoMorph Figma Plugin（Figma Account - Full Seat が必要）、または MoMorph MCP Server に接続した Agent システム（GitHub Copilot、Claude Code）を通じて AI によって生成することができます。

サーバー上の Screen Spec は、コード生成ワークフロー全体における信頼できる唯一の情報源（Source of Truth）です。

> **このハンズオンに関する注意:** 全画面の Screen Spec はすでに MoMorph サーバーに用意されているため、**Screen Spec を新たに作成する必要はなく**、**Takumi Agent Kit を使ったコード生成ワークフローに直接進むことができます**。ただし、MoMorph での Screen Spec 作成プロセスについてさらに深く探求することをお勧めします。
> - Screen Spec の作成方法の詳細については、[MoMorph Figma Plugin](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F07S87PSVUN) ドキュメントを参照してください。

#### Takumi Agent Kit でのコード生成ワークフロー

Takumi Agent Kit は、MoMorph MCP と統合されたスラッシュコマンドとエージェントスキルを提供し、Figma デザインからコードを生成します。目的と機能の複雑さに応じて、以下の **4 つのシナリオ** から選んでください。

##### Scenario 1: Simple or medium feature

*スコープが明確で、作業時間は数分から 1〜2 日、コーディング前にプランをレビューする必要なし。*

`/tkm:takumi` を 1 つまたは複数の MoMorph Screen URL とともに実行します。Takumi は MoMorph MCP を通じて Spec とテストケースを読み込み、不明点を明確化したうえで、プロジェクトの既存パターンに沿ったコードを記述します — UI は Figma に合わせ、バックエンドは並行して進行します。コードレビュアーが自動的に起動します。**1 コマンド、1 PR。**

```
/tkm:takumi <MoMorph Screen URLs>
```

例:

```
/tkm:takumi Implement the login page (/login), use Supabase local project:
https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
```

##### Scenario 2: Complex feature

*新しいサブシステム、複雑なインタラクションを持つ複数の画面、コアインフラに影響するビジネスロジック — コーディング前にスコープレビューが必要、複数日の作業。*

`/tkm:create-plan` を MoMorph Screen URL とともに実行し、機能を具体的な受け入れ基準を持つ複数のフェーズに分解します。プランをレビューし、必要に応じて調整した後、`/tkm:takumi path/to/plan.md` がチェックポイント付きで各フェーズを実行します。先にプランを立てることで、スコープを揃え、途中で方向性が誤るのを防げます — 特に複数人で協業する場合や、コアインフラに触れる機能で必要です。

```
/tkm:create-plan <MoMorph Screen URLs>
/tkm:takumi [plan]
```

例:

```
/tkm:create-plan Implement admin dashboard with RBAC, user management, and audit logs, use Supabase local project:
1. Dashboard: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/K3mF2nLpQ7
2. UsersList: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/RxV8aBcD2e
3. UserDetail: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/H4nMpL6vWq
```

```
/tkm:takumi plans/260512-1030-admin-dashboard/plan.md
```

##### Scenario 3: UI only from design

*Figma デザインを UI コンポーネントに変換するだけでよい — バックエンドなし、ビジネスロジックなし。*

完全な Takumi パイプラインをスキップし、`/momorph-implement-design` スキルを直接呼び出します。このスキルは MoMorph MCP を通じて画面を読み込み、デザインから正確なビジュアル値を抽出（推測なし）、デザインそのものから取得したモックデータで UI コンポーネントを生成し、Figma リファレンスに対する視覚検証ループを出力が一致するまで実行します。純粋に視覚的なものが目的の場合の最速ルートです。

```
/momorph-implement-design <MoMorph Screen URLs>
```

例:

```
/momorph-implement-design Build the login page UI from design:
https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
```

##### Scenario 4: Fix a bug on a screen

*画面の現在のコードにバグがある — UI が間違っている、ロジックに不具合、バリデーション漏れ、または MoMorph 上のデザイン/Spec/テストケースが更新されたがコードが追いついていない。*

`/tkm:fix-bug` をバグの説明と MoMorph Screen URL とともに実行します。このスキルは現在のコードに加えてデザイン、Spec、テストケースを取得し、それらを diff してコードが信頼できる情報源から逸脱した正確な箇所を特定します。根本原因が `file:line` 付きで明らかになり、最小限のパッチとして修正が適用され、関連する Spec とテストケースが再実行されてからコミットされます。

```
/tkm:fix-bug <bug description> <MoMorph Screen URL>
```

例:

```
/tkm:fix-bug The login button does not submit the form when Enter is pressed, and the validation message disappears after the user edits the input:
https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
```

## 参考資料

- [Takumi Agent Kit](https://takumi.sun-asterisk.ai/)
- [Takumi — Working with MoMorph](https://takumi.sun-asterisk.ai/docs/use-cases/momorph-codegen/)
- [GitHub CLI Installation](https://github.com/cli/cli#installation)
- [MoMorph MCP Server](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F0A9HULD5D0)
- [MoMorph VSCode Extension](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F094K2LTV71)
- [MoMorph Web](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F092SAQBXR8)
- [MoMorph Figma Plugin](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F07S87PSVUN)
