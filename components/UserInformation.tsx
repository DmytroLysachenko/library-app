"use client";

import React from "react";
import Image from "next/image";
import { IKImage } from "imagekitio-next";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  cn,
  getInitials,
  getUserStatusIcon,
  getUserStatusLabel,
} from "@/lib/utils";
import { Card, CardContent } from "./ui/card";
import config from "@/lib/config";
import FileUpload from "./FileUpload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useForm } from "react-hook-form";
import { userUpdateSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./ui/button";
import { uploadAvatar } from "@/lib/actions/auth";
import { toast } from "@/hooks/use-toast";

const UserInformation = ({ user }: { user: User }) => {
  const form = useForm<z.infer<typeof userUpdateSchema>>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      avatar: user.avatar || "",
    },
  });

  const onAvatarSubmit = async (values: z.infer<typeof userUpdateSchema>) => {
    const result = await uploadAvatar(user.id, values.avatar);

    if (result.success) {
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <section className="w-full max-w-md space-y-6">
      <div className="relative">
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-dark-700 h-16 w-12 rounded-lg flex items-end justify-center p-3 rounded-b-full">
          <div className="w-8 h-2 gradient-vertical rounded-lg" />
        </div>
      </div>

      <Card className=" border-0 gradient-vertical w-full">
        <CardContent className="py-10 px-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-dark-600/10 p-2 rounded-full">
              <Avatar className="w-16 h-16 ">
                <AvatarImage
                  src={
                    user.avatar
                      ? config.env.imagekit.urlEndpoint + user.avatar
                      : undefined
                  }
                />
                <AvatarFallback className="bg-amber-100 w-full">
                  {getInitials(user.fullName) || "IN"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <div
                className={cn(
                  "flex items-center gap-2 mb-1",
                  user.status === "REJECTED"
                    ? "text-[#FF6C6F]"
                    : "text-light-100"
                )}
              >
                <Image
                  src={getUserStatusIcon(user.status)}
                  alt="status"
                  width={18}
                  height={18}
                />
                {getUserStatusLabel(user.status)}
              </div>
              <h2 className="text-xl font-semibold text-light-100">
                {user.fullName.split(" ")[0]}
              </h2>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onAvatarSubmit)}
              className="space-y-8 w-full relative"
            >
              <FormField
                control={form.control}
                name={"avatar"}
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1">
                    <FormControl>
                      <FileUpload
                        type="image"
                        accept="image/*"
                        placeholder="Upload an Avatar"
                        folder="user/avatars"
                        variant="dark"
                        onFileChange={field.onChange}
                        value={field.value}
                        size={60}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="absolute right-2 bottom-0 ">Confirm</Button>
            </form>
          </Form>

          <div className="space-y-2">
            <p className="text-sm text-slate-400">University</p>
            <p className="text-lg font-medium text-light-100">Coding Academy</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-400">Student ID</p>
            <p className="text-lg font-medium text-light-100">
              {user.universityId}
            </p>
          </div>

          <div className="relative w-full aspect-[1.586]">
            <IKImage
              path={user.universityCard}
              urlEndpoint={config.env.imagekit.urlEndpoint}
              alt="Book cover"
              className="rounded-sm object-fill"
              fill
              loading="lazy"
              lqip={{ active: true }}
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default UserInformation;
