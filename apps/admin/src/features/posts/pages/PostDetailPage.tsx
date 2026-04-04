import React, { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useGetPostDetail, useGetComments, useBanPost } from "../queries/usePost";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Ban, Shield, ThumbsUp, ThumbsDown, MessageSquare, Tag, User, Clock, File } from "lucide-react";
import { CommentItem } from "../components/CommentItem";
import { Skeleton } from "@/components/ui/skeleton";
import { AttachmentType } from "../types/post.type";

export const PostDetailPage: React.FC = () => {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  const postId = parseInt(id || "0");

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "ban" | "unban" | null;
  }>({ open: false, action: null });

  const { data: post, isLoading: postLoading } = useGetPostDetail(postId);
  const { data: comments, isLoading: commentsLoading } = useGetComments(postId);
  const { mutate: banPost, isPending: banPending } = useBanPost();

  const handleOpenConfirm = (action: "ban" | "unban") => {
    setConfirmDialog({ open: true, action });
  };

  const handleConfirm = () => {
    if (confirmDialog.action === "ban" || confirmDialog.action === "unban") {
      banPost({ id: postId, isBanned: post?.isBanned || false });
    }
    setConfirmDialog({ open: false, action: null });
  };

  const handleCancel = () => {
    setConfirmDialog({ open: false, action: null });
  };

  if (postLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-destructive">Không tìm thấy bài viết</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-8">
      <Button variant="ghost" className="mb-6" onClick={() => navigate({ to: "/posts" })}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại danh sách
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-mono mb-2">{post.code}</p>
                  <CardTitle className="text-3xl mb-2">{post.title}</CardTitle>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>
                        {post.author.firstName} {post.author.lastName}
                      </span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(post.createdAt).toLocaleString("vi-VN")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {post.isBanned && <Badge variant="destructive">Bị khóa</Badge>}
                  {post.isEdited && <Badge variant="secondary">Đã chỉnh sửa</Badge>}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-foreground whitespace-pre-wrap">{post.content}</p>

              {post.attachments && post.attachments.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Tệp đính kèm</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {post.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                          {attachment.type === AttachmentType.IMAGE ? (
                            <img src={attachment.url} alt="Attachment" className="w-full h-32 object-cover" />
                          ) : (
                            <div className="w-full h-32 bg-slate-100 flex items-center justify-center">
                              <File className="w-12 h-12 text-slate-400" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {post.hashtags && post.hashtags.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Hashtags</h3>
                    <div className="flex flex-wrap gap-2">
                      {post.hashtags.map((tag) => (
                        <Badge key={tag.id} variant="outline">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  {post.likes}
                </Button>
                <Button variant="outline" size="sm">
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  {post.dislikes}
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="w-4 h-4" />
                  <span>{comments?.length || 0} bình luận</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bình luận ({comments?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {commentsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : comments && comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} postId={postId} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Chưa có bình luận nào</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã bài viết</span>
                <span className="font-mono font-semibold">{post.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lượt thích</span>
                <span className="font-semibold">{post.likes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lượt không thích</span>
                <span className="font-semibold">{post.dislikes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tệp đính kèm</span>
                <span className="font-semibold">{post.attachments?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hashtags</span>
                <span className="font-semibold">{post.hashtags?.length || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hành động</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!post.isBanned ? (
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => handleOpenConfirm("ban")}
                  disabled={banPending}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Khóa bài viết
                </Button>
              ) : (
                <Button className="w-full" onClick={() => handleOpenConfirm("unban")} disabled={banPending}>
                  <Shield className="w-4 h-4 mr-2" />
                  Mở khóa bài viết
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && handleCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === "ban" && "Xác nhận khóa bài viết"}
              {confirmDialog.action === "unban" && "Xác nhận mở khóa bài viết"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === "ban" &&
                "Bạn có chắc chắn muốn khóa bài viết này? Bài viết sẽ không còn hiển thị công khai."}
              {confirmDialog.action === "unban" &&
                "Bạn có chắc chắn muốn mở khóa bài viết này? Bài viết sẽ hiển thị công khai trở lại."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
