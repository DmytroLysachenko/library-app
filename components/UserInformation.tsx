"use client";

import React from "react";
import Image from "next/image";
import { IKImage } from "imagekitio-next";

import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  cn,
  getInitials,
  getUserStatusIcon,
  getUserStatusLabel,
} from "@/lib/utils";
import { Card, CardContent } from "./ui/card";
import config from "@/lib/config";

const UserInformation = ({ user }: { user: User }) => {
  return (
    <section className="w-full max-w-md space-y-6">
      <div className="relative">
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-dark-700 h-16 w-12 rounded-lg flex items-end justify-center p-3 rounded-b-full">
          <div className="w-8 h-2 gradient-vertical rounded-lg" />
        </div>
      </div>

      <Card className=" border-0 border-dashed border-slate-700 gradient-vertical">
        <CardContent className="py-10 px-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-dark-600/10 p-2 rounded-full">
              <Avatar className="w-16 h-16 ">
                <AvatarFallback className="bg-amber-100 w-full">
                  {getInitials(user.fullName || "IN")}
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
