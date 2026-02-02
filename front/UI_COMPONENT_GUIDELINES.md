# UI 컴포넌트 개발 가이드라인

이 문서는 MC Web Console Next.js 프로젝트의 UI 컴포넌트 개발 가이드라인을 정의합니다. 일관된 사용자 경험과 유지보수성을 위해 모든 UI 컴포넌트는 이 가이드라인을 따라 작성해야 합니다.

---

## 1. 팝업(Modal/Dialog) 구조화

### 1.1 기본 구조

모든 팝업은 **Title 영역**, **본문 영역**, **Footer 영역**으로 구성되어야 합니다.

```tsx
<DialogContent className="max-h-[90vh] flex flex-col p-0">
  {/* Title 영역 - 고정 */}
  <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
    <DialogTitle>팝업 제목</DialogTitle>
  </DialogHeader>

  {/* 본문 영역 - 스크롤 가능 */}
  <div className="flex-1 overflow-y-auto px-6 py-4">
    <div className="space-y-4">
      {/* 본문 내용 */}
    </div>
  </div>

  {/* Footer 영역 - 고정 */}
  <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
    <Button variant="outline" onClick={handleClose}>Cancel</Button>
    <Button onClick={handleSave}>Save</Button>
  </DialogFooter>
</DialogContent>
```

### 1.2 영역별 상세 규칙

#### Title 영역 (DialogHeader)
- **고정**: 스크롤되지 않고 항상 상단에 위치
- **클래스**:
  - `flex-shrink-0`: 고정 크기 유지
  - `px-6 pt-6 pb-4`: 적절한 패딩
  - `border-b`: 본문과 구분선
- **용도**: 팝업의 제목 및 간단한 설명

#### 본문 영역
- **스크롤 가능**: 내용이 길어지면 독립적으로 스크롤
- **클래스**:
  - `flex-1`: 남은 공간 모두 차지
  - `overflow-y-auto`: 세로 스크롤 활성화
  - `px-6 py-4`: 적절한 패딩
- **용도**: 폼, 테이블, 상세 정보 등 주요 컨텐츠

#### Footer 영역 (DialogFooter)
- **고정**: 스크롤되지 않고 항상 하단에 위치
- **클래스**:
  - `flex-shrink-0`: 고정 크기 유지
  - `px-6 py-4`: 적절한 패딩
  - `border-t`: 본문과 구분선
- **용도**: Save, Cancel, Apply 등 액션 버튼 배치

### 1.3 DialogContent 설정

```tsx
<DialogContent className="max-h-[90vh] flex flex-col p-0">
```

- `max-h-[90vh]`: 화면 높이의 90%를 최대 높이로 설정
- `flex flex-col`: 세로 방향 flexbox 레이아웃
- `p-0`: 기본 패딩 제거 (각 영역별로 개별 패딩 설정)

### 1.4 적용 예시

**Server Recommendation Modal** (`SpecRecommendationModal.tsx`):
- Title: "Server Recommendation" 제목 고정
- 본문: Region 선택, Spec Config, 검색 결과 테이블 (스크롤)
- Footer: Cancel, Apply 버튼 고정

### 1.5 체크리스트

팝업을 만들 때 다음 사항을 확인하세요:

- [ ] DialogContent에 `flex flex-col p-0` 적용
- [ ] Title 영역이 `flex-shrink-0 border-b`로 고정되어 있는가?
- [ ] 본문 영역이 `flex-1 overflow-y-auto`로 스크롤 가능한가?
- [ ] Footer 영역이 `flex-shrink-0 border-t`로 고정되어 있는가?
- [ ] 각 영역에 적절한 패딩(`px-6 py-4`)이 적용되어 있는가?

---

## 2. Form 컴포넌트 레이아웃

### 2.1 가로 배치 (Horizontal Layout)

label과 input을 같은 줄에 가로로 배치하는 경우:

```tsx
<div className="flex items-center gap-4 flex-nowrap">
  <Label className="text-sm font-medium whitespace-nowrap flex-shrink-0 min-w-[120px]">
    Label
  </Label>
  <div className="flex-1">
    <Input />
  </div>
</div>
```

**규칙**:
- Label 너비: `min-w-[120px]` (최소 120px로 통일)
- Gap: `gap-4` (16px)
- Label 스타일: `text-sm font-medium whitespace-nowrap flex-shrink-0`

### 2.2 그리드 배치

여러 Form 컴포넌트를 가로로 배치하는 경우:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <FormRangeInput label="Memory (GB)" ... />
  <FormRangeInput label="vCPU" ... />
  <FormRangeInput label="Cost (Hour)" ... />
</div>
```

**반응형 규칙**:
- 모바일 (xs): `grid-cols-1` - 세로 배치
- 태블릿 (sm): `grid-cols-2` - 2개씩 가로 배치
- 데스크톱 (lg): `grid-cols-3` - 3개 가로 배치

### 2.3 FormRangeInput vs FormSelect 일관성

`FormRangeInput`과 `FormSelect`의 label 영역 너비를 동일하게 유지:

```tsx
// FormRangeInput
<Label className="min-w-[120px]">Memory (GB)</Label>

// FormSelect (horizontal mode)
<Label className="min-w-[120px]">Architecture</Label>
```

---

## 3. 반응형 디자인

### 3.1 Breakpoint 규칙

Tailwind CSS breakpoint 사용:
- `sm`: 640px 이상 (태블릿)
- `md`: 768px 이상
- `lg`: 1024px 이상 (데스크톱)
- `xl`: 1280px 이상

### 3.2 모바일 우선 설계

항상 모바일을 기본으로 설계하고, 큰 화면에 대해 추가 스타일 적용:

```tsx
<div className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  {/* 모바일: 1열, 태블릿: 2열, 데스크톱: 3열 */}
</div>
```

---

## 4. Table 컴포넌트 사용 규칙

### 4.1 기본 원칙

**모든 화면(일반 페이지 및 팝업)에서 Table은 `DataTable` 컴포넌트를 사용해야 합니다.**

```tsx
import { DataTable } from '@/components/common/DataTable';
import { ColumnDef } from '@tanstack/react-table';
```

### 4.2 DataTable 사용 이유

| 항목 | 설명 |
|------|------|
| **일관성** | 모든 화면에서 동일한 Table UI/UX 제공 |
| **내장 기능** | Sorting, Filtering, Pagination 자동 제공 |
| **유지보수** | 중앙화된 컴포넌트로 쉬운 관리 |
| **TanStack React Table** | 강력한 Table 라이브러리 기반 |

### 4.3 ColumnDef 정의

```tsx
const columns = useMemo<ColumnDef<YourDataType>[]>(
  () => [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <div>{row.getValue('id')}</div>,
    },
    {
      accessorKey: 'name',
      header: '이름',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
    },
    {
      id: 'actions',
      header: '작업',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex gap-2">
            <button onClick={(e) => {
              e.stopPropagation();
              handleEdit(item);
            }}>수정</button>
            <button onClick={(e) => {
              e.stopPropagation();
              handleDelete(item);
            }}>삭제</button>
          </div>
        );
      },
    },
  ],
  [/* dependencies */]
);
```

### 4.4 DataTable 기본 사용

**중요**: Table은 항상 표시하고, 데이터만 동적으로 채웁니다.

```tsx
// ✅ 올바른 방법: Table은 항상 표시
<DataTable
  data={dataList}
  columns={columns}
  onRowClick={(item) => setSelectedItem(item)}
  isLoading={isLoading}
  emptyMessage="데이터가 없습니다."
/>

// ❌ 잘못된 방법: 조건부로 Table 표시
{dataList.length > 0 && (
  <DataTable data={dataList} columns={columns} />
)}
```

**조회 후 데이터 표시 패턴**:
```tsx
const { data, isLoading } = useData();

// Table은 항상 렌더링, 상태에 따라 메시지 변경
<DataTable
  data={data || []}
  columns={columns}
  isLoading={isLoading}
  emptyMessage={
    !data
      ? '조회 버튼을 클릭하세요.'
      : '검색 결과가 없습니다.'
  }
/>
```

### 4.5 선택된 행 하이라이트

```tsx
<DataTable
  data={dataList}
  columns={columns}
  selectedItem={selectedItem}
  getRowId={(row) => row.id}
  onRowClick={(item) => setSelectedItem(item)}
/>
```

### 4.6 Filtering 활성화

```tsx
<DataTable
  data={dataList}
  columns={columns}
  enableFiltering={true}
  filterColumns={['name', 'id', 'status']}
/>
```

### 4.7 팝업에서 Table 사용 예시

```tsx
export function ExampleModal({ open, onClose }: ExampleModalProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const { data, isLoading } = useItems();

  const columns = useMemo<ColumnDef<Item>[]>(
    () => [
      {
        id: 'select',
        header: '선택',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <input
              type="radio"
              checked={selectedItem?.id === item.id}
              onChange={() => setSelectedItem(item)}
              className="cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
          );
        },
        size: 50,
      },
      {
        accessorKey: 'name',
        header: '이름',
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('name')}</div>
        ),
      },
      // ... 추가 컬럼
    ],
    [selectedItem]
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle>항목 선택</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <DataTable
            data={data}
            columns={columns}
            onRowClick={(item) => setSelectedItem(item)}
            selectedItem={selectedItem}
            getRowId={(row) => row.id}
            isLoading={isLoading}
            emptyMessage="항목이 없습니다."
            enableFiltering={true}
            filterColumns={['name', 'id']}
          />
        </div>

        <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleApply} disabled={!selectedItem}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 4.8 DataTable Props

| Prop | 타입 | 설명 | 필수 |
|------|------|------|------|
| `data` | `T[]` | 표시할 데이터 배열 | ✅ |
| `columns` | `ColumnDef<T>[]` | 컬럼 정의 | ✅ |
| `onRowClick` | `(item: T) => void` | 행 클릭 핸들러 | ❌ |
| `selectedItem` | `T \| null` | 선택된 항목 | ❌ |
| `getRowId` | `(row: T) => string` | 행 ID 추출 함수 | ❌ |
| `isLoading` | `boolean` | 로딩 상태 | ❌ |
| `emptyMessage` | `string` | 데이터 없을 때 메시지 | ❌ |
| `onRefresh` | `() => void` | 새로고침 핸들러 | ❌ |
| `enableFiltering` | `boolean` | 필터 기능 활성화 | ❌ |
| `filterColumns` | `string[]` | 필터링할 컬럼 키 | ❌ |

### 4.9 주의사항

#### ❌ 잘못된 사용 (직접 Table 구현)

```tsx
// 팝업에서 Table, TableHeader, TableBody를 직접 사용 - 피해야 함
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>이름</TableHead>
      <TableHead>상태</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.status}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

#### ✅ 올바른 사용 (DataTable 사용)

```tsx
// 모든 화면에서 DataTable 사용
<DataTable
  data={data}
  columns={columns}
  onRowClick={handleRowClick}
  isLoading={isLoading}
  emptyMessage="데이터가 없습니다."
/>
```

### 4.10 체크리스트

Table을 구현할 때 다음 사항을 확인하세요:

- [ ] `DataTable` 컴포넌트를 사용하고 있는가?
- [ ] `ColumnDef`를 `useMemo`로 감싸서 정의했는가?
- [ ] 선택 기능이 필요한 경우 `selectedItem`과 `getRowId`를 전달했는가?
- [ ] 행 클릭 핸들러가 필요한 경우 `onRowClick`을 전달했는가?
- [ ] 필터 기능이 필요한 경우 `enableFiltering`과 `filterColumns`를 설정했는가?
- [ ] 직접 `Table`, `TableHeader`, `TableBody`를 사용하지 않았는가?

---

## 5. 참고 컴포넌트

### 5.1 재사용 가능한 Form 컴포넌트

- `FormRangeInput`: Min/Max 범위 입력
- `FormSelect`: Select 드롭다운
- `FormInput`: 일반 텍스트 입력

### 5.2 Table 컴포넌트

- `DataTable`: 표준 Table 컴포넌트 (TanStack React Table 기반)
- `CrudPageTemplate`: CRUD 페이지 전체 레이아웃
- `CrudTable`: DataTable의 간단한 래퍼

### 5.3 Modal/Dialog 컴포넌트

- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` (shadcn/ui)

---

## 6. 코드 예시

### 6.1 완전한 Modal 예시

```tsx
export function ExampleModal({ open, onClose, onSave }: ExampleModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] flex flex-col p-0">
        {/* Title 영역 - 고정 */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle>Example Modal</DialogTitle>
        </DialogHeader>

        {/* 본문 영역 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {/* Form 컴포넌트들 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormInput label="Name" />
              <FormInput label="Email" />
              <FormSelect label="Type" options={[]} horizontal />
            </div>
          </div>
        </div>

        {/* Footer 영역 - 고정 */}
        <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 7. 관련 문서

- [NAMING_CONVENTIONS.md](./NAMING_CONVENTIONS.md) - 네이밍 규칙
- [README.md](./README.md) - 프로젝트 개요

---

**문서 작성일**: 2025-02-02
**최종 수정일**: 2025-02-02
