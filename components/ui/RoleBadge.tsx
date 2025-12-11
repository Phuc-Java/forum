"use client";

import { getRoleInfo, parseCustomTags, type CustomTag } from "@/lib/roles";

interface RoleBadgeProps {
  role: string | null | undefined;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showName?: boolean;
  className?: string;
}

/**
 * Component hiển thị badge cấp bậc của user
 */
export function RoleBadge({
  role,
  size = "md",
  showIcon = true,
  showName = true,
  className = "",
}: RoleBadgeProps) {
  const roleInfo = getRoleInfo(role);

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 gap-0.5",
    md: "text-sm px-2 py-1 gap-1",
    lg: "text-base px-3 py-1.5 gap-1.5",
  };

  return (
    <span
      className={`
        inline-flex items-center font-mono font-medium rounded-md border
        ${roleInfo.bgColor} ${roleInfo.borderColor} ${roleInfo.color} ${roleInfo.textGlow}
        ${sizeClasses[size]}
        ${className}
      `}
      title={roleInfo.description}
    >
      {showIcon && <span className="shrink-0">{roleInfo.icon}</span>}
      {showName && <span>{roleInfo.name}</span>}
    </span>
  );
}

interface CustomTagBadgeProps {
  tag: CustomTag;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

/**
 * Component hiển thị custom tag
 */
export function CustomTagBadge({
  tag,
  size = "sm",
  showIcon = true,
  className = "",
}: CustomTagBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 gap-0.5",
    md: "text-sm px-2 py-0.5 gap-1",
    lg: "text-base px-2.5 py-1 gap-1",
  };

  return (
    <span
      className={`
        inline-flex items-center font-mono font-medium rounded-full border
        ${tag.bgColor} ${tag.borderColor} ${tag.color}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {showIcon && tag.icon && <span className="shrink-0">{tag.icon}</span>}
      <span>{tag.name}</span>
    </span>
  );
}

interface UserBadgesProps {
  role: string | null | undefined;
  customTags?: string | null;
  showRole?: boolean;
  showTags?: boolean;
  roleSize?: "sm" | "md" | "lg";
  tagSize?: "sm" | "md" | "lg";
  className?: string;
  layout?: "inline" | "stack";
}

/**
 * Component hiển thị tất cả badges của user (role + custom tags)
 */
export function UserBadges({
  role,
  customTags,
  showRole = true,
  showTags = true,
  roleSize = "md",
  tagSize = "sm",
  className = "",
  layout = "inline",
}: UserBadgesProps) {
  const tags = parseCustomTags(customTags);

  const layoutClasses = {
    inline: "flex flex-wrap items-center gap-1.5",
    stack: "flex flex-col items-start gap-1",
  };

  return (
    <div className={`${layoutClasses[layout]} ${className}`}>
      {showRole && <RoleBadge role={role} size={roleSize} />}
      {showTags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <CustomTagBadge key={tag.id} tag={tag} size={tagSize} />
          ))}
        </div>
      )}
    </div>
  );
}

interface RoleDisplayNameProps {
  displayName: string;
  role: string | null | undefined;
  customTags?: string | null;
  showBadges?: boolean;
  size?: "sm" | "md" | "lg";
  linkToProfile?: string;
  className?: string;
}

/**
 * Component hiển thị tên user với role color và badges
 */
export function RoleDisplayName({
  displayName,
  role,
  customTags,
  showBadges = true,
  size = "md",
  linkToProfile,
  className = "",
}: RoleDisplayNameProps) {
  const roleInfo = getRoleInfo(role);
  const tags = parseCustomTags(customTags);

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const nameElement = (
    <span
      className={`
        font-semibold font-mono
        ${roleInfo.color} ${roleInfo.textGlow}
        ${sizeClasses[size]}
        ${linkToProfile ? "hover:underline cursor-pointer" : ""}
      `}
    >
      {displayName}
    </span>
  );

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {linkToProfile ? <a href={linkToProfile}>{nameElement}</a> : nameElement}
      {showBadges && (
        <div className="flex flex-wrap items-center gap-1">
          <RoleBadge role={role} size="sm" showName={false} />
          {tags.slice(0, 2).map((tag) => (
            <CustomTagBadge key={tag.id} tag={tag} size="sm" showIcon={true} />
          ))}
          {tags.length > 2 && (
            <span className="text-xs text-foreground/50 font-mono">
              +{tags.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface PermissionGateProps {
  children: React.ReactNode;
  role: string | null | undefined;
  requiredLevel?: number;
  fallback?: React.ReactNode;
}

/**
 * Component để ẩn/hiện content dựa trên role level
 */
export function PermissionGate({
  children,
  role,
  requiredLevel = 2,
  fallback = null,
}: PermissionGateProps) {
  const roleInfo = getRoleInfo(role);

  if (roleInfo.level >= requiredLevel) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
