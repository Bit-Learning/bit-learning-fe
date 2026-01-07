import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@workspace/ui/components/Sonner";
import { noteApi } from "../api/note.api";
import { NoteRequest } from "../types/note.type";

export const noteKeys = {
  all: ["notes"] as const,
  lecture: (lectureId: number) => [...noteKeys.all, "lecture", lectureId] as const,
};

export const useLectureNotes = (lectureId: number) => {
  return useQuery({
    queryKey: noteKeys.lecture(lectureId),
    queryFn: async () => {
      const response = await noteApi.getNotesByLecture(lectureId);
      return response.data.data || [];
    },
    enabled: !!lectureId,
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: NoteRequest) => {
      const response = await noteApi.createNote(request);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      toast.success({ title: "Đã lưu ghi chú" });

      queryClient.invalidateQueries({
        queryKey: noteKeys.lecture(variables.lectureId),
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Không thể lưu ghi chú",
        description: error?.response?.data?.message || "Đã có lỗi xảy ra",
      });
    },
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, content }: { noteId: number; content: string }) => {
      const response = await noteApi.updateNote(noteId, content);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success({ title: "Đã cập nhật ghi chú" });

      queryClient.invalidateQueries({
        queryKey: noteKeys.all,
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Không thể cập nhật ghi chú",
        description: error?.response?.data?.message || "Đã có lỗi xảy ra",
      });
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: number) => {
      await noteApi.deleteNote(noteId);
    },
    onSuccess: () => {
      toast.success({ title: "Đã xóa ghi chú" });

      queryClient.invalidateQueries({
        queryKey: noteKeys.all,
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Không thể xóa ghi chú",
        description: error?.response?.data?.message || "Đã có lỗi xảy ra",
      });
    },
  });
};
