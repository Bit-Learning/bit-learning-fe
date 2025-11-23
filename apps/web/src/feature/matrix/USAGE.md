# Matrix Feature Module

## 📁 Cấu trúc thư mục

```
feature/matrix/
├── components/          # Shared components
│   ├── DifficultyBadge.tsx
│   ├── StatusBadge.tsx
│   ├── LoadingSpinner.tsx
│   ├── ErrorMessage.tsx
│   ├── EmptyState.tsx
│   └── index.ts
├── page/               # Page components
│   ├── MatrixList.tsx
│   ├── CreateMatrix.tsx
│   ├── ImportQuestionBank.tsx
│   └── GenerateExam.tsx
├── utils/              # Utility functions
│   └── matrix.utils.ts
└── README.md           # API Integration Guide
```

## 🎯 Các trang đã tạo

### 1. Matrix List (`/matrices`)

- ✅ Danh sách ma trận với pagination
- ✅ Search và filter
- ✅ Delete ma trận
- ✅ Tích hợp API đầy đủ

### 2. Create Matrix (`/matrices/create`)

- ✅ Form tạo ma trận mới
- ✅ Cấu trúc ma trận (matrix details)
- ✅ Validation
- 🔄 Cần tích hợp API

### 3. Import Question Bank (`/matrices/import`)

- ✅ Upload file Excel/CSV
- ✅ Preview kết quả import
- ✅ Statistics
- 🔄 Cần tích hợp API

### 4. Generate Exam (`/matrices/:id/generate`)

- ✅ Cấu hình tạo đề
- ✅ Preview đề thi
- ✅ Download PDF/Word
- 🔄 Cần tích hợp API

## 🛠️ Components có sẵn

### DifficultyBadge

Hiển thị badge cho mức độ câu hỏi

```tsx
import { DifficultyBadge } from '@/feature/matrix/components'

<DifficultyBadge level="easy" />
<DifficultyBadge level="medium" />
<DifficultyBadge level="hard" />
```

### StatusBadge

Hiển thị trạng thái active/inactive

```tsx
import { StatusBadge } from '@/feature/matrix/components'

;<StatusBadge isActive={true} />
```

### LoadingSpinner

Loading indicator

```tsx
import { LoadingSpinner } from '@/feature/matrix/components'

;<LoadingSpinner message="Đang tải..." size="md" />
```

### ErrorMessage

Hiển thị lỗi với retry button

```tsx
import { ErrorMessage } from '@/feature/matrix/components'

;<ErrorMessage message="Không thể tải dữ liệu" onRetry={() => refetch()} />
```

### EmptyState

Hiển thị khi không có dữ liệu

```tsx
import { EmptyState } from '@/feature/matrix/components'

;<EmptyState
    title="Chưa có ma trận nào"
    description="Tạo ma trận đầu tiên của bạn"
    actionLabel="Tạo mới"
    onAction={() => navigate('/matrices/create')}
/>
```

## 🔧 Utilities

### matrix.utils.ts

Các hàm tiện ích cho matrix module:

```typescript
import {
    getDifficultyBadgeColor,
    getDifficultyLabel,
    calculateTotalQuestions,
    calculateTotalScore,
    formatDate,
    validateMatrixForm,
    generateMatrixCode,
    downloadFile,
    generateExportFilename,
} from '@/feature/matrix/utils/matrix.utils'
```

## 📡 API Integration

Xem chi tiết trong [README.md](./README.md)

### Quick Start

```typescript
import { apiClient } from '@/shared/lib/apiClient'
import { useQuery, useMutation } from '@tanstack/react-query'

// Fetch matrices
const { data, isLoading } = useQuery(
    apiClient.matrix.getAllMatrices({
        pageable: { page: 0, size: 10 },
    }),
)

// Create matrix
const createMutation = useMutation({
    ...apiClient.matrix.createMatrix(),
    onSuccess: data => {
        console.log('Created:', data)
    },
})
```

## 🎨 UI/UX Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Loading states
- ✅ Error handling
- ✅ Empty states
- ✅ Confirmation dialogs
- ✅ Toast notifications (ready for integration)
- ✅ Form validation
- ✅ Search và filter
- ✅ Pagination

## 📝 TODO

- [ ] Tích hợp API cho CreateMatrix
- [ ] Tích hợp API cho ImportQuestionBank
- [ ] Tích hợp API cho GenerateExam
- [ ] Thêm toast notifications (Sonner)
- [ ] Implement download PDF/Word
- [ ] Add unit tests
- [ ] Add E2E tests
- [ ] Optimize performance
- [ ] Add accessibility features

## 🚀 Cách chạy

```bash
# Development
pnpm run dev

# Build
pnpm run build

# Test
pnpm run test
```

## 📚 Documentation

- [API Integration Guide](./README.md) - Hướng dẫn chi tiết tích hợp API
- [Component API](#components-có-sẵn) - Docs cho các components
- [Utilities](#utilities) - Docs cho utils functions
