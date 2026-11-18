<p align="center">
  <h1 align="center">⚡ claudify-agent</h1>
  <p align="center">
    <strong>Workflow spec-driven cho Claude Code: spec đủ chiều sâu, thực thi có kỷ luật theo milestone, behavior kiểm chứng được, context chỉ nạp khi cần.</strong>
  </p>
  <p align="center">
    <a href="https://www.npmjs.com/package/claudify-agent"><img src="https://img.shields.io/npm/v/claudify-agent.svg" alt="NPM Version" /></a>
    <a href="https://www.npmjs.com/package/claudify-agent"><img src="https://img.shields.io/npm/dm/claudify-agent.svg" alt="NPM Downloads" /></a>
    <a href="https://github.com/mytoandeptrai/claudify-agent/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" /></a>
  </p>
  <p align="center">
    <a href="README.md">English</a> | Tiếng Việt
  </p>
</p>

---

## 💡 Tổng quan

Claudify v2 kết hợp ba thứ:

- **SDD** — specification là nguồn sự thật về những gì hệ thống phải làm.
- **BDD** — acceptance criteria viết dạng GIVEN / WHEN / THEN, mỗi AC được chứng minh bằng một test mang ID của nó.
- **Engineering workflow** — brainstorming, writing plans, thực thi plan theo từng milestone, verification, finishing branch.

Các quyết định thiết kế giúp giảm token mà không làm mỏng spec:

- **Context nạp sẵn nhỏ.** Mỗi phiên chỉ nạp `CLAUDE.md`, `BACKBONE.md` và một file ngắn `.claude/rules/core.md`. Skill chỉ nạp khi được gọi.
- **Một feature là một change.** Không giới hạn số từ của spec. Feature lớn có nhiều milestone hơn, không bị chia thành nhiều change, nên chu trình
  spec → plan → apply → finish chỉ chạy một lần.
- **Thực thi theo milestone trong main session.** Mỗi lần `/spec-apply` đọc `progress.md`, milestone hiện tại, và chỉ những section spec mà milestone đó cần.
- **Cả workflow chỉ có một subagent:** reviewer cuối feature trong `/spec-verify`.

## 📦 Bắt đầu nhanh

```bash
npx claudify-agent@latest init
```

Lệnh này cài:

- `CLAUDE.md` — bảng điều hướng workflow. Nếu project đã có `CLAUDE.md`, nội dung của bạn được giữ nguyên; claudify chỉ quản lý khối giữa
  `<!-- claudify:start -->` và `<!-- claudify:end -->`.
- `BACKBONE.md` — bản đồ project (cấu trúc, glossary, docs index, capabilities, open changes, lệnh Verify, invariants), nạp mỗi phiên.
- `spec/config.md` — quy ước viết spec của project.
- `.claude/commands/` — các slash command bên dưới, mỗi file một dòng.
- `.claude/skills/` — 8 workflow skill.
- `.claude/rules/core.md` — các ràng buộc áp dụng cho mọi task.
- `.claude/scripts/spec-check.mjs` — kiểm tra truy vết AC ↔ test.

Sau đó chạy `/backbone-init` trong Claude Code để điền `BACKBONE.md`.

### Nâng cấp từ v1

v1 cài rules, hooks và các skill theo stack mà v2 đã bỏ. Gỡ chúng rồi cài lại:

```bash
npx claudify-agent@latest uninstall   # gỡ file của v1 và v2, giữ BACKBONE.md và spec/
npx claudify-agent@latest init
```

`init` giữ nguyên `spec/config.md` hiện có; hãy so nó với `templates/spec/config.md`. Ở v1, mỗi change là một file (`spec/changes/<name>.md`) và canonical spec là
`spec/specs/<capability>.md`; v2 dùng `spec/changes/<name>/spec/spec.md` và `spec/specs/<capability>/spec.md`. Hoàn tất các change v1 đang mở trước khi nâng
cấp, hoặc chuyển chúng bằng tay.

### Gỡ cài đặt

```bash
npx claudify-agent uninstall          # giữ BACKBONE.md và spec/
npx claudify-agent uninstall --all    # xoá luôn BACKBONE.md và spec/
```

Lệnh này chỉ xoá các file claudify đã cài (v1 và v2), khối claudify trong `CLAUDE.md` và các hook entry của v1 trong `.claude/settings.json`. Thêm `--yes` để bỏ
qua bước xác nhận.

## 🔁 Workflow

```
/spec-brainstorm → /spec-new → /spec-plan → /spec-apply (từng milestone) → /spec-verify → /spec-finish
```

| Command                  | Skill            | Làm gì                                                                                   |
|--------------------------|------------------|------------------------------------------------------------------------------------------|
| `/spec-brainstorm <ý tưởng>` | brainstorming | Hỏi từng câu, đưa 2–3 phương án, chốt design được duyệt. Tạo branch `feature/<change>`. |
| `/spec-new <change>`     | specification    | Viết `spec/changes/<change>/spec/`: `spec.md` chứa requirements và AC, thêm topic file khi cần. |
| `/spec-plan <change>`    | writing-plans    | Viết `plan.md` (milestone, task, AC ID và section spec mỗi milestone cần) và `progress.md`. |
| `/spec-apply <change>`   | executing-plans  | Một milestone: test trước, code, Verify, tự review, một commit, cập nhật progress.md.   |
| `/spec-status [change]`  | —                | Đọc progress.md và báo change đang ở đâu.                                                 |
| `/spec-verify <change>`  | verification     | spec-check, Verify đầy đủ, rà từng AC, một reviewer subagent. Status → `verified`.       |
| `/spec-finish <change>`  | finishing-branch | Đồng bộ requirements vào `spec/specs/`, archive change, merge / PR / giữ / huỷ.          |
| `/debug <triệu chứng>`   | debugging        | Tìm root cause có bằng chứng, viết regression test fail trước, rồi sửa.                  |
| `/backbone-init`, `/backbone-sync` | —      | Tạo hoặc làm mới `BACKBONE.md`.                                                           |

Skill cũng tự kích hoạt khi công việc khớp (xem bảng trong `CLAUDE.md`). Bug và thay đổi nhỏ không cần spec.

### Cấu trúc

```
spec/
├── config.md                      quy ước spec của project
├── specs/<capability>/spec.md     requirements + AC đã chấp nhận: sự thật hiện tại
├── changes/<change>/
│   ├── spec/spec.md               requirements + AC (nơi sở hữu duy nhất), Why, Scope, Design
│   ├── spec/<topic>.md            data-model, api-contracts, business-rules, ... chỉ khi có nội dung
│   ├── plan.md                    milestone và task: ý định, không phải code; trỏ tới section spec
│   └── progress.md                trạng thái thực thi: milestone hiện tại, đã xong, verification, blocker, findings
└── archive/YYYY-MM-DD-<change>/   các change đã xong
```

**Spec, plan, progress.** Spec nói hệ thống *phải làm gì* và sở hữu mọi AC. Plan nói *công việc được chia thế nào*: milestone, task ở mức component, mỗi
milestone cần AC và section spec nào. Progress nói *thực thi đang ở đâu*, theo ID milestone và task, không chép lại plan. Mỗi thông tin chỉ có một nơi sở hữu,
nên không lệch nhau và không phải đọc hai lần.

### Truy vết (spec ↔ test)

AC có ID `<capability>/AC-<n>`. Test ghi ID đó: `describe("refund/AC-2: expired QR is refunded", ...)`, hoặc `// refund/AC-2` trong Go.

```bash
node .claude/scripts/spec-check.mjs spec/changes/add-refund   # một change
node .claude/scripts/spec-check.mjs                           # toàn bộ canonical spec
```

## 📄 License

MIT © [jacob-tech](https://github.com/mytoandeptrai)
