"use client";
import React, { useState } from "react";
import SoulPlate from "./SoulPlate";
import { IRole } from "../data";

export default function RoleListWrapper({ roles }: { roles: IRole[] }) {
  const [activeRole, setActiveRole] = useState<string>("pham-nhan");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-32 items-center perspective-1200">
      {roles.map((role) => (
        <SoulPlate
          key={role.id}
          role={role}
          isActive={activeRole === role.id}
          onHover={() => setActiveRole(role.id)}
        />
      ))}
    </div>
  );
}
