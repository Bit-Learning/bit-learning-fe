import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/shared/redux/store";
import { courseApi } from "../api/course.api";
import {
  resetCourseFiltersAction,
  selectCourseState,
  setPageAction,
  setSelectedCourseIdAction,
  setSelectedGradeAction,
  setSelectedLevelAction,
  setSortByAction,
  type SortType,
} from "../store/course.store";
import type { CourseLevel, CoursePreview, MyCourse, SearchCourseRequest } from "../types/course.type";
import type { ApiResponse, PaginationInfo } from "@/shared/api/api.type";

const STALE_TIME = 30 * 1000;
const GC_TIME = 60 * 1000;

export const courseKeys = {
  all: ["courses"] as const,
  search: (req: SearchCourseRequest, page: number) => ["courses", "search", req, page] as const,
  byGrade: (grade: number, page: number) => ["courses", "grade", grade, page] as const,
  myPaginated: (page: number, size: number) => ["courses", "my", page, size] as const,
  detail: (id: number) => ["courses", "detail", id] as const,
  certificate: (courseId: number) => ["courses", "certificate", courseId] as const,
};

export const useSearchCourses = (request: SearchCourseRequest) => {
  const { pagination } = useSelector(selectCourseState);

  return useQuery<ApiResponse<CoursePreview[]>>({
    queryKey: courseKeys.search(request, pagination.page),
    queryFn: async () => {
      const res = await courseApi.searchCourses(request, pagination.page);
      return res.data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useCoursesByGrade = (grade: number) => {
  const { pagination } = useSelector(selectCourseState);

  return useQuery<ApiResponse<CoursePreview[]>>({
    queryKey: courseKeys.byGrade(grade, pagination.page),
    queryFn: async () => {
      const res = await courseApi.getCoursesByGrade(grade, pagination.page);
      return res.data;
    },
    enabled: !!grade,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useMyCourses = () => {
  const { pagination } = useSelector(selectCourseState);

  return useQuery<ApiResponse<MyCourse[]>>({
    queryKey: courseKeys.myPaginated(pagination.page, pagination.size),
    queryFn: async () => {
      const res = await courseApi.getMyCourses(pagination.page, pagination.size);
      return res.data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useCourseDetail = (id?: number) => {
  const { selectedCourseId } = useSelector(selectCourseState);
  const targetId = id ?? selectedCourseId;

  return useQuery({
    queryKey: courseKeys.detail(targetId ?? 0),
    queryFn: async () => {
      if (!targetId) return null;
      const res = await courseApi.getCourseById(targetId);
      return res.data.data;
    },
    enabled: !!targetId,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useCourseActions = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const selectCourse = (id: number) => {
    dispatch(setSelectedCourseIdAction(id));
    queryClient.invalidateQueries({ queryKey: courseKeys.detail(id) });
  };

  const selectGrade = (grade: number | null) => {
    dispatch(setSelectedGradeAction(grade));
    queryClient.invalidateQueries({ queryKey: courseKeys.all });
  };

  const selectLevel = (level: CourseLevel | null) => {
    dispatch(setSelectedLevelAction(level));
    queryClient.invalidateQueries({ queryKey: courseKeys.all });
  };

  const setSortBy = (sort: SortType) => {
    dispatch(setSortByAction(sort));
  };

  const changePage = (page: number) => {
    dispatch(setPageAction(page));
  };

  const resetFilters = () => {
    dispatch(resetCourseFiltersAction());
    queryClient.invalidateQueries({ queryKey: courseKeys.all });
  };

  return { selectCourse, selectGrade, selectLevel, setSortBy, changePage, resetFilters };
};

export const usePrefetchCourse = () => {
  const queryClient = useQueryClient();

  const prefetchCourseDetail = (id: number) => {
    queryClient.prefetchQuery({
      queryKey: courseKeys.detail(id),
      queryFn: async () => {
        const res = await courseApi.getCourseById(id);
        return res.data.data;
      },
      staleTime: STALE_TIME,
    });
  };

  return { prefetchCourseDetail };
};

export const useCourseState = () => useSelector(selectCourseState);

export const useCertificate = (courseId: number, enabled = false) => {
  return useQuery({
    queryKey: courseKeys.certificate(courseId),
    queryFn: async () => {
      const res = await courseApi.getCertificate(courseId);
      return URL.createObjectURL(res.data);
    },
    enabled: enabled && !!courseId,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnMount: true,
  });
};

export const useDownloadCertificate = () => {
  return useMutation({
    mutationFn: (courseId: number) => courseApi.downloadCertificate(courseId),
  });
};

export const useVerifyCertificate = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const res = await courseApi.verifyCertificate(file);
      return res.data.data;
    },
  });
};
