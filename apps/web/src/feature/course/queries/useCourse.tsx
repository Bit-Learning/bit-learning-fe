import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/shared/redux/store";
import { courseApi } from "../api/course.api";
import {
  selectCourseState,
  setPageAction,
  setSelectedCourseIdAction,
  setSelectedGradeAction,
  setSelectedLevelAction,
  setSortByAction,
  resetCourseFiltersAction,
  type SortType,
} from "../store/course.store";
import type { CourseLevel } from "../types/course.type";

export const courseKeys = {
  all: ["courses"] as const,
  allPaginated: (page: number, size: number) => ["courses", "all", page, size] as const,
  myPaginated: (page: number, size: number) => ["courses", "my", page, size] as const,
  byGrade: (grade: number, page: number, size: number) => ["courses", "grade", grade, page, size] as const,
  detail: (id: number) => ["courses", "detail", id] as const,
  certificate: (courseId: number) => ["courses", "certificate", courseId] as const,
};

const STALE_TIME = 30 * 1000;
const GC_TIME = 60 * 1000;

export const useAllCourses = () => {
  const { pagination } = useSelector(selectCourseState);

  return useQuery({
    queryKey: courseKeys.allPaginated(pagination.page, pagination.size),
    queryFn: async () => {
      const response = await courseApi.getAllCourses(pagination.page, pagination.size);
      return response.data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useMyCourses = () => {
  const { pagination } = useSelector(selectCourseState);

  return useQuery({
    queryKey: courseKeys.myPaginated(pagination.page, pagination.size),
    queryFn: async () => {
      const response = await courseApi.getMyCourses(pagination.page, pagination.size);
      return response.data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useCoursesByGrade = (grade?: number) => {
  const { selectedGrade, pagination } = useSelector(selectCourseState);
  const targetGrade = grade ?? selectedGrade;

  return useQuery({
    queryKey: courseKeys.byGrade(targetGrade ?? 1, pagination.page, pagination.size),
    queryFn: async () => {
      if (!targetGrade) return null;
      const response = await courseApi.getCoursesByGrade(targetGrade, pagination.page, pagination.size);
      return response.data;
    },
    enabled: !!targetGrade,
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
      const response = await courseApi.getCourseById(targetId);
      return response.data.data;
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
    queryClient.invalidateQueries({
      queryKey: courseKeys.detail(id),
    });
  };

  const selectGrade = (grade: number | null) => {
    dispatch(setSelectedGradeAction(grade));
    queryClient.invalidateQueries({
      queryKey: courseKeys.all,
    });
  };

  const selectLevel = (level: CourseLevel | null) => {
    dispatch(setSelectedLevelAction(level));
    queryClient.invalidateQueries({
      queryKey: courseKeys.all,
    });
  };

  const setSortBy = (sort: SortType) => {
    dispatch(setSortByAction(sort));
  };

  const changePage = (page: number) => {
    dispatch(setPageAction(page));
  };

  const resetFilters = () => {
    dispatch(resetCourseFiltersAction());
    queryClient.invalidateQueries({
      queryKey: courseKeys.all,
    });
  };

  return {
    selectCourse,
    selectGrade,
    selectLevel,
    setSortBy,
    changePage,
    resetFilters,
  };
};

export const usePrefetchCourse = () => {
  const queryClient = useQueryClient();

  const prefetchCourseDetail = (id: number) => {
    queryClient.prefetchQuery({
      queryKey: courseKeys.detail(id),
      queryFn: async () => {
        const response = await courseApi.getCourseById(id);
        return response.data.data;
      },
      staleTime: STALE_TIME,
    });
  };

  return { prefetchCourseDetail };
};

export const useCourseState = () => {
  return useSelector(selectCourseState);
};

export const useCertificate = (courseId: number, enabled = false) => {
  return useQuery({
    queryKey: courseKeys.certificate(courseId),
    queryFn: async () => {
      const response = await courseApi.getCertificate(courseId);
      return URL.createObjectURL(response.data);
    },
    enabled: enabled && !!courseId,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnMount: true,
  });
};

export const useDownloadCertificate = () => {
  return useMutation({
    mutationFn: async (courseId: number) => {
      const res = await courseApi.downloadCertificate(courseId);
      return res;
    },
  });
};

export const useVerifyCertificate = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const response = await courseApi.verifyCertificate(file);
      return response.data.data;
    },
  });
};
