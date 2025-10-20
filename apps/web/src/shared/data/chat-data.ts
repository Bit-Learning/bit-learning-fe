// Mock chat data
export const mockConversations = [
    { id: '1', title: 'Hội thoại về React Hooks', date: '20/10/2025' },
    { id: '2', title: 'Thiết kế UI/UX hiện đại', date: '19/10/2025' },
    { id: '3', title: 'Tối ưu hiệu suất web', date: '18/10/2025' },
    { id: '4', title: 'TypeScript best practices', date: '17/10/2025' },
    { id: '5', title: 'Xây dựng API với Node.js', date: '16/10/2025' },
]

export const mockMessages = [
    {
        id: '1',
        role: 'user',
        content:
            'Chào bạn, mình đang học Tin học lớp 11 và thấy sách giáo khoa khá khô khan. Bạn có thể giúp mình hiểu rõ hơn về nội dung chính của môn này không?',
        timestamp: '08:00',
    },
    {
        id: '2',
        role: 'assistant',
        content:
            'Chào bạn! Sách Tin học cấp 3, đặc biệt là lớp 11, chủ yếu tập trung vào lập trình cơ bản, cụ thể là ngôn ngữ lập trình **Python** (trong chương trình mới) hoặc **Pascal/C++** (ở chương trình cũ). Mục tiêu là giúp bạn hiểu được **tư duy thuật toán** – tức là cách phân tích, mô tả và giải quyết vấn đề bằng các bước logic.',
        timestamp: '08:01',
    },
    {
        id: '3',
        role: 'user',
        content: 'Vậy phần thuật toán trong sách có quan trọng không? Mình thấy nhiều ví dụ hơi khó hiểu.',
        timestamp: '08:02',
    },
    {
        id: '4',
        role: 'assistant',
        content:
            'Rất quan trọng luôn đó! Phần thuật toán là nền tảng cho mọi kiến thức lập trình sau này. Sách giáo khoa chỉ giới thiệu một số thuật toán cơ bản như **tìm kiếm tuyến tính, tìm kiếm nhị phân, sắp xếp nổi bọt, sắp xếp chọn**… Mục tiêu không phải là bạn nhớ hết, mà là **hiểu quy trình giải quyết vấn đề bằng logic**.\n\nNếu bạn thấy ví dụ trong sách khó, bạn có thể thử viết lại chúng bằng ngôn ngữ quen thuộc hơn, như Python, để dễ hình dung. Ví dụ về thuật toán tìm kiếm tuyến tính:\n\n```python\ndef linear_search(arr, target):\n    """Tìm kiếm tuyến tính trong mảng\"\"\"\n    for i in range(len(arr)):\n        if arr[i] == target:\n            return i  # Trả về vị trí tìm thấy\n    return -1  # Không tìm thấy\n\n# Ví dụ sử dụng\nnumbers = [5, 2, 8, 1, 9, 3]\nresult = linear_search(numbers, 8)\nprint(f"Số 8 được tìm thấy tại vị trí: {result}")\n```\n\nCode này duyệt qua từng phần tử trong mảng để tìm giá trị mục tiêu. Độ phức tạp là O(n).',
        timestamp: '08:04',
    },
    {
        id: '5',
        role: 'user',
        content: 'Ồ, cảm ơn! Còn thuật toán tìm kiếm nhị phân thì sao? Mình thấy nó phức tạp hơn.',
        timestamp: '08:05',
    },
    {
        id: '6',
        role: 'assistant',
        content:
            'Tìm kiếm nhị phân (Binary Search) hiệu quả hơn nhiều, nhưng yêu cầu mảng phải **đã được sắp xếp**. Nó hoạt động bằng cách chia đôi không gian tìm kiếm sau mỗi lần so sánh:\n\n```python\ndef binary_search(arr, target):\n    """Tìm kiếm nhị phân - mảng phải đã sắp xếp\"\"\"\n    left = 0\n    right = len(arr) - 1\n    \n    while left <= right:\n        mid = (left + right) // 2\n        \n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1  # Tìm bên phải\n        else:\n            right = mid - 1  # Tìm bên trái\n    \n    return -1\n\n# Ví dụ\nsorted_numbers = [1, 2, 3, 5, 8, 9]\nresult = binary_search(sorted_numbers, 5)\nprint(f"Số 5 được tìm thấy tại vị trí: {result}")\n```\n\nĐộ phức tạp chỉ là O(log n) - nhanh hơn nhiều so với tìm kiếm tuyến tính khi làm việc với dữ liệu lớn!',
        timestamp: '08:06',
    },
    {
        id: '7',
        role: 'user',
        content: 'Tuyệt vời! Vậy còn thuật toán sắp xếp thì sao? Mình nghe nói có Bubble Sort và Quick Sort.',
        timestamp: '08:07',
    },
    {
        id: '8',
        role: 'assistant',
        content:
            'Đúng rồi! **Bubble Sort** là thuật toán đơn giản nhất nhưng chậm. Nó hoạt động bằng cách so sánh và đổi chỗ các phần tử liền kề:\n\n```python\ndef bubble_sort(arr):\n    """Sắp xếp nổi bọt - đơn giản nhưng chậm\"\"\"\n    n = len(arr)\n    \n    for i in range(n):\n        # Flag để tối ưu (nếu không có swap thì đã sắp xếp xong)\n        swapped = False\n        \n        for j in range(0, n - i - 1):\n            if arr[j] > arr[j + 1]:\n                # Đổi chỗ\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n                swapped = True\n        \n        if not swapped:\n            break\n    \n    return arr\n\n# Ví dụ\nnumbers = [64, 34, 25, 12, 22, 11, 90]\nprint("Mảng gốc:", numbers)\nsorted_arr = bubble_sort(numbers.copy())\nprint("Mảng đã sắp xếp:", sorted_arr)\n```\n\nĐộ phức tạp: O(n²) - không phù hợp cho dữ liệu lớn.',
        timestamp: '08:09',
    },
    {
        id: '9',
        role: 'user',
        content: 'Còn Quick Sort thì sao? Nghe nói nó nhanh hơn nhiều.',
        timestamp: '08:10',
    },
    {
        id: '10',
        role: 'assistant',
        content:
            'Chính xác! **Quick Sort** sử dụng kỹ thuật "chia để trị" (divide and conquer) và nhanh hơn nhiều:\n\n```python\ndef quick_sort(arr):\n    """Sắp xếp nhanh - hiệu quả với dữ liệu lớn\"\"\"\n    if len(arr) <= 1:\n        return arr\n    \n    # Chọn pivot (phần tử giữa)\n    pivot = arr[len(arr) // 2]\n    \n    # Chia mảng thành 3 phần\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    \n    # Đệ quy sắp xếp và kết hợp\n    return quick_sort(left) + middle + quick_sort(right)\n\n# Ví dụ\nnumbers = [64, 34, 25, 12, 22, 11, 90]\nprint("Mảng gốc:", numbers)\nsorted_arr = quick_sort(numbers)\nprint("Mảng đã sắp xếp:", sorted_arr)\n```\n\nĐộ phức tạp trung bình: O(n log n) - nhanh hơn nhiều so với Bubble Sort!\n\nBạn cũng có thể thử với JavaScript/TypeScript:\n\n```typescript\nfunction quickSort<T>(arr: T[]): T[] {\n  if (arr.length <= 1) return arr;\n  \n  const pivot = arr[Math.floor(arr.length / 2)];\n  const left = arr.filter(x => x < pivot);\n  const middle = arr.filter(x => x === pivot);\n  const right = arr.filter(x => x > pivot);\n  \n  return [...quickSort(left), ...middle, ...quickSort(right)];\n}\n\n// Sử dụng\nconst numbers = [64, 34, 25, 12, 22, 11, 90];\nconsole.log("Sorted:", quickSort(numbers));\n```',
        timestamp: '08:12',
    },
    {
        id: '11',
        role: 'user',
        content: 'Cảm ơn nhé! Giờ mình hiểu rõ hơn nhiều về các thuật toán rồi.',
        timestamp: '08:13',
    },
    {
        id: '12',
        role: 'assistant',
        content:
            'Rất vui được giúp bạn! Để thực hành thêm, bạn có thể:\n\n1. **So sánh hiệu suất** các thuật toán với dữ liệu khác nhau\n2. **Vẽ sơ đồ** để hình dung cách thuật toán hoạt động\n3. **Tự implement** các biến thể khác như Merge Sort, Insertion Sort\n4. **Làm bài tập** trên LeetCode, HackerRank để rèn luyện\n\nNhững kiến thức này sẽ rất hữu ích khi bạn học sâu hơn về **cấu trúc dữ liệu và giải thuật** ở đại học! 🚀',
        timestamp: '08:14',
    },
]
