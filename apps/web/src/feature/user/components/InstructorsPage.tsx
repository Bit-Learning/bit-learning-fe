import { useMemo, useState } from "react";
import PageMeta from "@/shared/components/seo/page-meta";
import { useInstructors } from "../queries/useUser";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/Avatar";
import Loader from "@workspace/ui/components/loader/TerminalLoader";
import {
  ChevronLeft,
  ChevronRight,
  Github,
  Linkedin,
  Globe,
  Mail,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Users,
  BriefcaseBusiness,
  Sparkles,
} from "lucide-react";
import type { TInstructor } from "../types/user.type";
import { useNavigate } from "@tanstack/react-router";
import { TopMentorsByViews } from "@/feature/mentor-dashboard/components/TopMentorsByViews";
import { TopMentorsByReactions } from "@/feature/mentor-dashboard/components/TopMentorsByReactions";

function SocialIconLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
    >
      {children}
    </a>
  );
}

function InstructorCard({ instructor }: { instructor: TInstructor }) {
  const fullName = `${instructor.firstName ?? ""} ${instructor.lastName ?? ""}`.trim();

  const navigate = useNavigate();

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
      <div className="relative h-48 overflow-hidden bg-slate-200">
        {instructor.coverImage ? (
          <img
            src={instructor.coverImage}
            alt={fullName}
            className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-slate-200 via-slate-300 to-slate-200" />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-slate-950/50 via-slate-900/10 to-transparent" />

        <div className="absolute right-4 top-4 flex gap-2 opacity-0 transition duration-200 group-hover:opacity-100">
          {instructor.email && (
            <SocialIconLink href={`mailto:${instructor.email}`} label="Email">
              <Mail size={14} />
            </SocialIconLink>
          )}
          {instructor.socialProfile?.github && (
            <SocialIconLink href={instructor.socialProfile.github} label="GitHub">
              <Github size={14} />
            </SocialIconLink>
          )}
          {instructor.socialProfile?.linkedin && (
            <SocialIconLink href={instructor.socialProfile.linkedin} label="LinkedIn">
              <Linkedin size={14} />
            </SocialIconLink>
          )}
          {instructor.socialProfile?.website && (
            <SocialIconLink href={instructor.socialProfile.website} label="Website">
              <Globe size={14} />
            </SocialIconLink>
          )}
        </div>
      </div>

      <div className="relative px-5 pb-5">
        <div className="-mt-7 mb-3 w-fit rounded-2xl bg-white p-1 shadow-md">
          <Avatar className="h-14 w-14 rounded-xl">
            <AvatarImage src={instructor.avatar} />
            <AvatarFallback className="rounded-xl bg-linear-to-br from-blue-500 to-violet-500 text-sm font-semibold text-white">
              {instructor.firstName?.charAt(0) ?? "M"}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{fullName}</h3>
            {(instructor.jobTitle || instructor.company) && (
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                {instructor.jobTitle}
                {instructor.jobTitle && instructor.company && " · "}
                {instructor.company}
              </p>
            )}
          </div>

          {instructor.bio && <p className="line-clamp-3 text-sm leading-6 text-slate-600">{instructor.bio}</p>}

          {instructor.specialties && instructor.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {instructor.specialties.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                >
                  {s}
                </span>
              ))}
              {instructor.specialties.length > 3 && (
                <span className="text-[10px] text-slate-400">+{instructor.specialties.length - 3}</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {instructor.studentsCount || instructor.coursesCount
                ? `${instructor.studentsCount ?? 0} học viên · ${instructor.coursesCount ?? 0} khoá học`
                : "Giảng viên thực chiến"}
            </span>

            <button
              onClick={() => {
                navigate({
                  to: "/profile/$username",
                  params: { username: instructor.username ?? "" },
                });
              }}
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700 cursor-pointer"
            >
              Xem hồ sơ
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function StatItem({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white">
        {icon}
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-blue-100">{label}</p>
    </div>
  );
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function JourneyStep({ index, title, description }: { index: string; title: string; description: string }) {
  return (
    <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
        {index}
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

export default function InstructorsPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useInstructors(page, 12);

  const instructors: TInstructor[] = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalInstructors = data?.totalElements ?? 0;

  return (
    <>
      <PageMeta
        title="Đội ngũ giảng viên và giảng viên - Bit Learning"
        description="Khám phá đội ngũ giảng viên và mentor tại Bit Learning với kinh nghiệm thực chiến trong lập trình, AI và công nghệ."
        keywords={["mentor Bit Learning", "giang vien lap trinh", "instructors Bit Learning", "mentor cong nghe"]}
      />
      <div className="min-h-screen bg-slate-50 text-slate-900">
        {/* Hero */}
        <section className="relative overflow-hidden bg-slate-950">
          <div className="absolute inset-0 bg-[radial-linear(circle_at_top_left,rgba(59,130,246,0.28),transparent_30%),radial-linear(circle_at_bottom_right,rgba(139,92,246,0.24),transparent_35%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
            <div className="max-w-2xl">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-blue-100">
                <Sparkles size={14} />
                Đội ngũ giảng viên Bit Learning
              </p>

              <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
                Học cùng giảng viên thực chiến,
                <span className="block bg-linear-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                  rút ngắn hành trình vào nghề
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">
                Từ nền tảng cơ bản đến kỹ năng làm dự án thực tế, đội ngũ giảng viên của chúng tôi đồng hành cùng bạn để
                học nhanh hơn, hiểu sâu hơn và tự tin hơn trên con đường công nghệ.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#mentor-list"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Xem danh sách giảng viên
                  <ArrowRight size={16} />
                </a>
                <a
                  href="/courses"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
                >
                  Khám phá khóa học
                </a>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-2">
              <StatItem icon={<Users size={18} />} value={String(totalInstructors || 0)} label="Giảng viên đồng hành" />
              <StatItem icon={<BookOpen size={18} />} value="Nhiều lộ trình" label="Tập trung thực hành" />
              <StatItem icon={<BriefcaseBusiness size={18} />} value="Thực chiến" label="Kinh nghiệm dự án thật" />
              <StatItem icon={<BadgeCheck size={18} />} value="Đồng hành" label="Học cùng phản hồi cá nhân" />
            </div>
          </div>
        </section>

        {/* Top mentors */}
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-blue-600">Bảng xếp hạng</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              Những giảng viên đang tạo ra ảnh hưởng lớn nhất
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Xếp hạng dựa trên lượt xem và tương tác thực tế từ cộng đồng học viên — phản ánh chất lượng và sức lan toả
              của từng giảng viên qua các bài viết họ chia sẻ.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <TopMentorsByViews limit={5} />
            <TopMentorsByReactions limit={5} />
          </div>
        </section>

        {/* Benefits */}
        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-blue-600">
                Vì sao nên học cùng giảng viên
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Học đúng hướng, tiến bộ nhanh hơn</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <BenefitCard
                icon={<BriefcaseBusiness size={20} />}
                title="Kinh nghiệm thực chiến"
                description="Giảng viên mang đến góc nhìn từ dự án thực tế, giúp bạn hiểu cách áp dụng kiến thức vào công việc."
              />
              <BenefitCard
                icon={<Users size={20} />}
                title="Đồng hành cá nhân"
                description="Không học một mình. Bạn có người định hướng, phản hồi và giúp tháo gỡ những chỗ đang vướng."
              />
              <BenefitCard
                icon={<BookOpen size={20} />}
                title="Lộ trình rõ ràng"
                description="Từ nền tảng đến nâng cao, mỗi bước học đều có mục tiêu rõ để tránh lan man và mất phương hướng."
              />
              <BenefitCard
                icon={<BadgeCheck size={20} />}
                title="Tập trung vào kết quả"
                description="Mục tiêu không chỉ là học xong bài, mà là làm được sản phẩm, hiểu được bản chất và tiến gần hơn tới công việc thực tế."
              />
            </div>
          </div>
        </section>

        {/* Journey */}
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-blue-600">Hành trình học tập</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Từ người mới đến người sẵn sàng làm dự án</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <JourneyStep
              index="01"
              title="Chọn định hướng"
              description="Tìm giảng viên và lộ trình phù hợp với mục tiêu của bạn."
            />
            <JourneyStep
              index="02"
              title="Học có dẫn dắt"
              description="Tiếp cận kiến thức theo cách rõ ràng, dễ theo dõi và có hệ thống."
            />
            <JourneyStep
              index="03"
              title="Thực hành dự án"
              description="Biến lý thuyết thành kỹ năng thông qua bài tập và sản phẩm thực tế."
            />
            <JourneyStep
              index="04"
              title="Nhận phản hồi"
              description="Cải thiện liên tục với góp ý từ giảng viên để tiến bộ nhanh hơn."
            />
          </div>
        </section>

        {/* Mentor list */}
        <section id="mentor-list" className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-blue-600">Danh sách giảng viên</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Khám phá đội ngũ giảng viên</h2>
            </div>

            {totalInstructors > 0 && (
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-900">{totalInstructors}</span> giảng viên đang đồng hành cùng
                học viên
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader />
            </div>
          ) : instructors.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
              Chưa có giảng viên nào.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {instructors.map((instructor) => (
                  <InstructorCard key={instructor.id} instructor={instructor} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Trang {page + 1} / {totalPages}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ChevronLeft size={16} />
                      Trước
                    </button>

                    <button
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      Sau
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
          <div className="overflow-hidden rounded-4xl bg-slate-950 px-8 py-12 md:px-12 md:py-14">
            <div className="max-w-3xl">
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-blue-300">Sẵn sàng bắt đầu?</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-white md:text-4xl">
                Tìm giảng viên phù hợp và bắt đầu hành trình học tập của bạn ngay hôm nay
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-300 md:text-base">
                Khám phá các khóa học, gặp gỡ giảng viên và xây nền tảng vững chắc để tiến xa hơn trong lĩnh vực công
                nghệ.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="/courses"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Xem khóa học
                  <ArrowRight size={16} />
                </a>
                <a
                  href="/community"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Tham gia cộng đồng
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
