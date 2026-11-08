# ⚡ claudify-agent

> **Enterprise-grade workflow & context optimization framework for Claude Code, Claude Desktop, and autonomous AI coding agents.**

Inspired by research-backed agent instruction patterns, **claudify-agent** acts as the deterministic bridle and operating system for Claude: preventing context bloat, eliminating repetitive LLM token waste through zero-token local hooks, and enforcing systematic plan-first development.

---

## 🚀 Quick Install via NPX

Không cần cài đặt rườm rà. Tại bất kỳ dự án mới hoặc có sẵn nào của bạn, chỉ cần mở terminal và chạy:

```bash
npx claudify-agent init
```

Lệnh này sẽ tự động khởi tạo:
- `CLAUDE.md`: File điều phối trung tâm tự động nạp bởi Claude Code CLI.
- `.claude/skills/`: Kho 12 cẩm nang chuyên sâu (Golang, NestJS, Concurrency/Locking, Solidity, Next.js, React...).
- `.claude/rules/`: 13 bộ luật tối ưu phân tầng ngữ cảnh (< 20 dòng/rule).
- `.claude/scripts/`: Hệ thống tự kiểm tra cú pháp, typecheck, và bảo mật tốn 0 token.

---

## 📖 Hướng Dẫn Sử Dụng Chi Tiết (How to Use)

### Cách 1: Dùng với Claude Code CLI (Khuyên Dùng Nhất 🚀)

Sau khi chạy `npx claudify-agent init`, chỉ cần mở terminal và gõ:
```bash
claude
```
👉 Claude Code CLI sẽ tự động phát hiện và tuân thủ toàn bộ quy tắc trong `CLAUDE.md`:
- Tự động lập **Plan Mode** trước khi sửa từ 2 file trở lên.
- Tự động tra cứu kỹ năng chuyên biệt khi đụng tới backend Go, NestJS, hoặc Smart Contract.
- Tự chạy kiểm tra local sau khi code xong.

### Cách 2: Dùng với Claude Desktop / Claude Projects

1. Mở **Claude Desktop** $\rightarrow$ Tạo **Project** mới trỏ vào thư mục code.
2. Dán nội dung của [CLAUDE.md](CLAUDE.md) vào ô **Custom Instructions**.
3. Thêm thư mục `.claude/` vào Project Files để Claude tra cứu khi cần.

---

## 🛠️ Kho Kỹ Năng Đầy Đủ (Included 12 Skills)

| Kỹ Năng | Đường dẫn | Trọng tâm giải quyết |
| :--- | :--- | :--- |
| **Backend Concurrency** | `.claude/skills/backend-concurrency/SKILL.md` | Chống Race conditions, Distributed Lock (Redis), Deadlock, Idempotency. |
| **Golang Backend** | `.claude/skills/golang-guide/SKILL.md` | Standard layout (`cmd/`, `internal/`), Worker Pool, Safe Goroutines, Context. |
| **NestJS Enterprise** | `.claude/skills/nestjs-guide/SKILL.md` | Module boundaries, TypeORM Transaction QueryRunner, DTO Validation. |
| **Solidity (Smart Contracts)** | `.claude/skills/solidity-guide/SKILL.md` | Mẫu CEI, ReentrancyGuard, tối ưu Gas EVM, Foundry/Hardhat tests. |
| **Next.js Guide** | `.claude/skills/nextjs-guide/SKILL.md` | App Router, Server Components & Server Actions. |
| **React Guide** | `.claude/skills/react-guide/SKILL.md` | Single Source of Truth, render optimization & Custom Hooks. |
| **Python Guide** | `.claude/skills/python-guide/SKILL.md` | FastAPI, Django, Type hints & Pydantic. |
| **MCP Mastery** | `.claude/skills/mcp-mastery/SKILL.md` | Kết nối và sử dụng các Model Context Protocol servers. |
| **Debug Optimizer** | `.claude/skills/debug-optimizer/SKILL.md` | Quy trình truy tìm nguyên nhân gốc rễ (Root Cause) 4 bước. |
| **Tool Selection** | `.claude/skills/tool-selection/SKILL.md` | Chiến lược chọn đúng tool nhằm giảm thiểu số lần gọi API. |
| **Plan Mastery** | `.claude/skills/plan-mode-mastery/SKILL.md` | Lập kế hoạch có hệ thống trước khi gõ code. |
| **Vite Guide** | `.claude/skills/vite-guide/SKILL.md` | Cấu hình bundling SPA tối ưu hiệu năng. |

---

## 📄 License
MIT © [mytoandeptrai](https://github.com/mytoandeptrai)
