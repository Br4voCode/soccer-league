import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateUserRoleSchema,
  type UpdateUserRoleFormData,
} from "../schemas/userSchema";
import { usersApiService } from "../services/api";
import type { User } from "../types";
import { ApiError } from "@/shared/utils/api-client";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";

interface UserRoleDialogProps {
  readonly user?: User;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const UserRoleDialog = ({ user, isOpen, onClose }: UserRoleDialogProps) => {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset, formState: { isSubmitting } } =
    useForm<UpdateUserRoleFormData>({
      resolver: zodResolver(updateUserRoleSchema),
      values: { role: user?.role ?? "visitante" },
    });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserRoleFormData) =>
      usersApiService.updateUserRole(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
      reset();
    },
  });

  const isLoading = isSubmitting || updateMutation.isPending;

  const getErrorMessage = (error: unknown) => {
    if (error instanceof ApiError) return error.message;
    if (error instanceof Error) return error.message;
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Cambiar rol</DialogTitle>
          <DialogDescription>{user?.email}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => updateMutation.mutate(data))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="role">Rol *</Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading}
                >
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visitante">Visitante</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superadmin">Superadmin</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {updateMutation.isError && (
            <p className="text-sm text-destructive font-medium">
              {getErrorMessage(updateMutation.error)}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
