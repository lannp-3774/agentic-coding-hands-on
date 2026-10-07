# Agentic Coding Hands-on

[![Vietnamese](https://img.shields.io/badge/Vietnamese-green.svg)](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/blob/main/README.md) [![Japanese](https://img.shields.io/badge/Japanese-yellow.svg)](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/blob/main/README_ja.md) [![English](https://img.shields.io/badge/English-blue.svg)](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/blob/main/README_en.md)

Repository phục vụ khóa thực hành **Agentic Coding** nội bộ Sun\*. Học viên sẽ sử dụng **MoMorph + Claude Code** để generate code từ Figma design. Ngoài Claude Code, bạn cũng có thể sử dụng các AI coding agent khác như **Copilot**, **Gemini**, **Windsurf**,... với các bước và cách dùng tương tự. Trong bài thực hành này, chúng tôi giả định bạn dùng **Claude Code**.

## Branches

Repository có các branch sau:

- [**`main`**](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/tree/main) — Tài liệu hướng dẫn và cấu hình Supabase. Học viên clone về, tự khởi tạo project (Next.js, Android, React Native, iOS...) và làm việc trên nhánh này.
- [**`web-sample`**](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/tree/web-sample) — Mẫu tham khảo cho Web (Next.js). Có sẵn các thư mục `.claude`, `.vscode`, `.momorph` chứa specs mẫu và code đã generate cho một số màn hình. Dùng để xem context đầu vào và kết quả mà MoMorph sinh ra trông như thế nào.

## Prerequisites

- Git
- Docker (để chạy Supabase local)
- [GitHub CLI](https://cli.github.com/)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- [VSCode](https://code.visualstudio.com/) + MoMorph Extension — dùng để xem Figma frame list, copy prompt nhanh. Đặc biệt hữu ích cho mobile dev khi IDE chính (Android Studio, Xcode) không hỗ trợ MoMorph Extension.

### Suggested Tech Stack

Bạn không bị giới hạn về tech stack — có thể tự do sử dụng bất kỳ framework hay ngôn ngữ nào phù hợp. Tuy nhiên, chúng tôi khuyến nghị các stack sau để có trải nghiệm tốt nhất với MoMorph:

- **Backend (chung):** [Supabase](https://supabase.com/) — Backend-as-a-Service (BaaS) cung cấp database, authentication và real-time features
- **Web:** Next.js + Cloudflare Workers + TailwindCSS + Supabase
- **Android:** Kotlin + Jetpack Compose + Supabase
- **iOS:** Swift + SwiftUI + Supabase
- **React Native:** React Native + Expo + Supabase

## Hướng dẫn thực hành

### Bước 0: Thực hiện GitHub SSO

1. Truy cập https://github.com/orgs/sun-asterisk-internal/sso
2. Hoàn tất quá trình đăng nhập SSO để tài khoản GitHub của bạn được tham gia vào organization `sun-asterisk-internal`

### Bước 1: Khởi tạo project của bạn

Tạo project mới bằng công cụ phù hợp với platform bạn chọn:

```sh
# Web (Next.js):
npx create-next-app@latest my-app
cd my-app

# Android:
# Mở Android Studio → New Project → tạo project mới

# React Native (Expo):
npx create-expo-app my-app
cd my-app

# iOS (Swift):
# Mở Xcode → Create New Project → tạo project mới
```

Sau khi khởi tạo xong, thiết lập git remote theo mẫu sau:

```sh
git init    # nếu project chưa có git

# origin: fork cá nhân của bạn (thay <your-username> bằng GitHub username của bạn)
git remote add origin git@github.com:<your-username>/agentic-coding-hands-on.git

# upstream: repository gốc của bài thực hành
git remote add upstream git@github.com:sun-asterisk-internal/agentic-coding-hands-on.git
```

Kiểm tra lại bằng `git remote -v`, kết quả mong muốn sẽ có dạng:

```
origin    git@github.com:<your-username>/agentic-coding-hands-on.git (fetch)
origin    git@github.com:<your-username>/agentic-coding-hands-on.git (push)
upstream  git@github.com:sun-asterisk-internal/agentic-coding-hands-on.git (fetch)
upstream  git@github.com:sun-asterisk-internal/agentic-coding-hands-on.git (push)
```

> **Tại sao cần đặt remote?** MoMorph VSCode Extension cần nhận diện repository để hiển thị Figma file đã liên kết. Remote `upstream` trỏ về `sun-asterisk-internal/agentic-coding-hands-on` giúp MoMorph hoạt động chính xác, còn `origin` trỏ về fork cá nhân để bạn push code của mình.

### Bước 2: Đăng nhập MoMorph Web và kết nối tài khoản GitHub

> **Lưu ý:** Bài thực hành MoMorph này đã được liên kết sẵn với repository `sun-asterisk-internal/agentic-coding-hands-on`. Bạn chỉ thực hiện kết nối tài khoản GitHub với MoMorph là có thể sử dụng. Tuyệt đối không cập nhật trường **Select Repository** ở bước số 4, kể cả khi nó hiển thị bị trống. Nếu tự ý thay đổi, các thành viên khác sẽ không thể truy cập và thực hành được.

1. Truy cập [MoMorph Web](https://momorph.ai/) và đăng nhập bằng tài khoản Figma (dùng email `*@sun-asterisk.com`).
2. Điền link file Figma sau để tiếp tục: https://www.figma.com/design/9ypp4enmFmdK3YAFJLIu6C/SAA-2025---Internal-Live-Coding
3. Xác nhận lại tài khoản GitHub của bạn đã là thành viên của organization `sun-asterisk-internal` (kết quả của [Bước 0](#bước-0-thực-hiện-github-sso)) trước khi sang bước tiếp theo. Nếu chưa, hãy request Infra để được join organization.
4. Vào MoMorph, sau đó truy cập **Settings → GitHub → Connect** để kết nối tài khoản GitHub của bạn với MoMorph. **Tuyệt đối không cập nhật trường Select Repository**.

> **Quan trọng:** Nếu chưa là thành viên của organization `sun-asterisk-internal`, bạn sẽ **không truy cập được MoMorph MCP** để lấy spec/design data, và **không xem được dữ liệu Figma trên MoMorph VSCode Extension** ở các bước sau. Hãy hoàn tất bước này trước khi tiếp tục.
>
> Sau khi kết nối thành công, **refresh lại trang Settings** trên MoMorph Web — bạn sẽ thấy trường **Select Repository** hiển thị giá trị `sun-asterisk-internal/agentic-coding-hands-on` và bị **disable**. Đây là trạng thái đúng và bình thường.

### Bước 3: Cài đặt và đăng nhập GitHub CLI

Chọn một trong các cách sau để cài đặt:

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

Xác nhận cài đặt thành công:

```sh
gh --version
```

Đăng nhập GitHub CLI:

```sh
gh auth login
```

Làm theo hướng dẫn trên CLI: chọn `GitHub.com`, chọn giao thức `HTTPS` hoặc `SSH`, và hoàn tất xác thực qua trình duyệt.

Kiểm tra trạng thái đăng nhập:

```sh
gh auth status
```

### Bước 4: Cài đặt Takumi CLI

Cài Takumi CLI qua npm:

```sh
npm install -g @sunasteriskrnd/takumi
```

Kết quả mong muốn:

```
Installed takumi@0.1.0
```

Khởi tạo Takumi cho project hiện tại:

```sh
tkm init
```

Kết quả mong muốn:

```
Initialized — 16 agents, 75+ skills ready
```

Kiểm tra môi trường hoạt động:

```sh
tkm doctor
```

Kết quả mong muốn:

```
All checks passed
```

### Bước 5: Đăng ký MCP Servers

Đăng ký 2 MCP server cho Claude Code: **MoMorph** (để Takumi truy cập spec và design qua MCP) và **Playwright** (để tự động hóa trình duyệt khi visual validation / test UI):

```sh
claude mcp add --transport http momorph https://mcp.momorph.ai/mcp --header "x-github-token: $(gh auth token)"
claude mcp add playwright npx @playwright/mcp@latest
```

> **Lưu ý:** Lệnh `momorph` MCP server dùng `gh auth token` để lấy GitHub token đã đăng nhập ở Bước 3. Nếu chưa đăng nhập GitHub CLI thành công, lệnh này sẽ thất bại.

### Bước 6: Cài đặt MoMorph VSCode Extension

Cài đặt MoMorph VSCode Extension từ file VSIX có sẵn trong thư mục `resources/`:

```sh
code --install-extension resources/vscode-momorph-0.13.0.vsix
```

Sau khi cài đặt, mở source code repo trên VSCode → mở Command Palette (`Cmd+Shift+P` trên macOS hoặc `Ctrl+Shift+P` trên Windows/Linux) → chạy command **"MoMorph: Sign In"** → click vào biểu tượng MoMorph trên sidebar → bạn sẽ thấy danh sách frame list của Figma file đã liên kết.

> Tham khảo hướng dẫn chi tiết tại đây: https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F094K2LTV71?focus_section_id=temp:C:USe2e5a076e79fd458c9b713260c

### Bước 7: Sử dụng MoMorph VSCode Extension

MoMorph VSCode Extension hiển thị Figma Tree của file Figma đã liên kết, giúp bạn dễ dàng tra cứu và lấy thông tin frame (link, ID, prompt...) để sử dụng trong quá trình development.

Để Figma Tree gọn hơn, hãy lọc theo platform mà bạn đang thực hành:

1. Mở Command Palette: `Ctrl+Shift+P` (Windows/Linux) hoặc `Cmd+Shift+P` (macOS)
2. Chạy: **MoMorph: Filter Screens**
3. Filter by: **Figma Pages**
   - Nếu thực hành **Mobile** (Android / iOS / React Native): chọn **"Mobile"**
   - Nếu thực hành **Web**: chọn **"Website"**
4. Filter by: **Spec Status** → Chọn **"Done"**

Thao tác này giúp Figma Tree chỉ hiển thị các màn hình của platform bạn đang làm và đã hoàn thành spec, giúp bạn thao tác nhanh gọn hơn.

> **Mẹo:** Trong Figma Tree, bạn có thể chọn nhiều màn hình cùng lúc bằng cách giữ `Cmd` (macOS) / `Ctrl` (Windows/Linux) rồi click chuột trái vào từng màn hình. Sau đó click chuột phải → chọn **Copy Screen Information** để copy thông tin của tất cả các màn hình đã chọn, rất tiện khi muốn gen code cho nhiều màn hình đồng thời.

### Bước 8: Bắt đầu generate code

Sử dụng Figma project để thực hành:

**Figma file:** [SAA 2025 - Internal Live Coding](https://www.figma.com/design/9ypp4enmFmdK3YAFJLIu6C/SAA-2025---Internal-Live-Coding)

#### Chuẩn bị context: Viết Screen Spec trên MoMorph Web

Thông thường, trước khi bắt đầu generate code, ta cần chuẩn bị đầy đủ *Screen Specifications* trên MoMorph. Nội dung Screen Specifications này có thể được viết manual, hoặc được generate ra bởi AI thông qua các chức năng trên MoMorph Web, MoMorph Figma Plugin (yêu cầu Figma Account - Full Seat), cũng như thông qua các hệ thống Agent (GitHub Copilot, Claude Code) khi kết nối với MoMorph MCP Server.

Screen spec trên server chính là nguồn thông tin gốc (source of truth) cho toàn bộ quy trình generate code phía sau.

> **Lưu ý cho bài thực hành này:** Screen spec của các màn hình đã được chuẩn bị sẵn trên MoMorph server rồi, nên các bạn **không cần tạo lại screen spec** mà có thể **bắt tay ngay vào quy trình generate code với Takumi Agent Kit**. Tuy nhiên các bạn vẫn được khuyến khích tự tìm hiểu sâu hơn về quy trình tạo Screen Spec với MoMorph.
> - Vui lòng tham khảo thêm tài liệu [MoMorph Figma Plugin](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F07S87PSVUN) để tìm hiểu chi tiết hơn về khâu viết Screen Spec.

#### Quy trình generate code với Takumi Agent Kit

Takumi Agent Kit cung cấp các slash commands và agent skills tích hợp với MoMorph MCP để generate code từ Figma design. Tuỳ vào mục tiêu và độ phức tạp, bạn có thể chọn một trong **4 scenario** dưới đây.

##### Scenario 1: Simple or medium feature

*Scope rõ ràng, mất từ vài phút đến 1–2 ngày, không cần review plan trước khi code.*

Gọi `/tkm:takumi` với một hoặc nhiều MoMorph Screen URL. Takumi sẽ đọc spec và test case qua MoMorph MCP, hỏi rõ những phần còn mơ hồ, rồi viết code phù hợp với pattern hiện có của project — UI khớp Figma, backend chạy song song. Code reviewer kích hoạt tự động. **Một command, một PR.**

```
/tkm:takumi <MoMorph Screen URLs>
```

Ví dụ:

```
/tkm:takumi Implement the login page (/login), use Supabase local project:
https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
```

##### Scenario 2: Complex feature

*Subsystem mới, nhiều màn hình tương tác phức tạp, business logic chạm tới core infrastructure — cần review scope trước khi code, làm nhiều ngày.*

Dùng `/tkm:create-plan` với các MoMorph Screen URL để chia feature thành nhiều phase với acceptance criteria cụ thể. Review plan, chỉnh sửa nếu cần, sau đó `/tkm:takumi path/to/plan.md` sẽ thực thi từng phase kèm checkpoint. Planning trước giúp align scope và tránh đi sai hướng giữa chừng — đặc biệt cần khi nhiều người cùng làm hoặc feature đụng tới core infrastructure.

```
/tkm:create-plan <MoMorph Screen URLs>
/tkm:takumi [plan]
```

Ví dụ:

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

*Bạn chỉ cần biến Figma design thành UI component — không backend, không business logic.*

Bỏ qua full Takumi pipeline và gọi trực tiếp skill `/momorph-implement-design`. Skill này đọc màn hình qua MoMorph MCP, lấy chính xác giá trị visual từ design (không đoán), generate UI component với mock data lấy từ chính design, và chạy visual validation loop so với Figma reference đến khi output khớp. Đây là path nhanh nhất khi mục tiêu thuần UI.

```
/momorph-implement-design <MoMorph Screen URLs>
```

Ví dụ:

```
/momorph-implement-design Build the login page UI from design:
https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
```

##### Scenario 4: Fix a bug on a screen

*Code hiện tại của một màn hình có bug — UI sai, logic sai, thiếu validation, hoặc design/spec/test case trên MoMorph đã được update mà code chưa kịp theo.*

Gọi `/tkm:fix-bug` với mô tả bug và MoMorph screen URL. Skill này pull code hiện tại cùng với design, spec, và test case, rồi diff để xác định chính xác chỗ code lệch khỏi nguồn-thông-tin-gốc. Root cause hiện ra kèm `file:line`, fix được apply dưới dạng patch tối thiểu, spec và test case liên quan được chạy lại để verify trước khi commit.

```
/tkm:fix-bug <bug description> <MoMorph Screen URL>
```

Ví dụ:

```
/tkm:fix-bug The login button does not submit the form when Enter is pressed, and the validation message disappears after the user edits the input:
https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
```

## Tài liệu tham khảo

- [Takumi Agent Kit](https://takumi.sun-asterisk.ai/)
- [Takumi — Working with MoMorph](https://takumi.sun-asterisk.ai/docs/use-cases/momorph-codegen/)
- [GitHub CLI Installation](https://github.com/cli/cli#installation)
- [MoMorph MCP Server](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F0A9HULD5D0)
- [MoMorph VSCode Extension](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F094K2LTV71)
- [MoMorph Web](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F092SAQBXR8)
- [MoMorph Figma Plugin](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F07S87PSVUN)
